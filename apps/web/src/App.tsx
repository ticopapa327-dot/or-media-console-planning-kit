import {
  Activity,
  Cable,
  Database,
  Monitor,
  Plus,
  RadioTower,
  RotateCcw,
  Save,
  Server,
  ShieldCheck,
  Trash2,
  Workflow
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  Connection,
  ConnectionKind,
  Device,
  DeviceCategory,
  LayoutTemplate,
  MediaAsset,
  OperationalStatus,
  Patient,
  RecordingStatus,
  RecordingTask,
  Room,
  RoomType,
  RouteSession,
  SurgeryCase,
  SurgeryStatus,
  TopologyCatalog,
  TopologySummary
} from "@or-media-console/shared";
import {
  createConnection,
  createDevice,
  createPatient,
  createRoom,
  createRoute,
  createSurgery,
  deleteConnection,
  deleteDevice,
  deleteRoom,
  deleteRoute,
  disconnectRoute,
  failRecording,
  fetchTopology,
  pauseRecording,
  resetTopology,
  resumeRecording,
  saveConnection,
  saveDevice,
  saveLayout,
  saveMediaAsset,
  savePatient,
  saveRoom,
  saveRoute,
  saveSurgery,
  startRecording,
  stopRecording,
  type TopologyResponse
} from "./api";

const roomOrder = ["room-or-standard", "room-teaching-hall", "room-remote-teaching", "room-server-core"];
const defaultRoomId = "room-or-standard";
const roomTypes: RoomType[] = ["operating_room", "teaching_hall", "remote_teaching", "server_room"];
const statuses: OperationalStatus[] = ["online", "degraded", "offline", "unknown"];
const surgeryStatuses: SurgeryStatus[] = ["scheduled", "in_progress", "completed", "cancelled"];
const recordingStatuses: RecordingStatus[] = ["recording", "paused", "stopped", "failed"];
const connectionKinds: ConnectionKind[] = ["hdmi", "video", "lan", "audio", "fiber", "usb", "power", "wireless"];
const deviceCategories: DeviceCategory[] = [
  "matrix",
  "encoder",
  "decoder",
  "optical_transceiver",
  "switch",
  "controller",
  "workstation",
  "display",
  "camera",
  "medical_source",
  "monitor",
  "audio",
  "server",
  "storage",
  "power",
  "client"
];

function statusText(status: OperationalStatus): string {
  const labels: Record<OperationalStatus, string> = {
    online: "在线",
    offline: "离线",
    degraded: "降级",
    unknown: "待确认"
  };

  return labels[status];
}

function categoryText(category: DeviceCategory): string {
  const labels: Record<DeviceCategory, string> = {
    matrix: "矩阵",
    encoder: "编码",
    decoder: "解码",
    optical_transceiver: "光端机",
    switch: "交换",
    controller: "控制",
    workstation: "工作站",
    display: "显示",
    camera: "摄像",
    medical_source: "视频源",
    monitor: "监护",
    audio: "音频",
    server: "服务器",
    storage: "存储",
    power: "供电",
    client: "终端"
  };

  return labels[category];
}

function roomTypeText(type: RoomType): string {
  const labels: Record<RoomType, string> = {
    operating_room: "手术室端",
    teaching_hall: "示教报告厅",
    remote_teaching: "远程示教端",
    server_room: "服务器侧"
  };

  return labels[type];
}

function surgeryStatusText(status: SurgeryStatus): string {
  const labels: Record<SurgeryStatus, string> = {
    scheduled: "已排程",
    in_progress: "进行中",
    completed: "已完成",
    cancelled: "已取消"
  };

  return labels[status];
}

function recordingStatusText(status: RecordingStatus): string {
  const labels: Record<RecordingStatus, string> = {
    recording: "录制中",
    paused: "已暂停",
    stopped: "已停止",
    failed: "失败"
  };

  return labels[status];
}

