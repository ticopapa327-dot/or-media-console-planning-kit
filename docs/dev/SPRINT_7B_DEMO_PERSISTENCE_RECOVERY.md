# Sprint 7B Demo Persistence And Recovery

This document records the demo-state persistence and recovery increment.

## Scope

The repository already uses `FileTopologyRepository` for local runtime persistence through `data/topology.local.json`. Sprint 7B completes the minimum recovery loop around that persistence layer:

- Add a repository-level `replace` operation that validates a restored catalog before saving.
- Add an API endpoint for exporting the current topology catalog as a backup payload.
- Add an API endpoint for restoring a catalog from a backup payload.
- Audit topology restore operations.
- Cover backup and restore with automated API tests.

This is a local demo and engineering workflow. It is not a production disaster-recovery design, immutable backup vault, database PITR strategy, retention policy, or hospital-approved operations procedure.

## API Endpoints

Backup:

- `GET /api/admin/topology/backup`

Restore:

- `POST /api/admin/topology/restore`

Restore accepts a partial or full topology catalog payload. Missing arrays are normalized by the repository, and the resulting catalog must pass shared topology validation before it is persisted.

## Runtime File

The API server continues to use:

```text
data/topology.local.json
```

Override with:

```powershell
$env:TOPOLOGY_FILE="C:\temp\or-media-console-topology.json"
pnpm --filter @or-media-console/api dev
```

The `data/` directory remains ignored by Git.

## Audit

Restore writes:

- action: `topology.restore`
- entity type: `topology`
- metadata: `roomCount`, `deviceCount`, `connectionCount`

## Validation

Automated checks cover:

- creating a runtime topology change
- exporting the changed catalog
- resetting back to the standard seed
- restoring from the exported catalog
- verifying audit evidence for restore

## Next Sprint

The next useful increment is audit evidence export:

- filter audit logs by actor, action and entity
- export matching entries for release review
- keep audit read operations behind `audit:read`
