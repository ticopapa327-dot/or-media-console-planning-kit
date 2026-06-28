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

export interface TopologyCatalog {
  version: string;
  generatedFrom: string;
  rooms: Room[];
  devices: Device[];
  connections: Connection[];
  signalSources: SignalSource[];
  displayTargets: DisplayTarget[];
  storageVolumes: StorageVolume[];
}

export interface TopologySummary {
  roomCount: number;
  deviceCount: number;
  connectionCount: number;
  signalSourceCount: number;
  displayTargetCount: number;
  storageUsableGb: number;
  degradedDeviceCount: number;
  offlineDeviceCount: number;
}

export interface ValidationIssue {
  code: string;
  message: string;
}
