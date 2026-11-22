# Timestamp — unified release train

**Current proposed release:** `1.3.0-rc1` (22 November 2026) — **source/test candidate only; not deployed**.

This file is the single development entry point for Timestamp. Keep one product version for Wear OS, Garmin, PWA, and Google Apps Script backend. Record previous build versions only as migration history.

| Component | Proposed release | Baseline source | Current location |
|---|---|---|---|
| Backend | 1.3.0-rc1 | 1.2.3 | Consolidated source bundle in ChatGPT Library, `/Timestamp/releases/Timestamp-v1.3.0-rc1-unified-source.zip` |
| Wear OS | 1.3.0-rc1 | 0.6.10 | Same consolidated bundle, `wearos/` |
| Garmin | 1.3.0-rc1 | 0.4.2 | Same consolidated bundle, `garmin/` |
| PWA | 1.3.0-rc1 | 1.1.6 draft | [Draft PR #1](https://github.com/ResusPro/timestamp/pull/1) |

## Clinical workflow

At the start of a new job, pressing **Mobile** prompts for callsign. MAGPAS: **HM66**, **M33**, **CC01**, or **Personal** (for example Nick); other organisations use Personal. HM66 and M33 map to historical shared keys `Helimed66` and `Medic33` respectively. Team identity identifies the **job**, while user/device identity is retained separately for audit.

After selection, all actions from watch, Garmin and phones use the same team-wide active episode until **Clear**. Single-occurrence milestones, especially PHEA, are immutable; genuine ROC redoses and drugs are repeatable. Backend must enforce first-write-wins, not rely exclusively on device UI.

## Release governance

1. Make changes in the combined source bundle and track the common release version.
2. Test backend first; use existing deployment URL so watches and phones do not need new endpoints.
3. Test Garmin simulator and Pixel Watch/Android Studio before store/install.
4. Test on both MAGPAS phones, with a clearly synthetic job.
5. Only after all pass, publish updated clients and mark release stable.

See [Issue #2](https://github.com/ResusPro/timestamp/issues/2) for write-once backend/watch enforcement, [Issue #3](https://github.com/ResusPro/timestamp/issues/3) for team-wide sync, and [PR #1](https://github.com/ResusPro/timestamp/pull/1) for PWA release candidate.

**Important:** The consolidated ZIP is persistent in the user's ChatGPT Library, but its non-PWA code has not yet been imported into this public GitHub repository. The ideal next repository cleanup is to add `backend/`, `wearos/`, `garmin/` alongside the existing PWA; until then, the ZIP is the complete captured source for these three platforms and the PWA is pinned to its Git commit. Do not commit activation codes or patient data here.
