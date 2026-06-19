Timestamp Logger PWA v0.9a

Progressive Web App (PWA) for rapid mission timestamp capture.

Designed for pre-hospital, retrieval, critical care, and air ambulance environments where recording accurate timings is important but interaction time must be minimal.

What this app does

Timestamp Logger allows one-touch or voice capture of key mission events and synchronises them to a central Google Sheets backend.

The app is designed to:

Work on Android and iPhone
Install as a home-screen app
Continue functioning with poor or absent signal
Queue unsent events locally
Automatically sync when connectivity returns
Provide a local audit trail of captured events
Feed a central reporting dashboard
Current Version

PWA v0.9a

Aligned with:

Wear OS: wear-0.3b
Backend: v0.9a
Timeline Events
Mission Timeline
Mobile
Landed
Arrive Scene
With Patient
Post-Treatment Timeline
Ready to Leave Scene
Depart Scene
Hospital Arrival
Handover Complete

Completed events:

Turn green
Display captured timestamp
Remain visible throughout the mission
Clinical Events
Interventions

Current predefined interventions:

Arterial Line
ETT
FAST
FIB
Haemostatic Dressing
IO Access
IV Access
Pelvic Binder
PHEA
ROSC
Thoracostomy
Tourniquet
Drugs

Current predefined medications:

Adrenaline
Blood
Calcium
Fentanyl
Ketamine
Midazolam
Rocuronium
TXA
Other...

Both intervention and drug menus include:

Other...

This allows:

Free text entry
Dictation
Future expansion without code changes
Voice Notes

Large full-width button permanently fixed to the bottom of the screen.

Features:

Single tap activation
Dictation using device speech recognition
Immediate submission
No additional confirmation screens

Voice notes are sent as:

event_type: "VOICE_NOTE"
event_category: "voice"
Manual Notes

Free-text notes may be entered manually.

Examples:

Tourniquet repositioned
Consultant requested
Crew stood down
Delay due weather

Manual notes are logged independently from timeline events.

Clear Patient Episode

The Clear button replaces the earlier Complete Job function.

Selecting Clear:

Prompts:
End patient episode?
Logs:
event_type: "CLEAR"
event_category: "job"
Clears local timeline state
Reminds user to review output:
tiny.cc/MagpasTimestamp
User Setup

Each device stores:

Organisation

Examples:

Magpas
DSAA
EAAA
HIOWAA
User

Examples:

Callsign
Initials
Crew identifier

These values are included with every timestamp.

Offline Operation

The PWA is designed for unreliable mobile signal environments.

When offline

Events are:

Stored locally
Timestamped immediately
Added to the pending queue
When signal returns

The app:

Automatically retries transmission
Removes successfully synced items
Updates sync status

No user action required.

Output

Default output link:

tiny.cc/MagpasTimestamp

This link can be customised for other organisations.

Output data is stored centrally in Google Sheets and can be used for:

Mission review
Audit
Research
Operational performance monitoring
Timestamp validation
Data Schema

All platforms share the same payload structure.

{
  "event_time": "",
  "event_type": "",
  "event_category": "",
  "note": "",
  "user": "",
  "organisation": "",
  "source": "",
  "app_version": "",
  "local_id": "",
  "sync_status": ""
}

This schema is shared by:

PWA
Wear OS
Backend
Planned Features
Near-term
Additional intervention library
Additional medication library
Custom organisation output links
Better admin dashboard
Event editing
Event deletion
Medium-term
Apple Watch companion app
Wear OS haptic improvements
Voice command shortcuts
Mission summary generation
Future
HEMSbase integration
PhEMNet integration
CAD/dispatch integration
Multi-organisation tenancy
Crew-level analytics
Project Status

Active development.

Current focus:

Stabilise PWA workflow
Stabilise Wear OS workflow
Maintain cross-platform event compatibility
Build reporting/admin features
Explore smartwatch-first workflows

Timestamp Logger
Rapid mission timestamp capture for pre-hospital critical care and air ambulance operations.
