# Winter Arc Tracker V25 Backend Setup

1. Create a Supabase project.
2. Enable Anonymous Sign-Ins for Community Sync.
3. Run `backend-schema.sql` in the Supabase SQL Editor.
4. Put only the public project URL + publishable/anon key in `assets/webcore/cloud-config.js`.
5. Replace `YOUR_CREATOR_EMAIL` in the creator-dashboard RPC before production use.
6. Never ship a service-role key in the app.

Public Rank only exposes intended aggregate data through RPCs. Owner writes use `auth.uid()`.
