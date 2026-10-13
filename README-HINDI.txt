WINTER ARC TRACKER — LIVE WEBSITE REPAIR (ONE ZIP)

Pehle ki ZIP ki galti: usmein poora repaired project nahi tha aur live GitHub par kuch commit nahi hua tha. Is ZIP mein ek GitHub Actions workflow hai jo aapke EXISTING repo par actual repair kar sakta hai. Main seedhe GitHub par write nahi kar sakta kyunki connector ko 403 mil raha hai; ye workflow aapke GitHub Actions ke permissions se chalega.

CONFIRMED ROOT CAUSE
GitHub Pages `assets/webcore/` publish karta hai. Current deployed `assets/webcore/app.js` mein final JavaScript wrapper closure missing hai (`Unexpected end of input`), jabki root `app.js` mein hai. Isi liye successful old Android/Pages job hone ke bawajood website blank reh sakti hai. Get the App panel mein bhi handler mismatch hai. Service-worker cache V25.3 hai.

YEH WORKFLOW KYA KAREGA
1. Root `app.js` aur published webcore file ko compare karega; unexpected differences hon to safe stop karega.
2. Verified missing JavaScript closure ko repair karega aur Get the App handler fix karega.
3. Download Android APK link add karega.
4. Service-worker cache ko V25.5 karega, old cache se update trigger karega aur override CSS ko cache list mein dalega.
5. Build workflow mein JS syntax checks add karega.
6. APK build aur Pages deployment ko connect karke APK ko website par `downloads/winter-arc-tracker.apk` ke roop mein publish karega.
7. Syntax/copy/link checks pass hone ke baad hi repaired source commit karega, phir normal APK build aur Pages deployment run/watch karega.

DATA SAFETY
- Habits, completion history, XP, routines, PIN, localStorage, JSON backups, Supabase records aur backend SQL ko read/modify/delete nahi karega.
- Existing visual design/core features ko rewrite nahi karega.
- Fix sirf known app source, service-worker cache aur build workflow par hai.
- Unexpected file mismatch par commit se pehle stop karega.
- APK debug/test build hoga; Play Store signing nahi.

ANDROID PHONE SE INSTALL KARNE KA TARIKA
A) ZIP download karke Extract karein. Iske andar `repair-web.yml` file hai.
B) Chrome mein https://github.com/Vikas915577/Tracker kholen aur sign in karein.
C) Repo ke Code tab mein `Add file` > `Create new file` chunein.
D) Filename/path bilkul ye dalein: `.github/workflows/repair-web.yml`
E) ZIP ke `repair-web.yml` ko text editor se kholkar poora text copy karein, GitHub editor mein paste karein, neeche `Commit changes` karein. Isse sirf ek repair-workflow file add hogi; existing app code abhi replace nahi hota.
F) Repository ke `Actions` tab mein `Repair Winter Arc Website` kholen.
G) `Run workflow` > branch `main` > `Run workflow` dabayein.
H) Repair run green/successful hona chahiye. Phir ye `Winter Arc Build` workflow chalakar `build-apk` aur `deploy-pages` dono verify karega. Agar repair job commit ke baad dispatch step permission ki wajah se fail ho, Actions mein `Winter Arc Build` ko manually `Run workflow` karein.

DEPLOYMENT KE BAAD CHECK
1. https://github.com/Vikas915577/Tracker/actions kholkar sabse latest `Winter Arc Build` dekhein; `build-apk` aur `deploy-pages` dono green hone chahiye.
2. Website Chrome Incognito mein kholen: https://vikas915577.github.io/Tracker/?v=25.5
3. More > Get the App mein Download Android APK link dekhein.
4. Direct APK URL: https://vikas915577.github.io/Tracker/downloads/winter-arc-tracker.apk

IMPORTANT
Workflow ko repository mein add karna aur phir Actions mein Run workflow karna zaroori hai. Sirf ZIP download/extract karne se live website change nahi hoti. Current GitHub connector read-only 403 deta hai, isliye main is turn mein aapki taraf se commit/deploy nahi kar saka. Successful Actions run ke bina website fixed hone ka claim nahi kiya ja sakta.
