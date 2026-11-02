# Winter Arc Tracker — Phase 2 Stability Report

**Target:** `Vikas915577/Tracker`  
**Release target:** V26.0 stability build  
**Scope:** Frontend/runtime stability and deployment synchronization only  
**Backend:** Out of scope; no Supabase/SQL/RLS/Auth/schema changes

## Confirmed source findings

1. `assets/webcore/app.js` is the actual previous Pages runtime, while root `app.js` contains the newer source. The active `.github/workflows/build.yml` was still the V25.4 webcore-only workflow. The root `build.yml` described V26 but called helper scripts under `scripts/`, while the actual helper files are in the repository root. This made the build/deployment definitions inconsistent.
2. The app references `cloudSync` from the V19 wrapper before V24 assigns the real optional implementation. No outer-scope declaration existed before the V19 capture. That can stop app startup before the UI mounts.
3. `addHabit()` stored `created:currentMonth()` even though the app's data model uses a date boundary. A habit added mid-month could be treated as eligible from the first of the month, distorting its history/streak denominator.
4. Existing tracker data is stored under `progress_tracker_v17`; legacy migration keys include V16 and earlier versions. These keys must remain unchanged.
5. The current Pages and service-worker setup can safely be updated without changing the browser origin or clearing site storage. The Android shell currently opens the GitHub Pages URL; changing it to localhost would change the origin and risk making existing browser localStorage appear missing, so this patch does not change that behavior.

## Phase 2 changes packaged

- Idempotent `phase2_stability_patch.py` adds a mutable outer `cloudSync` bootstrap before V19, changes new-habit creation to `today()`, sets the V26.0 version marker, and adds the boot-success marker after the final render.
- Existing `repair_app_boot.py` remains the startup-patch verifier and is called after the Phase 2 patch.
- Replaces the active `.github/workflows/build.yml` with a corrected workflow that calls the helper scripts from their real root paths.
- The new workflow creates a `phase2-backup-<run-id>` branch before editing. If that backup branch cannot be pushed, the workflow stops before applying code changes.
- Builds `assets/webcore/` from the root canonical files, syntax-checks the app and service worker, validates all web assets, deploys only the verified bundle, and builds an Android debug APK artifact.
- `phase2_stability_test.py` checks the existing store/migration keys, Arc dates, V19 declaration order, new-habit date, navigation/XP/streak/freeze markers, boot diagnostic, service worker, and byte-for-byte root/webcore synchronization.
- Flutter app version and package version are aligned to V26.0.

## Data and backend safety

- `progress_tracker_v17` is not renamed or reset.
- Existing migration keys, habit checks, XP events, freezes, PIN, profile and history are not deleted by the patch.
- The patch does not alter SQL files, backend schema, RLS policies, Supabase project settings, or cloud credentials.
- Existing Community Sync behavior is retained and remains opt-in by its existing default; local tracker features do not require the backend.
- Do not clear Chrome storage/cookies while updating.

## Local validation performed in this environment

- `phase2_stability_patch.py --self-test`: PASS (scope/order, creation-date replacement, boot marker order and idempotency).
- Temporary repository fixture: PASS (first patch applies, second patch is idempotent, Flutter/package version replacements match).
- Python bytecode compilation for both Phase 2 scripts: PASS.
- GitHub Actions YAML parse: PASS; expected 3 jobs found (`prepare-and-upload-pages`, `deploy-pages`, `build-apk`).

## Not yet verified

- The full live `app.js` and asset tree could not be downloaded into this runtime because outbound DNS/network access to GitHub was unavailable. The app-specific syntax check, real bundle validator and workflow itself therefore still need to run on GitHub Actions.
- GitHub branch creation/write through the connected integration returned HTTP 403. No branch, commit, APK build or Pages deploy has been made by this session.
- The Action must complete its safety backup branch, JavaScript checks, bundle validation, Pages deploy and APK build before Phase 2 can be called deployed.
- A physical Android phone/browser interaction test is still required after deployment.

## Exact files in the patch package

- `phase2_stability_patch.py` (repository root)
- `phase2_stability_test.py` (repository root)
- `.github/workflows/build.yml` (replace the active workflow at this exact path)
- `build.yml` (reference copy of the same workflow)
- `PHASE2-INSTRUCTIONS-HINGLISH.md`
- `PHASE2-REPORT.md`

The repository already contains `repair_app_boot.py`, `prepare_web_bundle.py`, and `verify_web_bundle.py`; these are used at their root paths.
