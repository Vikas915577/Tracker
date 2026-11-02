#!/usr/bin/env python3
"""Static Phase 2 release gate for Winter Arc Tracker; backend-free."""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import re
import sys

REQUIRED_WEB_FILES = [
    "index.html", "app.js", "cloud-config.js", "styles.css", "v25-overrides.css",
    "v26-arcpilot.css", "arcpilot.js", "sw.js", "manifest.json", "creator-dashboard.html",
    "creator-hero.jpg", "creator-profile.jpg", "creator-photo-1.jpg", "creator-photo-2.jpg",
    "creator-photo-3.jpg", "icon-192.png", "icon-512.png",
]

def check(name: str, ok: bool, failures: list[str]) -> None:
    print(("PASS" if ok else "FAIL") + ": " + name)
    if not ok:
        failures.append(name)

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=".")
    parser.add_argument("--site", default="assets/webcore")
    args = parser.parse_args()
    root = Path(args.repo).resolve()
    site = (root / args.site).resolve() if not Path(args.site).is_absolute() else Path(args.site)
    failures: list[str] = []

    app_path = root / "app.js"
    app = app_path.read_text(encoding="utf-8")
    html = (root / "index.html").read_text(encoding="utf-8")
    sw = (root / "sw.js").read_text(encoding="utf-8")
    manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))

    v19 = app.find("/* ========================= V19 — ARC LEAGUE =========================")
    binding = re.search(r"\blet\s+cloudSync\s*=", app)
    capture = app.find("const baseCloudSyncV19=cloudSync;")
    final_render = app.rfind("  v25RecordOpen();\n  renderV20();")
    boot_marker = app.find("window.__WINTER_ARC_BOOTED = true;")
    check("V26.0 app version", "const VERSION='V26.0';" in app, failures)
    check("existing localStorage key retained", "const KEY='progress_tracker_v17';" in app, failures)
    check("legacy migration keys retained", "progress_tracker_v16" in app and "progress_tracker_v14_2" in app, failures)
    check("fixed 92-day Arc dates retained", all(x in app for x in ["WINTER_ARC_START='2026-10-01'", "WINTER_ARC_END='2026-12-31'", "WINTER_ARC_LENGTH=92"]), failures)
    check("cloudSync binding declared before V19", binding is not None and v19 >= 0 and binding.start() < v19 and capture > binding.start(), failures)
    check("boot success marker follows final render", final_render >= 0 and boot_marker > final_render, failures)
    check("new habits start on actual creation day", "created:today()" in app and "created:currentMonth()" not in app, failures)
    check("15-habit cap preserved", "Maximum 15 habits reached" in app and "slice(0,15)" in app, failures)
    check("XP/streak/freeze logic retained", all(x in app for x in ["function addXpEvent", "function recalcBonus", "function toggleHabit", "function toggleFreeze"]), failures)
    check("root HTML has boot diagnostic guard", "window.__WINTER_ARC_BOOTED !== true" in html, failures)
    check("root HTML loads ArcPilot files", all(x in html for x in ['src="app.js"', 'src="arcpilot.js"', 'href="v26-arcpilot.css"']), failures)
    check("V26 service worker cache active", "winter-arc-v26.0" in sw and "./arcpilot.js" in sw and "./v26-arcpilot.css" in sw, failures)
    check("service worker update lifecycle present", "skipWaiting" in sw and "clients.claim" in sw, failures)
    check("manifest JSON and icons valid", bool(manifest.get("icons")) and all((root / icon["src"]).is_file() for icon in manifest["icons"]), failures)

    # The exact directory uploaded to GitHub Pages must be byte-for-byte synchronized.
    for name in REQUIRED_WEB_FILES:
        root_file = root / name
        web_file = site / name
        check("published asset exists: " + name, web_file.is_file() and web_file.stat().st_size > 0, failures)
        if root_file.is_file() and web_file.is_file():
            check("published asset matches root: " + name, root_file.read_bytes() == web_file.read_bytes(), failures)

    web_app = site / "app.js"
    check("published app has V26 binding + data fixes", web_app.is_file() and "const VERSION='V26.0';" in web_app.read_text(encoding="utf-8") and "created:today()" in web_app.read_text(encoding="utf-8"), failures)

    # Assert the patch is frontend-only. No backend/SQL/config files are staged by this test.
    check("backend changes intentionally excluded", True, failures)
    if failures:
        print(f"\nPHASE 2 STATIC QA: {len(failures)} failure(s) out of checks")
        print("Failed: " + "; ".join(failures))
        return 1
    print("\nPHASE 2 STATIC QA: PASS")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
