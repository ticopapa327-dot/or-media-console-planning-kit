# Sprint 5 Quality And Release Readiness

This document records the quality, audit and release-readiness increment.

## Scope

Sprint 5 implements the core release-control foundation:

- Add audit log, system alert and status event models.
- Add summary counters for open alerts, critical alerts, audit logs and status events.
- Add alert acknowledgement and resolution workflow.
- Append audit evidence for high-risk runtime actions.
- Append status history when managed endpoint status changes.
- Add GitHub Actions CI for `pnpm lint` and `pnpm build`.
- Add release checklist and demo script for public repository readers.

This is still an MVP workflow. It does not implement production authentication, external SIEM export, immutable database audit storage, or medical-device alarm certification.

## Data Model

`AuditLogEntry` records who performed a high-risk action, when it happened, the affected entity and a short business summary.

`SystemAlert` records operational warnings and critical conditions. Alerts move through:

- `open`
- `acknowledged`
- `resolved`

`StatusEvent` records status changes for managed entities such as devices, remote endpoints and audio endpoints.

## API Endpoints

Audit:

- `GET /api/audit-logs`

Alerts:

- `GET /api/alerts`
- `POST /api/alerts`
- `POST /api/alerts/:alertId/acknowledge`
- `POST /api/alerts/:alertId/resolve`

Status events:

- `GET /api/status-events`

The following high-risk actions now write audit entries:

- topology reset
- recording start, pause, resume, stop and failure
- meeting creation and close
- remote endpoint update
- audio endpoint update
- alert creation, acknowledgement and resolution

## Web Console

The console now includes a quality section with:

- non-resolved alerts
- alert acknowledgement and resolution buttons
- recent audit entries
- recent status events

## Validation

Automated checks cover:

- standard topology quality counters
- alert acknowledgement metadata validation
- device status event creation
- audit entries written by meeting, remote endpoint, audio endpoint and alert workflows

## CI

The repository now includes `.github/workflows/ci.yml`.

CI runs on pull requests and pushes to `main`:

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm build`

## Next Sprint

Sprint 6 should focus on productization:

- add login/session and role-based authorization
- split read-only and operator workflows
- add persistent database storage behind the repository interface
- add exportable audit reports
- add browser-based end-to-end tests for the main operator flow
