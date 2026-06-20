# Timestamp Logger PWA v1.1

Shared active episode release for backend v1.1.

## Requires

Backend v1.1 deployed first.

## Changes from v1.0

- Pulls shared active episode state from backend.
- Completed timeline buttons sync across user devices.
- Patient contact timer syncs across user devices.
- Session ID stored and reused.
- Pull Shared State button in User Setup.
- PWA version displayed as v1.1.

## Timer behaviour

Starts at WITH_PATIENT. Stops at HANDOVER_COMPLETE or clears on CLEAR.
