# V21 Setup

1. Replace the deployed site files with this package.
2. Keep `cloud-config.js` empty when running locally/offline.
3. For Top 20 + community sync, configure Supabase in `cloud-config.js` and apply `backend-schema.sql`.
4. Hard-refresh the browser after deployment because the service worker cache is now `winter-arc-v21.0`.

The package intentionally includes only `app-v20-backup.js` as the previous-version code backup.
