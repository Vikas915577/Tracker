# Winter Arc Tracker — V26.1 repair

## Important: upload the workflow to the correct folder

The earlier `phase1-repair.yml` was uploaded to the repository ROOT, so GitHub did not register it as an Actions workflow. This time the file must be created at this exact repository path:

`.github/workflows/phase1-repair.yml`

Do not upload it beside `app.js` at the repository root.

## Android Chrome steps

1. Download and extract `Tracker-V26.1-Repair-Workflow.zip`.
2. Open: https://github.com/Vikas915577/Tracker/tree/main/.github/workflows
3. Confirm the breadcrumb/folder at the top says `.github / workflows`.
4. Tap **Add file → Upload files** and upload `phase1-repair.yml` from the extracted ZIP.
5. Commit the new file to `main`.
6. Open https://github.com/Vikas915577/Tracker/actions
7. Select **Tracker V26.1 Repair and Browser Verification** and tap **Run workflow** on `main`.

## What the workflow does

- Declares the missing outer-scope `cloudSync` binding and makes the old V19 wrapper safe.
- Sets a boot-success marker only after the tracker render completes.
- Makes root source canonical and synchronizes the actual GitHub Pages `assets/webcore/` bundle.
- Bumps the service-worker cache to `winter-arc-v26.1.0` and publishes the corrected worker.
- Verifies HTML asset references and JavaScript syntax.
- Runs Chromium against the website, completes onboarding, checks a habit, reloads, and verifies that the completion remains saved.
- Adds the same prepare-and-browser checks to the normal `Winter Arc Build` workflow so future releases are blocked on a broken website.
- Commits the tested repair, then deploys the exact tested `assets/webcore/` folder.

The workflow does not delete `progress_tracker_v17`, habits, completion history, streaks, XP, local PIN data, or Supabase data. Do not clear Chrome site storage or cookies as a troubleshooting step.

## If the workflow fails at the Git push step

Open **Settings → Actions → General → Workflow permissions** in the repository and enable **Read and write permissions** for `GITHUB_TOKEN`. Save, then re-run the repair workflow.

## Release acceptance

Do not call the site fixed unless the run shows green for:
- Repair, synchronize and validate the exact Pages bundle
- Run real browser and data-persistence test
- Commit verified V26.1 repair to main
- Deploy verified Tracker website

After deployment, open https://vikas915577.github.io/Tracker/ in a new Chrome tab. The page should show the tracker onboarding or your existing profile, not the diagnostic error screen.
