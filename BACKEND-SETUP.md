# Winter Arc Tracker V15 — Backend Setup

## 1) Create Supabase project
Create a Supabase project and keep the project URL and public anon key.

## 2) Run the SQL
Open Supabase → SQL Editor → paste `backend-schema.sql` → Run.

## 3) Create the creator admin account
Supabase → Authentication → Users → create an email/password user for your admin account.

Then in SQL Editor:

```sql
insert into public.creator_admins(email)
values ('YOUR_ADMIN_EMAIL');
```

Use the same email as the Supabase Auth user.

## 4) Configure frontend
Open `cloud-config.js` and set:

```js
window.WINTER_ARC_CLOUD = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_PUBLIC_ANON_KEY'
};
```

Only use the public anon key. Never add the service-role key to GitHub Pages.

## 5) Frontend behavior
Community Sync is OFF by default. A user explicitly turns it ON to send a summary row to `community_users`.

The following are not sent by the app's community sync:
- Private Wellness habit names
- Journal
- Sleep
- Mood / energy
- PIN

## 6) Admin
Open:

`https://YOUR-GITHUB-PAGES-URL/creator-dashboard.html`

Sign in with the creator Supabase Auth account. Only emails inserted into `creator_admins` can view the community table.
