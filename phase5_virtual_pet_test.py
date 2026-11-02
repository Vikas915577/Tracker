#!/usr/bin/env python3
"""Static release gate for Phase 5 local Virtual Pet and premium UI."""
from __future__ import annotations
import argparse
from pathlib import Path

STORE="const KEY='progress_tracker_v17';"
MARKERS=(
 "let cloudSync = async function",
 "PHASE 3 — XP, LEVELS & ACHIEVEMENTS",
 "/* ========================= PHASE 4 — LOCAL ARCADE ========================= */",
 "/* ========================= PHASE 5 — VIRTUAL PET & PREMIUM UI ========================= */",
)
TODAY="${v24RecoveryCard()}${v26XpCard()}${v26PetCard()}<section class=\"v24-statbar\">"

def check(label:str,ok:bool,fail:list[str])->None:
 print(("PASS" if ok else "FAIL")+": "+label)
 if not ok:fail.append(label)

def main()->int:
 p=argparse.ArgumentParser();p.add_argument("--repo",default=".");p.add_argument("--site",default="assets/webcore");a=p.parse_args()
 root=Path(a.repo).resolve();site=Path(a.site);site=(root/site).resolve() if not site.is_absolute() else site
 fail=[];app_path=root/"app.js"
 if not app_path.is_file():print("FAIL: app.js missing");return 1
 app=app_path.read_text(encoding="utf-8")
 check("Existing Tracker storage key retained",STORE in app and "progress_tracker_v16" in app,fail)
 check("Phase 2, 3, 4 prerequisites retained",all(x in app for x in MARKERS[:3]),fail)
 check("Phase 5 functions included",all(x in app for x in ("function v26PetState()","function v26PetLevel()","function v26PetCard()","function v26PetPage()")),fail)
 check("Today screen includes the pet card after XP card",TODAY in app,fail)
 check("Active More route opens Arc Companion", "morePanel==='pet'?v26PetPage():morePanel==='arcade'?" in app,fail)
 check("Arc Companion tile exists once",app.count("tile('🐾','Arc Companion'")==1,fail)
 check("Three care controls are present",'data-v26-pet-action="${id}"' in app and "[\'feed\',\'play\',\'rest\']" in app,fail)
 block_start=app.find(MARKERS[3]);block_end=app.find("  function v20More(){",block_start);block=app[block_start:block_end] if block_start>=0 and block_end>=0 else ""
 check("Pet state reuses Tracker object (no separate key)","data.arcPet" in block and "localStorage.setItem" not in block and "localStorage.removeItem" not in block,fail)
 check("Growth derives from existing XP; no extra XP grants","Number(data.xp)" in block and "data.xp+=" not in block and "addXpEvent" not in block,fail)
 check("Care actions limited to once each and max 3/day", "pet.todayActions.includes(action)" in block and "pet.todayActions.length>=3" in block,fail)
 check("Care history is bounded to 45 days","dates.length-45" in block,fail)
 check("No backend/network calls in Phase 5 block",all(x not in block.lower() for x in ("fetch(","supabase","cloud_cfg","xmlhttprequest")),fail)
 web=site/"app.js"
 check("Published webcore app exists and matches root",web.is_file() and web.read_bytes()==app_path.read_bytes(),fail)
 if fail:print(f"\nPHASE 5 QA: {len(fail)} failure(s): "+"; ".join(fail));return 1
 print("\nPHASE 5 QA: PASS — local companion, existing progress store and XP ledger preserved.");return 0

if __name__=="__main__":raise SystemExit(main())
