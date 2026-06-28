# Sprint 3 Recording And Media Assets

This document records the first recording and media asset workflow increment.

## Scope

Sprint 3 implements the core of `MVP-013` to `MVP-016`:

- Add demo-only patient and surgery models.
- Add recording task state machine.
- Add media asset metadata.
- Create a media asset automatically when a recording is stopped.
- Track storage volume usage when a recording produces media.
- Add patient, surgery, recording and media controls to the web console.

No real patient data is used. Seeded records use explicit demo identifiers.

## Status

Completed in commit `332db43`.

## Recording State Machine

```text
recording -> paused -> recording -> stopped
recording -> failed
paused -> failed
```

The API rejects:

- Pausing a task that is not recording.
- Resuming a task that is not paused.
- Stopping a task that is already stopped or failed.
- Starting another active recording for the same signal source.

## API Endpoints

Clinical endpoints:

- `GET /api/clinical/patients`
- `POST /api/clinical/patients`
- `PUT /api/clinical/patients/:patientId`
- `DELETE /api/clinical/patients/:patientId`
- `GET /api/clinical/surgeries`
- `POST /api/clinical/surgeries`
- `PUT /api/clinical/surgeries/:surgeryId`
- `DELETE /api/clinical/surgeries/:surgeryId`

Recording endpoints:

- `GET /api/recordings`
- `POST /api/recordings/start`
- `POST /api/recordings/:recordingId/pause`
- `POST /api/recordings/:recordingId/resume`
- `POST /api/recordings/:recordingId/stop`
- `POST /api/recordings/:recordingId/fail`

Media endpoints:

- `GET /api/media-assets`
- `POST /api/media-assets`
- `PUT /api/media-assets/:assetId`
- `DELETE /api/media-assets/:assetId`

## Web Console

The console now includes:

- Patient quick entry.
- Surgery quick entry for the selected room.
- Room surgery list.
- Recording start controls.
- Recording pause, resume, stop and fail actions.
- Media asset list with editable titles.

## Validation

Automated checks cover:

- Patient and surgery creation.
- Recording start, pause, resume and stop.
- Media asset creation on stop.
- Duplicate active recording conflict.
- New shared model reference validation.

## Next Sprint

Sprint 4 should add teaching and remote access workflows:

- Read-only teaching sessions.
- Meeting session and member model.
- Remote endpoint authorization.
- Audio input/output configuration state.
- Permission boundaries for teaching users versus operating room control users.
