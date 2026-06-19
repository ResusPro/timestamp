# Timestamp Logger PWA v1.0

Queued release aligned with WearOS wear-0.4 and Backend v1.0.

Target changes:

- Add visible **PATIENT CONTACT TIME** timer to the web app.
- Timer starts at `WITH_PATIENT`.
- Timer continues through scene and transport.
- Timer stops at `HANDOVER_COMPLETE` or `CLEAR`.
- `READY_TO_LEAVE_SCENE` remains a timestamp but does not stop the timer.
- Add 10-minute passage-of-time alerts where supported by browser/device.
- Add `Mark` / `GENERIC_TIMESTAMP` button.
- Keep offline queue, Output link, Clear confirmation, intervention/drug pickers, and Other entries.

Backend v1.0 adds `_DICTIONARY` correction support.
