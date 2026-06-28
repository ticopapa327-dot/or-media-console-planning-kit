import { STANDARD_TOPOLOGY, summarizeTopology, type TopologyCatalog, type TopologySummary } from "@or-media-console/shared";

export interface TopologyResponse {
  catalog: TopologyCatalog;
  summary: TopologySummary;
  validation: Array<{ code: string; message: string }>;
}

export async function fetchTopology(): Promise<TopologyResponse> {
  try {
    const response = await fetch("/api/topology");

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    return (await response.json()) as TopologyResponse;
  } catch {
    return {
      catalog: STANDARD_TOPOLOGY,
      summary: summarizeTopology(STANDARD_TOPOLOGY),
      validation: []
    };
  }
}
