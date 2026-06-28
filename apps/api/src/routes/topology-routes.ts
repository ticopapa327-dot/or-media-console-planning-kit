import type { FastifyInstance, FastifyReply } from "fastify";
import type {
  Connection,
  Device,
  DevicePort,
  DisplayTarget,
  LayoutTemplate,
  MediaAsset,
  Patient,
  RecordingTask,
  Room,
  RouteSession,
  SignalSource,
  SurgeryCase
} from "@or-media-console/shared";
import { RepositoryError, type TopologyRepository } from "../repositories/topology-repository";

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

  app.post("/api/admin/topology/reset", async () => topologyResponse(repository.reset(), repository));

  app.get("/api/admin/rooms", async () => repository.getCatalog().rooms);

  app.post<{ Body: Room }>("/api/admin/rooms", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.upsertRoom(request.body), repository))
  );

  app.put<{ Params: { roomId: string }; Body: Room }>("/api/admin/rooms/:roomId", async (request, reply) =>
    withRepositoryError(reply, () =>
      topologyResponse(
        repository.upsertRoom({
          ...request.body,
          id: request.params.roomId
        }),
        repository
      )
    )
  );

  app.delete<{ Params: { roomId: string } }>("/api/admin/rooms/:roomId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deleteRoom(request.params.roomId), repository))
  );

  app.get("/api/admin/devices", async () => repository.getCatalog().devices);

  app.post<{ Body: Device }>("/api/admin/devices", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.upsertDevice(request.body), repository))
  );

  app.put<{ Params: { deviceId: string }; Body: Device }>("/api/admin/devices/:deviceId", async (request, reply) =>
    withRepositoryError(reply, () =>
      topologyResponse(
        repository.upsertDevice({
          ...request.body,
          id: request.params.deviceId,
          ports: request.body.ports ?? []
        }),
        repository
      )
    )
  );

  app.delete<{ Params: { deviceId: string } }>("/api/admin/devices/:deviceId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deleteDevice(request.params.deviceId), repository))
  );

  app.post<{ Params: { deviceId: string }; Body: DevicePort }>("/api/admin/devices/:deviceId/ports", async (request, reply) =>
    withRepositoryError(reply, () =>
      topologyResponse(
        repository.upsertDevicePort(request.params.deviceId, {
          ...request.body,
          deviceId: request.params.deviceId
        }),
        repository
      )
    )
  );

  app.put<{ Params: { deviceId: string; portId: string }; Body: DevicePort }>(
    "/api/admin/devices/:deviceId/ports/:portId",
    async (request, reply) =>
      withRepositoryError(reply, () =>
        topologyResponse(
          repository.upsertDevicePort(request.params.deviceId, {
            ...request.body,
            id: request.params.portId,
            deviceId: request.params.deviceId
          }),
          repository
        )
      )
  );

  app.delete<{ Params: { deviceId: string; portId: string } }>(
    "/api/admin/devices/:deviceId/ports/:portId",
    async (request, reply) =>
      withRepositoryError(reply, () =>
        topologyResponse(repository.deleteDevicePort(request.params.deviceId, request.params.portId), repository)
      )
  );

  app.get("/api/admin/connections", async () => repository.getCatalog().connections);

  app.post<{ Body: Connection }>("/api/admin/connections", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.upsertConnection(request.body), repository))
  );

  app.put<{ Params: { connectionId: string }; Body: Connection }>(
    "/api/admin/connections/:connectionId",
    async (request, reply) =>
      withRepositoryError(reply, () =>
        topologyResponse(
          repository.upsertConnection({
            ...request.body,
            id: request.params.connectionId
          }),
          repository
        )
      )
  );

  app.delete<{ Params: { connectionId: string } }>("/api/admin/connections/:connectionId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deleteConnection(request.params.connectionId), repository))
  );

  app.get("/api/admin/signal-sources", async () => repository.getCatalog().signalSources);

  app.post<{ Body: SignalSource }>("/api/admin/signal-sources", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.upsertSignalSource(request.body), repository))
  );

  app.put<{ Params: { sourceId: string }; Body: SignalSource }>("/api/admin/signal-sources/:sourceId", async (request, reply) =>
    withRepositoryError(reply, () =>
      topologyResponse(
        repository.upsertSignalSource({
          ...request.body,
          id: request.params.sourceId
        }),
        repository
      )
    )
  );

  app.delete<{ Params: { sourceId: string } }>("/api/admin/signal-sources/:sourceId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deleteSignalSource(request.params.sourceId), repository))
  );

  app.get("/api/admin/display-targets", async () => repository.getCatalog().displayTargets);

  app.post<{ Body: DisplayTarget }>("/api/admin/display-targets", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.upsertDisplayTarget(request.body), repository))
  );

  app.put<{ Params: { targetId: string }; Body: DisplayTarget }>("/api/admin/display-targets/:targetId", async (request, reply) =>
    withRepositoryError(reply, () =>
      topologyResponse(
        repository.upsertDisplayTarget({
          ...request.body,
          id: request.params.targetId
        }),
        repository
      )
    )
  );

  app.delete<{ Params: { targetId: string } }>("/api/admin/display-targets/:targetId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deleteDisplayTarget(request.params.targetId), repository))
  );

  app.get("/api/routes", async () => repository.getCatalog().routeSessions);

  app.post<{ Body: Partial<RouteSession> & Pick<RouteSession, "sourceId" | "targetId"> }>("/api/routes", async (request, reply) =>
    withRepositoryError(reply, () => {
      const route: RouteSession = {
        id: request.body.id ?? `ROUTE-${Date.now()}`,
        sourceId: request.body.sourceId,
        targetId: request.body.targetId,
        status: request.body.status ?? "active",
        label: request.body.label ?? `${request.body.sourceId} -> ${request.body.targetId}`,
        createdBy: request.body.createdBy ?? "local-admin",
        startedAt: request.body.startedAt ?? new Date().toISOString(),
        endedAt: request.body.endedAt
      };

      return topologyResponse(repository.upsertRouteSession(route), repository);
    })
  );

  app.put<{ Params: { routeId: string }; Body: RouteSession }>("/api/routes/:routeId", async (request, reply) =>
    withRepositoryError(reply, () =>
      topologyResponse(
        repository.upsertRouteSession({
          ...request.body,
          id: request.params.routeId
        }),
        repository
      )
    )
  );

  app.post<{ Params: { routeId: string } }>("/api/routes/:routeId/disconnect", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.disconnectRouteSession(request.params.routeId), repository))
  );

  app.delete<{ Params: { routeId: string } }>("/api/routes/:routeId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deleteRouteSession(request.params.routeId), repository))
  );

  app.get("/api/layouts", async () => repository.getCatalog().layoutTemplates);

  app.post<{ Body: LayoutTemplate }>("/api/layouts", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.upsertLayoutTemplate(request.body), repository))
  );

  app.put<{ Params: { layoutId: string }; Body: LayoutTemplate }>("/api/layouts/:layoutId", async (request, reply) =>
    withRepositoryError(reply, () =>
      topologyResponse(
        repository.upsertLayoutTemplate({
          ...request.body,
          id: request.params.layoutId
        }),
        repository
      )
    )
  );

  app.delete<{ Params: { layoutId: string } }>("/api/layouts/:layoutId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deleteLayoutTemplate(request.params.layoutId), repository))
  );

  app.get("/api/clinical/patients", async () => repository.getCatalog().patients);

  app.post<{ Body: Patient }>("/api/clinical/patients", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.upsertPatient(request.body), repository))
  );

  app.put<{ Params: { patientId: string }; Body: Patient }>("/api/clinical/patients/:patientId", async (request, reply) =>
    withRepositoryError(reply, () =>
      topologyResponse(
        repository.upsertPatient({
          ...request.body,
          id: request.params.patientId
        }),
        repository
      )
    )
  );

  app.delete<{ Params: { patientId: string } }>("/api/clinical/patients/:patientId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deletePatient(request.params.patientId), repository))
  );

  app.get("/api/clinical/surgeries", async () => repository.getCatalog().surgeries);

  app.post<{ Body: SurgeryCase }>("/api/clinical/surgeries", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.upsertSurgery(request.body), repository))
  );

  app.put<{ Params: { surgeryId: string }; Body: SurgeryCase }>("/api/clinical/surgeries/:surgeryId", async (request, reply) =>
    withRepositoryError(reply, () =>
      topologyResponse(
        repository.upsertSurgery({
          ...request.body,
          id: request.params.surgeryId
        }),
        repository
      )
    )
  );

  app.delete<{ Params: { surgeryId: string } }>("/api/clinical/surgeries/:surgeryId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deleteSurgery(request.params.surgeryId), repository))
  );

  app.get("/api/recordings", async () => repository.getCatalog().recordingTasks);

  app.post<{ Body: Partial<RecordingTask> & Pick<RecordingTask, "surgeryId" | "sourceId" | "storageVolumeId"> }>(
    "/api/recordings/start",
    async (request, reply) =>
      withRepositoryError(reply, () => {
        const startedAt = request.body.startedAt ?? new Date().toISOString();
        const recording: RecordingTask = {
          id: request.body.id ?? `REC-${Date.now()}`,
          surgeryId: request.body.surgeryId,
          sourceId: request.body.sourceId,
          storageVolumeId: request.body.storageVolumeId,
          status: "recording",
          muted: request.body.muted ?? false,
          startedAt,
          durationSeconds: request.body.durationSeconds ?? 0
        };

        return topologyResponse(repository.startRecording(recording), repository);
      })
  );

  app.post<{ Params: { recordingId: string } }>("/api/recordings/:recordingId/pause", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.pauseRecording(request.params.recordingId), repository))
  );

  app.post<{ Params: { recordingId: string } }>("/api/recordings/:recordingId/resume", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.resumeRecording(request.params.recordingId), repository))
  );

  app.post<{ Params: { recordingId: string } }>("/api/recordings/:recordingId/stop", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.stopRecording(request.params.recordingId), repository))
  );

  app.post<{ Params: { recordingId: string } }>("/api/recordings/:recordingId/fail", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.failRecording(request.params.recordingId), repository))
  );

  app.get("/api/media-assets", async () => repository.getCatalog().mediaAssets);

  app.post<{ Body: MediaAsset }>("/api/media-assets", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.upsertMediaAsset(request.body), repository))
  );

  app.put<{ Params: { assetId: string }; Body: MediaAsset }>("/api/media-assets/:assetId", async (request, reply) =>
    withRepositoryError(reply, () =>
      topologyResponse(
        repository.upsertMediaAsset({
          ...request.body,
          id: request.params.assetId
        }),
        repository
      )
    )
  );

  app.delete<{ Params: { assetId: string } }>("/api/media-assets/:assetId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deleteMediaAsset(request.params.assetId), repository))
  );
}

function topologyResponse(_: unknown, repository: TopologyRepository) {
  return {
    catalog: repository.getCatalog(),
    summary: repository.getSummary(),
    validation: repository.validate()
  };
}

function withRepositoryError(reply: FastifyReply, action: () => unknown) {
  try {
    return action();
  } catch (error) {
    if (error instanceof RepositoryError) {
      return reply.code(error.statusCode).send({
        error: error.code,
        message: error.message,
        details: error.details
      });
    }

    throw error;
  }
}
