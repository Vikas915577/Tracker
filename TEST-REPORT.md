# V15 Test Report

## Static checks
- JavaScript syntax: PASS (`node --check app.js`)
- Service worker syntax: PASS (`node --check sw.js`)
- Required package files: PASS
- Creator image assets present: PASS
- V15 strings/features present: PASS
- V14 migration (`Masturbation` → `Private Wellness`): PASS in Node VM logic harness
- Compare snapshot encode/decode round-trip: PASS in Node VM logic harness
- Pre-Arc date logic (2026-09-30): PASS (`arcDay() === 0`)

## Browser limitation
A real Chromium process was attempted against both localhost and file URLs, but this environment blocks browser page access (`is blocked` / chromewebdata). Therefore no live mobile tap-through result is claimed here. The app remains designed for real browser use on GitHub Pages.

## Backend status
Frontend sync and admin dashboard are wired for Supabase, but the project URL and public anon key are intentionally blank until the creator configures their own Supabase project. No service-role key is included in the package.
