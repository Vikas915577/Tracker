# Winter Arc V22 backend

Run `backend-schema.sql` in Supabase SQL Editor.

Then set this in `cloud-config.js` using your project's public anon key:

```js
window.WINTER_ARC_CLOUD = {
  url: 'https://YOUR-PROJECT.supabase.co',
  anonKey: 'YOUR_PUBLIC_ANON_KEY'
};
```

V22 also exposes the same object as `window.CLOUD_CFG` for compatibility, so the V21 naming mismatch is fixed.

Rank behavior:
- Top 20 query: public profiles only, ordered by rank score, last_seen and id, max 20 rows.
- Exact rank: separate count queries, so a user can correctly be #47 even though only 20 leaderboard rows are displayed.
- Active Now: public users seen in the last 15 minutes.
- Active Today: exact public-user count seen in the last 24 hours.

Only public display information is intended for the leaderboard. Private habit names, journal, sleep, mood, PIN and local notes stay on the device.
