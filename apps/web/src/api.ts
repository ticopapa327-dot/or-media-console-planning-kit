import {
  STANDARD_TOPOLOGY,
  summarizeTopology,
  type Connection,
  type Device,
  type AudioEndpoint,
  type LayoutTemplate,
  type MediaAsset,
  type MeetingMember,
  type MeetingSession,
  type Patient,
  type RecordingTask,
  type RemoteEndpoint,
  type Room,
  type RouteSession,
  type SurgeryCase,
  type TopologyCatalog,
  type TopologySummary,
  type UserAccount
} from "@or-media-console/shared";

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

export async function resetTopology(): Promise<TopologyResponse> {
  return sendTopologyRequest("/api/admin/topology/reset", {
    method: "POST"
  });
}

export async function saveRoom(room: Room): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/admin/rooms/${encodeURIComponent(room.id)}`, {
    method: "PUT",
    body: JSON.stringify(room)
  });
}

export async function createRoom(room: Room): Promise<TopologyResponse> {
  return sendTopologyRequest("/api/admin/rooms", {
    method: "POST",
    body: JSON.stringify(room)
  });
}

export async function deleteRoom(roomId: string): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/admin/rooms/${encodeURIComponent(roomId)}`, {
    method: "DELETE"
  });
}

export async function saveDevice(device: Device): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/admin/devices/${encodeURIComponent(device.id)}`, {
    method: "PUT",
    body: JSON.stringify(device)
  });
}

export async function createDevice(device: Device): Promise<TopologyResponse> {
  return sendTopologyRequest("/api/admin/devices", {
    method: "POST",
    body: JSON.stringify(device)
  });
}

export async function deleteDevice(deviceId: string): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/admin/devices/${encodeURIComponent(deviceId)}`, {
    method: "DELETE"
  });
}

export async function saveConnection(connection: Connection): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/admin/connections/${encodeURIComponent(connection.id)}`, {
    method: "PUT",
    body: JSON.stringify(connection)
  });
}

export async function createConnection(connection: Connection): Promise<TopologyResponse> {
  return sendTopologyRequest("/api/admin/connections", {
    method: "POST",
    body: JSON.stringify(connection)
  });
}

export async function deleteConnection(connectionId: string): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/admin/connections/${encodeURIComponent(connectionId)}`, {
    method: "DELETE"
  });
}

export async function createRoute(route: Pick<RouteSession, "sourceId" | "targetId"> & Partial<RouteSession>): Promise<TopologyResponse> {
  return sendTopologyRequest("/api/routes", {
    method: "POST",
    body: JSON.stringify(route)
  });
}

export async function saveRoute(route: RouteSession): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/routes/${encodeURIComponent(route.id)}`, {
    method: "PUT",
    body: JSON.stringify(route)
  });
}

export async function disconnectRoute(routeId: string): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/routes/${encodeURIComponent(routeId)}/disconnect`, {
    method: "POST"
  });
}

export async function deleteRoute(routeId: string): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/routes/${encodeURIComponent(routeId)}`, {
    method: "DELETE"
  });
}

export async function saveLayout(layout: LayoutTemplate): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/layouts/${encodeURIComponent(layout.id)}`, {
    method: "PUT",
    body: JSON.stringify(layout)
  });
}

export async function createPatient(patient: Patient): Promise<TopologyResponse> {
  return sendTopologyRequest("/api/clinical/patients", {
    method: "POST",
    body: JSON.stringify(patient)
  });
}

export async function savePatient(patient: Patient): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/clinical/patients/${encodeURIComponent(patient.id)}`, {
    method: "PUT",
    body: JSON.stringify(patient)
  });
}

export async function createSurgery(surgery: SurgeryCase): Promise<TopologyResponse> {
  return sendTopologyRequest("/api/clinical/surgeries", {
    method: "POST",
    body: JSON.stringify(surgery)
  });
}

export async function saveSurgery(surgery: SurgeryCase): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/clinical/surgeries/${encodeURIComponent(surgery.id)}`, {
    method: "PUT",
    body: JSON.stringify(surgery)
  });
}

