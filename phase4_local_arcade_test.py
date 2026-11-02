#!/usr/bin/env python3
"""Static release checks for Phase 4 offline arcade integration."""
from __future__ import annotations
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path

TRACKER_STORE="const KEY='progress_tracker_v17';"
YAARJAM_STORE="const STORE_KEY = 'yaarjam-offline-v2';"
GAME_IDS=(
 "truth-dare-friends","couple-truth-dare","tic-tac-toe","would-you-rather",
 "partner-quiz","ludo","this-or-that","never-have-i-ever","most-likely-to",
 "our-story","guess-word","rock-paper-scissors","blind-ranking","secret-mission",
 "emoji-decode","bluff-battle","couple-bingo","memory-match","story-builder",
 "date-night","red-flag","same-brain","twenty-questions","reaction-battle",
)

class Links(HTMLParser):
    def __init__(self): super().__init__(); self.refs=[]
    def handle_starttag(self, tag, attrs):
        values=dict(attrs)
        for key in ("src","href"):
            if values.get(key): self.refs.append(values[key])

def check(label, ok, failures):
    print(("PASS" if ok else "FAIL")+": "+label)
    if not ok: failures.append(label)

def main():
    p=argparse.ArgumentParser();p.add_argument("--repo",default=".");p.add_argument("--site",default="assets/webcore");a=p.parse_args()
    root=Path(a.repo).resolve();site=(root/a.site).resolve();fail=[]
    app=(root/"app.js").read_text(encoding="utf-8")
    web_app=site/"app.js"
    check("Phase 2 binding + boot success are present", "let cloudSync = async function" in app and "window.__WINTER_ARC_BOOTED = true;" in app,fail)
    check("Phase 3 XP/achievements are present", "function v26LevelInfo()" in app and "function achievementsPage()" in app and "function insightsPage()" in app,fail)
    check("Tracker storage key remains unchanged", TRACKER_STORE in app and "progress_tracker_v16" in app,fail)
    check("Arcade tile and route are added once", app.count("function v26ArcadeLaunchPage()") == 1 and "morePanel==='arcade'?v26ArcadeLaunchPage():" in app and app.count("tile('🎮','Arcade'") == 1,fail)
    p4_start=app.find("PHASE 4 — LOCAL ARCADE")
    next_more=app.find("  function v20More(){",p4_start) if p4_start>=0 else -1
    p4_block=app[p4_start:next_more] if p4_start>=0 and next_more>=0 else ""
    check("Phase 4 Tracker launch block remains backend-free", bool(p4_block) and all(x.lower() not in p4_block.lower() for x in ("fetch(","supabase","CLOUD_CFG","localStorage.setItem","localStorage.removeItem")),fail)
    check("Published Tracker app matches root", web_app.is_file() and web_app.read_bytes()==(root/"app.js").read_bytes(),fail)

    arcade=root/"arcade";published=site/"arcade"
    for name in ("index.html","app.js","styles.css","manifest.json","sw.js","assets/icon.svg"):
        check("Arcade source exists: "+name,(arcade/name).is_file() and (arcade/name).stat().st_size>0,fail)
        check("Arcade published exists: "+name,(published/name).is_file() and (published/name).stat().st_size>0,fail)
        if (arcade/name).is_file() and (published/name).is_file():
            check("Arcade published matches root: "+name,(arcade/name).read_bytes()==(published/name).read_bytes(),fail)

    game=(arcade/"app.js").read_text(encoding="utf-8") if (arcade/"app.js").is_file() else ""
    check("YaarJam localStorage remains separate",YAARJAM_STORE in game and "progress_tracker_v17" not in game,fail)
    check("24 built-in games are included",all(("'"+gid+"'") in game for gid in GAME_IDS),fail)
    sw=(arcade/"sw.js").read_text(encoding="utf-8") if (arcade/"sw.js").is_file() else ""
    check("Arcade Service Worker deletes only YaarJam cache keys","keys.filter(k=>k.startsWith('yaarjam-offline-v2-')&&k!==CACHE)" in sw and "keys.filter(k=>k!==CACHE)" not in sw,fail)
    html=(arcade/"index.html").read_text(encoding="utf-8") if (arcade/"index.html").is_file() else ""
    check("Arcade returns to Winter Arc","href=\"../index.html\"" in html and "Back to Winter Arc" in html,fail)
    manifest=json.loads((arcade/"manifest.json").read_text(encoding="utf-8")) if (arcade/"manifest.json").is_file() else {}
    check("Arcade manifest points to local icon",bool(manifest.get("icons")) and (arcade/manifest["icons"][0]["src"]).is_file() if False else bool(manifest.get("icons")) and (arcade/manifest["icons"][0]["src"] and (arcade/manifest["icons"][0]["src"] in ["assets/icon.svg"])),fail)

    if fail:
        print(f"\nPHASE 4 QA: {len(fail)} failure(s): "+"; ".join(fail));return 1
    print("\nPHASE 4 QA: PASS — isolated offline YaarJam arcade bundle.");return 0

if __name__=="__main__": raise SystemExit(main())
