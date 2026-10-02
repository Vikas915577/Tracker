# Winter Arc Tracker V25.2 — UI + Stability QA

## Scope
Feature-preserving polish of the V24.1 web core inside the Flutter/Dart no-NPM shell. No unrelated feature expansion.

## Verified statically
- JavaScript syntax: PASS
- V24.1 core retained: Today, Week, Month, Arc, Profile, More, habits/history, XP, streak, freeze, routines, goals/planner, mood/energy, journal, sleep, reminders, Rank, Community Sync, public profile, Share/Invite, friend compare, Creator/Credits, Backup/Restore, PWA/web core
- 15-habit cap present
- Rank search is name-only and player rows do not render Instagram handles
- Creator photo assets present
- No package.json and no npm build command
- Backend owner RLS present; tautological id=id policy absent; anonymous insert/update policies absent
- Web core service-worker cache bumped to v25.1
- Flutter shell uses local HTTP asset server instead of file:// loading so relative images/CSS/JS resolve reliably in the WebView

## UX changes
- Creator credit moved to the top of Today and kept compact
- Welcome credit appears near the top of onboarding
- Readable 12–14px supporting text targets and 44px touch targets
- Week/Month/Rank controls enlarged and clearer
- Cards/shadows/borders reduced
- More grouped into Your Journey / Daily Tools / Community & App
- Visible focus states and reduced-motion support retained

## Important limitation
The local environment does not contain the Flutter SDK and its Chromium harness blocks local/file URL navigation, so a real Android APK compile and physical-device tap test cannot be claimed here. GitHub Actions in the package is the compile validation path.


## V25.2 regression fixes
- Creator route no longer falls through to Tool unavailable.
- Legacy Manage / Goals / Planner / Routine screens receive mobile-first styling.
- Add Custom Habit routes to the proper modal.
- Audience page provides transparent reach metrics and opt-in public names.
- CSS is loaded before app boot to reduce visual flash.
