# Winter Arc Tracker V25.4 — Production Checklist

## 1) Which package is the real source?

Use this V25.4 package as the canonical source.

The important runtime structure is:

```text
lib/main.dart
assets/webcore/
backend/backend-schema.sql
tool/
.github/workflows/build.yml
.github/workflows/pages.yml
pubspec.yaml
```

Do **not** flatten these folders into the repository root.
Do not delete the older root-level tracker files just because they are legacy; the production build uses the canonical folders above.

## 2) GitHub — exact manual upload

The connected GitHub integration could read the repository but returned HTTP 403 for ref/write operations, so this package is prepared for manual upload. The live `main` branch was not changed by this session.

In `Vikas915577/Tracker` → `main`:

1. Download and extract this package.
2. Upload/copy the package contents into the repository root.
3. Make sure these directories/files are present:
   - `.github/workflows/build.yml`
   - `.github/workflows/pages.yml`
   - `assets/webcore/` (all files inside it)
   - `backend/backend-schema.sql`
   - `lib/main.dart`
   - `tool/prepare_platforms.sh`
   - `tool/patch_android_manifest.py`
   - `tool/qa_static.py`
   - `tool/qa_master.py`
   - `tool/qa_production.py`
   - `tool/qa_logic_smoke.js`
   - `pubspec.yaml`
4. Commit to `main`.

Important: `assets/webcore/cloud-config.js` is the file used by the production web core. The old root `cloud-config.js` is only a legacy copy.

If the GitHub web uploader does not include the hidden `.github` directory, create these two files manually at exactly:

```text
.github/workflows/build.yml
.github/workflows/pages.yml
```

### GitHub Pages setting

Open Repository → Settings → Pages → Source and select **GitHub Actions** for the included Pages workflow.

## 3) Supabase — exact step-by-step

The tracker works locally without Supabase. Supabase is needed for the optional Community Sync / public Rank backend.

### Step 1 — Create project

1. Open the Supabase Dashboard.
2. Choose **New project**.
3. Give the project any name you want.
4. Finish project creation.

Supabase's current dashboard flow creates a project first, then provides the project connection values in the Connect dialog / project settings. citeturn953317view0

### Step 2 — Enable Anonymous Sign-Ins

Inside the Supabase project:

**Authentication → Providers / Auth settings → Anonymous Sign-Ins → Enable**

Winter Arc uses anonymous Supabase accounts so a person can sync without entering email/password. Supabase's docs show `signInAnonymously()` creating an anonymous user; after sign-in the database session uses the `authenticated` role, so RLS still applies. citeturn198519view0turn953317view1

### Step 3 — Run the SQL

1. Open **SQL Editor**.
2. Choose **New query**.
3. Open this file from the package:

```text
backend/backend-schema.sql
```

4. Copy the **complete** file.
5. Paste it into the SQL Editor.
6. Click **Run**.

Supabase documents the SQL Editor as the place to run project SQL. citeturn953317view0

Do not run a shortened/custom SQL version. Use the complete supplied schema so the tables, RLS policies and Rank RPCs stay aligned with the app.

### Step 4 — Get Project URL

Open the Supabase project **Connect** dialog (or the project's API/settings area).
Copy the **Project URL**. It normally looks like:

```text
https://xxxxxxxx.supabase.co
```

Supabase's current Connect flow exposes the Project URL and client publishable key there. citeturn953317view0turn198519view1

### Step 5 — Get the public client key

Use the **Publishable key** intended for browser/mobile clients.
It normally starts like:

```text
sb_publishable_...
```

Older Supabase projects can still expose the legacy `anon` key; that is also a client-side key. Prefer the current publishable key when Supabase gives you one. citeturn198519view1

### Step 6 — Put the values in the app

Open:

```text
assets/webcore/cloud-config.js
```

Replace the two empty values with your own project values:

```js
window.WINTER_ARC_CLOUD = {
  url: 'https://YOUR-PROJECT.supabase.co',
  anonKey: 'YOUR_SB_PUBLISHABLE_KEY'
};
```

Example shape only:

```js
window.WINTER_ARC_CLOUD = {
  url: 'https://abcd1234.supabase.co',
  anonKey: 'sb_publishable_XXXXXXXXXXXXXXXX'
};
```

### VERY IMPORTANT — never paste these keys

Do **not** put either of these into `cloud-config.js`:

```text
sb_secret_...
service_role JWT
```

Supabase describes publishable keys as client-side keys and secret/service-role keys as elevated server-side credentials. RLS must protect the database when using the publishable key. citeturn198519view1turn130819view2

Never send a service-role/secret key to me or upload it to GitHub.

## 4) Privacy rules in this build

Community Sync is **OFF by default**.

A player summary is published only when both are enabled:

```text
Community Sync = ON
Public Profile = ON
```

The player cloud snapshot does not include private habit names, journal, sleep, mood, local PIN or private habit notes.

Turning Public Profile OFF triggers the remote cleanup path so the player's public row/challenge ownership is removed or deactivated instead of remaining publicly visible.

The public Rank uses display name only; the player-facing Rank path does not use Instagram handles.

## 5) After Supabase setup — test Community Sync

1. Open the deployed tracker.
2. Go to **More → Community Sync**.
3. Turn **Community Sync ON**.
4. Turn **Public Profile ON** only when you want to appear publicly.
5. Save.
6. The status should move from not configured to syncing/synced.
7. Open **Rank** and confirm the public name appears only after the opt-in conditions are satisfied.
8. Turn **Public Profile OFF** and save again.
9. Confirm the public profile is no longer available after the cleanup finishes.

## 6) Android / GitHub Actions

The included workflow is:

```text
.github/workflows/build.yml
```

It:

1. checks out the repository,
2. installs Flutter stable,
3. validates the canonical webcore assets,
4. generates Android/iOS/Web platform folders,
5. runs `flutter pub get`,
6. runs `flutter analyze`,
7. builds a **release APK**,
8. uploads the APK as a workflow artifact.

The output artifact is:

```text
winter-arc-v25-release-apk
```

The release APK is intended for direct testing/install. Google Play Store release signing is a separate step and needs a keystore/signing secrets; no private signing material is included here.

## 7) PWA cache

V25.4 uses a new service-worker cache name:

```text
winter-arc-v25.4
```

After the first V25.4 deployment, if an Android phone still shows an old screen, close the old installed PWA/browser tab and clear the site's stored data or reinstall the PWA so the new service worker can take control.

## 8) QA commands

From the repository root:

```bash
python3 tool/qa_static.py
python3 tool/qa_master.py
python3 tool/qa_production.py
node tool/qa_logic_smoke.js
node --check assets/webcore/app.js
bash -n tool/prepare_platforms.sh
python3 -m py_compile tool/patch_android_manifest.py
```

## 9) Migration safety

Do not use a fresh Android install as a way to silently copy the browser's localStorage. Use the app's existing **Backup / Restore** flow when moving data between browser/app environments.

## 10) Current verification status

Source-level QA for this V25.4 package passes:

- 27/27 production checks
- logic smoke checks
- static checks
- master checks
- JavaScript syntax
- shell syntax
- Python syntax

Not yet live-verified in this session:

- Flutter SDK/APK compilation (Flutter SDK is not installed in this environment)
- post-patch GitHub Actions run (GitHub write returned HTTP 403)
- real browser interaction run (Chromium hung in this environment)
- live Supabase connectivity (credentials intentionally blank until the owner creates the project)

These items are deliberately marked as unverified rather than called “done”.
