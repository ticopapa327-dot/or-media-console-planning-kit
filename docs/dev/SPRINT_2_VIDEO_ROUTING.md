# Sprint 2 Video Routing

This document records the first video routing workflow increment.

## Scope

Sprint 2 implements the core of `MVP-008` to `MVP-011`:

- Add `RouteSession` and `LayoutTemplate` to the shared topology model.
- Seed initial active routes and layout templates from the standard topology.
- Validate route source and display target references.
- Detect occupied display targets before activating a route.
- Expose route create, update, disconnect and delete APIs.
- Add route controls to the web console.

## Status

Completed in commit `01b4897`.

## Route Model

`RouteSession` represents one assignment from a signal source to a display target:

```text
SignalSource -> DisplayTarget
```

Only one active route may target the same display target. If a second active route is created for an occupied target, the API returns:

```json
{
  "error": "ROUTE_TARGET_OCCUPIED"
}
```

Disconnected routes remain in the catalog with `status = "disconnected"` and an `endedAt` timestamp. This keeps the door open for audit logging in a later sprint.

## API Endpoints

- `GET /api/routes`
- `POST /api/routes`
- `PUT /api/routes/:routeId`
- `POST /api/routes/:routeId/disconnect`
- `DELETE /api/routes/:routeId`
- `GET /api/layouts`
- `POST /api/layouts`
- `PUT /api/layouts/:layoutId`
- `DELETE /api/layouts/:layoutId`

## Web Console

The right-side work area now includes:

- Signal source selector.
- Display target selector.
- Route label input.
- Route creation action.
- Active/disconnected route list.
- Route save, disconnect and delete actions.
- Layout template list for the selected room.

## Validation

Automated checks cover:

- Active route and layout summary counts.
- Missing route source and target validation.
- Route creation.
- Route disconnection.
- Occupied display target conflict.
- Existing Sprint 1 topology CRUD behavior.

## Next Sprint

Sprint 3 should implement the recording and media asset minimum workflow:

- Patient and surgery manual entry.
- Recording task state machine.
- Storage volume usage and capacity warning.
- Media asset metadata.
- Media library query and controlled download audit placeholder.
