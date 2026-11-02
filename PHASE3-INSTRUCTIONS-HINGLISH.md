# Phase 3 — Android se apply karne ke steps

**Important:** Pehle Phase 2 deploy karo. Live site par `cloudSync is not defined` error khatam ho aur GitHub Actions + Pages deploy green ho, tabhi Phase 3 apply karna.

1. ZIP extract karo.
2. `phase3_xp_achievements_patch.py` aur `phase3_xp_achievements_test.py` ko `Vikas915577/Tracker` repo ke root mein upload karo.
3. ZIP ke andar `.github/workflows/build.yml` diya hai. GitHub mein isi exact path par existing workflow replace karo. Is prepared workflow mein Phase 2 patch ke baad Phase 3 patcher aur dono QA checks add hain.
4. Root `build.yml` optional reference copy hai; active file `.github/workflows/build.yml` hi replace karni hai.
5. Commit changes. Actions mein backup branch, Phase 2 QA, Phase 3 QA, JavaScript syntax, Pages deploy aur APK job check karo.
6. Phone par website reopen karke Today → XP card, More → Achievements aur More → Insights check karo.

## Kya change hoga?

- Today screen par XP + Level progress.
- Achievements page mein 21 milestones.
- Insights page mein last 7 days XP aur wins.
- XP/achievements local data se calculate honge; backend ki zarurat nahi.

**Chrome ka site storage/cookies clear mat karna.** Purana saved progress `progress_tracker_v17` mein rehta hai.
