# Winter Arc Tracker V24.1 — Supabase setup

V24.1 keeps the V21 Supabase shape and adds exact-rank + active-member RPCs for the public Arc League.

## 1. Create the tables
Open `backend-schema.sql` in Supabase SQL Editor and run it.

## 2. Configure the web app
Open `cloud-config.js` and set:
- `url`: your Supabase project URL
- `anonKey`: your Supabase anon key

Do not put a service-role key in the website.

## 3. Top 20 requirements
The leaderboard uses `get_public_leaderboard()` for a maximum of 20 public rows. `get_public_rank()` returns a user's exact global rank, including ranks outside Top 20. `get_active_public_members()` returns active public names with their exact rank. The app has a REST fallback when the RPCs are not installed, but the V24.1 SQL is recommended for exact results at scale.

## 4. Local-first privacy
Community sync is optional. Private habit names, journal, sleep, mood and local PIN are not included in the public leaderboard request.

## 5. Creator dashboard
`creator-dashboard.html` uses the same Supabase project. Keep the creator email placeholder in the SQL/RPC configured before using that dashboard in a real deployment.
