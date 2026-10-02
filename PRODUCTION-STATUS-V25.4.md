# Winter Arc Tracker V25.4 — production status

## Done by the assistant
- Supabase project **Winter arc** connected through the Supabase integration.
- Backend schema migration `winter_arc_v25_backend` applied.
- Security/performance migration `winter_arc_v25_security_performance` applied.
- `arc_users`, `arc_challenges`, `arc_challenge_members` created with RLS.
- Public leaderboard / exact rank / active-member RPCs created.
- Client config prepared with only the public publishable key.
- Canonical Flutter + webcore directory structure preserved.
- Missing `arcScore()`, `weeklyWins()` and `rankFetch()` helpers added to the web core.

## One dashboard switch remains
Supabase **Authentication → Providers / Auth settings → Anonymous Sign-Ins** must be enabled. The connected Supabase integration currently does not expose this dashboard toggle as an action, so this single click cannot be performed from the integration.

## GitHub limitation
The connected GitHub integration currently returns HTTP 403 `Resource not accessible by integration` for write operations. Therefore the assistant could not push the package into `Vikas915577/Tracker/main`. The ZIP contains the exact folder structure ready to upload.
