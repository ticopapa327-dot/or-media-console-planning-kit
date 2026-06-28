import {
  STANDARD_TOPOLOGY,
  summarizeTopology,
  validateTopology,
  type Connection,
  type Device,
  type DevicePort,
  type DisplayTarget,
  type LayoutTemplate,
  type MediaAsset,
  type Patient,
  type RecordingTask,
  type Room,
  type RouteSession,
  type SignalSource,
  type SurgeryCase,
  type TopologyCatalog,
  type TopologySummary,
  type ValidationIssue
} from "@or-media-console/shared";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export interface TopologyRepository {
  getCatalog(): TopologyCatalog;
  getSummary(): TopologySummary;
  getRoom(roomId: string): Room | undefined;
  validate(): ValidationIssue[];
  reset(): TopologyCatalog;
  upsertRoom(room: Room): TopologyCatalog;
  deleteRoom(roomId: string): TopologyCatalog;
  upsertDevice(device: Device): TopologyCatalog;
  deleteDevice(deviceId: string): TopologyCatalog;
  upsertDevicePort(deviceId: string, port: DevicePort): TopologyCatalog;
  deleteDevicePort(deviceId: string, portId: string): TopologyCatalog;
  upsertConnection(connection: Connection): TopologyCatalog;
  deleteConnection(connectionId: string): TopologyCatalog;
  upsertSignalSource(source: SignalSource): TopologyCatalog;
  deleteSignalSource(sourceId: string): TopologyCatalog;
  upsertDisplayTarget(target: DisplayTarget): TopologyCatalog;
  deleteDisplayTarget(targetId: string): TopologyCatalog;
  upsertRouteSession(route: RouteSession): TopologyCatalog;
  disconnectRouteSession(routeId: string, endedAt?: string): TopologyCatalog;
  deleteRouteSession(routeId: string): TopologyCatalog;
  upsertLayoutTemplate(layout: LayoutTemplate): TopologyCatalog;
  deleteLayoutTemplate(layoutId: string): TopologyCatalog;
  upsertPatient(patient: Patient): TopologyCatalog;
  deletePatient(patientId: string): TopologyCatalog;
  upsertSurgery(surgery: SurgeryCase): TopologyCatalog;
  deleteSurgery(surgeryId: string): TopologyCatalog;
  startRecording(recording: RecordingTask): TopologyCatalog;
  pauseRecording(recordingId: string, pausedAt?: string): TopologyCatalog;
  resumeRecording(recordingId: string): TopologyCatalog;
  stopRecording(recordingId: string, endedAt?: string): TopologyCatalog;
  failRecording(recordingId: string, endedAt?: string): TopologyCatalog;
  upsertMediaAsset(asset: MediaAsset): TopologyCatalog;
  deleteMediaAsset(assetId: string): TopologyCatalog;
}

export class InMemoryTopologyRepository implements TopologyRepository {
  constructor(private catalog: TopologyCatalog = cloneCatalog(STANDARD_TOPOLOGY)) {}

  getCatalog(): TopologyCatalog {
    return cloneCatalog(this.catalog);
  }

  getSummary(): TopologySummary {
    return summarizeTopology(this.catalog);
  }

  getRoom(roomId: string): Room | undefined {
    return this.catalog.rooms.find((room) => room.id === roomId);
  }

  validate(): ValidationIssue[] {
    return validateTopology(this.catalog);
  }

  reset(): TopologyCatalog {
    return this.save(cloneCatalog(STANDARD_TOPOLOGY));
  }

  upsertRoom(room: Room): TopologyCatalog {
    return this.save(upsertById(this.catalog, "rooms", room));
  }

  deleteRoom(roomId: string): TopologyCatalog {
    if (this.catalog.devices.some((device) => device.roomId === roomId)) {
      throw new RepositoryError(409, "ROOM_HAS_DEVICES", `Room ${roomId} still has devices`);
    }

    return this.save({
      ...this.catalog,
      rooms: this.catalog.rooms.filter((room) => room.id !== roomId),
      signalSources: this.catalog.signalSources.filter((source) => source.roomId !== roomId),
      displayTargets: this.catalog.displayTargets.filter((target) => target.roomId !== roomId)
    });
  }

  upsertDevice(device: Device): TopologyCatalog {
    return this.save(upsertById(this.catalog, "devices", device));
  }

