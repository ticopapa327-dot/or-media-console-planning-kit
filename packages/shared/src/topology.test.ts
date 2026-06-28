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
});
