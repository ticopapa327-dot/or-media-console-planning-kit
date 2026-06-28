export type RoomType = "operating_room" | "teaching_hall" | "remote_teaching" | "server_room";

export type DeviceCategory =
  | "matrix"
  | "encoder"
  | "decoder"
  | "optical_transceiver"
  | "switch"
  | "controller"
  | "workstation"
  | "display"
  | "camera"
  | "medical_source"
  | "monitor"
  | "audio"
  | "server"
  | "storage"
  | "power"
  | "client";

export type PortDirection = "input" | "output" | "bidirectional";

export type PortKind = "hdmi" | "video" | "lan" | "audio" | "fiber" | "usb" | "power" | "wireless";

export type ConnectionKind = "hdmi" | "video" | "lan" | "audio" | "fiber" | "usb" | "power" | "wireless";

export type OperationalStatus = "online" | "offline" | "degraded" | "unknown";

export type RouteStatus = "active" | "disconnected" | "failed";

export type LayoutMode = "single" | "pip" | "pbp_quad";

export type SurgeryStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export type RecordingStatus = "recording" | "paused" | "stopped" | "failed";

export type MediaAssetType = "video" | "snapshot" | "document";

export type ChecksumStatus = "pending" | "verified" | "failed";

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  description: string;
}

export interface DevicePort {
  id: string;
  deviceId: string;
  name: string;
  direction: PortDirection;
  kind: PortKind;
}

export interface Device {
  id: string;
  roomId: string;
  name: string;
  category: DeviceCategory;
  quantity: number;
  purpose: string;
  status: OperationalStatus;
  ports: DevicePort[];
}

export interface Connection {
  id: string;
  fromDeviceId: string;
  fromPortId?: string;
  toDeviceId: string;
  toPortId?: string;
  kind: ConnectionKind;
  purpose: string;
  testRefs: string[];
}

export interface SignalSource {
  id: string;
  roomId: string;
  name: string;
  deviceId: string;
  status: OperationalStatus;
}

export interface DisplayTarget {
  id: string;
  roomId: string;
  name: string;
  deviceId: string;
  status: OperationalStatus;
}

export interface StorageVolume {
  id: string;
  serverDeviceId: string;
  name: string;
  capacityGb: number;
  usedGb: number;
  status: OperationalStatus;
}

export interface RouteSession {
  id: string;
  sourceId: string;
  targetId: string;
  status: RouteStatus;
  label: string;
  createdBy: string;
  startedAt: string;
  endedAt?: string;
}

export interface LayoutSlot {
  slot: string;
  sourceId?: string;
}

export interface LayoutTemplate {
  id: string;
  roomId: string;
  name: string;
  mode: LayoutMode;
  slots: LayoutSlot[];
}

export interface Patient {
  id: string;
  medicalRecordNo: string;
  name: string;
  sex?: string;
  age?: number;
  department?: string;
}

export interface SurgeryCase {
  id: string;
  patientId: string;
  roomId: string;
  scheduledAt: string;
  procedureName: string;
  surgeon: string;
  status: SurgeryStatus;
}

export interface RecordingTask {
  id: string;
  surgeryId: string;
  sourceId: string;
  storageVolumeId: string;
  status: RecordingStatus;
  muted: boolean;
  startedAt: string;
  pausedAt?: string;
  endedAt?: string;
  durationSeconds: number;
}

export interface MediaAsset {
  id: string;
  surgeryId: string;
  patientId: string;
  recordingTaskId?: string;
  type: MediaAssetType;
  title: string;
  storageVolumeId: string;
  path: string;
  sizeMb: number;
  checksumStatus: ChecksumStatus;
  createdAt: string;
}

export interface TopologyCatalog {
  version: string;
  generatedFrom: string;
  rooms: Room[];
  devices: Device[];
  connections: Connection[];
  signalSources: SignalSource[];
  displayTargets: DisplayTarget[];
  storageVolumes: StorageVolume[];
  routeSessions: RouteSession[];
  layoutTemplates: LayoutTemplate[];
  patients: Patient[];
  surgeries: SurgeryCase[];
  recordingTasks: RecordingTask[];
  mediaAssets: MediaAsset[];
}

export interface TopologySummary {
  roomCount: number;
  deviceCount: number;
  connectionCount: number;
  signalSourceCount: number;
  displayTargetCount: number;
  activeRouteCount: number;
  layoutTemplateCount: number;
  patientCount: number;
  surgeryCount: number;
  activeRecordingCount: number;
  mediaAssetCount: number;
  storageUsableGb: number;
  degradedDeviceCount: number;
  offlineDeviceCount: number;
}

export interface ValidationIssue {
  code: string;
  message: string;
}