function metricItems(summary: TopologySummary) {
  return [
    { label: "房间", value: summary.roomCount, icon: Workflow },
    { label: "设备", value: summary.deviceCount, icon: Server },
    { label: "连接", value: summary.connectionCount, icon: Cable },
    { label: "信号源", value: summary.signalSourceCount, icon: RadioTower },
    { label: "显示端", value: summary.displayTargetCount, icon: Monitor },
    { label: "活动路由", value: summary.activeRouteCount, icon: Cable },
    { label: "录制中", value: summary.activeRecordingCount, icon: Activity },
    { label: "媒体", value: summary.mediaAssetCount, icon: Database },
    { label: "布局", value: summary.layoutTemplateCount, icon: Workflow },
    { label: "可用存储", value: `${summary.storageUsableGb} GB`, icon: Database }
  ];
}

function createDeviceDraft(roomId: string): Device {
  return {
    id: "",
    roomId,
    name: "",
    category: "client",
    quantity: 1,
    purpose: "",
    status: "unknown",
    ports: []
  };
}

function createRoomDraft(): Room {
  return {
    id: "",
    name: "",
    type: "operating_room",
    description: ""
  };
}

function createConnectionDraft(): Connection {
  return {
    id: "",
    fromDeviceId: "",
    toDeviceId: "",
    kind: "lan",
    purpose: "",
    testRefs: []
  };
}

function createRouteDraft(): Pick<RouteSession, "sourceId" | "targetId" | "label" | "createdBy"> {
  return {
    sourceId: "",
    targetId: "",
    label: "",
    createdBy: "local-admin"
  };
}

function createPatientDraft(): Patient {
  return {
    id: "",
    medicalRecordNo: "",
    name: "",
    sex: "未指定",
    age: 0,
    department: ""
  };
}

function createSurgeryDraft(roomId: string): SurgeryCase {
  return {
    id: "",
    patientId: "",
    roomId,
    scheduledAt: new Date().toISOString(),
    procedureName: "",
    surgeon: "",
    status: "scheduled"
  };
}

function createRecordingDraft(): Pick<RecordingTask, "surgeryId" | "sourceId" | "storageVolumeId" | "muted"> {
  return {
    surgeryId: "",
    sourceId: "",
    storageVolumeId: "VOL-REC-PRIMARY",
    muted: false
  };
}

