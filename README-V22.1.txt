Winter Arc Tracker V22.1 — upload package

Replace these files in the repo root:
  app.js
  cloud-config.js
  sw.js

Keep the existing:
  index.html
  styles.css
  manifest.json
  icon-192.png
  icon-512.png

Creator assets included:
  creator-profile.jpg
  creator-photo-1.jpg
  creator-photo-2.jpg
  creator-photo-3.jpg

After upload:
1. GitHub Pages must redeploy.
2. Hard refresh the site / clear the old service-worker cache if an older screen remains.
3. Keep Supabase URL + public anon key only in cloud-config.js. Do not add a service-role key.

V22.1 focuses on button reliability, Rank name-only behavior, home creator credit, Daily 3, Recovery Pass, Arc Details, Month, and organized More sections.
