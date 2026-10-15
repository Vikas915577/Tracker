# Winter Arc Tracker — website deployment fix

This is a small patch for the **website**, not an APK build. It does not replace the existing frontend or database. All paths in this ZIP are relative to the repository root.

## Files included

- `.github/workflows/pages.yml` — the key fix: GitHub Actions only runs workflows stored under `.github/workflows/`, not a `pages.yml` at the repository root. This workflow deploys `assets/webcore/` directly on every push to `main` and can be run manually.
- `assets/webcore/app.js` — fixes a missing closing `})();` at the end of the deployed web-core file. The existing root `app.js` was valid, but the copy in `assets/webcore/` was not; this mismatch can stop the website JavaScript from loading.
- `sw.js` — bumps the service-worker cache to V25.4 and precaches the override stylesheet.
- `assets/webcore/sw.js` — the same cache fix for the source folder that the website workflow publishes.

## Apply on GitHub from a phone

1. Download and extract this ZIP.
2. Open `https://github.com/Vikas915577/Tracker` and select the `main` branch.
3. Upload the files, preserving their exact paths. The new workflow must end up at `.github/workflows/pages.yml`, **not** at the repository root. Replace both existing `sw.js` files with the files in this ZIP.
4. Commit the changes to `main`. The workflow also runs `node --check` on the deployed JavaScript, so a syntax error is caught before publishing.
5. In **Settings → Pages**, set **Source** to **GitHub Actions**. This is needed for a custom workflow deployment if it is not already selected.
6. Open **Actions → Deploy Winter Arc Website**. The run should finish green. If the `Validate website core` step fails, one or more files are missing from `assets/webcore/`; don't remove those checks to hide the problem.

## Supabase Community Sync

The frontend is configured for the existing Supabase project and uses an active publishable key (safe for a browser client). Local habit tracking does not require Supabase. Community Sync calls `signInAnonymously()`, so enable **Authentication → Providers / Auth settings → Anonymous Sign-Ins** in the Supabase dashboard. Without that switch, cloud sync and the user-specific public-rank lookup can fail even though the website itself opens.

Dashboard: https://supabase.com/dashboard/project/nyahevumoflvzfbxxpbv/auth/providers

Do not put a Supabase service-role or secret key in any frontend file.