export function App() {
  const [topology, setTopology] = useState<TopologyResponse | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState(defaultRoomId);
  const [roomDraft, setRoomDraft] = useState<Room>(createRoomDraft);
  const [deviceDraft, setDeviceDraft] = useState<Device>(() => createDeviceDraft(defaultRoomId));
  const [connectionDraft, setConnectionDraft] = useState<Connection>(createConnectionDraft);
  const [routeDraft, setRouteDraft] = useState(createRouteDraft);
  const [patientDraft, setPatientDraft] = useState<Patient>(createPatientDraft);
  const [surgeryDraft, setSurgeryDraft] = useState<SurgeryCase>(() => createSurgeryDraft(defaultRoomId));
  const [recordingDraft, setRecordingDraft] = useState(createRecordingDraft);
  const [notice, setNotice] = useState("拓扑载入中");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchTopology().then((response) => {
      setTopology(response);
      setNotice("拓扑已载入");
    });
  }, []);

  const catalog: TopologyCatalog | undefined = topology?.catalog;
  const summary = topology?.summary;
  const rooms = useMemo(() => {
    if (!catalog) {
      return [];
    }

    return [...catalog.rooms].sort((left, right) => {
      const leftIndex = roomOrder.indexOf(left.id);
      const rightIndex = roomOrder.indexOf(right.id);
      return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
    });
  }, [catalog]);
  const selectedRoom: Room | undefined = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0];
  const roomDevices = catalog?.devices.filter((device) => device.roomId === selectedRoom?.id) ?? [];
  const deviceIds = new Set(roomDevices.map((device) => device.id));
  const roomConnections =
    catalog?.connections.filter((connection) => deviceIds.has(connection.fromDeviceId) || deviceIds.has(connection.toDeviceId)) ?? [];
  const roomSourceIds = new Set(catalog?.signalSources.filter((source) => source.roomId === selectedRoom?.id).map((source) => source.id));
  const roomTargetIds = new Set(catalog?.displayTargets.filter((target) => target.roomId === selectedRoom?.id).map((target) => target.id));
  const roomRoutes =
    catalog?.routeSessions.filter((route) => roomSourceIds.has(route.sourceId) || roomTargetIds.has(route.targetId)) ?? [];
  const roomLayouts = catalog?.layoutTemplates.filter((layout) => layout.roomId === selectedRoom?.id) ?? [];
  const roomSurgeries = catalog?.surgeries.filter((surgery) => surgery.roomId === selectedRoom?.id) ?? [];
  const roomSurgeryIds = new Set(roomSurgeries.map((surgery) => surgery.id));
  const roomRecordings = catalog?.recordingTasks.filter((recording) => roomSurgeryIds.has(recording.surgeryId)) ?? [];
  const roomMediaAssets = catalog?.mediaAssets.filter((asset) => roomSurgeryIds.has(asset.surgeryId)) ?? [];

  useEffect(() => {
    if (selectedRoom) {
      setRoomDraft(selectedRoom);
      setDeviceDraft(createDeviceDraft(selectedRoom.id));
      setSurgeryDraft((current) => ({ ...current, roomId: selectedRoom.id }));
    }
  }, [selectedRoom?.id]);

  function applyResponse(response: TopologyResponse, message: string) {
    setTopology(response);
    setNotice(message);
    setError(null);
  }

  async function perform(action: () => Promise<TopologyResponse>, message: string) {
    try {
      applyResponse(await action(), message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "操作失败");
    }
  }

  function updateLocalDevice(deviceId: string, updates: Partial<Device>) {
    setTopology((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        catalog: {
          ...current.catalog,
          devices: current.catalog.devices.map((device) => (device.id === deviceId ? { ...device, ...updates } : device))
        }
      };
    });
  }

  function updateLocalConnection(connectionId: string, updates: Partial<Connection>) {
    setTopology((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        catalog: {
          ...current.catalog,
          connections: current.catalog.connections.map((connection) =>
            connection.id === connectionId ? { ...connection, ...updates } : connection
          )
        }
      };
    });
  }

  function updateLocalRoute(routeId: string, updates: Partial<RouteSession>) {
    setTopology((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        catalog: {
          ...current.catalog,
          routeSessions: current.catalog.routeSessions.map((route) => (route.id === routeId ? { ...route, ...updates } : route))
        }
      };
    });
  }

  function updateLocalMediaAsset(assetId: string, updates: Partial<MediaAsset>) {
    setTopology((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        catalog: {
          ...current.catalog,
          mediaAssets: current.catalog.mediaAssets.map((asset) => (asset.id === assetId ? { ...asset, ...updates } : asset))
        }
      };
    });
  }

  return (
    <main className="shell">
      <aside className="sidebar" aria-label="房间导航">
        <div className="brand">
          <ShieldCheck aria-hidden="true" />
          <span>标准版控制台</span>
        </div>
        <nav>
          {rooms.map((room) => (
            <button
              className={room.id === selectedRoom?.id ? "navItem active" : "navItem"}
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              type="button"
            >
              <span>{room.name}</span>
              <small>{roomTypeText(room.type)}</small>
            </button>
          ))}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Sprint 1 · 拓扑配置管理</p>
            <h1>数字化手术室媒体控制台</h1>
          </div>
          <div className="topActions">
            <div className="healthBadge">
              <Activity aria-hidden="true" />
              <span>{notice}</span>
            </div>
            <button className="iconButton" onClick={() => perform(resetTopology, "拓扑已重置")} title="重置拓扑" type="button">
              <RotateCcw aria-hidden="true" />
            </button>
          </div>
        </header>

        {error ? <div className="alert error">{error}</div> : null}
        {topology?.validation.length ? (
          <div className="alert warning">{topology.validation.map((issue) => issue.message).join("；")}</div>
        ) : null}

        {summary ? (
          <section className="metricGrid" aria-label="拓扑统计">
            {metricItems(summary).map((item) => {
              const Icon = item.icon;

              return (
                <article className="metricCard" key={item.label}>
                  <Icon aria-hidden="true" />
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}

        <section className="workspace">
          <div className="roomPanel">
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">区域配置</p>
                <h2>{selectedRoom?.name ?? "未选择"}</h2>
              </div>
              <span className="pill">{roomDevices.length} 台设备</span>
            </div>

            <div className="formGrid roomForm">
              <label className="field">
                <span>编号</span>
                <input value={roomDraft.id} onChange={(event) => setRoomDraft({ ...roomDraft, id: event.target.value })} />
              </label>
              <label className="field">
                <span>名称</span>
                <input value={roomDraft.name} onChange={(event) => setRoomDraft({ ...roomDraft, name: event.target.value })} />
              </label>
              <label className="field">
                <span>类型</span>
                <select value={roomDraft.type} onChange={(event) => setRoomDraft({ ...roomDraft, type: event.target.value as RoomType })}>
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {roomTypeText(type)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field wide">
                <span>说明</span>
                <input
                  value={roomDraft.description}
                  onChange={(event) => setRoomDraft({ ...roomDraft, description: event.target.value })}
                />
              </label>
              <div className="buttonRow">
                <button onClick={() => perform(() => saveRoom(roomDraft), "房间已保存")} type="button">
                  <Save aria-hidden="true" />
                  保存
                </button>
                <button onClick={() => perform(() => createRoom(roomDraft), "房间已新增")} type="button">
                  <Plus aria-hidden="true" />
                  新增
                </button>
                <button onClick={() => selectedRoom && perform(() => deleteRoom(selectedRoom.id), "房间已删除")} type="button">
                  <Trash2 aria-hidden="true" />
                  删除
                </button>
              </div>
            </div>

            <div className="sectionHeader listHeader">
              <div>
                <p className="eyebrow">病例</p>
                <h2>手术资料</h2>
              </div>
            </div>

            <div className="formGrid caseForm">
              <label className="field">
                <span>患者编号</span>
                <input value={patientDraft.id} onChange={(event) => setPatientDraft({ ...patientDraft, id: event.target.value })} />
              </label>
              <label className="field">
                <span>病历号</span>
                <input
                  value={patientDraft.medicalRecordNo}
                  onChange={(event) => setPatientDraft({ ...patientDraft, medicalRecordNo: event.target.value })}
                />
              </label>
              <label className="field">
                <span>患者姓名</span>
                <input value={patientDraft.name} onChange={(event) => setPatientDraft({ ...patientDraft, name: event.target.value })} />
              </label>
              <label className="field">
                <span>科室</span>
                <input
                  value={patientDraft.department}
                  onChange={(event) => setPatientDraft({ ...patientDraft, department: event.target.value })}
                />
              </label>
              <div className="buttonRow">
                <button onClick={() => perform(() => createPatient(patientDraft), "患者已新增")} type="button">
                  <Plus aria-hidden="true" />
                  新增患者
                </button>
                <button onClick={() => perform(() => savePatient(patientDraft), "患者已保存")} type="button">
                  <Save aria-hidden="true" />
                  保存患者
                </button>
              </div>
            </div>

            <div className="formGrid caseForm">
              <label className="field">
                <span>手术编号</span>
                <input value={surgeryDraft.id} onChange={(event) => setSurgeryDraft({ ...surgeryDraft, id: event.target.value })} />
              </label>
              <label className="field">
                <span>患者</span>
                <select value={surgeryDraft.patientId} onChange={(event) => setSurgeryDraft({ ...surgeryDraft, patientId: event.target.value })}>
                  <option value="">选择患者</option>
                  {catalog?.patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.medicalRecordNo} · {patient.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>术式</span>
                <input
                  value={surgeryDraft.procedureName}
                  onChange={(event) => setSurgeryDraft({ ...surgeryDraft, procedureName: event.target.value })}
                />
              </label>
              <label className="field">
                <span>医生</span>
                <input value={surgeryDraft.surgeon} onChange={(event) => setSurgeryDraft({ ...surgeryDraft, surgeon: event.target.value })} />
              </label>
              <label className="field">
                <span>状态</span>
                <select
                  value={surgeryDraft.status}
                  onChange={(event) => setSurgeryDraft({ ...surgeryDraft, status: event.target.value as SurgeryStatus })}
                >
                  {surgeryStatuses.map((status) => (
                    <option key={status} value={status}>
                      {surgeryStatusText(status)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="buttonRow">
                <button
                  onClick={() =>
                    perform(
                      () =>
                        createSurgery({
                          ...surgeryDraft,
                          roomId: selectedRoom?.id ?? surgeryDraft.roomId
                        }),
                      "手术已新增"
                    )
                  }
                  type="button"
                >
                  <Plus aria-hidden="true" />
                  新增手术
                </button>
                <button onClick={() => perform(() => saveSurgery(surgeryDraft), "手术已保存")} type="button">
                  <Save aria-hidden="true" />
                  保存手术
                </button>
              </div>
            </div>

            <div className="caseList">
              {roomSurgeries.map((surgery) => {
                const patient = catalog?.patients.find((item) => item.id === surgery.patientId);

                return (
                  <article className="caseRow" key={surgery.id}>
                    <strong>{surgery.procedureName}</strong>
                    <span>{patient?.name ?? surgery.patientId}</span>
                    <em>{surgeryStatusText(surgery.status)}</em>
                  </article>
                );
              })}
            </div>

            <div className="sectionHeader listHeader">
              <div>
                <p className="eyebrow">设备</p>
                <h2>设备目录</h2>
              </div>
            </div>

            <div className="formGrid addForm">
              <label className="field">
                <span>编号</span>
                <input value={deviceDraft.id} onChange={(event) => setDeviceDraft({ ...deviceDraft, id: event.target.value })} />
              </label>
              <label className="field">
                <span>名称</span>
                <input value={deviceDraft.name} onChange={(event) => setDeviceDraft({ ...deviceDraft, name: event.target.value })} />
              </label>
              <label className="field">
                <span>分类</span>
                <select
                  value={deviceDraft.category}
                  onChange={(event) => setDeviceDraft({ ...deviceDraft, category: event.target.value as DeviceCategory })}
                >
                  {deviceCategories.map((category) => (
                    <option key={category} value={category}>
                      {categoryText(category)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>状态</span>
                <select
                  value={deviceDraft.status}
                  onChange={(event) => setDeviceDraft({ ...deviceDraft, status: event.target.value as OperationalStatus })}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {statusText(status)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field wide">
                <span>用途</span>
                <input value={deviceDraft.purpose} onChange={(event) => setDeviceDraft({ ...deviceDraft, purpose: event.target.value })} />
              </label>
              <div className="buttonRow">
                <button
                  onClick={() =>
                    perform(
                      () =>
                        createDevice({
                          ...deviceDraft,
                          roomId: selectedRoom?.id ?? deviceDraft.roomId,
                          quantity: Number(deviceDraft.quantity) || 1
                        }),
                      "设备已新增"
                    )
                  }
                  type="button"
                >
                  <Plus aria-hidden="true" />
                  新增设备
                </button>
              </div>
            </div>

            <div className="deviceGrid">
              {roomDevices.map((device) => (
                <article className="deviceCard" key={device.id}>
                  <div className="deviceHeader">
                    <span className={`status ${device.status}`}>{statusText(device.status)}</span>
                    <span className="deviceId">{device.id}</span>
                  </div>
                  <label className="field compactField">
                    <span>名称</span>
                    <input value={device.name} onChange={(event) => updateLocalDevice(device.id, { name: event.target.value })} />
                  </label>
                  <label className="field compactField">
                    <span>用途</span>
                    <input value={device.purpose} onChange={(event) => updateLocalDevice(device.id, { purpose: event.target.value })} />
                  </label>
                  <div className="inlineControls">
                    <label className="field compactField">
                      <span>状态</span>
                      <select
                        value={device.status}
                        onChange={(event) => updateLocalDevice(device.id, { status: event.target.value as OperationalStatus })}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {statusText(status)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field compactField">
                      <span>分类</span>
                      <select
                        value={device.category}
                        onChange={(event) => updateLocalDevice(device.id, { category: event.target.value as DeviceCategory })}
                      >
                        {deviceCategories.map((category) => (
                          <option key={category} value={category}>
                            {categoryText(category)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="deviceFooter">
                    <span>{device.ports.length} 端口</span>
                    <div className="miniActions">
                      <button onClick={() => perform(() => saveDevice(device), "设备已保存")} title="保存设备" type="button">
                        <Save aria-hidden="true" />
                      </button>
                      <button onClick={() => perform(() => deleteDevice(device.id), "设备已删除")} title="删除设备" type="button">
                        <Trash2 aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="linkPanel">
            <div className="sectionHeader compact">
              <div>
                <p className="eyebrow">视频</p>
                <h2>路由控制</h2>
              </div>
              <span className="pill">{roomRoutes.filter((route) => route.status === "active").length}</span>
            </div>

            <div className="formStack addConnection">
              <label className="field">
                <span>信号源</span>
                <select value={routeDraft.sourceId} onChange={(event) => setRouteDraft({ ...routeDraft, sourceId: event.target.value })}>
                  <option value="">选择信号源</option>
                  {catalog?.signalSources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>显示端</span>
                <select value={routeDraft.targetId} onChange={(event) => setRouteDraft({ ...routeDraft, targetId: event.target.value })}>
                  <option value="">选择显示端</option>
                  {catalog?.displayTargets.map((target) => (
                    <option key={target.id} value={target.id}>
                      {target.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>标签</span>
                <input value={routeDraft.label} onChange={(event) => setRouteDraft({ ...routeDraft, label: event.target.value })} />
              </label>
              <button onClick={() => perform(() => createRoute(routeDraft), "路由已创建")} type="button">
                <Plus aria-hidden="true" />
                创建路由
              </button>
            </div>

            <div className="connectionList routeList">
              {roomRoutes.map((route) => {
                const source = catalog?.signalSources.find((item) => item.id === route.sourceId);
                const target = catalog?.displayTargets.find((item) => item.id === route.targetId);

                return (
                  <article className="routeRow" key={route.id}>
                    <div className="routeHeader">
                      <strong>{route.id}</strong>
                      <span className={`status ${route.status === "active" ? "online" : "unknown"}`}>
                        {route.status === "active" ? "活动" : "断开"}
                      </span>
                    </div>
                    <p>
                      {source?.name ?? route.sourceId} → {target?.name ?? route.targetId}
                    </p>
                    <label className="field compactField">
                      <span>标签</span>
                      <input value={route.label} onChange={(event) => updateLocalRoute(route.id, { label: event.target.value })} />
                    </label>
                    <div className="buttonRow compactButtons">
                      <button onClick={() => perform(() => saveRoute(route), "路由已保存")} type="button">
                        <Save aria-hidden="true" />
                        保存
                      </button>
                      <button onClick={() => perform(() => disconnectRoute(route.id), "路由已断开")} type="button">
                        <Cable aria-hidden="true" />
                        断开
                      </button>
                      <button onClick={() => perform(() => deleteRoute(route.id), "路由已删除")} type="button">
                        <Trash2 aria-hidden="true" />
                        删除
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="sectionHeader compact secondarySection">
              <div>
                <p className="eyebrow">布局</p>
                <h2>模板</h2>
              </div>
              <span className="pill">{roomLayouts.length}</span>
            </div>

            <div className="layoutList">
              {roomLayouts.map((layout: LayoutTemplate) => (
                <article className="layoutRow" key={layout.id}>
                  <strong>{layout.name}</strong>
                  <span>{layout.mode}</span>
                  <button onClick={() => perform(() => saveLayout(layout), "布局已保存")} title="保存布局" type="button">
                    <Save aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>

            <div className="sectionHeader compact secondarySection">
              <div>
                <p className="eyebrow">录制</p>
                <h2>任务</h2>
              </div>
              <span className="pill">{roomRecordings.filter((recording) => recording.status === "recording").length}</span>
            </div>

            <div className="formStack addConnection">
              <label className="field">
                <span>手术</span>
                <select
                  value={recordingDraft.surgeryId}
                  onChange={(event) => setRecordingDraft({ ...recordingDraft, surgeryId: event.target.value })}
                >
                  <option value="">选择手术</option>
                  {roomSurgeries.map((surgery) => (
                    <option key={surgery.id} value={surgery.id}>
                      {surgery.procedureName || surgery.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>信号源</span>
                <select
                  value={recordingDraft.sourceId}
                  onChange={(event) => setRecordingDraft({ ...recordingDraft, sourceId: event.target.value })}
                >
                  <option value="">选择信号源</option>
                  {catalog?.signalSources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>存储卷</span>
                <select
                  value={recordingDraft.storageVolumeId}
                  onChange={(event) => setRecordingDraft({ ...recordingDraft, storageVolumeId: event.target.value })}
                >
                  {catalog?.storageVolumes.map((volume) => (
                    <option key={volume.id} value={volume.id}>
                      {volume.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="toggleField">
                <input
                  checked={recordingDraft.muted}
                  onChange={(event) => setRecordingDraft({ ...recordingDraft, muted: event.target.checked })}
                  type="checkbox"
                />
                <span>静音录制</span>
              </label>
              <button onClick={() => perform(() => startRecording(recordingDraft), "录制已开始")} type="button">
                <Plus aria-hidden="true" />
                开始录制
              </button>
            </div>

            <div className="connectionList routeList">
              {roomRecordings.map((recording) => {
                const surgery = catalog?.surgeries.find((item) => item.id === recording.surgeryId);
                const source = catalog?.signalSources.find((item) => item.id === recording.sourceId);

                return (
                  <article className="routeRow" key={recording.id}>
                    <div className="routeHeader">
                      <strong>{recording.id}</strong>
                      <span className={`status ${recording.status === "recording" ? "online" : "unknown"}`}>
                        {recordingStatusText(recording.status)}
                      </span>
                    </div>
                    <p>
                      {surgery?.procedureName ?? recording.surgeryId} · {source?.name ?? recording.sourceId}
                    </p>
                    <div className="buttonRow compactButtons">
                      <button onClick={() => perform(() => pauseRecording(recording.id), "录制已暂停")} type="button">
                        <Activity aria-hidden="true" />
                        暂停
                      </button>
                      <button onClick={() => perform(() => resumeRecording(recording.id), "录制已恢复")} type="button">
                        <Activity aria-hidden="true" />
                        恢复
                      </button>
                      <button onClick={() => perform(() => stopRecording(recording.id), "录制已停止并生成媒体")} type="button">
                        <Save aria-hidden="true" />
                        停止
                      </button>
                      <button onClick={() => perform(() => failRecording(recording.id), "录制已标记失败")} type="button">
                        <Trash2 aria-hidden="true" />
                        失败
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="sectionHeader compact secondarySection">
              <div>
                <p className="eyebrow">媒体</p>
                <h2>资产</h2>
              </div>
              <span className="pill">{roomMediaAssets.length}</span>
            </div>

            <div className="mediaList">
              {roomMediaAssets.map((asset) => (
                <article className="mediaRow" key={asset.id}>
                  <strong>{asset.id}</strong>
                  <label className="field compactField">
                    <span>标题</span>
                    <input value={asset.title} onChange={(event) => updateLocalMediaAsset(asset.id, { title: event.target.value })} />
                  </label>
                  <div className="mediaMeta">
                    <span>{asset.type}</span>
                    <span>{asset.sizeMb} MB</span>
                    <span>{asset.checksumStatus}</span>
                  </div>
                  <button onClick={() => perform(() => saveMediaAsset(asset), "媒体资产已保存")} type="button">
                    <Save aria-hidden="true" />
                    保存
                  </button>
                </article>
              ))}
            </div>

            <div className="sectionHeader compact secondarySection">
              <div>
                <p className="eyebrow">链路</p>
                <h2>连接核对</h2>
              </div>
              <span className="pill">{roomConnections.length}</span>
            </div>

            <div className="formStack addConnection">
              <label className="field">
                <span>编号</span>
                <input value={connectionDraft.id} onChange={(event) => setConnectionDraft({ ...connectionDraft, id: event.target.value })} />
              </label>
              <label className="field">
                <span>源设备</span>
                <select
                  value={connectionDraft.fromDeviceId}
                  onChange={(event) => setConnectionDraft({ ...connectionDraft, fromDeviceId: event.target.value })}
                >
                  <option value="">选择源设备</option>
                  {catalog?.devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>目标设备</span>
                <select
                  value={connectionDraft.toDeviceId}
                  onChange={(event) => setConnectionDraft({ ...connectionDraft, toDeviceId: event.target.value })}
                >
                  <option value="">选择目标设备</option>
                  {catalog?.devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>类型</span>
                <select
                  value={connectionDraft.kind}
                  onChange={(event) => setConnectionDraft({ ...connectionDraft, kind: event.target.value as ConnectionKind })}
                >
                  {connectionKinds.map((kind) => (
                    <option key={kind} value={kind}>
                      {kind.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>用途</span>
                <input
                  value={connectionDraft.purpose}
                  onChange={(event) => setConnectionDraft({ ...connectionDraft, purpose: event.target.value })}
                />
              </label>
              <button onClick={() => perform(() => createConnection(connectionDraft), "连接已新增")} type="button">
                <Plus aria-hidden="true" />
                新增连接
              </button>
            </div>

            <div className="connectionList editableList">
              {roomConnections.map((connection) => (
                <article className="connectionRow editable" key={connection.id}>
                  <div className="connectionFields">
                    <strong>{connection.id}</strong>
                    <label className="field compactField">
                      <span>源</span>
                      <select
                        value={connection.fromDeviceId}
                        onChange={(event) => updateLocalConnection(connection.id, { fromDeviceId: event.target.value })}
                      >
                        {catalog?.devices.map((device) => (
                          <option key={device.id} value={device.id}>
                            {device.id}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field compactField">
                      <span>目标</span>
                      <select
                        value={connection.toDeviceId}
                        onChange={(event) => updateLocalConnection(connection.id, { toDeviceId: event.target.value })}
                      >
                        {catalog?.devices.map((device) => (
                          <option key={device.id} value={device.id}>
                            {device.id}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field compactField">
                      <span>用途</span>
                      <input
                        value={connection.purpose}
                        onChange={(event) => updateLocalConnection(connection.id, { purpose: event.target.value })}
                      />
                    </label>
                  </div>
                  <div className="connectionActions">
                    <select
                      value={connection.kind}
                      onChange={(event) => updateLocalConnection(connection.id, { kind: event.target.value as ConnectionKind })}
                    >
                      {connectionKinds.map((kind) => (
                        <option key={kind} value={kind}>
                          {kind.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => perform(() => saveConnection(connection), "连接已保存")} title="保存连接" type="button">
                      <Save aria-hidden="true" />
                    </button>
                    <button onClick={() => perform(() => deleteConnection(connection.id), "连接已删除")} title="删除连接" type="button">
                      <Trash2 aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