  deleteDevice(deviceId: string): TopologyCatalog {
    const isReferenced =
      this.catalog.connections.some((connection) => connection.fromDeviceId === deviceId || connection.toDeviceId === deviceId) ||
      this.catalog.signalSources.some((source) => source.deviceId === deviceId) ||
      this.catalog.displayTargets.some((target) => target.deviceId === deviceId) ||
      this.catalog.storageVolumes.some((volume) => volume.serverDeviceId === deviceId);

    if (isReferenced) {
      throw new RepositoryError(409, "DEVICE_IS_REFERENCED", `Device ${deviceId} is still referenced`);
    }

    return this.save({
      ...this.catalog,
      devices: this.catalog.devices.filter((device) => device.id !== deviceId)
    });
  }

  upsertDevicePort(deviceId: string, port: DevicePort): TopologyCatalog {
    if (port.deviceId !== deviceId) {
      throw new RepositoryError(400, "PORT_DEVICE_MISMATCH", `Port ${port.id} does not belong to ${deviceId}`);
    }

    const devices = this.catalog.devices.map((device) => {
      if (device.id !== deviceId) {
        return device;
      }

      return {
        ...device,
        ports: upsertListById(device.ports, port)
      };
    });

    if (!devices.some((device) => device.id === deviceId)) {
      throw new RepositoryError(404, "DEVICE_NOT_FOUND", `Device ${deviceId} was not found`);
    }

    return this.save({ ...this.catalog, devices });
  }

  deleteDevicePort(deviceId: string, portId: string): TopologyCatalog {
    if (this.catalog.connections.some((connection) => connection.fromPortId === portId || connection.toPortId === portId)) {
      throw new RepositoryError(409, "PORT_IS_REFERENCED", `Port ${portId} is still referenced`);
    }

    const devices = this.catalog.devices.map((device) => {
      if (device.id !== deviceId) {
        return device;
      }

      return {
        ...device,
        ports: device.ports.filter((port) => port.id !== portId)
      };
    });

    return this.save({ ...this.catalog, devices });
  }

  upsertConnection(connection: Connection): TopologyCatalog {
    return this.save(upsertById(this.catalog, "connections", connection));
  }

  deleteConnection(connectionId: string): TopologyCatalog {
    return this.save({
      ...this.catalog,
      connections: this.catalog.connections.filter((connection) => connection.id !== connectionId)
    });
  }

  upsertSignalSource(source: SignalSource): TopologyCatalog {
    return this.save(upsertById(this.catalog, "signalSources", source));
  }

  deleteSignalSource(sourceId: string): TopologyCatalog {
    return this.save({
      ...this.catalog,
      signalSources: this.catalog.signalSources.filter((source) => source.id !== sourceId)
    });
  }

  upsertDisplayTarget(target: DisplayTarget): TopologyCatalog {
    return this.save(upsertById(this.catalog, "displayTargets", target));
  }

  deleteDisplayTarget(targetId: string): TopologyCatalog {
    return this.save({
      ...this.catalog,
      displayTargets: this.catalog.displayTargets.filter((target) => target.id !== targetId)
    });
  }

  upsertRouteSession(route: RouteSession): TopologyCatalog {
    if (
      route.status === "active" &&
      this.catalog.routeSessions.some(
        (existingRoute) =>
          existingRoute.id !== route.id && existingRoute.status === "active" && existingRoute.targetId === route.targetId
      )
    ) {
      throw new RepositoryError(409, "ROUTE_TARGET_OCCUPIED", `Display target ${route.targetId} already has an active route`);
    }

    return this.save(upsertById(this.catalog, "routeSessions", route));
  }

  disconnectRouteSession(routeId: string, endedAt = new Date().toISOString()): TopologyCatalog {
    const route = this.catalog.routeSessions.find((candidate) => candidate.id === routeId);

    if (!route) {
      throw new RepositoryError(404, "ROUTE_NOT_FOUND", `Route session ${routeId} was not found`);
    }

    return this.save({
      ...this.catalog,
      routeSessions: this.catalog.routeSessions.map((candidate) =>
        candidate.id === routeId ? { ...candidate, status: "disconnected", endedAt } : candidate
      )
    });
  }

  deleteRouteSession(routeId: string): TopologyCatalog {
    return this.save({
      ...this.catalog,
      routeSessions: this.catalog.routeSessions.filter((route) => route.id !== routeId)
    });
  }

  upsertLayoutTemplate(layout: LayoutTemplate): TopologyCatalog {
    return this.save(upsertById(this.catalog, "layoutTemplates", layout));
  }

  deleteLayoutTemplate(layoutId: string): TopologyCatalog {
    return this.save({
      ...this.catalog,
      layoutTemplates: this.catalog.layoutTemplates.filter((layout) => layout.id !== layoutId)
    });
  }

