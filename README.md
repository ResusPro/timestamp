# Timestamp Logger PWA v1.1.4

Requires Backend v1.1.1.

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
