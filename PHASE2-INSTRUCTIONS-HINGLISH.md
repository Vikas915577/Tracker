# Winter Arc Tracker — Phase 2 Stability Patch (V26.0)

Ye update existing Tracker ko stable karne ke liye hai. Ismein Supabase/backend/SQL ko change nahi kiya jata.

## Is patch mein kya hoga?

1. V19 startup ke waqt missing outer `cloudSync` binding add hoti hai. V24 ka real optional sync function baad mein usi binding ko replace karta hai; bootstrap khud koi network request nahi karta.
2. New habit ka creation date first-of-month ke bajay actual creation day hota hai. Isse new habit ki purani dates galat eligible nahi hoti.
3. App version marker V26.0 hota hai aur boot-success marker final render ke baad set hota hai.
4. `progress_tracker_v17` localStorage key, legacy migration keys, Arc dates, XP, streak, freeze aur user history untouched rehte hain.
5. Root source files se exact `assets/webcore/` Pages bundle banaya jata hai. Isse old webcore deploy hone ka mismatch fix hota hai.
6. Workflow pehle `phase2-backup-<run-id>` safety branch banata hai. Branch create nahi hui to patch aage nahi badhta.
7. Android test APK bhi GitHub Actions artifact mein build hota hai.

## Backend boundary

- Koi Supabase SQL/schema/table/RLS/Auth migration nahi.
- Koi cloud credential/key edit nahi.
- Koi database deploy ya backend action nahi.
- Community Sync ka existing default OFF hi rahega.

## Android phone se apply karna

1. ZIP extract karo. Folder structure same rakhna.
2. GitHub par `Vikas915577/Tracker` kholo.
3. Repository ke `Add file` se `phase2_stability_patch.py` aur `phase2_stability_test.py` ko root mein upload karo.
4. ZIP ka `.github/workflows/build.yml` file isi exact path par upload karke existing `.github/workflows/build.yml` replace karo. Root `build.yml` bhi optional reference copy hai.
5. Commit changes to `main`.
6. GitHub → Settings → Actions → General → Workflow permissions mein `Read and write permissions` enable karo, agar currently read-only hai. Branch-protection policy ko bypass mat karna.
7. Actions tab mein `Winter Arc Phase 2 Stability Build` run dekho. Safety backup branch create honi chahiye; uske baad all validation steps green hone chahiye.
8. `deploy-pages` aur `build-apk` dono green hon to website aur APK artifact verify karo.

## Safety stop conditions

- Agar backup branch create nahi hoti, workflow changes apply karne se pehle stop karega.
- Agar app version, V19 boundary, cloudSync scope, ya expected source pattern alag mile, patcher fail-safe stop karega.
- Failed test par invalid Pages artifact deploy nahi hoga.
- Chrome ka site storage/cookies clear mat karna; saved progress wahin hai.

## Known limitation

Is environment se GitHub ko code push/branch create permission nahi mili (HTTP 403), aur outbound network/DNS available nahi tha. Isliye main remote commit, Pages deployment, real Android device test ya live browser test ka claim nahi kar raha. Ye ZIP ek tested patch package hai; actual repository run ke baad Actions result hi deployment confirmation hoga.
