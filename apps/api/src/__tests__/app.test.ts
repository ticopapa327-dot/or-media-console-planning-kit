import { describe, expect, it } from "vitest";
import { createApp } from "../app";

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
});
