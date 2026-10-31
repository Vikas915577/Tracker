WHITE SCREEN REPAIR — IMPORTANT APPLY INSTRUCTIONS

The root cause is confirmed: GitHub Pages deploys assets/webcore, where app.js is truncated and fails parsing with 'Unexpected end of input'. Root app.js parses successfully. The deployed index is also V25.4 while the root index and ArcPilot files are V26.

DO NOT upload all extracted files into the repository root. That is what happened in the previous upload: build.yml and main.dart landed at the root, so GitHub Actions did not use them. The active workflow is .github/workflows/build.yml.

Android steps:
1. Extract this ZIP.
2. Open WORKFLOW-CONTENT.txt and copy the complete YAML after the first two instruction lines.
3. Open https://github.com/Vikas915577/Tracker/edit/main/.github/workflows/build.yml
4. Tap Edit, select all existing contents, paste the copied YAML, and commit to main.
5. Open https://github.com/Vikas915577/Tracker/actions and confirm the new run's 'deploy-pages' job succeeds.
6. Open https://vikas915577.github.io/Tracker/. If old cached content remains, clear Chrome site data for the website and reopen it.

The replacement workflow syncs root V26 files into assets/webcore, syntax-checks the exact Pages bundle, checks matching files, and then deploys. It does not delete or replace habit history, Supabase tables, images, icons, or other tracker features.

I could not commit these changes directly: the connected GitHub integration returned HTTP 403 for branch creation and file writes. The live deployment remains pending until this workflow content is committed and Actions succeeds.
