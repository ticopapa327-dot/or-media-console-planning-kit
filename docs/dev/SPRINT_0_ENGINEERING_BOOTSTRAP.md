# Sprint 0 Engineering Bootstrap

This document records the first implementation step after the prelaunch planning package.

## Scope

Sprint 0 turns the planning kit into a runnable engineering skeleton:

- `packages/shared`: TypeScript domain types, standard topology seed, topology validation, topology summary.
- `apps/api`: Fastify API with health and topology endpoints.
- `apps/web`: React/Vite dashboard that reads the topology API and falls back to local seed data.
- `apps/api/db/migrations`: Draft persistence schema for Sprint 1.

## Prerequisites

- Node.js 24 or an active LTS version.
- pnpm 11 or newer.

## Commands

```powershell
pnpm install
pnpm test
pnpm build
pnpm dev
```

Default local ports:

- API: `http://127.0.0.1:4100`
- Web: `http://127.0.0.1:4200`

## Validation

The current automated checks cover:

- Standard topology reference integrity.
- Topology summary counts.
- API health endpoint.
- API topology endpoint.
- First dashboard data assumptions.

## Status

Completed in commit `77ae023`.

## Next Sprint

Sprint 1 should replace the in-memory repository with a real persistence adapter or migration runner, then expose CRUD operations for rooms, devices, ports, connections, signal sources and display targets.
