import { Activity, Cable, Database, Monitor, RadioTower, Server, ShieldCheck, Workflow } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Device, Room, TopologyCatalog, TopologySummary } from "@or-media-console/shared";
import { fetchTopology, type TopologyResponse } from "./api";

const roomOrder = ["room-or-standard", "room-teaching-hall", "room-remote-teaching", "room-server-core"];

function statusText(status: Device["status"]): string {
  const labels: Record<Device["status"], string> = {
    online: "在线",
    offline: "离线",
    degraded: "降级",
    unknown: "待确认"
  };

  return labels[status];
}

function categoryText(category: Device["category"]): string {
  const labels: Record<Device["category"], string> = {
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

function metricItems(summary: TopologySummary) {
  return [
    { label: "房间", value: summary.roomCount, icon: Workflow },
    { label: "设备", value: summary.deviceCount, icon: Server },
    { label: "连接", value: summary.connectionCount, icon: Cable },
    { label: "信号源", value: summary.signalSourceCount, icon: RadioTower },
    { label: "显示端", value: summary.displayTargetCount, icon: Monitor },
    { label: "可用存储", value: `${summary.storageUsableGb} GB`, icon: Database }
  ];
}

export function App() {
  const [topology, setTopology] = useState<TopologyResponse | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState(roomOrder[0]);

  useEffect(() => {
    void fetchTopology().then(setTopology);
  }, []);

  const catalog: TopologyCatalog | undefined = topology?.catalog;
  const summary = topology?.summary;
  const rooms = useMemo(() => {
    if (!catalog) {
      return [];
    }

    return [...catalog.rooms].sort((left, right) => roomOrder.indexOf(left.id) - roomOrder.indexOf(right.id));
  }, [catalog]);
  const selectedRoom: Room | undefined = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0];
  const roomDevices = catalog?.devices.filter((device) => device.roomId === selectedRoom?.id) ?? [];
  const deviceIds = new Set(roomDevices.map((device) => device.id));
  const roomConnections =
    catalog?.connections.filter((connection) => deviceIds.has(connection.fromDeviceId) || deviceIds.has(connection.toDeviceId)) ?? [];

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
              <small>{room.type.replace("_", " ")}</small>
            </button>
          ))}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Sprint 0 · MVP 拓扑样例</p>
            <h1>数字化手术室媒体控制台</h1>
          </div>
          <div className="healthBadge">
            <Activity aria-hidden="true" />
            <span>{topology ? "拓扑已载入" : "载入中"}</span>
          </div>
        </header>

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
                <p className="eyebrow">当前区域</p>
                <h2>{selectedRoom?.name ?? "未选择"}</h2>
              </div>
              <span className="pill">{roomDevices.length} 台设备</span>
            </div>
            <p className="description">{selectedRoom?.description}</p>

            <div className="deviceGrid">
              {roomDevices.map((device) => (
                <article className="deviceCard" key={device.id}>
                  <div className="deviceHeader">
                    <span className={`status ${device.status}`}>{statusText(device.status)}</span>
                    <span className="deviceId">{device.id}</span>
                  </div>
                  <h3>{device.name}</h3>
                  <p>{device.purpose}</p>
                  <div className="deviceFooter">
                    <span>{categoryText(device.category)}</span>
                    <span>{device.ports.length} 端口</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="linkPanel">
            <div className="sectionHeader compact">
              <div>
                <p className="eyebrow">链路</p>
                <h2>连接核对</h2>
              </div>
              <span className="pill">{roomConnections.length}</span>
            </div>

            <div className="connectionList">
              {roomConnections.slice(0, 12).map((connection) => (
                <article className="connectionRow" key={connection.id}>
                  <div>
                    <strong>{connection.id}</strong>
                    <span>{connection.purpose}</span>
                  </div>
                  <em>{connection.kind.toUpperCase()}</em>
                </article>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
