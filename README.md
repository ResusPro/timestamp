# Timestamp Logger PWA v1.1.1

Bug-fix release after v1.1 UI regression.

## Fixes

- Restores top timeline buttons.
- Restores visible current time.
- Removes Mark/Generic entirely.
- Keeps Intervention and Drug selectors.
- Keeps Ready to Leave Scene, Depart Scene, Hospital Arrival, Handover Complete.
- Keeps Clear workflow.
- Keeps backend v1.1 shared active episode pull.
- Keeps patient contact timer.

## Requires

Backend v1.1.

## Timer

Starts at `WITH_PATIENT`.

Stops at `HANDOVER_COMPLETE`.

Clears with `CLEAR`.
