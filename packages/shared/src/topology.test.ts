import { describe, expect, it } from "vitest";
import { STANDARD_TOPOLOGY, summarizeTopology, validateTopology } from "./index";

describe("standard topology seed", () => {
  it("has no broken room, device, port, or endpoint references", () => {
    expect(validateTopology(STANDARD_TOPOLOGY)).toEqual([]);
  });

  it("summarizes the standard MVP topology", () => {
    expect(summarizeTopology(STANDARD_TOPOLOGY)).toMatchObject({
      roomCount: 4,
      signalSourceCount: 6,
      displayTargetCount: 3,
      activeRouteCount: 2,
      layoutTemplateCount: 3,
      patientCount: 1,
      surgeryCount: 1,
      activeRecordingCount: 0,
      mediaAssetCount: 1,
      offlineDeviceCount: 0
    });
  });

  it("reports duplicate ids and missing connection endpoints", () => {
    const brokenCatalog = {
      ...STANDARD_TOPOLOGY,
      rooms: [STANDARD_TOPOLOGY.rooms[0], STANDARD_TOPOLOGY.rooms[0]].filter(Boolean),
      connections: [
        ...STANDARD_TOPOLOGY.connections,
        {
          id: "CONN-BROKEN",
          fromDeviceId: "missing-source",
          toDeviceId: "missing-target",
          kind: "lan",
          purpose: "验证断链检测",
          testRefs: []
        }
      ],
      routeSessions: [
        ...STANDARD_TOPOLOGY.routeSessions,
        {
          id: "ROUTE-BROKEN",
          sourceId: "missing-source",
          targetId: "missing-display",
          status: "active",
          label: "验证路由断链检测",
          createdBy: "test",
          startedAt: "2026-06-29T00:00:00.000Z"
        }
      ],
      recordingTasks: [
        ...STANDARD_TOPOLOGY.recordingTasks,
        {
          id: "REC-BROKEN",
          surgeryId: "missing-surgery",
          sourceId: "missing-source",
          storageVolumeId: "missing-storage",
          status: "recording",
          muted: false,
          startedAt: "2026-06-29T00:00:00.000Z",
          durationSeconds: 0
        }
      ]
    };
    const codes = validateTopology(brokenCatalog).map((issue) => issue.code);

    expect(codes).toContain("ROOM_ID_DUPLICATE");
    expect(codes).toContain("CONNECTION_FROM_DEVICE_MISSING");
    expect(codes).toContain("CONNECTION_TO_DEVICE_MISSING");
    expect(codes).toContain("ROUTE_SOURCE_MISSING");
    expect(codes).toContain("ROUTE_TARGET_MISSING");
    expect(codes).toContain("RECORDING_SURGERY_MISSING");
    expect(codes).toContain("RECORDING_STORAGE_MISSING");
  });
});
