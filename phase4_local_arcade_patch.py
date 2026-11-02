#!/usr/bin/env python3
"""Phase 4: add YaarJam as a separate, offline-first local arcade inside Tracker.

The arcade is copied from a pinned public YaarJam V2 source checkout. Its own
localStorage namespace and Service Worker cache are kept isolated from Winter Arc.
No Supabase/backend/schema files are read or changed.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path

TRACKER_STORE = "const KEY='progress_tracker_v17';"
YAARJAM_STORE = "const STORE_KEY = 'yaarjam-offline-v2';"
PHASE3_MARKER = "PHASE 3 — XP, LEVELS & ACHIEVEMENTS"
PHASE4_MARKER = "/* ========================= PHASE 4 — LOCAL ARCADE ========================= */"
MORE_HEAD = "  function v20More(){"
PANEL_ANCHOR = "morePanel==='rank'?v20Rank():"
TILE_ANCHOR = "${tile('📱','Get the App','Install PWA when supported.','getapp')}"

PHASE4_BLOCK = r'''/* ========================= PHASE 4 — LOCAL ARCADE ========================= */
  // YaarJam is a separate static sub-app under ./arcade/. Its save data uses
  // yaarjam-offline-v2 and never reads or writes Winter Arc's progress_tracker_v17.
  function v26ArcadeLaunchPage(){
    return `<section class="v24-simple-card">
      <span class="kicker">LOCAL GAME ARCADE</span>
      <h2 style="font-size:22px;margin:6px 0">YaarJam · 24 offline games</h2>
      <p style="font-size:12px;line-height:1.5;color:var(--muted)">Play on this phone with friends or your partner. Includes board games, quick challenges, quizzes and party rounds. The arcade keeps its own local saves, separate from your Winter Arc habits and XP.</p>
      <div class="v24-story" style="margin:12px 0"><div><b>24</b><span>Games</span></div><div><b>381</b><span>Prompt & item records</span></div><div><b>Offline</b><span>After first load</span></div></div>
      <a class="btn primary" href="./arcade/index.html" style="display:flex;align-items:center;justify-content:center;text-decoration:none;min-height:46px">Open YaarJam Arcade →</a>
      <p style="font-size:10px;line-height:1.45;color:var(--muted);margin:10px 0 0">Local pass-the-phone and computer play. No cross-phone live multiplayer or backend connection is added.</p>
    </section>`;
  }

'''

ICON_SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ff7d9b"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs>
  <rect width="128" height="128" rx="30" fill="#11101c"/>
  <rect x="12" y="12" width="104" height="104" rx="27" fill="url(#g)"/>
  <path d="M39 37h50v11H70v43H58V48H39z" fill="#201a2e"/>
  <circle cx="92" cy="87" r="8" fill="#83e0c2"/>
</svg>'''

BACK_LINK = '<a class="winter-arc-back" href="../index.html" aria-label="Back to Winter Arc">← Back to Winter Arc</a>'
BACK_CSS = '''\n/* Phase 4: return path to the parent Winter Arc app. */
.winter-arc-back{display:block;max-width:780px;margin:0 auto;padding:9px 18px 0;color:var(--mint,#83e0c2);font-size:12px;font-weight:850;text-decoration:none;min-height:30px}
.winter-arc-back:focus-visible{outline:2px solid var(--mint,#83e0c2);outline-offset:2px;border-radius:8px}
'''


def patch_tracker_app(path: Path) -> list[str]:
    if not path.is_file():
        raise ValueError("Tracker app.js missing; run from repository root.")
    source = path.read_text(encoding="utf-8")
    if TRACKER_STORE not in source:
        raise ValueError("Tracker localStorage key changed; refusing to patch.")
    if "const VERSION='V26.0';" not in source:
        raise ValueError("Phase 2 V26.0 prerequisite missing.")
    if PHASE3_MARKER not in source or "function v26LevelInfo()" not in source:
        raise ValueError("Phase 3 XP/achievement prerequisite missing; apply Phase 2 and Phase 3 first.")
    if "let cloudSync = async function" not in source:
        raise ValueError("Phase 2 cloudSync binding missing; refusing to patch an unstable app.")

    if PHASE4_MARKER in source:
        needed = ("function v26ArcadeLaunchPage()", "morePanel==='arcade'?v26ArcadeLaunchPage():", "24 offline games")
        if any(item not in source for item in needed):
            raise ValueError("A partial Phase 4 patch exists; manual review required.")
        return ["Phase 4 app integration already applied (idempotent no-op)"]

    starts = [m.start() for m in re.finditer(re.escape(MORE_HEAD), source)]
    if not starts:
        raise ValueError("Active V20/V24 More screen boundary not found.")
    start = starts[-1]
    end = source.find("\n  function v20Shell()", start)
    if end < 0:
        raise ValueError("Could not identify the final More screen boundary.")
    segment = source[start:end]
    if segment.count(PANEL_ANCHOR) != 1:
        raise ValueError("Expected one active Rank panel branch in final More screen.")
    if segment.count(TILE_ANCHOR) != 1:
        raise ValueError("Expected one active Get the App tile in final More screen.")

    segment = segment.replace(PANEL_ANCHOR, "morePanel==='arcade'?v26ArcadeLaunchPage():" + PANEL_ANCHOR, 1)
    segment = segment.replace(TILE_ANCHOR, "${tile('🎮','Arcade','24 offline games from YaarJam','arcade')}" + TILE_ANCHOR, 1)
    source = source[:start] + PHASE4_BLOCK + segment + source[end:]
    # The reconstruction is intentionally bounded to the active More renderer.
    if source.count(PHASE4_MARKER) != 1 or source.count("function v26ArcadeLaunchPage()") != 1:
        raise ValueError("Phase 4 integration postcondition failed.")
    if TRACKER_STORE not in source or "progress_tracker_v16" not in source:
        raise ValueError("Existing Tracker storage/migration keys must remain unchanged.")
    if "morePanel==='arcade'?v26ArcadeLaunchPage():" not in source:
        raise ValueError("Arcade panel route was not inserted.")
    path.write_text(source, encoding="utf-8")
    return ["Arcade tile added to More", "Offline arcade launch page added", "Tracker data store left unchanged"]


def copy_arcade_source(source: Path, destination: Path) -> list[str]:
    required = ("index.html", "app.js", "styles.css", "manifest.json", "sw.js")
    missing = [name for name in required if not (source / name).is_file() or (source / name).stat().st_size == 0]
    if missing:
        raise ValueError("YaarJam source checkout is incomplete: " + ", ".join(missing))
    destination.mkdir(parents=True, exist_ok=True)
    for name in required:
        shutil.copy2(source / name, destination / name)

    # Keep the YaarJam cache activation scoped to its own prefix. The source
    # version previously deleted every CacheStorage entry on this origin,
    # including the parent Winter Arc cache.
    sw_path = destination / "sw.js"
    sw = sw_path.read_text(encoding="utf-8")
    old_filter = "keys.filter(k=>k!==CACHE)"
    safe_filter = "keys.filter(k=>k.startsWith('yaarjam-offline-v2-')&&k!==CACHE)"
    if safe_filter not in sw:
        if sw.count(old_filter) != 1:
            raise ValueError("YaarJam Service Worker cleanup rule changed; refusing unsafe merge.")
        sw = sw.replace(old_filter, safe_filter, 1)
        sw_path.write_text(sw, encoding="utf-8")

    # The checked-out V2 index refers to this icon; some repo snapshots omit it.
    icon_source = source / "assets" / "icon.svg"
    icon_dest = destination / "assets" / "icon.svg"
    icon_dest.parent.mkdir(parents=True, exist_ok=True)
    if icon_source.is_file():
        shutil.copy2(icon_source, icon_dest)
    else:
        icon_dest.write_text(ICON_SVG, encoding="utf-8")

    index_path = destination / "index.html"
    html = index_path.read_text(encoding="utf-8")
    if BACK_LINK not in html:
        anchor = '<div class="app-shell">'
        if html.count(anchor) != 1:
            raise ValueError("YaarJam app shell boundary changed; cannot safely add return link.")
        html = html.replace(anchor, anchor + "\n    " + BACK_LINK, 1)
        index_path.write_text(html, encoding="utf-8")

    css_path = destination / "styles.css"
    css = css_path.read_text(encoding="utf-8")
    if ".winter-arc-back{" not in css:
        css_path.write_text(css + BACK_CSS, encoding="utf-8")

    manifest = json.loads((destination / "manifest.json").read_text(encoding="utf-8"))
    icon = destination / manifest["icons"][0]["src"]
    if not icon.is_file():
        raise ValueError("YaarJam manifest icon is missing after copy.")

    # Ensure the original game store remains isolated from Tracker's store.
    game = (destination / "app.js").read_text(encoding="utf-8")
    if YAARJAM_STORE not in game:
        raise ValueError("YaarJam local save key changed; manual storage review required.")
    if "progress_tracker_v17" in game:
        raise ValueError("YaarJam must not reference Tracker's progress key.")
    if "keys.filter(k=>k!==CACHE)" in sw_path.read_text(encoding="utf-8"):
        raise ValueError("Unscoped Service Worker cache deletion remains.")

    return ["YaarJam V2 static game app copied", "YaarJam cache cleanup isolated", "Back-to-Tracker link added"]


def self_test() -> None:
    import tempfile
    fixture = """(function(){
const VERSION='V26.0';
const KEY='progress_tracker_v17';
const OLD_KEYS=['progress_tracker_v16'];
let cloudSync = async function(){return false};
/* PHASE 3 — XP, LEVELS & ACHIEVEMENTS */
function v26LevelInfo(){}
  function v20More(){ return 'legacy'; }
  function v20Menu(){}
  function v20More(){
    let body='';
    try{body=morePanel==='rank'?v20Rank():'empty'}
    const tile=(icon,title,sub,id)=>`<button>${title}</button>`;
    return `${tile('📱','Get the App','Install PWA when supported.','getapp')}`;
  }
  function v20Shell(){}
})();
"""
    with tempfile.TemporaryDirectory() as tmp:
        root=Path(tmp);(root/"app.js").write_text(fixture,encoding="utf-8")
        original=(root/"app.js").read_text(encoding="utf-8")
        result=patch_tracker_app(root/"app.js")
        updated=(root/"app.js").read_text(encoding="utf-8")
        assert "function v26ArcadeLaunchPage()" in updated
        assert "morePanel==='arcade'?v26ArcadeLaunchPage():morePanel==='rank'?v20Rank():" in updated
        assert updated.index(PHASE4_MARKER) < updated.rindex(MORE_HEAD)
        assert updated.count("tile('🎮','Arcade'") == 1
        assert TRACKER_STORE in updated
        patch_tracker_app(root/"app.js")
        assert (root/"app.js").read_text(encoding="utf-8") == updated

        source=root/"source";source.mkdir();(source/"assets").mkdir()
        (source/"index.html").write_text('<div class="app-shell"><header class="topbar"></header></div><script src="app.js"></script>',encoding="utf-8")
        (source/"app.js").write_text(YAARJAM_STORE+"\nconst GAMES=[];",encoding="utf-8")
        (source/"styles.css").write_text("body{}",encoding="utf-8")
        (source/"manifest.json").write_text(json.dumps({"icons":[{"src":"assets/icon.svg"}]}),encoding="utf-8")
        (source/"sw.js").write_text("const CACHE='yaarjam-offline-v2-cache-1';self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));",encoding="utf-8")
        dest=root/"arcade";copy_arcade_source(source,dest)
        sw=(dest/"sw.js").read_text(encoding="utf-8")
        assert "keys.filter(k=>k.startsWith('yaarjam-offline-v2-')&&k!==CACHE)" in sw
        assert (dest/"assets/icon.svg").is_file()
        assert "../index.html" in (dest/"index.html").read_text(encoding="utf-8")
    print("PASS: Phase 4 self-test (active More renderer, isolated game store, scoped Service Worker, back link, idempotency)")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--repo", default=".", help="Tracker repository root")
    parser.add_argument("--source", default=".phase4-source", help="Pinned YaarJam checkout")
    parser.add_argument("--publish", default="assets/webcore", help="Prepared GitHub Pages directory")
    parser.add_argument("--no-publish", action="store_true", help="Do not copy into prepared Pages directory")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0

    root = Path(args.repo).resolve()
    source = Path(args.source).resolve()
    arcade = root / "arcade"
    changes = patch_tracker_app(root / "app.js")
    changes += copy_arcade_source(source, arcade)

    if not args.no_publish:
        site = Path(args.publish)
        if not site.is_absolute():
            site = root / site
        if not (site / "index.html").is_file():
            raise SystemExit("Prepared Pages directory not found. Run prepare_web_bundle.py before --publish.")
        shutil.copytree(arcade, site / "arcade", dirs_exist_ok=True)
        changes.append("Arcade copied into the exact Pages publish directory")

    print("Phase 4 local arcade patch result:")
    for item in changes:
        print("- " + item)
    print("Backend/database unchanged; Tracker and YaarJam use separate localStorage keys.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, AssertionError, KeyError) as exc:
        raise SystemExit("PHASE 4 PATCH STOPPED SAFELY: " + str(exc))
