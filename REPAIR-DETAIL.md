# V26 combined repair — bug findings and changes

## Confirmed previous startup error
The app's V19 Arc League compatibility wrapper executes:
`const baseCloudSyncV19=cloudSync;`

No shared outer-scope `cloudSync` binding existed before V19. The actual async Supabase
implementation is assigned later inside V24. In strict mode, reading the missing binding
throws `ReferenceError: cloudSync is not defined` and stops the rest of the application boot.

## Exact fix
`repair_app_boot.py` inserts a mutable outer-scope binding immediately before the V19 IIFE.
The bootstrap returns false and makes no network request. The later V19 wrapper and V24 real
Supabase implementation reuse the same binding; the real sync logic is not replaced.

The script is idempotent and refuses to patch if the expected V19 boundary or final render
boundary cannot be found.

## Boot diagnostic correction
The `#app` mount element remains in the DOM after a successful render. A previous diagnostic
checked only whether `#app` exists and could incorrectly show an error after the app had loaded.
The combined patch now checks `window.__WINTER_ARC_BOOTED`, which is set only after the final
V20 render completes.

## Deployment repair
- Uses the actual workflow location `.github/workflows/build.yml`.
- Copies the root app/index/ArcPilot/CSS/service-worker/config/icons/photos into `assets/webcore`.
- Checks JavaScript syntax using Node.
- Validates HTML local resources, manifest icons, V26 marker, cloudSync declaration order,
  the existing progress store, ArcPilot preferences, and service-worker cache.
- Deploys the exact validated `assets/webcore` artifact via GitHub Pages actions.
- Attempts to commit the root hotfix with GITHUB_TOKEN without force-pushing.

## Included feature
- ArcPilot personal habit trends, weekly what-if estimate and recovery suggestions.
- Local-only preferences; original tracker store remains separate and preserved.

## Platform research
- GitHub Pages custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Pages publishing source: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- JavaScript `let` declaration behavior: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
- Service Worker lifecycle: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- localStorage is origin-scoped: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

## Not changed intentionally
Flutter WebView loading origin is not changed to localhost. Existing localStorage is origin-specific,
so changing from GitHub Pages to localhost requires a separately tested migration.
No old webcore images, icons, SQL, habit history or user data are deleted.
