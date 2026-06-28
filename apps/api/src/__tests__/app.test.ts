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
    expect(body.validation).toEqual([]);
    expect(body.catalog.rooms.map((room: { id: string }) => room.id)).toContain("room-or-standard");
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
