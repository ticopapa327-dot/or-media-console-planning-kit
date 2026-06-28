# Sprint 4 Teaching, Remote Access And Audio

This document records the first teaching, remote access and audio management increment.

## Scope

Sprint 4 implements the core of `MVP-018` to `MVP-021`:

- Add demo user accounts and role labels.
- Add teaching meeting sessions and members.
- Add remote endpoint authorization state.
- Add audio endpoint mute and volume state.
- Add meeting, member, remote endpoint and audio controls to the web console.

This is still an MVP workflow. It does not implement production identity integration, external network access, or real audio hardware control.

## Meeting Model

`MeetingSession` represents a teaching or remote meeting bound to a room and optionally to a surgery case.

`MeetingMember` represents the members in a session:

- `host`: can be treated as the meeting owner.
- `speaker`: can participate with audio.
- `viewer`: read-only teaching participant.

The current implementation stores these permissions as data. Enforcement will be expanded when authentication and RBAC are implemented.

## API Endpoints

Users:

- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:userId`
- `DELETE /api/users/:userId`

Meetings:

- `GET /api/meetings`
- `POST /api/meetings`
- `PUT /api/meetings/:meetingId`
- `POST /api/meetings/:meetingId/close`
- `DELETE /api/meetings/:meetingId`

Members:

- `GET /api/meeting-members`
- `POST /api/meeting-members`
- `PUT /api/meeting-members/:memberId`
- `DELETE /api/meeting-members/:memberId`

Remote endpoints:

- `GET /api/remote-endpoints`
- `POST /api/remote-endpoints`
- `PUT /api/remote-endpoints/:endpointId`
- `DELETE /api/remote-endpoints/:endpointId`

Audio endpoints:

- `GET /api/audio-endpoints`
- `POST /api/audio-endpoints`
- `PUT /api/audio-endpoints/:endpointId`
- `DELETE /api/audio-endpoints/:endpointId`

## Web Console

The console now includes:

- Meeting creation and close action.
- Meeting member creation, role changes and audio mute state.
- Remote endpoint authorization toggle.
- Audio endpoint mute and volume controls.

## Validation

Automated checks cover:

- Open meeting count.
- Remote endpoint authorization count.
- Meeting creation and close.
- Remote endpoint authorization update.
- Audio volume normalization to the 0-100 range.
- Reference validation for users, meetings, members, remote endpoints and audio endpoints.

## Next Sprint

Sprint 5 should consolidate quality and release readiness:

- Add audit log model and write operations for high-risk actions.
- Add alerts and status history.
- Add MVP release checklist generated from implemented endpoints.
- Add CI workflow for `pnpm lint` and `pnpm build`.
- Prepare a short demo script for GitHub readers.