  upsertPatient(patient: Patient): TopologyCatalog {
    return this.save(upsertById(this.catalog, "patients", patient));
  }

  deletePatient(patientId: string): TopologyCatalog {
    const isReferenced =
      this.catalog.surgeries.some((surgery) => surgery.patientId === patientId) ||
      this.catalog.mediaAssets.some((asset) => asset.patientId === patientId);

    if (isReferenced) {
      throw new RepositoryError(409, "PATIENT_IS_REFERENCED", `Patient ${patientId} is still referenced`);
    }

    return this.save({
      ...this.catalog,
      patients: this.catalog.patients.filter((patient) => patient.id !== patientId)
    });
  }

  upsertSurgery(surgery: SurgeryCase): TopologyCatalog {
    return this.save(upsertById(this.catalog, "surgeries", surgery));
  }

  deleteSurgery(surgeryId: string): TopologyCatalog {
    const isReferenced =
      this.catalog.recordingTasks.some((recording) => recording.surgeryId === surgeryId) ||
      this.catalog.mediaAssets.some((asset) => asset.surgeryId === surgeryId);

    if (isReferenced) {
      throw new RepositoryError(409, "SURGERY_IS_REFERENCED", `Surgery ${surgeryId} is still referenced`);
    }

    return this.save({
      ...this.catalog,
      surgeries: this.catalog.surgeries.filter((surgery) => surgery.id !== surgeryId)
    });
  }

  startRecording(recording: RecordingTask): TopologyCatalog {
    if (
      this.catalog.recordingTasks.some(
        (candidate) =>
          candidate.id !== recording.id &&
          candidate.sourceId === recording.sourceId &&
          (candidate.status === "recording" || candidate.status === "paused")
      )
    ) {
      throw new RepositoryError(409, "SOURCE_ALREADY_RECORDING", `Signal source ${recording.sourceId} already has an active recording`);
    }

    return this.save(upsertById(this.catalog, "recordingTasks", recording));
  }

  pauseRecording(recordingId: string, pausedAt = new Date().toISOString()): TopologyCatalog {
    const recording = this.getRecordingOrThrow(recordingId);

    if (recording.status !== "recording") {
      throw new RepositoryError(409, "RECORDING_NOT_ACTIVE", `Recording ${recordingId} is not active`);
    }

    return this.save({
      ...this.catalog,
      recordingTasks: this.catalog.recordingTasks.map((candidate) =>
        candidate.id === recordingId ? { ...candidate, status: "paused", pausedAt } : candidate
      )
    });
  }

  resumeRecording(recordingId: string): TopologyCatalog {
    const recording = this.getRecordingOrThrow(recordingId);

    if (recording.status !== "paused") {
      throw new RepositoryError(409, "RECORDING_NOT_PAUSED", `Recording ${recordingId} is not paused`);
    }

    return this.save({
      ...this.catalog,
      recordingTasks: this.catalog.recordingTasks.map((candidate) =>
        candidate.id === recordingId ? { ...candidate, status: "recording", pausedAt: undefined } : candidate
      )
    });
  }

  stopRecording(recordingId: string, endedAt = new Date().toISOString()): TopologyCatalog {
    const recording = this.getRecordingOrThrow(recordingId);

    if (recording.status !== "recording" && recording.status !== "paused") {
      throw new RepositoryError(409, "RECORDING_NOT_RUNNING", `Recording ${recordingId} is not running`);
    }

    const surgery = this.catalog.surgeries.find((candidate) => candidate.id === recording.surgeryId);
    const assetId = `MEDIA-${recording.id}`;
    const durationSeconds = Math.max(Math.round((Date.parse(endedAt) - Date.parse(recording.startedAt)) / 1000), recording.durationSeconds);
    const mediaAsset: MediaAsset = {
      id: assetId,
      surgeryId: recording.surgeryId,
      patientId: surgery?.patientId ?? "unknown-patient",
      recordingTaskId: recording.id,
      type: "video",
      title: `${recording.id} 录制文件`,
      storageVolumeId: recording.storageVolumeId,
      path: `media/${recording.surgeryId}/${assetId}.mp4`,
      sizeMb: Math.max(Math.round(durationSeconds / 60) * 64, 64),
      checksumStatus: "pending",
      createdAt: endedAt
    };

    return this.save({
      ...this.catalog,
      recordingTasks: this.catalog.recordingTasks.map((candidate) =>
        candidate.id === recordingId ? { ...candidate, status: "stopped", endedAt, durationSeconds } : candidate
      ),
      mediaAssets: upsertListById(this.catalog.mediaAssets, mediaAsset),
      storageVolumes: this.catalog.storageVolumes.map((volume) =>
        volume.id === recording.storageVolumeId ? { ...volume, usedGb: volume.usedGb + Math.ceil(mediaAsset.sizeMb / 1024) } : volume
      )
    });
  }

