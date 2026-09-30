# Winter Arc Tracker V21 — Supabase setup

V21 keeps the same lightweight Supabase shape used by the previous build and adds the rank fields needed by the Top 20 leaderboard.

## 1. Create the tables
Open `backend-schema.sql` in Supabase SQL Editor and run it.

## 2. Configure the web app
Open `cloud-config.js` and set:
- `url`: your Supabase project URL
- `anonKey`: your Supabase anon key

Do not put a service-role key in the website.

## 3. Top 20 requirements
The leaderboard reads public rows from `arc_users` ordered by `rank_score` descending and requests a maximum of 20 rows. A user's public profile must be opted in for it to appear.

## 4. Local-first privacy
Community sync is optional. Private habit names, journal, sleep, mood and local PIN are not included in the public leaderboard request.

## 5. Creator dashboard
`creator-dashboard.html` uses the same Supabase project. Keep the creator email placeholder in the SQL/RPC configured before using that dashboard in a real deployment.
