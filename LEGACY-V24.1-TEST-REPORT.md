
# V24.1 Stable QA

Static/source checks performed:
- JS syntax: PASS (`node --check app.js`)
- Fixed Arc constants: PASS (1 Oct 2026 → 31 Dec 2026, 92 days)
- Core navigation: Today / Week / Month / Arc / More + Profile preserved
- Rank search: name-only
- Public Rank RPC path: exact Top 20 + exact own rank
- Community Sync: opt-in + authenticated owner UID
- Community OFF cleanup: DELETE own row path
- Public OFF: private row update path
- Max habits: 15
- New habit: modal flow, no prompt
- Delete habit: confirmation modal
- Routine: active routine state, step/progress based on real habit completion
- XP: completion/undo/bonus rebuild path
- Backup: V24.1 metadata + confirmation restore
- PWA cache: versioned + old cache cleanup + tolerant precache
- Accessibility: focus-visible + larger mobile targets

Not claimed as physically verified in this environment:
- Real Android Chrome tap-through
- Actual Supabase project/network responses
- Real install prompt on a physical device
