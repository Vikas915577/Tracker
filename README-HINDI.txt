WINTER ARC TRACKER V25.4 — COMPLETE REPAIR KIT

ZAROORI BAAT
Yeh ZIP live GitHub website ko apne-aap publish nahi karti. Connected GitHub integration ne write/branch operations ko 403 se reject kiya tha, isliye live main branch abhi tak change nahi hui. Neeche diye steps existing source ko safe tareeke se repair karne ke liye hain.

YEH KIT KYA FIX KARTA HAI
1. Root app.js ka extra JavaScript closing wrapper hataata hai.
2. More > Get the App ka function call sahi karta hai (getAppPage -> v16GetAppPage).
3. Android APK ke liye direct download link add karta hai: ./downloads/winter-arc-tracker.apk.
4. PWA service-worker cache V25.3 se V25.4 karta hai aur v25-overrides.css cache karta hai.
5. GitHub Actions mein JavaScript syntax checks jodta hai.
6. Website deploy mein APK artifact include karta hai, jab Android build successful ho.
7. Original files ka timestamped backup banata hai; default mode sirf dry-run hai.

DATA SAFETY
- Habits, habit completions, localStorage, PIN, JSON backups, Supabase rows ya backend SQL ko delete/modify nahi kiya jata.
- Reset/Clear Site Data karne ki zarurat nahi.
- Script sirf ye 5 code files badalta hai: app.js, assets/webcore/app.js, sw.js, assets/webcore/sw.js, .github/workflows/build.yml.
- Apply ke waqt original files ko .tracker-repair-backup-<timestamp>/ folder mein copy karta hai.
- Pehle dry-run zaroor karein; koi mismatch ho to script stop karta hai aur changes nahi likhta.

KYA LIVE WEBSITE ABHI FIX HAI?
Nahi. Jab tak repaired files GitHub ke main branch mein push/merge nahi hoti aur Actions ka deploy-pages job successful nahi hota, live website old version hi dikhayegi. Yeh honesty ke liye clear likha hai.

POORA REPAIRED PROJECT ZIP BANANE KA TAREEQA (PC ya Codespaces par)
1. Python 3 ke saath internet access hona chahiye.
2. Is ZIP ko extract karein.
3. Terminal mein is folder ke andar run karein:
   python3 make_fixed_project_zip.py
4. Yeh GitHub se current public source download karega, temporary copy mein repair + QA karega, aur `Tracker-FIXED.zip` banayega. Yeh script GitHub par push/deploy nahi karti.

SABSE SAFE TAREEQA (GitHub Codespaces ya PC/Mac par existing repo repair karne ke liye)
1. Repository kholen: https://github.com/Vikas915577/Tracker
2. Code menu > Codespaces > Create codespace on main (agar Codespaces available ho).
3. Is ZIP ko Codespaces workspace mein upload/extract karein. ZIP ki files `winter_arc_tracker_complete_repair/` folder ke andar hongi. Terminal hamesha repository root mein kholen (jahan `app.js` hai).
4. Pehle dry-run karein:
   python3 winter_arc_tracker_complete_repair/tracker_repair.py
5. Agar sirf expected 5 files report hon aur Node syntax check pass ho, tab apply karein:
   python3 winter_arc_tracker_complete_repair/tracker_repair.py --apply
6. Post-fix QA chalayein:
   python3 winter_arc_tracker_complete_repair/qa_after_repair.py
7. Diff check karein:
   git diff --check
   git diff --stat
8. Separate branch par commit karein:
   git switch -c fix/website-and-apk-download
   git add app.js assets/webcore/app.js sw.js assets/webcore/sw.js .github/workflows/build.yml
   git commit -m "Fix tracker website and APK download"
   git push -u origin fix/website-and-apk-download
9. GitHub par Pull Request kholen aur review karke main mein merge karein.
10. Repository > Actions mein “Winter Arc Build” ke build-apk aur deploy-pages jobs dono green hone chahiye.
11. Successful deploy ke baad website ko Chrome Incognito mein check karein. Normal Chrome mein purana cached tab ho to pehle tab band karke dobara website kholen; apna tracker data clear na karein.

ANDROID APK LINK (sirf successful deploy ke baad)
https://vikas915577.github.io/Tracker/downloads/winter-arc-tracker.apk
Yeh debug/test APK hai, Play Store-signed release nahi.

AGAR WEBSITE ABHI BHI PURANI DIKHE
1. Pehle GitHub Actions ka sabse naya run aur deploy-pages success check karein.
2. Check karein ki GitHub Pages ka Source “GitHub Actions” hai.
3. Website Chrome Incognito mein kholen.
4. APK link tabhi kaam karega jab build-apk successful ho aur Pages deploy mein artifact include ho.

IS ZIP MEIN
- make_fixed_project_zip.py: current GitHub source download + repair + complete project ZIP generation (requires network/Python)
- tracker_repair.py: backup-first repair automation (dry-run by default)
- run-repair.sh: Linux/macOS/Codespaces helper
- run-repair.bat: Windows helper
- qa_after_repair.py: post-fix static QA
- FIX-SUMMARY.txt: exact file/change summary
- README-HINDI.txt: instructions

AGAR GITHUB WRITE PERMISSION 403 DE
Connected integration mein repo write permission enable/re-authorize karni hogi. 403 aane par code live push nahi hua maana jaye; successful commit SHA aur Actions run ke bina site fixed claim na karein.
