WINTER ARC TRACKER V21

V21 is a clean mobile-first rebuild of the main app shell.

MAIN FLOW
Welcome → name + focus → choose 3 habits → Arc Ready → Today.

NAVIGATION
Today · Week · Rank · Profile · More

TOP 20 RANK
Rank loads up to 20 public profiles from Supabase using rank_score descending.
The UI always keeps the visible leaderboard capped at 20 rows.

RANK FORMULA
75% weekly consistency + 15% best streak + 10% weekly wins.

LOCAL-FIRST
The app keeps the existing localStorage key `progress_tracker_v17` for migration compatibility.
Private habit names, journal, sleep, mood and PIN are not sent to the public leaderboard payload.

BACKUP
Only the immediately previous app backup is included in this package:
`app-v20-backup.js`

DEPLOY
Replace the site files with the V21 package contents and confirm the GitHub Pages Actions run succeeds.
