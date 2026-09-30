# Winter Arc Tracker V19 — Setup

## Main files to deploy
Replace these files in GitHub Pages:
- `app.js`
- `styles.css` (unchanged from V18.1 unless later edits are made)
- `index.html`
- `manifest.json`
- `sw.js`

Keep these assets:
- `cloud-config.js`
- `icon-192.png`
- `icon-512.png`
- `creator-profile.jpg`
- `creator-photo-1.jpg`
- `creator-photo-2.jpg`
- `creator-photo-3.jpg`

## Arc League backend
Run the complete `backend-schema.sql` in Supabase SQL Editor. It includes V19 columns and RLS policies for public leaderboard profiles plus the Arc Challenge tables.

Then add the public Supabase URL + anon key to `cloud-config.js`. Do not add a service-role key to the browser package.

## Ranking rules
Weekly rank score =
- 75 points max from weekly completion percentage
- 15 points max from streak (capped at 30 days)
- 10 points max from weekly wins (capped at 21 wins)

Leagues:
- Starter: 0–39
- Bronze: 40–59
- Silver: 60–74
- Gold: 75–89
- Diamond: 90–100

The score is based on percentages/capped bonuses, so creating more habits alone does not increase rank.

## Important
Community ranking is opt-in. Private habit names, journal, sleep, mood and PIN remain local in the existing app flow. A user needs Community Sync + a public profile to appear in the leaderboard.
