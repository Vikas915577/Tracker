# Winter Arc Tracker V22 Setup

1. Replace the deployed app files with this package.
2. Keep `cloud-config.js` empty for local/offline use.
3. For Rank + Active Community, configure Supabase and run `backend-schema.sql`.
4. Hard-refresh after deployment; V22 uses cache `winter-arc-v22.0`.
5. Only the immediately previous app code backup is included: `app-v21-backup.js`.

Rank behavior:
- Public leaderboard displays a maximum of 20 names.
- Search filters only those 20 rows and never renumbers them.
- Exact global rank is calculated separately from the Top-20 query.
- Active Now = last 15 minutes; Active Today = last 24 hours.
- Public profile remains opt-in.

Important backend note:
The prototype still uses a public Supabase anon key and device UUID-style profile id. For a production launch, move writes behind authenticated sessions/Edge Functions and rate limiting.
