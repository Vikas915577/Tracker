#!/usr/bin/env python3
"""Static Phase 3 release checks for the local XP/achievement feature set."""
from __future__ import annotations
import argparse
from pathlib import Path

MARKER="PHASE 3 — XP, LEVELS & ACHIEVEMENTS"
STORE="const KEY='progress_tracker_v17';"
REQUIRED=(
    "function v26LevelInfo()",
    "function v26AchievementCatalog()",
    "function v26XpCard()",
    "function achievementsPage()",
    "function insightsPage()",
    "${v24RecoveryCard()}${v26XpCard()}<section class=\"v24-statbar\">",
    "XP is calculated from the existing check and daily-bonus ledger",
)

def check(label: str, ok: bool, failures: list[str]) -> None:
    print(("PASS" if ok else "FAIL")+": "+label)
    if not ok: failures.append(label)

def main() -> int:
    parser=argparse.ArgumentParser()
    parser.add_argument("--repo",default=".")
    parser.add_argument("--site",default="assets/webcore")
    args=parser.parse_args()
    root=Path(args.repo).resolve();site=(root/args.site).resolve()
    app_path=root/"app.js";failures=[]
    if not app_path.is_file(): raise SystemExit("FAIL: app.js is missing")
    app=app_path.read_text(encoding="utf-8")
    check("Phase 2 V26.0 prerequisite", "const VERSION='V26.0';" in app, failures)
    check("Existing localStorage key retained", STORE in app and "progress_tracker_v16" in app, failures)
    check("Phase 2 cloudSync binding retained", "let cloudSync = async function" in app and app.find("let cloudSync = async function") < app.find("const baseCloudSyncV19=cloudSync;"), failures)
    check("Phase 3 marker occurs once", app.count(MARKER)==1, failures)
    for item in REQUIRED: check("feature: "+item[:72], item in app, failures)
    check("21 achievement milestone definitions", app.count("group:'")>=21, failures)
    block=app[app.index("PHASE 3 — XP, LEVELS & ACHIEVEMENTS"):app.index("function v20More(){",app.index("PHASE 3 — XP, LEVELS & ACHIEVEMENTS"))]
    check("Phase 3 remains local-only", all(x.lower() not in block.lower() for x in ("fetch(","supabase","CLOUD_CFG","localStorage.setItem","localStorage.removeItem")), failures)
    check("XP ledger remains authoritative", all(x in app for x in ("function v24RebuildXp()","data.xpEvents=events;data.bonusEvents=bonus;data.xp=", "function v26XpForDate(d)")), failures)
    check("No XP history reset or store rename", STORE in app and "localStorage.removeItem('progress_tracker_v17')" not in block, failures)
    web=site/"app.js"
    if web.exists():
        check("Published app has exact same Phase 3 source", web.read_bytes()==app_path.read_bytes(), failures)
    else:
        check("Published app is prepared", False, failures)
    if failures:
        print(f"\nPHASE 3 QA: {len(failures)} failure(s)")
        print("Failed: "+"; ".join(failures));return 1
    print("\nPHASE 3 QA: PASS");return 0

if __name__=="__main__": raise SystemExit(main())
