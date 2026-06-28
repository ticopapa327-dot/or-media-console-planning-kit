import type { TopologyCatalog, TopologySummary, ValidationIssue } from "./types";

export function summarizeTopology(catalog: TopologyCatalog): TopologySummary {
  const storageUsableGb = catalog.storageVolumes.reduce(
    (total, volume) => total + Math.max(volume.capacityGb - volume.usedGb, 0),
    0
  );

  return {
    roomCount: catalog.rooms.length,
    deviceCount: catalog.devices.length,
    connectionCount: catalog.connections.length,
    signalSourceCount: catalog.signalSources.length,
    displayTargetCount: catalog.displayTargets.length,
    storageUsableGb,
    degradedDeviceCount: catalog.devices.filter((device) => device.status === "degraded").length,
    offlineDeviceCount: catalog.devices.filter((device) => device.status === "offline").length
  };
}

export function validateTopology(catalog: TopologyCatalog): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const roomIds = new Set(catalog.rooms.map((room) => room.id));
  const deviceIds = new Set(catalog.devices.map((device) => device.id));
  const portIds = new Set(catalog.devices.flatMap((device) => device.ports.map((port) => port.id)));

  for (const device of catalog.devices) {
    if (!roomIds.has(device.roomId)) {
      issues.push({
        code: "DEVICE_ROOM_MISSING",
        message: `Device ${device.id} references missing room ${device.roomId}`
      });
    }

    for (const port of device.ports) {
      if (port.deviceId !== device.id) {
        issues.push({
          code: "PORT_DEVICE_MISMATCH",
          message: `Port ${port.id} belongs to ${port.deviceId}, expected ${device.id}`
        });
      }
    }
  }

  for (const connection of catalog.connections) {
    if (!deviceIds.has(connection.fromDeviceId)) {
      issues.push({
        code: "CONNECTION_FROM_DEVICE_MISSING",
        message: `Connection ${connection.id} references missing source device ${connection.fromDeviceId}`
      });
    }

    if (!deviceIds.has(connection.toDeviceId)) {
      issues.push({
        code: "CONNECTION_TO_DEVICE_MISSING",
        message: `Connection ${connection.id} references missing target device ${connection.toDeviceId}`
      });
    }

    if (connection.fromPortId && !portIds.has(connection.fromPortId)) {
      issues.push({
        code: "CONNECTION_FROM_PORT_MISSING",
        message: `Connection ${connection.id} references missing source port ${connection.fromPortId}`
      });
    }

    if (connection.toPortId && !portIds.has(connection.toPortId)) {
      issues.push({
        code: "CONNECTION_TO_PORT_MISSING",
        message: `Connection ${connection.id} references missing target port ${connection.toPortId}`
      });
    }
  }

  for (const source of catalog.signalSources) {
    if (!deviceIds.has(source.deviceId)) {
      issues.push({
        code: "SOURCE_DEVICE_MISSING",
        message: `Signal source ${source.id} references missing device ${source.deviceId}`
      });
    }
  }

  for (const display of catalog.displayTargets) {
    if (!deviceIds.has(display.deviceId)) {
      issues.push({
        code: "DISPLAY_DEVICE_MISSING",
        message: `Display target ${display.id} references missing device ${display.deviceId}`
      });
    }
  }

  return issues;
}
