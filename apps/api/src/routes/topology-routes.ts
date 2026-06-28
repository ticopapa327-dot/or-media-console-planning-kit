import type { FastifyInstance } from "fastify";
import type { TopologyRepository } from "../repositories/topology-repository";

export async function registerTopologyRoutes(app: FastifyInstance, repository: TopologyRepository): Promise<void> {
  app.get("/api/topology", async () => ({
    catalog: repository.getCatalog(),
    summary: repository.getSummary(),
    validation: repository.validate()
  }));

  app.get<{ Params: { roomId: string } }>("/api/topology/rooms/:roomId", async (request, reply) => {
    const room = repository.getRoom(request.params.roomId);

    if (!room) {
      return reply.code(404).send({
        error: "ROOM_NOT_FOUND",
        message: `Room ${request.params.roomId} was not found`
      });
    }

    const catalog = repository.getCatalog();
    const devices = catalog.devices.filter((device) => device.roomId === room.id);
    const deviceIds = new Set(devices.map((device) => device.id));
    const connections = catalog.connections.filter(
      (connection) => deviceIds.has(connection.fromDeviceId) || deviceIds.has(connection.toDeviceId)
    );

    return {
      room,
      devices,
      connections,
      signalSources: catalog.signalSources.filter((source) => source.roomId === room.id),
      displayTargets: catalog.displayTargets.filter((target) => target.roomId === room.id)
    };
  });
}
