import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type {
  AuthSession,
  AuditLogEntry,
  Connection,
  Device,
  DevicePort,
  DisplayTarget,
  GovernanceEntityType,
  AudioEndpoint,
  LayoutTemplate,
  MediaAsset,
  MeetingMember,
  MeetingSession,
  Patient,
  PermissionKey,
  RecordingTask,
  RemoteEndpoint,
  Room,
  RouteSession,
  SignalSource,
  SyntheticCaseRequest,
  SystemAlert,
  SurgeryCase,
  TopologyCatalog,
  UserAccount
} from "@or-media-console/shared";
import { RepositoryError, type TopologyRepository } from "../repositories/topology-repository";

interface AuditLogQuery {
  actor?: string;
  action?: string;
  entityType?: GovernanceEntityType;
  entityId?: string;
  since?: string;
  until?: string;
  limit?: string;
}

export async function registerTopologyRoutes(app: FastifyInstance, repository: TopologyRepository): Promise<void> {
  app.addHook("preHandler", async (request, reply) => {
    const permission = requiredPermission(request.method, request.url);

    if (!permission) {
      return;
    }

    const session = resolveSession(request, repository);

    if (!session) {
      return reply.code(401).send({
        error: "AUTH_REQUIRED",
        message: "A valid user is required"
      });
    }

    if (!session.permissions.includes(permission)) {
      return reply.code(403).send({
        error: "PERMISSION_DENIED",
        message: `User ${session.user.id} does not have ${permission}`
      });
    }
  });

  app.get("/api/auth/session", async (request, reply) => {
    const session = resolveSession(request, repository);

    if (!session) {
      return reply.code(401).send({
        error: "AUTH_REQUIRED",
        message: "A valid user is required"
      });
    }

    return session;
  });

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

  app.post("/api/admin/topology/reset", async (request, reply) =>
    withRepositoryError(reply, () => {
      repository.reset();
      return auditedResponse(
        repository,
        auditLog(request, repository, "topology.reset", "topology", "STANDARD_TOPOLOGY", "拓扑已重置为标准版种子数据")
      );
    })
  );

  app.get("/api/admin/topology/backup", async () => repository.getCatalog());

  app.post<{ Body: Partial<TopologyCatalog> }>("/api/admin/topology/restore", async (request, reply) =>
    withRepositoryError(reply, () => {
      const restored = repository.replace(request.body);

      return auditedResponse(
        repository,
        auditLog(request, repository, "topology.restore", "topology", restored.version, "拓扑已从备份恢复", {
          roomCount: restored.rooms.length,
          deviceCount: restored.devices.length,
          connectionCount: restored.connections.length
        })
      );
    })
  );

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

  app.post<{ Body: SyntheticCaseRequest }>("/api/clinical/synthetic-case", async (request, reply) =>
    withRepositoryError(reply, () => {
      const { patient, surgery } = createSyntheticCase(request.body, repository);

      repository.upsertPatient(patient);
      repository.upsertSurgery(surgery);

      return auditedResponse(
        repository,
        auditLog(request, repository, "clinical.synthetic_case", "surgery", surgery.id, `合成病例 ${surgery.id} 已生成`, {
          synthetic: true,
          patientId: patient.id,
          roomId: surgery.roomId
        })
      );
    })
  );

  app.post<{ Body: Patient }>("/api/clinical/patients", async (request, reply) =>
    withRepositoryError(reply, () => {
      const patient = withPatientDefaults(request.body);

      repository.upsertPatient(patient);
      return auditedResponse(repository, auditLog(request, repository, "patient.upsert", "patient", patient.id, `患者 ${patient.id} 已保存`));
    })
  );

  app.put<{ Params: { patientId: string }; Body: Patient }>("/api/clinical/patients/:patientId", async (request, reply) =>
    withRepositoryError(reply, () => {
      const patient = withPatientDefaults({
          ...request.body,
          id: request.params.patientId
        });

      repository.upsertPatient(patient);
      return auditedResponse(repository, auditLog(request, repository, "patient.upsert", "patient", patient.id, `患者 ${patient.id} 已保存`));
    })
  );

  app.delete<{ Params: { patientId: string } }>("/api/clinical/patients/:patientId", async (request, reply) =>
    withRepositoryError(reply, () => {
      repository.deletePatient(request.params.patientId);
      return auditedResponse(
        repository,
        auditLog(request, repository, "patient.delete", "patient", request.params.patientId, `患者 ${request.params.patientId} 已删除`)
      );
    })
  );

  app.get("/api/clinical/surgeries", async () => repository.getCatalog().surgeries);

  app.post<{ Body: SurgeryCase }>("/api/clinical/surgeries", async (request, reply) =>
    withRepositoryError(reply, () => {
      const surgery = withSurgeryDefaults(request.body);

      repository.upsertSurgery(surgery);
      return auditedResponse(repository, auditLog(request, repository, "surgery.upsert", "surgery", surgery.id, `手术 ${surgery.id} 已保存`));
    })
  );

  app.put<{ Params: { surgeryId: string }; Body: SurgeryCase }>("/api/clinical/surgeries/:surgeryId", async (request, reply) =>
    withRepositoryError(reply, () => {
      const surgery = withSurgeryDefaults({
          ...request.body,
          id: request.params.surgeryId
        });

      repository.upsertSurgery(surgery);
      return auditedResponse(repository, auditLog(request, repository, "surgery.upsert", "surgery", surgery.id, `手术 ${surgery.id} 已保存`));
    })
  );

  app.delete<{ Params: { surgeryId: string } }>("/api/clinical/surgeries/:surgeryId", async (request, reply) =>
    withRepositoryError(reply, () => {
      repository.deleteSurgery(request.params.surgeryId);
      return auditedResponse(
        repository,
        auditLog(request, repository, "surgery.delete", "surgery", request.params.surgeryId, `手术 ${request.params.surgeryId} 已删除`)
      );
    })
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

        repository.startRecording(recording);
        return auditedResponse(
          repository,
          auditLog(request, repository, "recording.start", "recording", recording.id, `录制 ${recording.id} 已开始`, {
            sourceId: recording.sourceId,
            surgeryId: recording.surgeryId
          })
        );
      })
  );

  app.post<{ Params: { recordingId: string } }>("/api/recordings/:recordingId/pause", async (request, reply) =>
    withRepositoryError(reply, () => {
      repository.pauseRecording(request.params.recordingId);
      return auditedResponse(
        repository,
        auditLog(request, repository, "recording.pause", "recording", request.params.recordingId, `录制 ${request.params.recordingId} 已暂停`)
      );
    })
  );

  app.post<{ Params: { recordingId: string } }>("/api/recordings/:recordingId/resume", async (request, reply) =>
    withRepositoryError(reply, () => {
      repository.resumeRecording(request.params.recordingId);
      return auditedResponse(
        repository,
        auditLog(request, repository, "recording.resume", "recording", request.params.recordingId, `录制 ${request.params.recordingId} 已恢复`)
      );
    })
  );

  app.post<{ Params: { recordingId: string } }>("/api/recordings/:recordingId/stop", async (request, reply) =>
    withRepositoryError(reply, () => {
      repository.stopRecording(request.params.recordingId);
      return auditedResponse(
        repository,
        auditLog(request, repository, "recording.stop", "recording", request.params.recordingId, `录制 ${request.params.recordingId} 已停止`)
      );
    })
  );

  app.post<{ Params: { recordingId: string } }>("/api/recordings/:recordingId/fail", async (request, reply) =>
    withRepositoryError(reply, () => {
      repository.failRecording(request.params.recordingId);
      return auditedResponse(
        repository,
        auditLog(request, repository, "recording.fail", "recording", request.params.recordingId, `录制 ${request.params.recordingId} 已标记失败`)
      );
    })
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

  app.get("/api/users", async () => repository.getCatalog().users);

  app.post<{ Body: UserAccount }>("/api/users", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.upsertUser(request.body), repository))
  );

  app.put<{ Params: { userId: string }; Body: UserAccount }>("/api/users/:userId", async (request, reply) =>
    withRepositoryError(reply, () =>
      topologyResponse(
        repository.upsertUser({
          ...request.body,
          id: request.params.userId
        }),
        repository
      )
    )
  );

  app.delete<{ Params: { userId: string } }>("/api/users/:userId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deleteUser(request.params.userId), repository))
  );

  app.get("/api/meetings", async () => repository.getCatalog().meetingSessions);

  app.post<{ Body: Partial<MeetingSession> & Pick<MeetingSession, "title" | "roomId" | "createdBy"> }>(
    "/api/meetings",
    async (request, reply) =>
      withRepositoryError(reply, () => {
        const meeting: MeetingSession = {
          id: request.body.id ?? `MEET-${Date.now()}`,
          title: request.body.title,
          roomId: request.body.roomId,
          surgeryId: request.body.surgeryId,
          status: request.body.status ?? "open",
          createdBy: request.body.createdBy,
          createdAt: request.body.createdAt ?? new Date().toISOString(),
          closedAt: request.body.closedAt
        };

        repository.upsertMeetingSession(meeting);
        return auditedResponse(
          repository,
          auditLog(request, repository, "meeting.create", "meeting", meeting.id, `会议 ${meeting.id} 已创建`, {
            roomId: meeting.roomId,
            createdBy: meeting.createdBy
          })
        );
      })
  );

  app.put<{ Params: { meetingId: string }; Body: MeetingSession }>("/api/meetings/:meetingId", async (request, reply) =>
    withRepositoryError(reply, () =>
      topologyResponse(
        repository.upsertMeetingSession({
          ...request.body,
          id: request.params.meetingId
        }),
        repository
      )
    )
  );

  app.post<{ Params: { meetingId: string } }>("/api/meetings/:meetingId/close", async (request, reply) =>
    withRepositoryError(reply, () => {
      repository.closeMeetingSession(request.params.meetingId);
      return auditedResponse(
        repository,
        auditLog(request, repository, "meeting.close", "meeting", request.params.meetingId, `会议 ${request.params.meetingId} 已关闭`)
      );
    })
  );

  app.delete<{ Params: { meetingId: string } }>("/api/meetings/:meetingId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deleteMeetingSession(request.params.meetingId), repository))
  );

  app.get("/api/meeting-members", async () => repository.getCatalog().meetingMembers);

  app.post<{ Body: MeetingMember }>("/api/meeting-members", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.upsertMeetingMember(request.body), repository))
  );

  app.put<{ Params: { memberId: string }; Body: MeetingMember }>("/api/meeting-members/:memberId", async (request, reply) =>
    withRepositoryError(reply, () =>
      topologyResponse(
        repository.upsertMeetingMember({
          ...request.body,
          id: request.params.memberId
        }),
        repository
      )
    )
  );

  app.delete<{ Params: { memberId: string } }>("/api/meeting-members/:memberId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deleteMeetingMember(request.params.memberId), repository))
  );

  app.get("/api/remote-endpoints", async () => repository.getCatalog().remoteEndpoints);

  app.post<{ Body: RemoteEndpoint }>("/api/remote-endpoints", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.upsertRemoteEndpoint(request.body), repository))
  );

  app.put<{ Params: { endpointId: string }; Body: RemoteEndpoint }>("/api/remote-endpoints/:endpointId", async (request, reply) =>
    withRepositoryError(reply, () => {
      const endpoint = {
          ...request.body,
          id: request.params.endpointId
        };
      repository.upsertRemoteEndpoint(endpoint);
      return auditedResponse(
        repository,
        auditLog(
          request,
          repository,
          "remote_endpoint.update",
          "remote_endpoint",
          request.params.endpointId,
          `远程端 ${request.params.endpointId} 已更新`,
          {
            authorized: endpoint.authorized,
            status: endpoint.status
          }
        )
      );
    })
  );

  app.delete<{ Params: { endpointId: string } }>("/api/remote-endpoints/:endpointId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deleteRemoteEndpoint(request.params.endpointId), repository))
  );

  app.get("/api/audio-endpoints", async () => repository.getCatalog().audioEndpoints);

  app.post<{ Body: AudioEndpoint }>("/api/audio-endpoints", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.upsertAudioEndpoint(request.body), repository))
  );

  app.put<{ Params: { endpointId: string }; Body: AudioEndpoint }>("/api/audio-endpoints/:endpointId", async (request, reply) =>
    withRepositoryError(reply, () => {
      const endpoint = {
          ...request.body,
          id: request.params.endpointId
        };
      repository.upsertAudioEndpoint(endpoint);
      return auditedResponse(
        repository,
        auditLog(
          request,
          repository,
          "audio_endpoint.update",
          "audio_endpoint",
          request.params.endpointId,
          `音频端点 ${request.params.endpointId} 已更新`,
          {
            muted: endpoint.muted,
            volume: endpoint.volume,
            status: endpoint.status
          }
        )
      );
    })
  );

  app.delete<{ Params: { endpointId: string } }>("/api/audio-endpoints/:endpointId", async (request, reply) =>
    withRepositoryError(reply, () => topologyResponse(repository.deleteAudioEndpoint(request.params.endpointId), repository))
  );

  app.get<{ Querystring: AuditLogQuery }>("/api/audit-logs", async (request) =>
    filterAuditLogs(repository.getCatalog().auditLogs, request.query)
  );

  app.get<{ Querystring: AuditLogQuery }>("/api/audit-logs/export", async (request, reply) => {
    const entries = filterAuditLogs(repository.getCatalog().auditLogs, request.query);
    const payload = entries.map((entry) => JSON.stringify(entry)).join("\n");

    return reply
      .header("content-disposition", 'attachment; filename="audit-logs.ndjson"')
      .type("application/x-ndjson")
      .send(payload ? `${payload}\n` : "");
  });

  app.get("/api/alerts", async () => repository.getCatalog().systemAlerts);

  app.post<{ Body: SystemAlert }>("/api/alerts", async (request, reply) =>
    withRepositoryError(reply, () => {
      repository.upsertSystemAlert(request.body);
      return auditedResponse(
        repository,
        auditLog(request, repository, "alert.create", "topology", request.body.id, `告警 ${request.body.id} 已创建`, {
          severity: request.body.severity,
          status: request.body.status
        })
      );
    })
  );

  app.post<{ Params: { alertId: string }; Body: { actor?: string } }>("/api/alerts/:alertId/acknowledge", async (request, reply) =>
    withRepositoryError(reply, () => {
      const actor = request.body?.actor ?? "system-api";
      repository.acknowledgeSystemAlert(request.params.alertId, actor);
      return auditedResponse(
        repository,
        auditLog(request, repository, "alert.acknowledge", "topology", request.params.alertId, `告警 ${request.params.alertId} 已确认`, {
          actor
        })
      );
    })
  );

  app.post<{ Params: { alertId: string }; Body: { actor?: string } }>("/api/alerts/:alertId/resolve", async (request, reply) =>
    withRepositoryError(reply, () => {
      const actor = request.body?.actor ?? "system-api";
      repository.resolveSystemAlert(request.params.alertId, actor);
      return auditedResponse(
        repository,
        auditLog(request, repository, "alert.resolve", "topology", request.params.alertId, `告警 ${request.params.alertId} 已解决`, {
          actor
        })
      );
    })
  );

  app.get("/api/status-events", async () => repository.getCatalog().statusEvents);
}

