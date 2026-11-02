#!/usr/bin/env python3
"""Safe, idempotent Phase 2 stability patch for Winter Arc Tracker V26.0.

Only patches local frontend/runtime metadata. It deliberately does not read or
write Supabase SQL, database settings, credentials, or backend configuration.
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

V19_ANCHOR = "/* ========================= V19 — ARC LEAGUE ========================="
CLOUD_MARKER = "/* V26.0 CLOUDSYNC BINDING FIX — outer app scope */"
CLOUD_BLOCK = (
    CLOUD_MARKER + "\n"
    "// V19 wraps this binding; V24 later assigns the actual optional sync routine.\n"
    "// This initial function is local-only and makes no network request.\n"
    "let cloudSync = async function (_opts = {}) { return false; };\n\n"
)
CAPTURE = "const baseCloudSyncV19=cloudSync;"
FINAL_RENDER = "  v25RecordOpen();\n  renderV20();"
BOOT_MARKER = "  window.__WINTER_ARC_BOOTED = true;"
STORE_KEY = "const KEY='progress_tracker_v17';"


def patch_app_text(source: str) -> tuple[str, list[str]]:
    changed: list[str] = []
    if STORE_KEY not in source:
        raise ValueError("Existing progress store key was not found; refusing to patch.")
    if V19_ANCHOR not in source or CAPTURE not in source:
        raise ValueError("Expected V19 Arc League boundary/capture not found; refusing to patch.")

    # V26.0 is the already-authored root release; V25.4 is accepted as the older base.
    version_matches = list(re.finditer(r"const VERSION='([^']+)';", source))
    if len(version_matches) != 1:
        raise ValueError("Expected exactly one app VERSION declaration.")
    current_version = version_matches[0].group(1)
    if current_version == "V25.4":
        source = source[:version_matches[0].start(1)] + "V26.0" + source[version_matches[0].end(1):]
        changed.append("version V25.4 -> V26.0")
    elif current_version != "V26.0":
        raise ValueError(f"Unexpected app version {current_version!r}; refusing to overwrite it.")

    anchor_pos = source.index(V19_ANCHOR)
    declarations = list(re.finditer(r"\b(let|const|var|function)\s+cloudSync\b", source))
    before = [m for m in declarations if m.start() < anchor_pos]
    after = [m for m in declarations if m.start() >= anchor_pos]
    if not before:
        if after:
            raise ValueError("cloudSync is declared only inside/after V19; refusing unsafe shadowing.")
        source = source[:anchor_pos] + CLOUD_BLOCK + source[anchor_pos:]
        changed.append("outer-scope cloudSync binding")
    else:
        # It must be mutable because V19/V24 replace the function reference later.
        if before[-1].group(1) != "let":
            raise ValueError("An outer cloudSync declaration exists but is not mutable let.")

    # New habits must begin on their actual creation date, not the first day of the month.
    bad_creation = "created:currentMonth()"
    if bad_creation in source:
        if source.count(bad_creation) != 1:
            raise ValueError("Found multiple currentMonth creation-date expressions; manual review required.")
        source = source.replace(bad_creation, "created:today()", 1)
        changed.append("new-habit creation date currentMonth() -> today()")
    elif "created:today()" not in source:
        raise ValueError("Expected new-habit creation date expression not found.")

    if BOOT_MARKER not in source:
        if source.count(FINAL_RENDER) != 1:
            raise ValueError("Expected one final render boundary; refusing boot marker insertion.")
        source = source.replace(FINAL_RENDER, FINAL_RENDER + "\n" + BOOT_MARKER, 1)
        changed.append("boot-success marker after final render")

    # Postconditions: exact scope/order and retained local store.
    anchor_pos = source.index(V19_ANCHOR)
    decl = re.search(r"\blet\s+cloudSync\s*=", source)
    capture_pos = source.index(CAPTURE)
    final_pos = source.rindex(FINAL_RENDER)
    boot_pos = source.index(BOOT_MARKER)
    if decl is None or decl.start() >= anchor_pos or decl.start() >= capture_pos:
        raise ValueError("cloudSync binding is not declared before V19 captures it.")
    if boot_pos <= final_pos:
        raise ValueError("Boot marker is not after the final render call.")
    if "const VERSION='V26.0';" not in source:
        raise ValueError("V26.0 version marker validation failed.")
    if STORE_KEY not in source or "progress_tracker_v16" not in source:
        raise ValueError("Progress store/migration keys changed unexpectedly.")
    if "data.habits.push({id:uid(),name:n,icon,private:!!privateFlag,created:today()" not in source:
        raise ValueError("New habit is not anchored to its exact creation date.")
    return source, changed


def replace_once(path: Path, old: str, new: str, label: str) -> str:
    if not path.is_file():
        raise ValueError(f"Required file missing: {path}")
    text = path.read_text(encoding="utf-8")
    if new in text:
        return "already current"
    if text.count(old) != 1:
        raise ValueError(f"{label}: expected one exact occurrence in {path}.")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")
    return "updated"


def patch_repo(root: Path) -> dict[str, object]:
    app_path = root / "app.js"
    if not app_path.is_file():
        raise ValueError("Run this patch from the Tracker repository root (app.js missing).")
    app = app_path.read_text(encoding="utf-8")
    patched, app_changes = patch_app_text(app)
    if patched != app:
        app_path.write_text(patched, encoding="utf-8")

    index = root / "index.html"
    if not index.is_file():
        raise ValueError("Root index.html is missing.")
    html = index.read_text(encoding="utf-8")
    if "window.__WINTER_ARC_BOOTED !== true" not in html:
        # The existing root diagnostic must be guarded so a successfully rendered
        # #app mount is not mistaken for a failed boot.
        old = "return !!document.getElementById('app');"
        new = "return !!document.getElementById('app') && window.__WINTER_ARC_BOOTED !== true;"
        if html.count(old) != 1:
            raise ValueError("Root boot diagnostic does not have a recognized safe guard.")
        index.write_text(html.replace(old, new, 1), encoding="utf-8")
        html = index.read_text(encoding="utf-8")

    # Keep Flutter's error-screen version aligned with the web release.
    dart = root / "lib" / "main.dart"
    dart_status = "not present"
    if dart.is_file():
        dart_status = replace_once(dart, "const String appVersion = 'V25.4';",
                                   "const String appVersion = 'V26.0';", "Flutter shell version")

    pubspec = root / "pubspec.yaml"
    pubspec_status = "not present"
    if pubspec.is_file():
        pubspec_status = replace_once(pubspec, "version: 25.4.0+5", "version: 26.0.0+6",
                                      "Flutter package version")

    return {
        "app_changes": app_changes,
        "index_boot_guard": "present",
        "flutter_shell_version": dart_status,
        "flutter_package_version": pubspec_status,
        "backend_touched": False,
    }


def self_test() -> None:
    fixture = """(function(){\n'use strict';\nconst VERSION='V25.4';\nconst KEY='progress_tracker_v17';\nconst OLD_KEYS=['progress_tracker_v16'];\nfunction addHabit(){data.habits.push({id:uid(),name:n,icon,private:!!privateFlag,created:currentMonth(),difficulty});}\n/* ========================= V19 — ARC LEAGUE =========================\nconst baseCloudSyncV19=cloudSync;\n  v25RecordOpen();\n  renderV20();\n})();\n"""
    fixed, changes = patch_app_text(fixture)
    if "let cloudSync = async function" not in fixed:
        raise AssertionError("self-test: outer binding missing")
    if "created:today()" not in fixed:
        raise AssertionError("self-test: new habit date not fixed")
    if fixed.index("let cloudSync") > fixed.index(V19_ANCHOR):
        raise AssertionError("self-test: cloud binding scope incorrect")
    if fixed.index(BOOT_MARKER) < fixed.index(FINAL_RENDER):
        raise AssertionError("self-test: boot marker order incorrect")
    fixed_again, second_changes = patch_app_text(fixed)
    if fixed_again != fixed or second_changes:
        raise AssertionError("self-test: patch is not idempotent")
    print("PASS: Phase 2 patch self-test (scope, creation date, boot marker, idempotency)")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=".", help="Tracker repository root")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0
    root = Path(args.repo).resolve()
    report = patch_repo(root)
    print("Phase 2 patch result:")
    for key, value in report.items():
        print(f"- {key}: {value}")
    print("No Supabase, SQL, backend schema, or credentials were modified.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, AssertionError) as exc:
        raise SystemExit(f"PHASE 2 PATCH STOPPED SAFELY: {exc}")
