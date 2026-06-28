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
      ]
    };
    const codes = validateTopology(brokenCatalog).map((issue) => issue.code);

    expect(codes).toContain("ROOM_ID_DUPLICATE");
    expect(codes).toContain("CONNECTION_FROM_DEVICE_MISSING");
    expect(codes).toContain("CONNECTION_TO_DEVICE_MISSING");
  });
});
