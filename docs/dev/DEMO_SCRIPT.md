# Demo Script / 演示脚本

## Audience / 受众

This demo is written for engineers, product owners and hospital digital operating-room stakeholders who want to understand how engineering experience can be converted into a runnable product skeleton.

## Preparation / 准备

Run:

```powershell
pnpm install
pnpm dev
```

Open:

- Web console: `http://127.0.0.1:4200`
- API health: `http://127.0.0.1:4100/healthz`

## Three-Minute Walkthrough / 三分钟演示

1. Topology overview

   Open the web console and show the room navigation, equipment counts, signal sources, display targets, storage, meetings, alerts and audit counters.

2. Operating-room device control

   Select the operating-room side, change one device status and save it. Point out that the status event count increases.

3. Video routing

   Create a route from a signal source to an available display target, then disconnect it. Explain that route conflicts are blocked by the API.

4. Recording and media

   Start a recording for the demo surgery, then stop it. Show that the media asset list receives a new generated asset.

5. Teaching and remote collaboration

   Create a teaching meeting, add or edit a member, update remote endpoint authorization, and save an audio endpoint volume or mute state.

6. Quality and release readiness

   In the quality section, acknowledge the seeded alert. Show recent audit logs and status events as evidence that high-risk actions are traceable.

## Closing Message / 收尾话术

This repository is not a finished hospital production system. It is a structured product starting point: requirements, architecture, equipment topology, runnable API, web console, tests, CI, release checklist and demo path are already aligned.

For developers, the next valuable step is authentication, role-based authorization, database persistence and browser end-to-end testing.
