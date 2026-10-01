# Winter Arc Tracker V25 — Master / No-NPM

This package is the **architecture migration** requested for Winter Arc.

## What is actually inside

**Flutter/Dart shell** → mobile/desktop packaging, native back button, better WebView/media behavior, no Node/npm requirement.

**Bundled V24.1 feature-preserving web core** → the existing tracker feature set is kept instead of rewriting a smaller app and accidentally removing mature functionality.

**Supabase backend SQL** → owner-based RLS, public Rank RPCs, Community Sync and creator dashboard support.

**GitHub Actions** → builds the Android test APK without requiring npm on the phone.

The app deliberately does **not** add unrelated new product features.

## Feature preservation

The bundled core keeps Today, Week, Month, Arc, Profile, More, habits, habit history, streaks, XP, freeze, routines, goals, day planner, mood/energy, journal, sleep, reminders, Rank, Community Sync, public profile, Share & Invite, friend compare, Creator/Credits, Backup/Restore and PWA/web behavior.

The previous V20/V21 sources are retained as migration references in the conversation and the current V24.1 core is bundled as the runtime source, so this package is not a cut-down rewrite.

## Important data migration fact

Chrome/PWA localStorage is sandboxed separately from a newly installed native app. A new Android/iOS app cannot safely copy another app/browser's private localStorage without explicit access. Therefore the safe migration path is:

**Old tracker → Export JSON backup → Install V25 → Restore backup.**

The bundled web core already contains its legacy V17/V18/V19/V20 migration logic for backups and preserves the existing data model.

## Phone-only workflow

1. Upload the contents of this ZIP to the GitHub repository root.
2. GitHub Actions runs Flutter's toolchain and produces a test APK artifact.
3. Download/install the APK from the Actions artifact.
4. The same repo can publish `assets/webcore/` to GitHub Pages for the web/PWA version.

There is no `package.json`, no npm script and no Node build step.

## Backend

Run `backend/backend-schema.sql` in Supabase. Enable Anonymous Sign-Ins for Community Sync. Then configure `assets/webcore/cloud-config.js` with the public project URL and publishable/anon key. Never commit a service-role key.

## Security

Owner writes require `auth.uid() = id`. Public Rank is exposed through aggregate RPCs and player-facing Rank does not display Instagram handles.

## QA status

Static checks and JavaScript syntax checks are included. This environment does not have the Flutter SDK installed, so the final Flutter APK compile must be verified by the included GitHub Actions workflow.
