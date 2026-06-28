import {
  STANDARD_TOPOLOGY,
  summarizeTopology,
  validateTopology,
  type Room,
  type TopologyCatalog,
  type TopologySummary,
  type ValidationIssue
} from "@or-media-console/shared";

export interface TopologyRepository {
  getCatalog(): TopologyCatalog;
  getSummary(): TopologySummary;
  getRoom(roomId: string): Room | undefined;
  validate(): ValidationIssue[];
}

export class InMemoryTopologyRepository implements TopologyRepository {
  constructor(private readonly catalog: TopologyCatalog = STANDARD_TOPOLOGY) {}

  getCatalog(): TopologyCatalog {
    return this.catalog;
  }

  getSummary(): TopologySummary {
    return summarizeTopology(this.catalog);
  }

  getRoom(roomId: string): Room | undefined {
    return this.catalog.rooms.find((room) => room.id === roomId);
  }

  validate(): ValidationIssue[] {
    return validateTopology(this.catalog);
  }
}
