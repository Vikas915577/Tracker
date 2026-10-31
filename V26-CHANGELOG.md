# Winter Arc Tracker V26.0 — Patch Notes

## ArcPilot
- Adds local-only habit trend signals based on the latest 7 days versus the 7 days before them.
- Adds a weekly what-if simulator using the observed 14-calendar-day completion rate.
- Adds a simple rescue suggestion from the habit's saved small-win/action text.
- Keeps frozen days out of the calculation.
- Does not call an AI API, upload check-in history, or edit habits automatically.
- Saves only ArcPilot's selected habit and weekly target under `winter_arc_arcpilot_v1`.

## Stability fixes in this patch
- Aligns root and `assets/webcore` service-worker cache version to V26.0.
- Includes ArcPilot files in the PWA offline cache.
- Changes the Android WebView host from the remote GitHub Pages URL to the bundled local page at `http://localhost:8080/webcore/index.html`.
- Adds CI validation for JavaScript syntax and root/webcore ArcPilot, CSS and service-worker parity.
- Keeps the existing tracker data key (`progress_tracker_v17`) unchanged.
