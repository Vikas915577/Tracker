TRACKER PHASE 1 — AUTOMATIC REPAIR

WHY IT IS BLANK
The active GitHub Pages workflow publishes assets/webcore/. The deployed assets/webcore/app.js is missing the final outer IIFE closure that exists in root app.js. The browser cannot parse this JavaScript and does not start the tracker. The old service worker can also return index.html for missing JS/CSS requests.

WHAT THIS AUTOMATION DOES
1. Applies the exact app.js repair only if the two source copies differ by the verified missing outer closure.
2. Adds a boot-success marker and visible startup diagnostics instead of an indefinite blank page.
3. Refreshes the deployed service-worker cache and prevents HTML fallback for missing JS/CSS files.
4. Adds JavaScript syntax and required-file checks to the real Pages deployment workflow.
5. Commits the repair to main and triggers the normal Winter Arc Build workflow.

DATA SAFETY
No progress_tracker_v17, localStorage, IndexedDB, habit records, streak history, Supabase tables, or Supabase config is edited. The service worker clears only old Cache Storage entries beginning winter-arc- after the new worker activates.

RUN FROM ANDROID CHROME
1. Extract .github/workflows/phase1-repair.yml from this ZIP.
2. Open https://github.com/Vikas915577/Tracker/tree/main/.github/workflows
3. Tap Add file -> Upload files. Upload phase1-repair.yml and commit it to main.
4. Open https://github.com/Vikas915577/Tracker/actions
5. Select "Tracker Phase 1 Startup Repair" -> Run workflow -> main -> Run workflow.
6. After it finishes, open the newest "Winter Arc Build" run. Both "Validate exact published web bundle" and "Deploy to GitHub Pages" must be green.
7. Reopen https://vikas915577.github.io/Tracker/ in a fresh Chrome tab. Do NOT clear site storage or cookies.

If the repair workflow cannot push, open repository Settings -> Actions -> General -> Workflow permissions and allow read and write permissions for GITHUB_TOKEN, then rerun the repair workflow.
