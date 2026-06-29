# Sprint 7 Synthetic Clinical Data

This document records the synthetic clinical-data increment after the MVP scope was clarified to exclude HIS/EMR patient lookup.

## Scope

Sprint 7A implements the current `MVP-013` boundary:

- Keep HIS/EMR patient lookup out of the current MVP.
- Mark patient and surgery records with `dataSource = manual | synthetic`.
- Add an API workflow that creates a synthetic patient and surgery case in one audited action.
- Add a web-console action for generating a synthetic case for the selected room.
- Keep generated identifiers visibly synthetic so they cannot be mistaken for real hospital data.

The implementation remains suitable for local development, demos and automated tests. It does not implement HIS/EMR/PACS integration, patient identity matching, real scheduling import or production clinical master-data governance.

## API Endpoints

New endpoint:

- `POST /api/clinical/synthetic-case`

Request fields:

- `roomId`: target room for the generated surgery case.
- `seed`: optional stable demo/test suffix. If omitted, the API creates a runtime suffix.
- `scheduledAt`: optional ISO timestamp.
- `procedureName`, `surgeon`, `department`: optional demo labels.

Generated records use:

- patient id: `PAT-SYN-{suffix}`
- medical record number: `SYN-MRN-{suffix}`
- surgery id: `SURG-SYN-{suffix}`
- `dataSource: "synthetic"`

Manual patient and surgery endpoints now default missing `dataSource` to `"manual"`.

## Audit

Synthetic case generation writes an audit entry:

- action: `clinical.synthetic_case`
- entity type: `surgery`
- metadata: `synthetic`, `patientId`, `roomId`

Manual clinical create/update/delete endpoints also write audit evidence with `patient.*` and `surgery.*` actions.

## Web Console

The case section now shows the current MVP boundary:

- `HIS/EMR 未接入`
- `手动/合成数据`

Users can generate a synthetic case for the selected room, then immediately use it in recording, media and teaching workflows.

## Validation

Automated checks cover:

- fixed-seed synthetic patient and surgery generation
- explicit `synthetic` data-source tagging
- generated medical record number prefix
- audit evidence for synthetic case generation

## Next Sprint

Sprint 7B should continue with persistence:

- file-backed or database-backed repository wiring for demo state
- seed loader and reset strategy
- backup/restore commands
- deployment notes for local demo data
