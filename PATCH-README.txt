WINTER ARC TRACKER V26.0 PATCH ZIP

IMPORTANT
This is a PATCH ZIP, not a full repository backup. It contains only new/replacement files.
It does not contain your existing app.js, CSS base files, icons, creator photos, cloud config,
Flutter platform folders, SQL data, or previous tracker history. Keep those existing files.

HOW TO APPLY
1. Extract this ZIP.
2. Copy/merge every extracted path into the root of the existing Tracker repository.
3. When asked, replace files with the same path:
   - index.html
   - sw.js
   - lib/main.dart
   - .github/workflows/build.yml
   - assets/webcore/index.html
   - assets/webcore/sw.js
4. Add the new files:
   - arcpilot.js
   - v26-arcpilot.css
   - assets/webcore/arcpilot.js
   - assets/webcore/v26-arcpilot.css
   - V26-CHANGELOG.md
5. Commit and push to the main branch. The existing build.yml workflow then validates the
   website bundle, builds the Android debug APK, and deploys GitHub Pages from assets/webcore.

FEATURE NOTES
- ArcPilot appears as a new tile in More → Personal Intelligence.
- It reads progress_tracker_v17 only; it never overwrites that store.
- Its preferences are stored separately in winter_arc_arcpilot_v1.
- Forecasts are estimates, not guaranteed predictions.
- Frozen days are excluded from habit-rate calculations.

ROLLBACK
To roll back ArcPilot only, remove arcpilot.js and v26-arcpilot.css from the root and
assets/webcore folders, restore the previous index.html, sw.js, lib/main.dart and workflow
files from Git history, then push again.
