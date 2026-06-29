import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { FileTopologyRepository } from "../repositories/topology-repository";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("API app", () => {
  it("reports health and topology version", async () => {
    const app = await createApp();
    const response = await app.inject({ method: "GET", url: "/healthz" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      service: "or-media-console-api",
      topologyVersion: "0.1.0"
    });
  });

  it("serves the standard topology catalog", async () => {
    const app = await createApp();
    const response = await app.inject({ method: "GET", url: "/api/topology" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.summary.roomCount).toBe(4);
    expect(body.summary.activeRouteCount).toBe(2);
    expect(body.summary.openMeetingCount).toBe(1);
    expect(body.summary.authorizedRemoteEndpointCount).toBe(1);
    expect(body.summary.openAlertCount).toBe(1);
    expect(body.summary.auditLogCount).toBe(1);
    expect(body.summary.statusEventCount).toBe(1);
    expect(body.summary.enabledUserCount).toBe(5);
    expect(body.summary.roleCapabilityCount).toBe(6);
    expect(body.validation).toEqual([]);
    expect(body.catalog.rooms.map((room: { id: string }) => room.id)).toContain("room-or-standard");
  });

  it("reports the current local auth session", async () => {
    const app = await createApp();
    const response = await app.inject({
      method: "GET",
      url: "/api/auth/session",
      headers: {
        "x-user-id": "USER-AUDITOR"
      }
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.user.id).toBe("USER-AUDITOR");
    expect(body.permissions).toContain("audit:read");
  });

  it("returns room-specific equipment and connections", async () => {
    const app = await createApp();
    const response = await app.inject({ method: "GET", url: "/api/topology/rooms/room-or-standard" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.devices.length).toBeGreaterThan(10);
    expect(body.connections.some((connection: { id: string }) => connection.id === "CONN-OR-V15")).toBe(true);
  });

  it("upserts rooms through admin endpoints", async () => {
    const app = await createApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/admin/rooms",
      payload: {
        id: "room-test-lab",
        name: "联调实验室",
        type: "operating_room",
        description: "Sprint 1 API 测试房间"
      }
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.summary.roomCount).toBe(5);
    expect(body.catalog.rooms.some((room: { id: string }) => room.id === "room-test-lab")).toBe(true);
  });

  it("rejects devices that reference missing rooms", async () => {
    const app = await createApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/admin/devices",
      payload: {
        id: "DEV-BAD-ROOM",
        roomId: "missing-room",
        name: "错误设备",
        category: "client",
        quantity: 1,
        purpose: "验证引用校验",
        status: "unknown",
        ports: []
      }
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.error).toBe("TOPOLOGY_INVALID");
  });

  it("blocks deletion of referenced devices", async () => {
    const app = await createApp();
    const response = await app.inject({
      method: "DELETE",
      url: "/api/admin/devices/OR-MTX-01"
    });
    const body = response.json();

    expect(response.statusCode).toBe(409);
    expect(body.error).toBe("DEVICE_IS_REFERENCED");
  });

  it("updates device status through admin endpoints", async () => {
    const app = await createApp();
    const original = (await app.inject({ method: "GET", url: "/api/topology" })).json();
    const device = original.catalog.devices.find((item: { id: string }) => item.id === "TH-CAM-01");
    const response = await app.inject({
      method: "PUT",
      url: "/api/admin/devices/TH-CAM-01",
      payload: {
        ...device,
        status: "online"
      }
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.catalog.devices.find((item: { id: string }) => item.id === "TH-CAM-01").status).toBe("online");
    expect(body.summary.statusEventCount).toBe(2);
  });

  it("resets the topology with an empty POST body", async () => {
    const app = await createApp();
    await app.inject({
      method: "POST",
      url: "/api/admin/rooms",
      payload: {
        id: "room-before-reset",
        name: "重置前房间",
        type: "operating_room",
        description: "验证重置"
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/admin/topology/reset"
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.summary.roomCount).toBe(4);
    expect(body.catalog.rooms.some((room: { id: string }) => room.id === "room-before-reset")).toBe(false);
  });

  it("creates and disconnects route sessions", async () => {
    const app = await createApp();
    const created = await app.inject({
      method: "POST",
      url: "/api/routes",
      payload: {
        id: "ROUTE-TEST-001",
        sourceId: "SRC-DSA-CT",
        targetId: "DISP-OR-LARGE",
        label: "测试路由"
      }
    });
    const createdBody = created.json();

    expect(created.statusCode).toBe(200);
    expect(createdBody.summary.activeRouteCount).toBe(3);

    const disconnected = await app.inject({
      method: "POST",
      url: "/api/routes/ROUTE-TEST-001/disconnect"
    });
    const disconnectedBody = disconnected.json();

    expect(disconnected.statusCode).toBe(200);
    expect(disconnectedBody.summary.activeRouteCount).toBe(2);
    expect(disconnectedBody.catalog.routeSessions.find((route: { id: string }) => route.id === "ROUTE-TEST-001").status).toBe(
      "disconnected"
    );
  });

  it("rejects routes that target an occupied display", async () => {
    const app = await createApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/routes",
      payload: {
        id: "ROUTE-CONFLICT",
        sourceId: "SRC-DSA-CT",
        targetId: "DISP-BEDSIDE",
        label: "冲突路由"
      }
    });
    const body = response.json();

    expect(response.statusCode).toBe(409);
    expect(body.error).toBe("ROUTE_TARGET_OCCUPIED");
  });

  it("creates patient and surgery records through clinical endpoints", async () => {
    const app = await createApp();
    const patientResponse = await app.inject({
      method: "POST",
      url: "/api/clinical/patients",
      payload: {
        id: "PAT-TEST-001",
        medicalRecordNo: "MRN-TEST-001",
        name: "测试患者",
        sex: "未指定",
        age: 0,
        department: "测试科室"
      }
    });

    expect(patientResponse.statusCode).toBe(200);

    const surgeryResponse = await app.inject({
      method: "POST",
      url: "/api/clinical/surgeries",
      payload: {
        id: "SURG-TEST-001",
        patientId: "PAT-TEST-001",
        roomId: "room-or-standard",
        scheduledAt: "2026-06-29T10:00:00.000Z",
        procedureName: "测试术式",
        surgeon: "测试医生",
        status: "scheduled"
      }
    });
    const body = surgeryResponse.json();

    expect(surgeryResponse.statusCode).toBe(200);
    expect(body.summary.patientCount).toBe(2);
    expect(body.summary.surgeryCount).toBe(2);
  });

  it("runs the recording task state machine and creates media on stop", async () => {
    const app = await createApp();
    const started = await app.inject({
      method: "POST",
      url: "/api/recordings/start",
      payload: {
        id: "REC-TEST-001",
        surgeryId: "SURG-DEMO-001",
        sourceId: "SRC-DSA-CT",
        storageVolumeId: "VOL-REC-PRIMARY",
        startedAt: "2026-06-29T10:00:00.000Z"
      }
    });

    expect(started.statusCode).toBe(200);
    expect(started.json().summary.activeRecordingCount).toBe(1);

    const paused = await app.inject({ method: "POST", url: "/api/recordings/REC-TEST-001/pause" });
    expect(paused.statusCode).toBe(200);
    expect(paused.json().summary.activeRecordingCount).toBe(1);

    const resumed = await app.inject({ method: "POST", url: "/api/recordings/REC-TEST-001/resume" });
    expect(resumed.statusCode).toBe(200);

    const stopped = await app.inject({ method: "POST", url: "/api/recordings/REC-TEST-001/stop" });
    const stoppedBody = stopped.json();

    expect(stopped.statusCode).toBe(200);
    expect(stoppedBody.summary.activeRecordingCount).toBe(0);
    expect(stoppedBody.catalog.mediaAssets.some((asset: { id: string }) => asset.id === "MEDIA-REC-TEST-001")).toBe(true);
  });

  it("rejects duplicate active recordings for the same source", async () => {
    const app = await createApp();

    await app.inject({
      method: "POST",
      url: "/api/recordings/start",
      payload: {
        id: "REC-CONFLICT-001",
        surgeryId: "SURG-DEMO-001",
        sourceId: "SRC-DSA-CT",
        storageVolumeId: "VOL-REC-PRIMARY"
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/recordings/start",
      payload: {
        id: "REC-CONFLICT-002",
        surgeryId: "SURG-DEMO-001",
        sourceId: "SRC-DSA-CT",
        storageVolumeId: "VOL-REC-PRIMARY"
      }
    });
    const body = response.json();

    expect(response.statusCode).toBe(409);
    expect(body.error).toBe("SOURCE_ALREADY_RECORDING");
  });

  it("creates and closes teaching meetings", async () => {
    const app = await createApp();
    const created = await app.inject({
      method: "POST",
      url: "/api/meetings",
      headers: {
        "x-user-id": "USER-TEACH"
      },
      payload: {
        id: "MEET-TEST-001",
        title: "测试示教会议",
        roomId: "room-teaching-hall",
        createdBy: "USER-TEACH",
        surgeryId: "SURG-DEMO-001"
      }
    });

    expect(created.statusCode).toBe(200);
    expect(created.json().summary.openMeetingCount).toBe(2);

    const closed = await app.inject({ method: "POST", url: "/api/meetings/MEET-TEST-001/close" });
    const closedBody = closed.json();
    const meetingCreateAudit = closedBody.catalog.auditLogs.find((entry: { action: string }) => entry.action === "meeting.create");

    expect(closed.statusCode).toBe(200);
    expect(closedBody.summary.openMeetingCount).toBe(1);
    expect(closedBody.catalog.auditLogs.some((entry: { action: string }) => entry.action === "meeting.close")).toBe(true);
    expect(meetingCreateAudit?.actor).toBe("USER-TEACH");
  });

  it("blocks control actions when the role has no permission", async () => {
    const app = await createApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/routes",
      headers: {
        "x-user-id": "USER-REMOTE"
      },
      payload: {
        id: "ROUTE-DENIED",
        sourceId: "SRC-DSA-CT",
        targetId: "DISP-OR-LARGE",
        label: "权限拒绝路由"
      }
    });
    const body = response.json();

    expect(response.statusCode).toBe(403);
    expect(body.error).toBe("PERMISSION_DENIED");
  });

  it("updates remote endpoint authorization", async () => {
    const app = await createApp();
    const original = (await app.inject({ method: "GET", url: "/api/topology" })).json();
    const endpoint = original.catalog.remoteEndpoints.find((item: { id: string }) => item.id === "RT-MOBILE-ACCESS-01");
    const response = await app.inject({
      method: "PUT",
      url: "/api/remote-endpoints/RT-MOBILE-ACCESS-01",
      payload: {
        ...endpoint,
        authorized: true
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().summary.authorizedRemoteEndpointCount).toBe(2);
    expect(response.json().catalog.auditLogs.some((entry: { action: string }) => entry.action === "remote_endpoint.update")).toBe(true);
  });

  it("normalizes audio endpoint volume", async () => {
    const app = await createApp();
    const original = (await app.inject({ method: "GET", url: "/api/topology" })).json();
    const endpoint = original.catalog.audioEndpoints.find((item: { id: string }) => item.id === "AUD-OR-MIC-01");
    const response = await app.inject({
      method: "PUT",
      url: "/api/audio-endpoints/AUD-OR-MIC-01",
      payload: {
        ...endpoint,
        volume: 130
      }
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.catalog.audioEndpoints.find((item: { id: string }) => item.id === "AUD-OR-MIC-01").volume).toBe(100);
    expect(body.catalog.auditLogs.some((entry: { action: string }) => entry.action === "audio_endpoint.update")).toBe(true);
  });

  it("acknowledges alerts and records audit evidence", async () => {
    const app = await createApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/alerts/ALERT-SEED-001/acknowledge",
      payload: {
        actor: "qa-user"
      }
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.summary.openAlertCount).toBe(0);
    expect(body.catalog.systemAlerts.find((alert: { id: string }) => alert.id === "ALERT-SEED-001").acknowledgedBy).toBe("qa-user");
    expect(body.catalog.auditLogs.some((entry: { action: string }) => entry.action === "alert.acknowledge")).toBe(true);
  });
});

describe("FileTopologyRepository", () => {
  it("persists topology changes to disk", () => {
    const directory = mkdtempSync(join(tmpdir(), "or-topology-"));
    const filePath = join(directory, "topology.local.json");

    try {
      const repository = new FileTopologyRepository(filePath);

      repository.upsertRoom({
        id: "room-file-test",
        name: "文件持久化测试",
        type: "server_room",
        description: "验证运行期拓扑写入本地文件"
      });

      const reloadedRepository = new FileTopologyRepository(filePath);

      expect(reloadedRepository.getRoom("room-file-test")?.name).toBe("文件持久化测试");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
