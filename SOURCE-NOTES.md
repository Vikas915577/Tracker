# Source notes

- Tracker source is `Vikas915577/Tracker`.
- Arcade source is the public YaarJam V2 repository `Vikas915577/Couple-game-`, pinned to commit `8f9f206d12835617c8974d8668a8a56fb060c54b`.
- Source inventory verified: static `index.html`, `app.js`, `styles.css`, `manifest.json`, `sw.js`; 24 unique game IDs; `STORE_KEY` is `yaarjam-offline-v2`.
- The checked source's `assets/icon.svg` path was missing at the pinned snapshot, so the build creates a simple local SVG fallback.
- The original arcade `activate` handler cleared all origin cache keys; integration narrows it to `yaarjam-offline-v2-*` only.
