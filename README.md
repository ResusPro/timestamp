# Timestamp Logger PWA v1.1.5

Compatible with the existing Backend v1.1.1 API; backend write-once enforcement is still required before this is a complete multi-device fix.

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
