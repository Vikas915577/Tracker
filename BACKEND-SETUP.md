# Winter Arc V16.0 backend setup

The app is offline-first. Cloud/community sync is **opt-in** and disabled by default.

## 1. Create Supabase
Create a Supabase project and copy the Project URL + public anon key.

## 2. Run SQL
Open SQL Editor and run `backend-schema.sql`.
Before running it, replace `YOUR_CREATOR_EMAIL` with the email you will use for the creator dashboard.

## 3. Configure the app
Open `cloud-config.js` and set:

```js
window.WINTER_ARC_CLOUD = {
  url: 'https://YOUR-PROJECT.supabase.co',
  anonKey: 'YOUR_PUBLIC_ANON_KEY'
};
```

Use only the **anon/public** key in the app. Never put a service-role key in GitHub Pages.

## 4. Creator dashboard
Open `creator-dashboard.html`, set `SUPABASE_URL` and `SUPABASE_ANON_KEY`, upload it to GitHub Pages, and sign in with the creator account.

The SQL RPC checks the creator email before returning the user list.

## 5. What is synced
Only when a user explicitly enables Community Sync:
- display name
- Instagram handle (if present)
- Arc day / total days
- Arc progress
- today's completed count
- habit count
- total wins
- best streak
- last seen
- public-profile preference

Private habit names, journal, sleep, mood, PIN and full local history are not uploaded by this V16.0 sync flow.

## 6. Important production note
The current prototype uses a random device UUID for opt-in writes. For a public production launch, move write operations behind a Supabase Edge Function or authenticated anonymous/user sessions and add rate limiting. The creator dashboard itself should never use a service-role key in browser code.


## V16 website-first structure
The main product is the GitHub Pages website. The user-facing app stays fully usable without the creator dashboard. The dashboard is a separate creator-only page and does not replace or remove the tracker features.
