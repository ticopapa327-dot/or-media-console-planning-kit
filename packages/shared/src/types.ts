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

export type UserRole = "or_operator" | "teaching_user" | "remote_expert" | "device_engineer" | "admin" | "auditor";

export type PermissionKey =
  | "topology:read"
  | "topology:write"
  | "route:control"
  | "recording:control"
  | "meeting:manage"
  | "remote:authorize"
  | "audio:control"
  | "alert:manage"
  | "audit:read"
  | "user:manage";

export type MeetingStatus = "open" | "closed";

export type MeetingMemberRole = "host" | "viewer" | "speaker";

export type RemoteDeviceType = "office_pc" | "mobile" | "tablet" | "laptop" | "teaching_host";

export type AudioEndpointKind = "microphone" | "speaker" | "amplifier";

export type GovernanceEntityType =
  | "room"
  | "device"
  | "connection"
  | "signal_source"
  | "display_target"
  | "route"
  | "layout"
  | "patient"
  | "surgery"
  | "recording"
  | "media_asset"
  | "user"
  | "meeting"
  | "meeting_member"
  | "remote_endpoint"
  | "audio_endpoint"
  | "storage_volume"
  | "topology";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertStatus = "open" | "acknowledged" | "resolved";

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

export interface UserAccount {
  id: string;
  displayName: string;
  role: UserRole;
  allowedRoomIds: string[];
  enabled: boolean;
}

export interface RoleCapability {
  role: UserRole;
  permissions: PermissionKey[];
}

export interface AuthSession {
  user: UserAccount;
  permissions: PermissionKey[];
}

export interface MeetingSession {
  id: string;
  title: string;
  roomId: string;
  surgeryId?: string;
  status: MeetingStatus;
  createdBy: string;
  createdAt: string;
  closedAt?: string;
}

export interface MeetingMember {
  id: string;
  meetingId: string;
  userId?: string;
  displayName: string;
  role: MeetingMemberRole;
  audioMuted: boolean;
}

export interface RemoteEndpoint {
  id: string;
  name: string;
  deviceType: RemoteDeviceType;
  roomId?: string;
  authorized: boolean;
  network: "lan" | "wifi";
  status: OperationalStatus;
}

export interface AudioEndpoint {
  id: string;
  roomId: string;
  name: string;
  kind: AudioEndpointKind;
  muted: boolean;
  volume: number;
  status: OperationalStatus;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  entityType: GovernanceEntityType;
  entityId: string;
  occurredAt: string;
  summary: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface SystemAlert {
  id: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  relatedEntityType?: GovernanceEntityType;
  relatedEntityId?: string;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface StatusEvent {
  id: string;
  entityType: GovernanceEntityType;
  entityId: string;
  previousStatus?: string;
  nextStatus: string;
  severity: AlertSeverity;
  occurredAt: string;
  note?: string;
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
  users: UserAccount[];
  roleCapabilities: RoleCapability[];
  meetingSessions: MeetingSession[];
  meetingMembers: MeetingMember[];
  remoteEndpoints: RemoteEndpoint[];
  audioEndpoints: AudioEndpoint[];
  auditLogs: AuditLogEntry[];
  systemAlerts: SystemAlert[];
  statusEvents: StatusEvent[];
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
  openMeetingCount: number;
  authorizedRemoteEndpointCount: number;
  audioEndpointCount: number;
  enabledUserCount: number;
  roleCapabilityCount: number;
  auditLogCount: number;
  openAlertCount: number;
  criticalAlertCount: number;
  statusEventCount: number;
  storageUsableGb: number;
  degradedDeviceCount: number;
  offlineDeviceCount: number;
}

export interface ValidationIssue {
  code: string;
  message: string;
}
