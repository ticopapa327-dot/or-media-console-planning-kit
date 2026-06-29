# Sprint 7C Audit Query And Export

This document records the audit query and export increment.

## Scope

Sprint 7C makes audit evidence easier to use during demo, testing and release review:

- Add query parameters to `GET /api/audit-logs`.
- Add `GET /api/audit-logs/export` for newline-delimited JSON export.
- Keep audit read endpoints behind the `audit:read` permission.
- Cover filtering and export behavior with automated API tests.

This is still an MVP evidence workflow. It is not immutable audit storage, SIEM forwarding, signed log export, long-term retention, legal discovery tooling or a production medical audit trail.

## Query Parameters

Supported filters:

- `actor`
- `action`
- `entityType`
- `entityId`
- `since`
- `until`
- `limit`

Examples:

```text
GET /api/audit-logs?action=clinical.synthetic_case&actor=USER-OR-OP&limit=10
GET /api/audit-logs/export?action=topology.restore
```

The export endpoint returns `application/x-ndjson` and a download-oriented `content-disposition` header.

## Validation

Automated checks cover:

- creating audited synthetic clinical data
- filtering audit logs by actor and action
- limiting returned entries
- exporting matching audit logs as NDJSON

## Next Sprint

The next useful increment is browser-level release evidence:

- drive the web console through representative workflows
- record a screenshot or trace artifact
- keep the browser test small enough for CI
