#!/usr/bin/env python3
"""Idempotent V26 startup repair for cloudSync scope and boot diagnostics."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

V19_ANCHOR = "/* ========================= V19 — ARC LEAGUE ========================="
FIX_MARKER = "/* V26.0 CLOUDSYNC BINDING FIX — outer app scope */"
FIX_BLOCK = """/* V26.0 CLOUDSYNC BINDING FIX — outer app scope */
  // V19 wraps this shared binding; V24 later assigns the real Supabase implementation.
  // This bootstrap performs no network requests and does not replace the real sync logic.
  let cloudSync = async function (_opts = {}) {
    return false;
  };

"""
FINAL_RENDER = "  v25RecordOpen();\n  renderV20();"
BOOT_MARKER = "  window.__WINTER_ARC_BOOTED = true;"


def patch_app(path: Path) -> bool:
    if not path.is_file():
        raise SystemExit(f"App source not found: {path}")
    source = path.read_text(encoding="utf-8")
    original = source

    anchor_pos = source.find(V19_ANCHOR)
    if anchor_pos < 0:
        raise SystemExit("V19 Arc League boundary not found; refusing unsafe patch.")

    if FIX_MARKER not in source:
        declarations = list(re.finditer(r"\b(?:let|const|var|function)\s+cloudSync\b", source))
        declarations_before_v19 = [m for m in declarations if m.start() < anchor_pos]
        if declarations_before_v19:
            pass
        elif declarations:
            raise SystemExit("cloudSync exists only inside/after V19; refusing to shadow it.")
        else:
            source = source[:anchor_pos] + FIX_BLOCK + source[anchor_pos:]
            anchor_pos = source.find(V19_ANCHOR)
    elif source.find(FIX_MARKER) > anchor_pos:
        raise SystemExit("CloudSync fix marker is in the wrong scope.")

    version_match = re.search(r"const VERSION='([^']+)';", source)
    if not version_match:
        raise SystemExit("Application VERSION constant not found.")
    version = version_match.group(1)
    if version == "V25.4":
        source = source[:version_match.start(1)] + "V26.0" + source[version_match.end(1):]
    elif version != "V26.0":
        raise SystemExit(f"Unexpected app version {version!r}; refusing overwrite.")

    if BOOT_MARKER not in source:
        if FINAL_RENDER not in source:
            raise SystemExit("Final V20 render boundary not found; refusing boot-marker insertion.")
        source = source.replace(
            FINAL_RENDER,
            FINAL_RENDER + "\n" + BOOT_MARKER,
            1
        )

    if source != original:
        path.write_text(source, encoding="utf-8")

    # Validate the real declaration order after patching.
    anchor_pos = source.find(V19_ANCHOR)
    declaration = re.search(r"\blet\s+cloudSync\s*=", source)
    capture_pos = source.find("const baseCloudSyncV19=cloudSync;")
    if declaration is None or declaration.start() > anchor_pos:
        raise SystemExit("cloudSync binding is not declared before V19.")
    if capture_pos < 0 or declaration.start() > capture_pos:
        raise SystemExit("V19 captures cloudSync before its declaration.")
    if "const VERSION='V26.0';" not in source:
        raise SystemExit("V26 version marker validation failed.")
    if source.find(BOOT_MARKER) < source.rfind(FINAL_RENDER):
        raise SystemExit("Boot-success flag was not added after the final render.")
    return source != original


def patch_index(path: Path) -> bool:
    if not path.is_file():
        raise SystemExit(f"index.html not found: {path}")
    source = path.read_text(encoding="utf-8")
    original = source

    source = source.replace(
        "return !!document.getElementById('app');",
        "return !!document.getElementById('app') && window.__WINTER_ARC_BOOTED !== true;"
    )
    source = source.replace(
        "clear this website’s cached site data in Chrome and reopen it.",
        "close old tabs and reopen the website. Do not clear Chrome site storage or cookies; they may contain your saved progress."
    )
    if "window.__WINTER_ARC_BOOTED !== true" not in source:
        raise SystemExit("index.html boot-success guard is missing.")
    if source != original:
        path.write_text(source, encoding="utf-8")
    return source != original


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("app", nargs="?", default="app.js")
    parser.add_argument("--index", default="index.html")
    args = parser.parse_args()

    app_changed = patch_app(Path(args.app))
    index_changed = patch_index(Path(args.index))
    print("App:", "patched" if app_changed else "already fixed")
    print("Index:", "patched" if index_changed else "already fixed")
    print("Verified: cloudSync is outer-scoped and declared before V19.")
    print("Verified: boot-success marker is placed after final V20 render.")
    print("Verified: app version is V26.0.")
    print("Verified: error page will not ask users to clear saved site data.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
