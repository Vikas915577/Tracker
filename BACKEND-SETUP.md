
# Winter Arc Tracker V24.1 backend setup

1. Create/keep your Supabase project.
2. Enable **Anonymous Sign-Ins** in Authentication so the website can create an authenticated session without asking users for email/password.
3. Run `backend-schema.sql` in the Supabase SQL Editor.
4. Put only the project URL and public anon key in `cloud-config.js`. Never put a service-role key in the frontend.
5. Public Rank reads only public + community-opted-in rows. The public RPC does not return Instagram handles to the player UI.
6. User writes require an authenticated UID that matches the row owner. Anonymous direct clients cannot update another user's row.
7. Community OFF deletes the user's cloud row when the authenticated session is available; Public Profile OFF keeps the row private.
8. Creator dashboard uses the creator-only `creator_dashboard()` RPC and still requires the configured creator email placeholder.

Local tracker behavior does not depend on Supabase. If cloud config, network, or Supabase is unavailable, Today/Week/Month/Arc/More continue locally and Rank shows an explicit offline state.
