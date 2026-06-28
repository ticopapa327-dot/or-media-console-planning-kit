import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import { registerTopologyRoutes } from "./routes/topology-routes";
import { InMemoryTopologyRepository, type TopologyRepository } from "./repositories/topology-repository";

export interface CreateAppOptions {
  repository?: TopologyRepository;
}

export async function createApp(options: CreateAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true
  });
  const repository = options.repository ?? new InMemoryTopologyRepository();

  await app.register(cors, {
    origin: true
  });

  app.get("/healthz", async () => ({
    ok: true,
    service: "or-media-console-api",
    topologyVersion: repository.getCatalog().version
  }));

  await registerTopologyRoutes(app, repository);

  return app;
}
