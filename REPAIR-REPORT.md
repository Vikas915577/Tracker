# Repair findings — 31 October 2026

## Confirmed cause
The latest repository tree contains a root `app.js` and a separate `assets/webcore/app.js`.
The root file is 426,763 JavaScript characters in the GitHub connector response and passes
a JavaScript parse check. The deployed webcore copy is 426,756 characters and fails with:

`SyntaxError: Unexpected end of input`

The two files are the same source up to the last seven characters; the root file has the final
outer IIFE closure that the deployed copy is missing.

The root `index.html` is V26 and references `arcpilot.js` and `v26-arcpilot.css`. The webcore
index is still V25.4 and references only the older app assets. The webcore service worker is
also the old V25.3 build. GitHub Pages workflow currently uploads `assets/webcore`, explaining
why a valid root app.js alone did not repair the deployed site.

## Changes in this patch
- Replaces the active `.github/workflows/build.yml`.
- Syncs canonical root files into `assets/webcore` before both Pages deployment and APK build.
- Runs `node --check` against the exact files being deployed.
- Checks index.html local resources and manifest icons.
- Confirms the original `progress_tracker_v17` key remains present.
- Confirms ArcPilot's separate `winter_arc_arcpilot_v1` preference key.
- Confirms the V26 service-worker cache and activation hooks.
- Adds a boot diagnostic on the page so future script failures are visible rather than silently
  leaving an empty mount element.

## Research basis
- GitHub's custom workflow guidance requires configuring Pages to use GitHub Actions and
  deploying a Pages artifact with the appropriate permissions:
  https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- MDN describes the service-worker install/activate lifecycle, `skipWaiting()`, and
  `Clients.claim()` for applying updates and cleaning old caches:
  https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- MDN confirms localStorage is separated by origin:
  https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

## Intentionally not changed
The Flutter host currently opens the GitHub Pages URL after starting a localhost asset server.
This patch leaves that host URL unchanged. A switch from `https://vikas915577.github.io` to
`http://localhost:8080` changes the storage origin and could hide existing localStorage progress.
A safe Android data migration needs a separately tested import/export path.

## Remaining verification
After uploading this patch, inspect the latest Actions run and confirm `validate-web` and
`deploy-pages` succeeded. Then test the live website on Android: onboarding, Today, habit
completion, navigation, data persistence after refresh, and cache update.


## Data-preservation caution
Do not clear Chrome site storage/cookies as a generic cache fix. The existing tracker uses
origin-specific localStorage (`progress_tracker_v17`), so clearing site data can erase local
progress. The V26 service worker activates the new cache and removes older `winter-arc-*` caches;
try closing old tabs and reopening the site first. Export a JSON backup before any manual
storage cleanup.
