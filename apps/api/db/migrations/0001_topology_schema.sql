-- Sprint 0 schema draft for PostgreSQL-compatible deployments.
-- The API currently uses an in-memory repository seeded from the shared package.
-- This migration defines the intended persistence boundary for Sprint 1.

create table rooms (
  id text primary key,
  name text not null,
  type text not null,
  description text not null
);

create table devices (
  id text primary key,
  room_id text not null references rooms(id),
  name text not null,
  category text not null,
  quantity integer not null default 1,
  purpose text not null,
  status text not null
);

create table device_ports (
  id text primary key,
  device_id text not null references devices(id),
  name text not null,
  direction text not null,
  kind text not null
);

create table connections (
  id text primary key,
  from_device_id text not null references devices(id),
  from_port_id text references device_ports(id),
  to_device_id text not null references devices(id),
  to_port_id text references device_ports(id),
  kind text not null,
  purpose text not null
);

create table signal_sources (
  id text primary key,
  room_id text not null references rooms(id),
  name text not null,
  device_id text not null references devices(id),
  status text not null
);

create table display_targets (
  id text primary key,
  room_id text not null references rooms(id),
  name text not null,
  device_id text not null references devices(id),
  status text not null
);

create table storage_volumes (
  id text primary key,
  server_device_id text not null references devices(id),
  name text not null,
  capacity_gb integer not null,
  used_gb integer not null,
  status text not null
);

create table audit_logs (
  id text primary key,
  actor_id text not null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  created_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb
);
