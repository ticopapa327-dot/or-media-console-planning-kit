# Sprint 1 Topology Configuration

This document records the first configurable topology management increment.

## Scope

Sprint 1 implements `MVP-004` to `MVP-007` from the MVP task list:

- Persist the standard topology seed into a local runtime JSON file.
- Expose admin CRUD endpoints for rooms, devices, ports, connections, signal sources and display targets.
- Validate duplicate ids, missing rooms, missing devices, missing ports and unsafe deletes.
- Add an editable web console for room, device and connection maintenance.
- Keep generated runtime data out of the public repository.

## Runtime Data

The API uses this file by default:

```text
data/topology.local.json
```

The file is created automatically from `packages/shared/src/standard-topology.ts` when the API starts. The `data/` directory is ignored by Git because it is runtime configuration.

Override the file path when needed:

```powershell
$env:TOPOLOGY_FILE="C:\temp\or-media-console-topology.json"
pnpm --filter @or-media-console/api dev
```

## API Endpoints

Read endpoints:

- `GET /healthz`
- `GET /api/topology`
- `GET /api/topology/rooms/:roomId`

Admin endpoints:

- `POST /api/admin/topology/reset`
- `GET /api/admin/rooms`
- `POST /api/admin/rooms`
- `PUT /api/admin/rooms/:roomId`
- `DELETE /api/admin/rooms/:roomId`
- `GET /api/admin/devices`
- `POST /api/admin/devices`
- `PUT /api/admin/devices/:deviceId`
- `DELETE /api/admin/devices/:deviceId`
- `POST /api/admin/devices/:deviceId/ports`
- `PUT /api/admin/devices/:deviceId/ports/:portId`
- `DELETE /api/admin/devices/:deviceId/ports/:portId`
- `GET /api/admin/connections`
- `POST /api/admin/connections`
- `PUT /api/admin/connections/:connectionId`
- `DELETE /api/admin/connections/:connectionId`
- `GET /api/admin/signal-sources`
- `POST /api/admin/signal-sources`
- `PUT /api/admin/signal-sources/:sourceId`
- `DELETE /api/admin/signal-sources/:sourceId`
- `GET /api/admin/display-targets`
- `POST /api/admin/display-targets`
- `PUT /api/admin/display-targets/:targetId`
- `DELETE /api/admin/display-targets/:targetId`

## Web Console

The web console now supports:

- Room editing, creation and deletion.
- Device creation, inline status/category/purpose editing and deletion.
- Connection creation, inline endpoint/type/purpose editing and deletion.
- Topology reset from the standard seed.
- Validation and operation messages.

Default local ports:

- API: `http://127.0.0.1:4100`
- Web: `http://127.0.0.1:4200`

## Validation

Automated checks cover:

- Topology reference validation.
- Duplicate id detection.
- Admin room upsert.
- Invalid device room rejection.
- Referenced device delete protection.
- Device status update.
- File repository persistence.
- Dashboard data assumptions.

## Next Sprint

Sprint 2 should add route-session modeling and the first video routing workflow:

- `SignalSource` to `DisplayTarget` route sessions.
- Conflict detection for occupied outputs.
- Route create/disconnect API.
- Control console workflow for assigning sources to displays.
- Audit log entries for route operations.
