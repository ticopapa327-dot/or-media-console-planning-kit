import { createApp } from "./app";
import { FileTopologyRepository } from "./repositories/topology-repository";

const port = Number.parseInt(process.env.PORT ?? "4100", 10);
const host = process.env.HOST ?? "127.0.0.1";
const topologyFile = process.env.TOPOLOGY_FILE ?? "data/topology.local.json";

const app = await createApp({
  repository: new FileTopologyRepository(topologyFile)
});

try {
  await app.listen({ host, port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
