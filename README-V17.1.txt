WINTER ARC TRACKER V17.1

What changed
- Mobile-first shell; no desktop-style fixed layout on phone.
- Bottom navigation: Today / Week / Arc / More.
- Today screen is shorter and focuses on the next action.
- Fast-path habit completion prevents the older click handlers from firing twice.
- Creator credit is now a clickable card. Tap the creator photo to open a profile card with large photo, thumbnails, bio, Instagram and share actions.
- Added Focus Sprint: 5 / 10 / 25 minute temporary timer.
- Existing V16/V17 storage remains compatible through the existing migration flow.

GitHub deployment
1. Replace app.js, styles.css, index.html, manifest.json and sw.js.
2. Keep cloud-config.js values empty until your Supabase project is configured.
3. Keep creator-profile.jpg + creator-photo-1.jpg + creator-photo-2.jpg + creator-photo-3.jpg in the same folder.
4. Keep icon-192.png and icon-512.png in the same folder.

Important
- The browser page is still the primary experience.
- Community sync remains opt-in. The existing backend setup is unchanged.
