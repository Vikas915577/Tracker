# Winter Arc Tracker — Phase 3 XP, Levels & Achievements

**Target:** `Vikas915577/Tracker`  
**Prerequisite:** Phase 2 V26.0 stability build must be deployed and verified first.  
**Scope:** Frontend-only, local XP presentation, achievement milestones and insights.  
**Backend:** Not touched.

## Source audit findings

- XP events and daily bonuses already exist. The existing V24.1 startup logic rebuilds the XP ledger from valid Winter Arc check data, which prevents duplicate XP from repeated page reloads.
- Existing levels use a backwards-compatible threshold of 100 XP per level.
- A basic eight-item `achievements()` helper exists, but the current V24.1 More screen calls `achievementsPage()` and `insightsPage()` without defining either function in `app.js`. Those routes can fall into the generic “Tool unavailable” handler.
- The current Today screen focuses on Arc progress and priority habits but does not show the user's XP/level progress.

## Phase 3 patch contents

1. Adds a compact XP/level card to Today. It uses the existing 100-XP level formula and keeps existing XP totals unchanged.
2. Adds 21 derived milestones covering completed wins, best habit streaks, perfect-day/week consistency, level 5/10 and Winter Arc days 7/30/60/90/92.
3. Implements the previously referenced Achievements screen with progress bars and locked/unlocked states.
4. Implements the previously referenced Insights screen with seven-day XP, completed wins, active days, weekly consistency and strongest habit.
5. Keeps achievements derived from saved tracker history. It does not add claim buttons, reward writes or new persistence keys, so reloads cannot double-award rewards.

## Data and backend safety

- `progress_tracker_v17` and legacy migration keys are unchanged.
- Existing `checks`, `xpEvents`, `bonusEvents`, habits, XP totals, streaks, freezes, PIN, profile and routines are not reset.
- The patch modifies `app.js` only.
- No Supabase, SQL, RLS, Auth, API key, backend settings or network calls are added.
- XP remains local and Community Sync remains optional.

## Validation performed

- Patch self-test: phase gate, insertion points, page declarations, local-only restriction and idempotency.
- Python syntax compilation and workflow YAML parse are run before packaging.
- The repository-specific static checker verifies the 21 milestones, XP ledger integration, unchanged local store and exact root-to-webcore output.
- Live GitHub Actions and Android device tests remain pending until this patch is installed after Phase 2.

## Release gate

Do not install Phase 3 while the live site still shows `cloudSync is not defined`. First deploy the Phase 2 package, confirm its Actions checks and Pages deployment are green, then refresh the app without clearing Chrome storage. Only after the startup error is gone should Phase 3 be uploaded and deployed.

### Local checks from this preparation

- Phase 3 self-test: PASS.
- Python compilation: PASS.
- Workflow YAML parse: PASS.
- Node JavaScript syntax parse for the injected Phase 3 block: PASS.
- Synthetic repository patch + static QA + root/webcore byte-match: PASS.
- ZIP integrity: PASS.
- GitHub branch creation: BLOCKED by integration HTTP 403 (`Resource not accessible by integration`). No remote commit or deploy was made.
