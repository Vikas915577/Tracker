# Winter Arc V20 Setup

1. Replace the current site files with this package.
2. Apply `backend-schema.sql` in Supabase if you want global ranking.
3. Put your Supabase URL + anon key into `cloud-config.js`.
4. Deploy to GitHub Pages.
5. On a phone, refresh/update the PWA after deployment so the `winter-arc-v20.0` service-worker cache is active.

Top 20 is displayed in the Rank tab. A connected backend is required for real cross-user ranking.
