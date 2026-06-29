# Sprint 6 Local Auth And RBAC Foundation

This document records the local authentication and role-based access control increment.

## Scope

Sprint 6 implements the first authorization boundary:

- Add role capability data to the shared topology catalog.
- Add demo administrator and auditor users.
- Add `GET /api/auth/session` for the current local user.
- Accept `x-user-id` on API requests as the MVP local session selector.
- Block high-risk write APIs when the selected user lacks the required permission.
- Write audit entries with the selected user id instead of a fixed system actor.
- Add an operator selector to the web console.

This is an MVP authorization skeleton. It does not implement passwords, SSO, token issuance, session expiry, LDAP/AD integration, MFA, or production identity governance.

## Role Model

The standard topology now includes these role capability groups:

- `admin`: full local permissions.
- `or_operator`: routing, recording and audio control.
- `teaching_user`: meeting management and audio control.
- `remote_expert`: read-only topology access.
- `device_engineer`: topology maintenance, alert management and audit reading.
- `auditor`: read-only topology and audit access.

## Permission Keys

The MVP permission keys are:

- `topology:read`
- `topology:write`
- `route:control`
- `recording:control`
- `meeting:manage`
- `remote:authorize`
- `audio:control`
- `alert:manage`
- `audit:read`
- `user:manage`

## API Behavior

When no `x-user-id` header is sent, the local development API defaults to `USER-ADMIN`.

When `x-user-id` is sent:

- unknown or disabled users receive `401 AUTH_REQUIRED`
- users without the required permission receive `403 PERMISSION_DENIED`
- successful audited actions write the selected user id as `AuditLogEntry.actor`

## Web Console

The top bar now includes an operator selector. Selecting a different user updates the API actor header for subsequent requests and displays the current role and permission count.

## Validation

Automated checks cover:

- current session lookup
- role capability summary counts
- role capability validation
- permission denial for a read-only remote expert
- audit actor attribution for meeting creation

## Next Sprint

Sprint 7A should lock down the current clinical-data boundary before production identity or persistence work:

- keep HIS/EMR patient lookup outside the current MVP
- generate clearly synthetic patient and surgery records for demos and tests
- audit manual and synthetic clinical-data changes

After that, Sprint 7B can continue with persistence:

- file-backed or database-backed repository implementation
- migrations or seed loader
- backup/restore scripts
