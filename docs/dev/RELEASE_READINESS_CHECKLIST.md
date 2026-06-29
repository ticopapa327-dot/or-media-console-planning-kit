# Release Readiness Checklist / 开放前检查清单

## Code And CI / 代码与持续集成

- [ ] `pnpm install --frozen-lockfile` succeeds on a clean machine.
- [ ] `pnpm lint` passes.
- [ ] `pnpm build` passes.
- [ ] GitHub Actions CI passes on `main`.
- [ ] No local runtime data, PDFs, VSDX files, `dist` folders, or `node_modules` are tracked.

## Functional MVP / MVP 功能

- [ ] Topology dashboard loads the standard catalog.
- [ ] Room, device and connection edits persist through the API repository.
- [ ] Video route creation, conflict detection and disconnect work.
- [ ] Patient, surgery, recording and media asset workflows work.
- [ ] HIS/EMR patient lookup is not required for the current MVP; patient data used in demos is synthetic or manually entered.
- [ ] Teaching meetings, members, remote authorization and audio controls work.
- [ ] Local operator roles block unauthorized high-risk actions.
- [ ] Alerts can be acknowledged and resolved.
- [ ] Audit logs are written for high-risk actions.
- [ ] Status events are written when device or endpoint status changes.

## Documentation / 文档

- [ ] README includes bilingual project overview and local run commands.
- [ ] Prelaunch documents `00` to `15` are present.
- [ ] Sprint implementation notes are present from Sprint 0 onward.
- [ ] Equipment and electrical connection documentation is anonymized.
- [ ] Third-party manufacturer names and original vendor names are not present in tracked text files.

## Security And Compliance / 安全与合规

- [ ] Demo patient data is synthetic.
- [ ] No production credentials or protected health information are committed.
- [ ] Authentication and RBAC limits are documented as next-sprint scope.
- [ ] Audit log limitations are documented as MVP limitations.
- [ ] Network and deployment assumptions are marked for site-specific validation.

## Demo Gate / 演示门禁

- [ ] API health endpoint returns `200`.
- [ ] Web console returns `200`.
- [ ] Standard topology validation returns an empty issue list.
- [ ] A route can be created and disconnected.
- [ ] A recording can start and stop, creating a media asset.
- [ ] A teaching meeting can be created and closed.
- [ ] A remote endpoint authorization change creates an audit entry.
- [ ] A seeded alert can be acknowledged.
