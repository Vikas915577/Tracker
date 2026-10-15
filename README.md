# Supabase backend

The frontend config in `../cloud-config.js` points to the existing Winter Arc Supabase project and uses only its public publishable key. Do not add a service-role or secret key to the website.

The existing project has these public tables with Row Level Security enabled:

- `arc_users`
- `arc_challenges`
- `arc_challenge_members`

The public leaderboard/rank/active-member RPCs are also present. This package does not modify the live database and does not ask you to rerun the schema.

## One dashboard setting still required

Community Sync relies on anonymous sign-ins. Open Supabase Dashboard → Authentication → Providers / Auth settings → Anonymous Sign-Ins and enable it. Then test Community Sync from the deployed website.

Supabase URL: `https://nyahevumoflvzfbxxpbv.supabase.co`

Keep RLS enabled. Never expose a service-role key in frontend files.
