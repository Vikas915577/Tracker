# Winter Arc Tracker V19 backend setup

The website is offline-first. Community/league sharing is opt-in.

## Supabase
1. Create a Supabase project.
2. Replace `YOUR_CREATOR_EMAIL` in `backend-schema.sql`.
3. Run `backend-schema.sql` in SQL Editor.
4. Put your Project URL + public anon key in `cloud-config.js`.

The public app uses the `public_leaderboard()` RPC. The base table does not grant public SELECT access.

## Public profile
A user appears in Rank only after they explicitly enable **Public Profile**.
The public profile may include:
- display name
- Instagram handle
- goal
- Arc day / progress
- Arc score / league
- consistency
- best streak / wins
- Arc start date
- non-private habit names the user has chosen to share

Private Wellness, journal, sleep, mood, PIN and detailed local history stay private.

## Important
The prototype still uses direct aggregate upserts from the browser. For a production launch, move scoring/upserts behind a Supabase Edge Function or authenticated write path and calculate score server-side.
