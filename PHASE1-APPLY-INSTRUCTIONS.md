# Winter Arc Tracker — Phase 1 hotfix

## Confirmed issue

The Pages workflow publishes `assets/webcore/`, not the root web files. The deployed `assets/webcore/app.js` is missing the final outer `})();` closure that is present in the root `app.js`. The deployed JavaScript therefore fails parsing and the tracker cannot start. The existing web-core index also has no useful boot-failure screen, and its service worker cache is stale (`winter-arc-v25.3`) and does not pre-cache `v25-overrides.css`.

## Files in this patch

- `assets/webcore/app-js-fix.patch` — adds the boot-success marker and the missing final IIFE closure to the deployed app bundle.
- `assets/webcore/index.html` — retains the V25.4 app assets and Supabase client, adds a startup diagnostic instead of an indefinite blank screen.
- `assets/webcore/sw.js` — bumps the cache to `winter-arc-v25.4.1`, pre-caches the override CSS, and no longer returns `index.html` as a fake response for missing JavaScript/CSS files.
- `.github/workflows/build.yml` — validates the actual Pages bundle with `node --check` and required-file checks before uploading it.

## Apply safely

1. Create a new branch in GitHub named `fix/v26.1-phase1-stability` from `main`.
2. Apply `assets/webcore/app-js-fix.patch` to `assets/webcore/app.js` (for Git, use `git apply assets/webcore/app-js-fix.patch`). If editing on GitHub's website, go to the very end of `assets/webcore/app.js`; after its existing final `})();`, add these two lines exactly:

   ```js
   window.__WINTER_ARC_BOOTED = true;

   })();
   ```

   The file should now end with two `})();` closures, with the marker between them. Do not add a third closure.

3. Replace `assets/webcore/index.html` with the file at the same path in this patch folder.
4. Replace `assets/webcore/sw.js` with the file at the same path in this patch folder.
5. Replace `.github/workflows/build.yml` with the file at the same path in this patch folder.
6. Commit the changes on the repair branch. Open the Actions page and run **Winter Arc Build** manually on that branch. The deploy job must pass the new web-bundle validation before it can publish.
7. After checks pass, merge the repair branch into `main`. Confirm the Pages deployment is successful, then open the live site in Chrome and reload once.

## Data-safety notes

This patch does not change `progress_tracker_v17`, localStorage records, habit history, Supabase tables, or user content. It does not clear browser storage. The service worker only deletes older `winter-arc-*` Cache Storage entries after its new cache has been installed; it does not delete localStorage or IndexedDB.

## Not included in Phase 1

This is a startup/deployment hotfix, not a complete regression test of every screen. Habit CRUD, XP, streaks, leaderboard, Supabase auth, and Android APK runtime still require Phase 3/4 testing. Google Search indexing is a later SEO/Search Console phase.
