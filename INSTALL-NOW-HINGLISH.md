# Winter Arc — Permanent live repair + Phase 5 (Android instructions)

## Root cause (confirmed from the current GitHub repo)

Latest helper-file upload commit: `bffd6978e8328c3d4e72835022cef4816d61dbee`.
The commit added Phase 2–4 scripts and a root-level `build.yml`, but did **not** replace the active workflow at `.github/workflows/build.yml`.

The live workflow file is still the old `Winter Arc Build`, and it still publishes `assets/webcore` from the old V25.4 bundle. The published `app.js` still has `const baseCloudSyncV19=cloudSync;` without a `let cloudSync` binding before V19. That is why the same `cloudSync is not defined` error keeps returning. Uploading a file named `build.yml` at the repository root does not activate it.

## This update is intentionally small

Upload only these two **new** files to the Tracker repository root:

- `phase5_virtual_pet_patch.py`
- `phase5_virtual_pet_test.py`

Replace these two existing Phase 3 helper files with the updated copies in this ZIP as well (they now recognise the Phase 5 Today card on repeat builds):

- `phase3_xp_achievements_patch.py`
- `phase3_xp_achievements_test.py`

Then replace exactly this existing file:

- `.github/workflows/build.yml`

The ZIP includes that workflow at the exact folder path. Do not rename it to root `build.yml`.

## Phone steps

1. Download and extract this ZIP on Android.
2. Open `Vikas915577/Tracker` on GitHub. Use **Add file → Upload files** and upload the two Phase 5 `.py` files to the repository root (same level as `app.js`). Also upload/replace the two Phase 3 `.py` files from this ZIP at the same root. Commit them.
3. Open the active workflow editor directly: https://github.com/Vikas915577/Tracker/edit/main/.github/workflows/build.yml
4. In the downloaded ZIP, open `.github/workflows/build.yml`. Copy its complete contents. In the GitHub editor, select all old text and paste the new workflow contents.
5. Commit the change to `main` with message: `Activate safe Winter Arc V26 phases 2-5 release`.
6. Open the repository **Actions** tab. The workflow name must be `Winter Arc V26 Safe Release — Phases 2 to 5`.

## Why this workflow avoids the previous 403

The previous workflow tried to create a backup branch using `git push`, which depends on write permission and could fail with 403. This workflow does not create or push branches and does not need `contents: write`. It creates a downloadable source backup artifact instead, then runs Phases 2 → 3 → 4 → 5, verifies the built bundle, and only then deploys GitHub Pages.

Artifacts expected in the Actions run:

- `tracker-source-backup-...` — pre-build source backup.
- `winter-arc-v26-phases-2-5-patched-source-...` — patched build snapshot for inspection.
- `winter-arc-v26-phases-2-5-debug-apk` — Android debug APK, when the APK job succeeds.

The workflow deploys the patched Pages artifact but intentionally does not push generated code back to `main`. Keep the helper scripts and this active workflow in the repo so future builds repeat the same verified patch sequence.

## What the release does

- **Phase 2:** declares the outer `cloudSync` binding before V19, adds the boot-success marker, fixes new-habit creation date, synchronizes root source into the actual published `assets/webcore` bundle, and updates the V26 service-worker cache. It retains `progress_tracker_v17` and legacy migration keys.
- **Phase 3:** adds XP/level card, 21 derived milestones, Achievements and Insights. The existing XP ledger stays authoritative.
- **Phase 4:** adds the separate YaarJam offline arcade (24 games, 381 prompt/item records) under `./arcade/`, with a return-to-Tracker link and isolated game storage/cache.
- **Phase 5:** adds the Arc Companion virtual pet. It grows from existing XP, daily Feed/Play/Rest actions are limited to one each (maximum three per day), and care history is saved inside the existing `progress_tracker_v17` object. Pet care does not generate XP.

No Supabase, database, SQL, RLS, auth, or backend files are changed.

## After deployment

When `prepare-and-upload-pages` and `deploy-pages` are green, close old Tracker tabs and open a fresh tab at:

https://vikas915577.github.io/Tracker/?release=phase5

Do **not** clear Chrome site data, storage, or cookies. Your habit progress is stored there.

Quick phone check:

- Today loads without the warning and shows XP + Arc Companion.
- More → Arc Companion opens and Feed works once; its check remains after reload.
- More → Arcade opens YaarJam, and Back to Winter Arc returns correctly.
- Existing habits/checks remain present.

Do not consider Phase 5 released until the Actions QA and Pages deployment jobs are green. If a job fails, share a screenshot of the failed step, not just the top-level run status.
