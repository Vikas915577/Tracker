# Winter Arc Tracker V19.0 — Winter Arc League

## Main update
- New Rank tab: Today / Week / Rank / Profile / More
- Public Winter Arc League
- Arc Score 0–100
- Bronze / Silver / Gold / Platinum / Diamond leagues
- Public user cards with name, handle, Arc day, start date, score, consistency, streak, wins and public habits
- Public Arc Profile modal
- Personal rank + rank movement
- Top 3 podium
- Search public profiles
- 22-hustlers community counter retained
- Daily Rank Challenge
- Community join/public-profile controls
- Public leaderboard RPC with RLS-safe exposure

## Privacy
Rank data is opt-in. Private Wellness, journal, sleep, mood, PIN and detailed local history remain local/private. Only non-private habit names are eligible for public display after the user turns on Public Profile.

## Preserved
- Existing V17/V18 data migration
- Today / Week / Month / Arc
- MUST DO / SHOULD DO / BONUS
- YOUR NEXT WIN
- Recovery UX
- Habits / Goals / Routines / Planner / Sleep / Mood / Journal / Reminders / Privacy
- Backup / Restore / CSV
- PWA install
- Creator profile and share card
- Mobile Week-board fix

## Backend
Run `backend-schema.sql`, configure `cloud-config.js`, then users can join the league and publish their public Arc profile.

## Test note
`node --check app.js` and `node --check sw.js` should pass. Real Android tap-through still needs to be performed on a device/browser because this environment cannot drive the deployed GitHub Pages UI.