  failRecording(recordingId: string, endedAt = new Date().toISOString()): TopologyCatalog {
    this.getRecordingOrThrow(recordingId);

    return this.save({
      ...this.catalog,
      recordingTasks: this.catalog.recordingTasks.map((candidate) =>
        candidate.id === recordingId ? { ...candidate, status: "failed", endedAt } : candidate
      )
    });
  }

  upsertMediaAsset(asset: MediaAsset): TopologyCatalog {
    return this.save(upsertById(this.catalog, "mediaAssets", asset));
  }

  deleteMediaAsset(assetId: string): TopologyCatalog {
    return this.save({
      ...this.catalog,
      mediaAssets: this.catalog.mediaAssets.filter((asset) => asset.id !== assetId)
    });
  }

  private getRecordingOrThrow(recordingId: string): RecordingTask {
    const recording = this.catalog.recordingTasks.find((candidate) => candidate.id === recordingId);

    if (!recording) {
      throw new RepositoryError(404, "RECORDING_NOT_FOUND", `Recording ${recordingId} was not found`);
    }

    return recording;
  }

  protected save(catalog: TopologyCatalog): TopologyCatalog {
    const issues = validateTopology(catalog);

    if (issues.length > 0) {
      throw new RepositoryError(400, "TOPOLOGY_INVALID", "Topology validation failed", issues);
    }

    this.catalog = cloneCatalog(catalog);
    return this.getCatalog();
  }
}

export class FileTopologyRepository extends InMemoryTopologyRepository {
  constructor(private readonly filePath: string, seed: TopologyCatalog = STANDARD_TOPOLOGY) {
    super(loadCatalog(filePath, seed));
  }

  protected override save(catalog: TopologyCatalog): TopologyCatalog {
    const saved = super.save(catalog);
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, `${JSON.stringify(saved, null, 2)}\n`, "utf8");
    return saved;
  }
}

export class RepositoryError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
  }
}

function loadCatalog(filePath: string, seed: TopologyCatalog): TopologyCatalog {
  if (!existsSync(filePath)) {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
    return cloneCatalog(seed);
  }

  return normalizeCatalog(JSON.parse(readFileSync(filePath, "utf8")) as Partial<TopologyCatalog>);
}

function cloneCatalog(catalog: TopologyCatalog): TopologyCatalog {
  return normalizeCatalog(JSON.parse(JSON.stringify(catalog)) as Partial<TopologyCatalog>);
}

function normalizeCatalog(catalog: Partial<TopologyCatalog>): TopologyCatalog {
  return {
    version: catalog.version ?? STANDARD_TOPOLOGY.version,
    generatedFrom: catalog.generatedFrom ?? STANDARD_TOPOLOGY.generatedFrom,
    rooms: catalog.rooms ?? [],
    devices: catalog.devices ?? [],
    connections: catalog.connections ?? [],
    signalSources: catalog.signalSources ?? [],
    displayTargets: catalog.displayTargets ?? [],
    storageVolumes: catalog.storageVolumes ?? [],
    routeSessions: catalog.routeSessions ?? [],
    layoutTemplates: catalog.layoutTemplates ?? [],
    patients: catalog.patients ?? [],
    surgeries: catalog.surgeries ?? [],
    recordingTasks: catalog.recordingTasks ?? [],
    mediaAssets: catalog.mediaAssets ?? []
  };
}

type CatalogListKey = {
  [Key in keyof TopologyCatalog]: TopologyCatalog[Key] extends Array<{ id: string }> ? Key : never;
}[keyof TopologyCatalog];

function upsertById(
  catalog: TopologyCatalog,
  key: CatalogListKey,
  entity: { id: string }
): TopologyCatalog {
  const list = catalog[key] as unknown as Array<{ id: string }>;

  return {
    ...catalog,
    [key]: upsertListById(list, entity)
  } as TopologyCatalog;
}

function upsertListById<T extends { id: string }>(list: T[], entity: T): T[] {
  const exists = list.some((item) => item.id === entity.id);

  if (!exists) {
    return [...list, entity];
  }

  return list.map((item) => (item.id === entity.id ? entity : item));
}