export async function startRecording(recording: Pick<RecordingTask, "surgeryId" | "sourceId" | "storageVolumeId"> & Partial<RecordingTask>) {
  return sendTopologyRequest("/api/recordings/start", {
    method: "POST",
    body: JSON.stringify(recording)
  });
}

export async function pauseRecording(recordingId: string): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/recordings/${encodeURIComponent(recordingId)}/pause`, {
    method: "POST"
  });
}

export async function resumeRecording(recordingId: string): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/recordings/${encodeURIComponent(recordingId)}/resume`, {
    method: "POST"
  });
}

export async function stopRecording(recordingId: string): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/recordings/${encodeURIComponent(recordingId)}/stop`, {
    method: "POST"
  });
}

export async function failRecording(recordingId: string): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/recordings/${encodeURIComponent(recordingId)}/fail`, {
    method: "POST"
  });
}

export async function saveMediaAsset(asset: MediaAsset): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/media-assets/${encodeURIComponent(asset.id)}`, {
    method: "PUT",
    body: JSON.stringify(asset)
  });
}

export async function saveUser(user: UserAccount): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/users/${encodeURIComponent(user.id)}`, {
    method: "PUT",
    body: JSON.stringify(user)
  });
}

export async function createMeeting(meeting: Pick<MeetingSession, "title" | "roomId" | "createdBy"> & Partial<MeetingSession>) {
  return sendTopologyRequest("/api/meetings", {
    method: "POST",
    body: JSON.stringify(meeting)
  });
}

export async function saveMeeting(meeting: MeetingSession): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/meetings/${encodeURIComponent(meeting.id)}`, {
    method: "PUT",
    body: JSON.stringify(meeting)
  });
}

export async function closeMeeting(meetingId: string): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/meetings/${encodeURIComponent(meetingId)}/close`, {
    method: "POST"
  });
}

export async function saveMeetingMember(member: MeetingMember): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/meeting-members/${encodeURIComponent(member.id)}`, {
    method: "PUT",
    body: JSON.stringify(member)
  });
}

export async function createMeetingMember(member: MeetingMember): Promise<TopologyResponse> {
  return sendTopologyRequest("/api/meeting-members", {
    method: "POST",
    body: JSON.stringify(member)
  });
}

export async function saveRemoteEndpoint(endpoint: RemoteEndpoint): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/remote-endpoints/${encodeURIComponent(endpoint.id)}`, {
    method: "PUT",
    body: JSON.stringify(endpoint)
  });
}

export async function saveAudioEndpoint(endpoint: AudioEndpoint): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/audio-endpoints/${encodeURIComponent(endpoint.id)}`, {
    method: "PUT",
    body: JSON.stringify(endpoint)
  });
}

export async function acknowledgeAlert(alertId: string, actor = "web-console"): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
    method: "POST",
    body: JSON.stringify({ actor })
  });
}

export async function resolveAlert(alertId: string, actor = "web-console"): Promise<TopologyResponse> {
  return sendTopologyRequest(`/api/alerts/${encodeURIComponent(alertId)}/resolve`, {
    method: "POST",
    body: JSON.stringify({ actor })
  });
}

async function sendTopologyRequest(url: string, init: RequestInit): Promise<TopologyResponse> {
  const headers = init.body
    ? {
        "Content-Type": "application/json",
        ...(init.headers ?? {})
      }
    : init.headers;
  const response = await fetch(url, {
    ...init,
    headers
  });

  const body = (await response.json()) as TopologyResponse | { error: string; message: string };

  if (!response.ok) {
    const message = "message" in body ? body.message : `API responded with ${response.status}`;
    throw new Error(message);
  }

  return body as TopologyResponse;
}
