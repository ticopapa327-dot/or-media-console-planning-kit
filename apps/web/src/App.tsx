import {
  Activity,
  AlertTriangle,
  Cable,
  CheckCircle2,
  Database,
  Monitor,
  Plus,
  RadioTower,
  RotateCcw,
  Save,
  Server,
  ShieldCheck,
  Sparkles,
  Trash2,
  Workflow
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  AlertSeverity,
  AlertStatus,
  AuthSession,
  AudioEndpoint,
  Connection,
  ConnectionKind,
  Device,
  DeviceCategory,
  LayoutTemplate,
  MediaAsset,
  MeetingMember,
  MeetingMemberRole,
  MeetingSession,
  OperationalStatus,
  Patient,
  RecordingStatus,
  RecordingTask,
  RemoteDeviceType,
  RemoteEndpoint,
  Room,
  RoomType,
  RouteSession,
  SyntheticCaseRequest,
  SurgeryCase,
  SurgeryStatus,
  TopologyCatalog,
  TopologySummary,
  UserRole
} from "@or-media-console/shared";
import {
  acknowledgeAlert,
  createConnection,
  createDevice,
  createMeeting,
  createMeetingMember,
  createPatient,
  createRoom,
  createRoute,
  createSurgery,
  closeMeeting,
  deleteConnection,
  deleteDevice,
  deleteRoom,
  deleteRoute,
  disconnectRoute,
  failRecording,
  fetchSession,
  fetchTopology,
  generateSyntheticCase,
  pauseRecording,
  resetTopology,
  resolveAlert,
  resumeRecording,
  saveConnection,
  saveDevice,
  saveLayout,
  saveAudioEndpoint,
  saveMediaAsset,
  saveMeeting,
  saveMeetingMember,
  savePatient,
  saveRemoteEndpoint,
  saveRoom,
  saveRoute,
  saveSurgery,
  setApiActor,
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
const meetingMemberRoles: MeetingMemberRole[] = ["host", "speaker", "viewer"];
const remoteDeviceTypes: RemoteDeviceType[] = ["office_pc", "mobile", "tablet", "laptop", "teaching_host"];
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

function meetingMemberRoleText(role: MeetingMemberRole): string {
  const labels: Record<MeetingMemberRole, string> = {
    host: "主持",
    speaker: "发言",
    viewer: "观看"
  };

  return labels[role];
}

function userRoleText(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    or_operator: "手术室操作",
    teaching_user: "示教用户",
    remote_expert: "远程专家",
    device_engineer: "设备工程",
    admin: "管理员",
    auditor: "审计员"
  };

  return labels[role];
}

function alertSeverityText(severity: AlertSeverity): string {
  const labels: Record<AlertSeverity, string> = {
    info: "提示",
    warning: "警告",
    critical: "严重"
  };

  return labels[severity];
}

function alertStatusText(status: AlertStatus): string {
  const labels: Record<AlertStatus, string> = {
    open: "待处理",
    acknowledged: "已确认",
    resolved: "已解决"
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
    { label: "会议", value: summary.openMeetingCount, icon: RadioTower },
    { label: "远程授权", value: summary.authorizedRemoteEndpointCount, icon: ShieldCheck },
    { label: "音频端点", value: summary.audioEndpointCount, icon: Activity },
    { label: "未处理告警", value: summary.openAlertCount, icon: AlertTriangle },
    { label: "严重告警", value: summary.criticalAlertCount, icon: AlertTriangle },
    { label: "审计", value: summary.auditLogCount, icon: ShieldCheck },
    { label: "状态事件", value: summary.statusEventCount, icon: Activity },
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
    department: "",
    dataSource: "manual"
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
    status: "scheduled",
    dataSource: "manual"
  };
}

