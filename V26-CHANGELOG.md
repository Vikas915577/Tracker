# Winter Arc Tracker V26.0 — Combined Repair

## ArcPilot
- Personal habit pattern summaries from recent check-ins.
- Weekly what-if estimate with sample-size guard.
- Simple recovery suggestion.
- Local-only preferences; no external AI API.

## White-screen and deployment repairs
- Add the missing shared `cloudSync` binding before V19 uses it.
- Keep V24's real Supabase sync implementation intact.
- Add a boot-success marker and a real failure screen.
- Ensure the diagnostic does not falsely trigger after successful rendering.
- Sync canonical root files to the Pages deployment folder.
- Validate JavaScript, HTML resources, manifest icons and required V26 files before deploy.
- Align V26 service-worker assets and offline cache entries.

## Data preservation
- Keep `progress_tracker_v17`.
- Keep all existing habits and their completion history.
- No changes to database schema or Supabase project configuration.
- Do not clear Chrome site storage to resolve caching issues.