function filterAuditLogs(entries: AuditLogEntry[], query: AuditLogQuery): AuditLogEntry[] {
  let filtered = entries;

  if (query.actor) {
    filtered = filtered.filter((entry) => entry.actor === query.actor);
  }

  if (query.action) {
    filtered = filtered.filter((entry) => entry.action === query.action);
  }

  if (query.entityType) {
    filtered = filtered.filter((entry) => entry.entityType === query.entityType);
  }

  if (query.entityId) {
    filtered = filtered.filter((entry) => entry.entityId === query.entityId);
  }

  const since = parseOptionalTimestamp(query.since);
  const until = parseOptionalTimestamp(query.until);

  if (since !== undefined) {
    filtered = filtered.filter((entry) => Date.parse(entry.occurredAt) >= since);
  }

  if (until !== undefined) {
    filtered = filtered.filter((entry) => Date.parse(entry.occurredAt) <= until);
  }

  const limit = parsePositiveLimit(query.limit);
  return limit === undefined ? filtered : filtered.slice(-limit);
}

function parseOptionalTimestamp(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parsePositiveLimit(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function createSyntheticCase(
  request: SyntheticCaseRequest,
  repository: TopologyRepository
): { patient: Patient; surgery: SurgeryCase } {
  const roomId = request.roomId || "room-or-standard";
  const catalog = repository.getCatalog();

  if (!catalog.rooms.some((room) => room.id === roomId)) {
    throw new RepositoryError(404, "ROOM_NOT_FOUND", `Room ${roomId} was not found`);
  }

  const suffix = normalizeSyntheticSeed(request.seed ?? createRuntimeId("CASE"));
  const patient: Patient = {
    id: `PAT-SYN-${suffix}`,
    medicalRecordNo: `SYN-MRN-${suffix}`,
    name: `合成患者-${suffix}`,
    sex: "未指定",
    age: 0,
    department: request.department?.trim() || "演示科室",
    dataSource: "synthetic"
  };
  const surgery: SurgeryCase = {
    id: `SURG-SYN-${suffix}`,
    patientId: patient.id,
    roomId,
    scheduledAt: request.scheduledAt ?? new Date().toISOString(),
    procedureName: request.procedureName?.trim() || "合成演示术式",
    surgeon: request.surgeon?.trim() || "演示医生",
    status: "scheduled",
    dataSource: "synthetic"
  };

  return { patient, surgery };
}

function withPatientDefaults(patient: Patient): Patient {
  return {
    dataSource: "manual",
    ...patient
  };
}

function withSurgeryDefaults(surgery: SurgeryCase): SurgeryCase {
  return {
    dataSource: "manual",
    ...surgery
  };
}

function normalizeSyntheticSeed(seed: string): string {
  const normalized = seed
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);

  return normalized || createRuntimeId("CASE").replace(/^CASE-/, "");
}

function topologyResponse(_: unknown, repository: TopologyRepository) {
  return {
    catalog: repository.getCatalog(),
    summary: repository.getSummary(),
    validation: repository.validate()
  };
}

function auditedResponse(repository: TopologyRepository, entry: AuditLogEntry) {
  return topologyResponse(repository.appendAuditLog(entry), repository);
}

function auditLog(
  request: FastifyRequest,
  repository: TopologyRepository,
  action: string,
  entityType: GovernanceEntityType,
  entityId: string,
  summary: string,
  metadata?: AuditLogEntry["metadata"]
): AuditLogEntry {
  return {
    id: createRuntimeId("AUDIT"),
    actor: resolveSession(request, repository)?.user.id ?? "system-api",
    action,
    entityType,
    entityId,
    occurredAt: new Date().toISOString(),
    summary,
    metadata
  };
}

function resolveSession(request: FastifyRequest, repository: TopologyRepository): AuthSession | undefined {
  const catalog = repository.getCatalog();
  const header = request.headers["x-user-id"];
  const requestedUserId = Array.isArray(header) ? header[0] : header;
  const defaultUser = catalog.users.find((user) => user.id === "USER-ADMIN") ?? catalog.users.find((user) => user.enabled);
  const user = catalog.users.find((candidate) => candidate.id === (requestedUserId ?? defaultUser?.id) && candidate.enabled);

  if (!user) {
    return undefined;
  }

  return {
    user,
    permissions: catalog.roleCapabilities.find((capability) => capability.role === user.role)?.permissions ?? []
  };
}

function requiredPermission(method: string, rawUrl: string): PermissionKey | undefined {
  const path = rawUrl.split("?")[0] ?? rawUrl;
  const upperMethod = method.toUpperCase();

  if (path.startsWith("/api/audit-logs") || path === "/api/status-events") {
    return "audit:read";
  }

  if (upperMethod === "GET") {
    return undefined;
  }

  if (path.startsWith("/api/admin/") || path.startsWith("/api/users")) {
    return path.startsWith("/api/users") ? "user:manage" : "topology:write";
  }

  if (path.startsWith("/api/routes") || path.startsWith("/api/layouts")) {
    return "route:control";
  }

  if (path.startsWith("/api/clinical") || path.startsWith("/api/recordings") || path.startsWith("/api/media-assets")) {
    return "recording:control";
  }

  if (path.startsWith("/api/meetings") || path.startsWith("/api/meeting-members")) {
    return "meeting:manage";
  }

  if (path.startsWith("/api/remote-endpoints")) {
    return "remote:authorize";
  }

  if (path.startsWith("/api/audio-endpoints")) {
    return "audio:control";
  }

  if (path.startsWith("/api/alerts")) {
    return "alert:manage";
  }

  return undefined;
}

function createRuntimeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
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
