# Timestamp Logger PWA v1.3.0-rc1

Compatible with the existing Backend v1.1.1 API; backend write-once enforcement is still required before this is a complete multi-device fix.

## v1.3.0-rc1 — callsign selection at Mobile

- MAGPAS callers choose HM66, M33, CC01 or Personal at the first Mobile event of a new episode.
- HM66/M33 map to legacy team keys Helimed66/Medic33, preserving old-device compatibility.
- User setup retains organisation, optional operator/device name and an editable personal callsign.
- Team selection is persisted with the episode; Mobile cannot be tapped again to overwrite the first accepted timestamp.
- This release candidate also requires the paired backend v1.3.0-rc1 and watch/Garmin updates. Do not deploy PWA first on production teams.

## v1.1.6 — team-wide PWA sync repair (22 November 2026)

- Never cache cross-origin Google Apps Script episode GET responses in the service worker; stale cached responses previously could leave the other phone behind.
- Treat existing `organisation + user` backend key as `organisation + team callsign` for backward compatibility. Suggested teams: `Helimed66`, `Medic33`.
- Optional operator/device metadata remains separate and is included in POST for future audit support.
- Switch team safely without mixing local completion indicators; preserve queued events from previous team.
- Pull from backend every 15 seconds in foreground and immediately when the app regains focus.
- Ignore a poll from the old team that completes after team switch; distinguish empty upload queue from confirmed server acceptance.
- Still requires the backend and watch to implement canonical team identity and write-once milestones; this PWA patch is not the entire cross-device fix.

## v1.1.5 — client-side duplicate milestone protection (22 November 2026)

- Repeated taps on timeline milestones or named interventions (except ROSC) no longer enqueue, rewrite, or add a second event from this PWA.
- Original local timestamp survives accidental taps and the scene timer is not restarted.
- Already-recorded buttons show the recorded time and give an informative status/haptic response if tapped again.
- Drugs, voice notes, manual notes, and ROSC remain repeatable.
- On a shared-state pull, preserve the earliest known single-occurrence timestamp within the same episode, and reset old completions when the server session ID changes.
- IMPORTANT: Pixel Watch/Garmin apps and the Google Apps Script backend are maintained separately and must implement the same policy. This PWA fix alone does NOT block repeat submissions from those devices or a second client; the backend must reject duplicate write-once events by job/session ID atomically.

## Previous v1.1.4 changes

## Changes

- Aligns with operational meaning of **Clear**:
  - clear from job
  - available for next patient
  - episode remains available in Output
- Clear now resets active local UI and timer.
- Backend `CLEAR` closes active episode state.
- Next Mobile / With Patient starts a fresh session.
- Mark/Generic removed.
- Sync status remains in Local Timeline.
- Output remains a small header link.

## Deploy

Replace GitHub Pages files:

- index.html
- manifest.json
- service-worker.js
- icons

Then hard refresh / clear PWA cache if needed.
