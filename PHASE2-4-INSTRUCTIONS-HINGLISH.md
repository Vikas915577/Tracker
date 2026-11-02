# Winter Arc Tracker — Phase 2 repair + Phase 3 + Phase 4 release

## Sabse pehle: blank screen ka reason

2 November 2026 ke latest GitHub source audit mein:

- `app.js` aur published `assets/webcore/app.js` abhi bhi V25.4 the; V19 se pehle required outer `cloudSync` binding missing thi.
- Published `assets/webcore/index.html` purana minimal V25.4 HTML tha. Ismein root V26 error diagnostic nahi tha, isliye app crash par blank page dikh sakta hai.
- Published `assets/webcore/sw.js` abhi `winter-arc-v25.3` cache use kar raha tha.
- Latest commits ne Phase 2/3 helper files aur root `build.yml` upload kiya, lekin active `.github/workflows/build.yml` purana hi raha. Root `build.yml` apne aap workflow nahi chalata.

Is package mein correct active workflow file aur Phase 3 ka corrected patcher bhi diya hai.

## Android se repo update karne ka order

1. ZIP extract karo.
2. `Vikas915577/Tracker` repo ke root mein ye files upload/replace karo:
   - `phase2_stability_patch.py`
   - `phase2_stability_test.py`
   - `phase3_xp_achievements_patch.py` **(existing file ko replace karna; corrected version hai)**
   - `phase3_xp_achievements_test.py`
   - `phase4_local_arcade_patch.py`
   - `phase4_local_arcade_test.py`
3. ZIP mein jo `.github/workflows/build.yml` hai, usse repo ke isi exact path par upload karke existing file replace karo:
   - `.github/workflows/build.yml`
4. GitHub Settings → Actions → General → Workflow permissions mein `Read and write permissions` select karo, agar abhi read-only hai. Branch protection ko bypass mat karna.
5. Sab changes ko `main` par ek commit mein save karo. Naya workflow push par automatically start hoga.
6. GitHub → Actions mein `Winter Arc V26 Phase 2-4 Release` run kholo.

**Important:** `.github/workflows/build.yml` ko root ke `build.yml` naam se upload mat karna. Root `build.yml` active workflow nahi hai.

## Workflow ka order

1. Existing `main` se safety backup branch banata hai. Backup branch create nahi hui to code patching se pehle stop hoga.
2. Phase 2: `cloudSync` binding, boot-success flag, actual new-habit date aur root-to-webcore release sync.
3. Phase 3: XP card, levels, achievements aur insights. Corrected patcher current source ke dono `v20More()` definitions ko handle karta hai aur final active renderer ke paas insert karta hai.
4. Phase 4: pinned YaarJam V2 source checkout karke `arcade/` folder banata hai; Tracker More screen mein Arcade tile add karta hai.
5. Node syntax checks + Phase 2/3/4 static QA + exact Pages bundle verification.
6. Verified Pages deploy aur Android debug APK build.

## Phase 4 mein kya milega?

- Tracker → More → Community & App → Arcade.
- YaarJam V2 ke 24 built-in local games aur 381 prompt/item records.
- Board, quiz, word, memory, reaction, couples/friends/party categories.
- Arcade ke andar `← Back to Winter Arc` link.
- Tracker progress `progress_tracker_v17` aur YaarJam save `yaarjam-offline-v2` alag rahenge.
- YaarJam Service Worker ab sirf `yaarjam-offline-v2-*` cache entries clean karega; Winter Arc cache delete nahi karega.
- Same-phone pass-the-phone / local-vs-computer play. Cross-phone live multiplayer ya backend add nahi hota.

YaarJam source ko fixed public commit `8f9f206d12835617c8974d8668a8a56fb060c54b` se checkout kiya jata hai, taaki builds reproducible rahen.

## Deployment verify hone ke baad

- Actions mein backup, QA, `deploy-pages` aur `build-apk` jobs green hone chahiye.
- Website ko close karke fresh tab mein reopen karo.
- Chrome ka site storage/cookies clear mat karna. Saved Tracker progress wahi hai.
- Agar workflow backup permission error par stop hota hai, settings permission check karo; protection bypass mat karo.

## Backend/data safety boundary

Is package mein Supabase SQL, tables, RLS, Auth, credentials, backend functions ya database migrations edit nahi hote. Tracker aur YaarJam ke local save keys alag rehte hain.
