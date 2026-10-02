# Winter Arc Tracker V25 Backend Setup

1. Supabase project is connected: Winter arc.
2. Enable Anonymous Sign-Ins for Community Sync.
3. Backend schema has been applied and performance/security migration added.
4. `assets/webcore/cloud-config.js` is pre-filled with the project URL + public publishable key.
5. Replace `YOUR_CREATOR_EMAIL` in the creator-dashboard RPC before production use.
6. Never ship a service-role key in the app.

Public Rank only exposes intended aggregate data through RPCs. Owner writes use `auth.uid()`.
