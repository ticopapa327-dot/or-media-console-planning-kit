import { describe, expect, it } from "vitest";
import { STANDARD_TOPOLOGY, summarizeTopology } from "@or-media-console/shared";

describe("web topology assumptions", () => {
  it("has data for the first dashboard render", () => {
    const summary = summarizeTopology(STANDARD_TOPOLOGY);

    expect(summary.roomCount).toBe(4);
    expect(summary.deviceCount).toBeGreaterThan(20);
    expect(STANDARD_TOPOLOGY.displayTargets.length).toBeGreaterThan(0);
  });
});
