WINTER ARC TRACKER V25.4 — SAFE REPAIR KIT

IMPORTANT STATUS
The GitHub connection can read Vikas915577/Tracker, but GitHub refused file writes and branch creation with HTTP 403: "Resource not accessible by integration". This kit has NOT changed the live repository. The live site is not considered fixed until these changes are committed to main and the GitHub Actions deployment succeeds.

WHAT THIS FIX ADDRESSES
1. Removes the extra closing JavaScript wrapper in root app.js, which can cause a blank screen if GitHub Pages is configured to serve root files.
2. Fixes the More > Get the App screen. Its current code calls getAppPage(), but the available page function is v16GetAppPage().
3. Adds a direct Android APK download link: ./downloads/winter-arc-tracker.apk.
4. Updates the service-worker cache from V25.3 to V25.4 and includes v25-overrides.css so stale cached files are replaced.
5. Adds JavaScript syntax checks to GitHub Actions and makes the Pages deployment bundle the APK produced by the same successful build.

DATA SAFETY
The script only touches these five source files:
- app.js
- assets/webcore/app.js
- sw.js
- assets/webcore/sw.js
- .github/workflows/build.yml

It does NOT modify or delete habit data, localStorage data, backup JSON files, Supabase records, backend SQL, images, or the rest of the app. Before writing, it creates a timestamped backup folder inside the repository. By default it performs a dry run and writes nothing.

HOW TO APPLY (REQUIRES REPOSITORY WRITE ACCESS)
1. Open the Tracker repository in GitHub Codespaces or a local Git checkout.
2. Put tracker_repair.py in the repository root (same level as app.js and README.md).
3. Make a separate branch first:
   git switch -c fix/website-and-apk-download
4. Run the dry run:
   python3 tracker_repair.py
   It validates all expected source anchors before touching any file.
5. Apply the repair and create backups:
   python3 tracker_repair.py --apply
6. Review the result:
   git diff --check
   git diff --stat
   git diff -- app.js assets/webcore/app.js sw.js assets/webcore/sw.js .github/workflows/build.yml
7. Commit only the five intended source files:
   git add app.js assets/webcore/app.js sw.js assets/webcore/sw.js .github/workflows/build.yml
   git commit -m "Fix tracker website and APK download"
   git push -u origin fix/website-and-apk-download
8. Open a pull request and merge it to main. The active workflow only deploys on main.
9. In GitHub > Actions, confirm BOTH build-apk and deploy-pages succeed. Then open the site and use More > Get the App > Download Android APK.

EXPECTED DOWNLOAD URL AFTER A SUCCESSFUL DEPLOY
https://vikas915577.github.io/Tracker/downloads/winter-arc-tracker.apk

The app package in this workflow is currently a debug/test APK intended for direct installation, not a Play Store signed release. The direct download link will not exist until the updated workflow runs successfully on main.

IF YOU WANT CHATGPT TO PUSH IT DIRECTLY
Reconnect/re-authorize the GitHub integration with write access for this repository (contents write; Actions/Pages permissions are needed to manage deployment where applicable). Then ask to apply the repair; the current connection has read-only effective access and refuses all writes with 403.
