# Winter Arc Tracker V24 Setup

1. Replace the deployed site files with this package.
2. Keep `cloud-config.js` empty for local/offline use.
3. For Top 20, exact public rank and active named users, configure Supabase in `cloud-config.js` and run `backend-schema.sql`.
4. Hard-refresh the site after deployment. V24 uses service-worker cache `winter-arc-v24.0`.
5. The package intentionally includes only the immediately previous app backup: `app-v21-backup.js`.

## Creator showcase
The V24 app shows a compact `CREDIT BY` card at the top of the app and on the brand-new-user Welcome screen. It uses the three creator gallery assets `creator-photo-1.jpg`, `creator-photo-2.jpg`, and `creator-photo-3.jpg`, plus the creator profile image as the small avatar.
