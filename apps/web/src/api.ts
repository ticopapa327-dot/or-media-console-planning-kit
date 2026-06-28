import {
  STANDARD_TOPOLOGY,
  summarizeTopology,
  type Connection,
  type Device,
  type LayoutTemplate,
  type Room,
  type RouteSession,
  type TopologyCatalog,
  type TopologySummary
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