function createSyntheticCaseDraft(roomId: string): SyntheticCaseRequest {
  return {
    roomId,
    seed: "",
    procedureName: "合成演示术式",
    surgeon: "演示医生",
    department: "演示科室"
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

function createMeetingDraft(roomId: string): Pick<MeetingSession, "title" | "roomId" | "createdBy" | "surgeryId"> {
  return {
    title: "",
    roomId,
    createdBy: "USER-TEACH",
    surgeryId: undefined
  };
}

function createMemberDraft(): MeetingMember {
  return {
    id: "",
    meetingId: "",
    displayName: "",
    role: "viewer",
    audioMuted: true
  };
}

export function App() {
  const [topology, setTopology] = useState<TopologyResponse | null>(null);
  const [actorId, setActorId] = useState("USER-ADMIN");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState(defaultRoomId);
  const [roomDraft, setRoomDraft] = useState<Room>(createRoomDraft);
  const [deviceDraft, setDeviceDraft] = useState<Device>(() => createDeviceDraft(defaultRoomId));
  const [connectionDraft, setConnectionDraft] = useState<Connection>(createConnectionDraft);
  const [routeDraft, setRouteDraft] = useState(createRouteDraft);
  const [patientDraft, setPatientDraft] = useState<Patient>(createPatientDraft);
  const [surgeryDraft, setSurgeryDraft] = useState<SurgeryCase>(() => createSurgeryDraft(defaultRoomId));
  const [syntheticCaseDraft, setSyntheticCaseDraft] = useState<SyntheticCaseRequest>(() => createSyntheticCaseDraft(defaultRoomId));
  const [recordingDraft, setRecordingDraft] = useState(createRecordingDraft);
  const [meetingDraft, setMeetingDraft] = useState(() => createMeetingDraft(defaultRoomId));
  const [memberDraft, setMemberDraft] = useState<MeetingMember>(createMemberDraft);
  const [notice, setNotice] = useState("拓扑载入中");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setApiActor(actorId);
    void Promise.all([fetchTopology(), fetchSession()]).then(([topologyResponse, sessionResponse]) => {
      setTopology(topologyResponse);
      setSession(sessionResponse);
      setNotice("拓扑已载入");
    });
  }, [actorId]);

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
  const roomMeetings = catalog?.meetingSessions.filter((meeting) => meeting.roomId === selectedRoom?.id) ?? [];
  const roomMeetingIds = new Set(roomMeetings.map((meeting) => meeting.id));
  const roomMembers = catalog?.meetingMembers.filter((member) => roomMeetingIds.has(member.meetingId)) ?? [];
  const roomRemoteEndpoints = catalog?.remoteEndpoints.filter((endpoint) => endpoint.roomId === selectedRoom?.id) ?? [];
  const roomAudioEndpoints = catalog?.audioEndpoints.filter((endpoint) => endpoint.roomId === selectedRoom?.id) ?? [];
  const openAlerts = catalog?.systemAlerts.filter((alert) => alert.status !== "resolved") ?? [];
  const recentAuditLogs = catalog ? [...catalog.auditLogs].slice(-6).reverse() : [];
  const recentStatusEvents = catalog ? [...catalog.statusEvents].slice(-5).reverse() : [];

  useEffect(() => {
    if (selectedRoom) {
      setRoomDraft(selectedRoom);
      setDeviceDraft(createDeviceDraft(selectedRoom.id));
      setSurgeryDraft((current) => ({ ...current, roomId: selectedRoom.id }));
      setSyntheticCaseDraft((current) => ({ ...current, roomId: selectedRoom.id }));
      setMeetingDraft((current) => ({ ...current, roomId: selectedRoom.id }));
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

  function updateLocalMeeting(meetingId: string, updates: Partial<MeetingSession>) {
    setTopology((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        catalog: {
          ...current.catalog,
          meetingSessions: current.catalog.meetingSessions.map((meeting) =>
            meeting.id === meetingId ? { ...meeting, ...updates } : meeting
          )
        }
      };
    });
  }

  function updateLocalMember(memberId: string, updates: Partial<MeetingMember>) {
    setTopology((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        catalog: {
          ...current.catalog,
          meetingMembers: current.catalog.meetingMembers.map((member) => (member.id === memberId ? { ...member, ...updates } : member))
        }
      };
    });
  }

  function updateLocalRemoteEndpoint(endpointId: string, updates: Partial<RemoteEndpoint>) {
    setTopology((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        catalog: {
          ...current.catalog,
          remoteEndpoints: current.catalog.remoteEndpoints.map((endpoint) =>
            endpoint.id === endpointId ? { ...endpoint, ...updates } : endpoint
          )
        }
      };
    });
  }

  function updateLocalAudioEndpoint(endpointId: string, updates: Partial<AudioEndpoint>) {
    setTopology((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        catalog: {
          ...current.catalog,
          audioEndpoints: current.catalog.audioEndpoints.map((endpoint) =>
            endpoint.id === endpointId ? { ...endpoint, ...updates } : endpoint
          )
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
            <p className="eyebrow">Sprint 7A · 合成病例闭环</p>
            <h1>数字化手术室媒体控制台</h1>
          </div>
          <div className="topActions">
            <label className="actorPicker">
              <span>操作者</span>
              <select value={actorId} onChange={(event) => setActorId(event.target.value)}>
                {(catalog?.users ?? []).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.displayName} · {userRoleText(user.role)}
                  </option>
                ))}
              </select>
            </label>
            {session ? (
              <div className="healthBadge">
                <ShieldCheck aria-hidden="true" />
                <span>{userRoleText(session.user.role)} · {session.permissions.length} 项权限</span>
              </div>
            ) : null}
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
              <div className="sectionMeta">
                <span className="pill subtle">HIS/EMR 未接入</span>
                <span className="pill subtle">手动/合成数据</span>
              </div>
            </div>

            <div className="formGrid caseForm syntheticCaseForm">
              <label className="field">
                <span>演示编号</span>
                <input
                  placeholder="自动生成"
                  value={syntheticCaseDraft.seed ?? ""}
                  onChange={(event) => setSyntheticCaseDraft({ ...syntheticCaseDraft, seed: event.target.value })}
                />
              </label>
              <label className="field">
                <span>术式</span>
                <input
                  value={syntheticCaseDraft.procedureName ?? ""}
                  onChange={(event) => setSyntheticCaseDraft({ ...syntheticCaseDraft, procedureName: event.target.value })}
                />
              </label>
              <label className="field">
                <span>医生</span>
                <input
                  value={syntheticCaseDraft.surgeon ?? ""}
                  onChange={(event) => setSyntheticCaseDraft({ ...syntheticCaseDraft, surgeon: event.target.value })}
                />
              </label>
              <label className="field">
                <span>科室</span>
                <input
                  value={syntheticCaseDraft.department ?? ""}
                  onChange={(event) => setSyntheticCaseDraft({ ...syntheticCaseDraft, department: event.target.value })}
                />
              </label>
              <div className="buttonRow">
                <button
                  onClick={() =>
                    perform(async () => {
                      const response = await generateSyntheticCase({
                        ...syntheticCaseDraft,
                        roomId: selectedRoom?.id ?? syntheticCaseDraft.roomId
                      });
                      setSyntheticCaseDraft((current) => ({ ...current, seed: "" }));
                      return response;
                    }, "合成病例已生成")
                  }
                  type="button"
                >
                  <Sparkles aria-hidden="true" />
                  生成合成病例
                </button>
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
                    <span>
                      {patient?.name ?? surgery.patientId} · {patient?.dataSource === "synthetic" || surgery.dataSource === "synthetic" ? "合成" : "手动"}
                    </span>
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
                <p className="eyebrow">示教</p>
                <h2>会议</h2>
              </div>
              <span className="pill">{roomMeetings.filter((meeting) => meeting.status === "open").length}</span>
            </div>

            <div className="formStack addConnection">
              <label className="field">
                <span>标题</span>
                <input value={meetingDraft.title} onChange={(event) => setMeetingDraft({ ...meetingDraft, title: event.target.value })} />
              </label>
              <label className="field">
                <span>手术</span>
                <select value={meetingDraft.surgeryId ?? ""} onChange={(event) => setMeetingDraft({ ...meetingDraft, surgeryId: event.target.value })}>
                  <option value="">不关联</option>
                  {roomSurgeries.map((surgery) => (
                    <option key={surgery.id} value={surgery.id}>
                      {surgery.procedureName || surgery.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>创建者</span>
                <select value={meetingDraft.createdBy} onChange={(event) => setMeetingDraft({ ...meetingDraft, createdBy: event.target.value })}>
                  {catalog?.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName}
                    </option>
                  ))}
                </select>
              </label>
              <button onClick={() => perform(() => createMeeting(meetingDraft), "会议已创建")} type="button">
                <Plus aria-hidden="true" />
                创建会议
              </button>
            </div>

            <div className="mediaList">
              {roomMeetings.map((meeting) => (
                <article className="mediaRow" key={meeting.id}>
                  <strong>{meeting.id}</strong>
                  <label className="field compactField">
                    <span>标题</span>
                    <input value={meeting.title} onChange={(event) => updateLocalMeeting(meeting.id, { title: event.target.value })} />
                  </label>
                  <div className="mediaMeta">
                    <span>{meeting.status === "open" ? "开放" : "关闭"}</span>
                    <span>{meeting.surgeryId ?? "无手术关联"}</span>
                  </div>
                  <div className="buttonRow compactButtons">
                    <button onClick={() => perform(() => saveMeeting(meeting), "会议已保存")} type="button">
                      <Save aria-hidden="true" />
                      保存
                    </button>
                    <button onClick={() => perform(() => closeMeeting(meeting.id), "会议已关闭")} type="button">
                      <Cable aria-hidden="true" />
                      关闭
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="formStack addConnection">
              <label className="field">
                <span>成员编号</span>
                <input value={memberDraft.id} onChange={(event) => setMemberDraft({ ...memberDraft, id: event.target.value })} />
              </label>
              <label className="field">
                <span>会议</span>
                <select value={memberDraft.meetingId} onChange={(event) => setMemberDraft({ ...memberDraft, meetingId: event.target.value })}>
                  <option value="">选择会议</option>
                  {roomMeetings.map((meeting) => (
                    <option key={meeting.id} value={meeting.id}>
                      {meeting.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>姓名</span>
                <input value={memberDraft.displayName} onChange={(event) => setMemberDraft({ ...memberDraft, displayName: event.target.value })} />
              </label>
              <label className="field">
                <span>角色</span>
                <select value={memberDraft.role} onChange={(event) => setMemberDraft({ ...memberDraft, role: event.target.value as MeetingMemberRole })}>
                  {meetingMemberRoles.map((role) => (
                    <option key={role} value={role}>
                      {meetingMemberRoleText(role)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="toggleField">
                <input
                  checked={memberDraft.audioMuted}
                  onChange={(event) => setMemberDraft({ ...memberDraft, audioMuted: event.target.checked })}
                  type="checkbox"
                />
                <span>静音</span>
              </label>
              <button onClick={() => perform(() => createMeetingMember(memberDraft), "成员已加入")} type="button">
                <Plus aria-hidden="true" />
                加入会议
              </button>
            </div>

            <div className="memberList">
              {roomMembers.map((member) => (
                <article className="memberRow" key={member.id}>
                  <strong>{member.displayName}</strong>
                  <select value={member.role} onChange={(event) => updateLocalMember(member.id, { role: event.target.value as MeetingMemberRole })}>
                    {meetingMemberRoles.map((role) => (
                      <option key={role} value={role}>
                        {meetingMemberRoleText(role)}
                      </option>
                    ))}
                  </select>
                  <label className="toggleField">
                    <input
                      checked={member.audioMuted}
                      onChange={(event) => updateLocalMember(member.id, { audioMuted: event.target.checked })}
                      type="checkbox"
                    />
                    <span>静音</span>
                  </label>
                  <button onClick={() => perform(() => saveMeetingMember(member), "成员已保存")} type="button">
                    <Save aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>

            <div className="sectionHeader compact secondarySection">
              <div>
                <p className="eyebrow">远程</p>
                <h2>授权</h2>
              </div>
              <span className="pill">{roomRemoteEndpoints.filter((endpoint) => endpoint.authorized).length}</span>
            </div>

            <div className="memberList">
              {roomRemoteEndpoints.map((endpoint) => (
                <article className="memberRow" key={endpoint.id}>
                  <strong>{endpoint.name}</strong>
                  <select
                    value={endpoint.deviceType}
                    onChange={(event) => updateLocalRemoteEndpoint(endpoint.id, { deviceType: event.target.value as RemoteDeviceType })}
                  >
                    {remoteDeviceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <label className="toggleField">
                    <input
                      checked={endpoint.authorized}
                      onChange={(event) => updateLocalRemoteEndpoint(endpoint.id, { authorized: event.target.checked })}
                      type="checkbox"
                    />
                    <span>授权</span>
                  </label>
                  <button onClick={() => perform(() => saveRemoteEndpoint(endpoint), "远程端已保存")} type="button">
                    <Save aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>

            <div className="sectionHeader compact secondarySection">
              <div>
                <p className="eyebrow">音频</p>
                <h2>端点</h2>
              </div>
              <span className="pill">{roomAudioEndpoints.length}</span>
            </div>

            <div className="memberList">
              {roomAudioEndpoints.map((endpoint) => (
                <article className="memberRow" key={endpoint.id}>
                  <strong>{endpoint.name}</strong>
                  <input
                    max={100}
                    min={0}
                    onChange={(event) => updateLocalAudioEndpoint(endpoint.id, { volume: Number(event.target.value) })}
                    type="range"
                    value={endpoint.volume}
                  />
                  <label className="toggleField">
                    <input
                      checked={endpoint.muted}
                      onChange={(event) => updateLocalAudioEndpoint(endpoint.id, { muted: event.target.checked })}
                      type="checkbox"
                    />
                    <span>静音</span>
                  </label>
                  <button onClick={() => perform(() => saveAudioEndpoint(endpoint), "音频端点已保存")} type="button">
                    <Save aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>

            <div className="sectionHeader compact secondarySection">
              <div>
                <p className="eyebrow">质量</p>
                <h2>审计与告警</h2>
              </div>
              <span className="pill">{openAlerts.length}</span>
            </div>

            <div className="qualityList">
              {openAlerts.map((alert) => (
                <article className={`qualityRow ${alert.severity}`} key={alert.id}>
                  <div>
                    <div className="qualityHeader">
                      <strong>{alert.title}</strong>
                      <span>{alertSeverityText(alert.severity)}</span>
                    </div>
                    <p>{alert.message}</p>
                    <div className="mediaMeta">
                      <span>{alertStatusText(alert.status)}</span>
                      <span>{alert.relatedEntityId ?? alert.id}</span>
                    </div>
                  </div>
                  <div className="qualityActions">
                    <button onClick={() => perform(() => acknowledgeAlert(alert.id), "告警已确认")} title="确认告警" type="button">
                      <ShieldCheck aria-hidden="true" />
                    </button>
                    <button onClick={() => perform(() => resolveAlert(alert.id), "告警已解决")} title="解决告警" type="button">
                      <CheckCircle2 aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="qualityTimeline">
              <strong>近期审计</strong>
              {recentAuditLogs.map((entry) => (
                <article key={entry.id}>
                  <span>{entry.action}</span>
                  <p>{entry.summary}</p>
                </article>
              ))}
            </div>

            <div className="qualityTimeline">
              <strong>状态事件</strong>
              {recentStatusEvents.map((event) => (
                <article key={event.id}>
                  <span>
                    {event.entityId} · {event.nextStatus}
                  </span>
                  <p>{event.note ?? event.occurredAt}</p>
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
