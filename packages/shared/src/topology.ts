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
    activeRouteCount: catalog.routeSessions.filter((route) => route.status === "active").length,
    layoutTemplateCount: catalog.layoutTemplates.length,
    patientCount: catalog.patients.length,
    surgeryCount: catalog.surgeries.length,
    activeRecordingCount: catalog.recordingTasks.filter((recording) => recording.status === "recording" || recording.status === "paused")
      .length,
    mediaAssetCount: catalog.mediaAssets.length,
    openMeetingCount: catalog.meetingSessions.filter((meeting) => meeting.status === "open").length,
    authorizedRemoteEndpointCount: catalog.remoteEndpoints.filter((endpoint) => endpoint.authorized).length,
    audioEndpointCount: catalog.audioEndpoints.length,
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

  issues.push(...findDuplicateIds("ROOM_ID_DUPLICATE", "Room", catalog.rooms.map((room) => room.id)));
  issues.push(...findDuplicateIds("DEVICE_ID_DUPLICATE", "Device", catalog.devices.map((device) => device.id)));
  issues.push(...findDuplicateIds("PORT_ID_DUPLICATE", "Port", catalog.devices.flatMap((device) => device.ports.map((port) => port.id))));
  issues.push(...findDuplicateIds("CONNECTION_ID_DUPLICATE", "Connection", catalog.connections.map((connection) => connection.id)));
  issues.push(...findDuplicateIds("SOURCE_ID_DUPLICATE", "Signal source", catalog.signalSources.map((source) => source.id)));
  issues.push(...findDuplicateIds("DISPLAY_ID_DUPLICATE", "Display target", catalog.displayTargets.map((display) => display.id)));
  issues.push(...findDuplicateIds("STORAGE_ID_DUPLICATE", "Storage volume", catalog.storageVolumes.map((volume) => volume.id)));
  issues.push(...findDuplicateIds("ROUTE_ID_DUPLICATE", "Route session", catalog.routeSessions.map((route) => route.id)));
  issues.push(...findDuplicateIds("LAYOUT_ID_DUPLICATE", "Layout template", catalog.layoutTemplates.map((layout) => layout.id)));
  issues.push(...findDuplicateIds("PATIENT_ID_DUPLICATE", "Patient", catalog.patients.map((patient) => patient.id)));
  issues.push(...findDuplicateIds("SURGERY_ID_DUPLICATE", "Surgery case", catalog.surgeries.map((surgery) => surgery.id)));
  issues.push(...findDuplicateIds("RECORDING_ID_DUPLICATE", "Recording task", catalog.recordingTasks.map((recording) => recording.id)));
  issues.push(...findDuplicateIds("MEDIA_ID_DUPLICATE", "Media asset", catalog.mediaAssets.map((asset) => asset.id)));
  issues.push(...findDuplicateIds("USER_ID_DUPLICATE", "User", catalog.users.map((user) => user.id)));
  issues.push(...findDuplicateIds("MEETING_ID_DUPLICATE", "Meeting session", catalog.meetingSessions.map((meeting) => meeting.id)));
  issues.push(...findDuplicateIds("MEMBER_ID_DUPLICATE", "Meeting member", catalog.meetingMembers.map((member) => member.id)));
  issues.push(...findDuplicateIds("REMOTE_ENDPOINT_ID_DUPLICATE", "Remote endpoint", catalog.remoteEndpoints.map((endpoint) => endpoint.id)));
  issues.push(...findDuplicateIds("AUDIO_ENDPOINT_ID_DUPLICATE", "Audio endpoint", catalog.audioEndpoints.map((endpoint) => endpoint.id)));
  const sourceIds = new Set(catalog.signalSources.map((source) => source.id));
  const displayIds = new Set(catalog.displayTargets.map((display) => display.id));
  const storageIds = new Set(catalog.storageVolumes.map((volume) => volume.id));
  const patientIds = new Set(catalog.patients.map((patient) => patient.id));
  const surgeryIds = new Set(catalog.surgeries.map((surgery) => surgery.id));
  const recordingIds = new Set(catalog.recordingTasks.map((recording) => recording.id));
  const userIds = new Set(catalog.users.map((user) => user.id));
  const meetingIds = new Set(catalog.meetingSessions.map((meeting) => meeting.id));

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
    if (!roomIds.has(source.roomId)) {
      issues.push({
        code: "SOURCE_ROOM_MISSING",
        message: `Signal source ${source.id} references missing room ${source.roomId}`
      });
    }

    if (!deviceIds.has(source.deviceId)) {
      issues.push({
        code: "SOURCE_DEVICE_MISSING",
        message: `Signal source ${source.id} references missing device ${source.deviceId}`
      });
    }
  }

  for (const display of catalog.displayTargets) {
    if (!roomIds.has(display.roomId)) {
      issues.push({
        code: "DISPLAY_ROOM_MISSING",
        message: `Display target ${display.id} references missing room ${display.roomId}`
      });
    }

    if (!deviceIds.has(display.deviceId)) {
      issues.push({
        code: "DISPLAY_DEVICE_MISSING",
        message: `Display target ${display.id} references missing device ${display.deviceId}`
      });
    }
  }

  for (const volume of catalog.storageVolumes) {
    if (!deviceIds.has(volume.serverDeviceId)) {
      issues.push({
        code: "STORAGE_SERVER_MISSING",
        message: `Storage volume ${volume.id} references missing server ${volume.serverDeviceId}`
      });
    }
  }

  for (const route of catalog.routeSessions) {
    if (!sourceIds.has(route.sourceId)) {
      issues.push({
        code: "ROUTE_SOURCE_MISSING",
        message: `Route session ${route.id} references missing source ${route.sourceId}`
      });
    }

    if (!displayIds.has(route.targetId)) {
      issues.push({
        code: "ROUTE_TARGET_MISSING",
        message: `Route session ${route.id} references missing display target ${route.targetId}`
      });
    }
  }

  for (const layout of catalog.layoutTemplates) {
    if (!roomIds.has(layout.roomId)) {
      issues.push({
        code: "LAYOUT_ROOM_MISSING",
        message: `Layout template ${layout.id} references missing room ${layout.roomId}`
      });
    }

    for (const slot of layout.slots) {
      if (slot.sourceId && !sourceIds.has(slot.sourceId)) {
        issues.push({
          code: "LAYOUT_SOURCE_MISSING",
          message: `Layout template ${layout.id} references missing source ${slot.sourceId}`
        });
      }
    }
  }

  for (const surgery of catalog.surgeries) {
    if (!patientIds.has(surgery.patientId)) {
      issues.push({
        code: "SURGERY_PATIENT_MISSING",
        message: `Surgery ${surgery.id} references missing patient ${surgery.patientId}`
      });
    }

    if (!roomIds.has(surgery.roomId)) {
      issues.push({
        code: "SURGERY_ROOM_MISSING",
        message: `Surgery ${surgery.id} references missing room ${surgery.roomId}`
      });
    }
  }

  for (const recording of catalog.recordingTasks) {
    if (!surgeryIds.has(recording.surgeryId)) {
      issues.push({
        code: "RECORDING_SURGERY_MISSING",
        message: `Recording ${recording.id} references missing surgery ${recording.surgeryId}`
      });
    }

    if (!sourceIds.has(recording.sourceId)) {
      issues.push({
        code: "RECORDING_SOURCE_MISSING",
        message: `Recording ${recording.id} references missing source ${recording.sourceId}`
      });
    }

    if (!storageIds.has(recording.storageVolumeId)) {
      issues.push({
        code: "RECORDING_STORAGE_MISSING",
        message: `Recording ${recording.id} references missing storage volume ${recording.storageVolumeId}`
      });
    }
  }

  for (const asset of catalog.mediaAssets) {
    if (!surgeryIds.has(asset.surgeryId)) {
      issues.push({
        code: "MEDIA_SURGERY_MISSING",
        message: `Media asset ${asset.id} references missing surgery ${asset.surgeryId}`
      });
    }

    if (!patientIds.has(asset.patientId)) {
      issues.push({
        code: "MEDIA_PATIENT_MISSING",
        message: `Media asset ${asset.id} references missing patient ${asset.patientId}`
      });
    }

    if (asset.recordingTaskId && !recordingIds.has(asset.recordingTaskId)) {
      issues.push({
        code: "MEDIA_RECORDING_MISSING",
        message: `Media asset ${asset.id} references missing recording ${asset.recordingTaskId}`
      });
    }

    if (!storageIds.has(asset.storageVolumeId)) {
      issues.push({
        code: "MEDIA_STORAGE_MISSING",
        message: `Media asset ${asset.id} references missing storage volume ${asset.storageVolumeId}`
      });
    }
  }

  for (const user of catalog.users) {
    for (const roomId of user.allowedRoomIds) {
      if (!roomIds.has(roomId)) {
        issues.push({
          code: "USER_ROOM_MISSING",
          message: `User ${user.id} references missing room ${roomId}`
        });
      }
    }
  }

  for (const meeting of catalog.meetingSessions) {
    if (!roomIds.has(meeting.roomId)) {
      issues.push({
        code: "MEETING_ROOM_MISSING",
        message: `Meeting ${meeting.id} references missing room ${meeting.roomId}`
      });
    }

    if (meeting.surgeryId && !surgeryIds.has(meeting.surgeryId)) {
      issues.push({
        code: "MEETING_SURGERY_MISSING",
        message: `Meeting ${meeting.id} references missing surgery ${meeting.surgeryId}`
      });
    }

    if (!userIds.has(meeting.createdBy)) {
      issues.push({
        code: "MEETING_CREATOR_MISSING",
        message: `Meeting ${meeting.id} references missing creator ${meeting.createdBy}`
      });
    }
  }

  for (const member of catalog.meetingMembers) {
    if (!meetingIds.has(member.meetingId)) {
      issues.push({
        code: "MEMBER_MEETING_MISSING",
        message: `Meeting member ${member.id} references missing meeting ${member.meetingId}`
      });
    }

    if (member.userId && !userIds.has(member.userId)) {
      issues.push({
        code: "MEMBER_USER_MISSING",
        message: `Meeting member ${member.id} references missing user ${member.userId}`
      });
    }
  }

  for (const endpoint of catalog.remoteEndpoints) {
    if (endpoint.roomId && !roomIds.has(endpoint.roomId)) {
      issues.push({
        code: "REMOTE_ENDPOINT_ROOM_MISSING",
        message: `Remote endpoint ${endpoint.id} references missing room ${endpoint.roomId}`
      });
    }
  }

  for (const endpoint of catalog.audioEndpoints) {
    if (!roomIds.has(endpoint.roomId)) {
      issues.push({
        code: "AUDIO_ENDPOINT_ROOM_MISSING",
        message: `Audio endpoint ${endpoint.id} references missing room ${endpoint.roomId}`
      });
    }
  }

  return issues;
}

function findDuplicateIds(code: string, label: string, ids: string[]): ValidationIssue[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }

  return [...duplicates].map((id) => ({
    code,
    message: `${label} id ${id} is duplicated`
  }));
}
