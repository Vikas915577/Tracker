#!/usr/bin/env python3
"""Prepare a complete, consistent web bundle from the repository root."""

from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path

FILES = [
    "index.html",
    "app.js",
    "cloud-config.js",
    "styles.css",
    "v25-overrides.css",
    "v26-arcpilot.css",
    "arcpilot.js",
    "sw.js",
    "manifest.json",
    "creator-dashboard.html",
    "creator-hero.jpg",
    "creator-profile.jpg",
    "creator-photo-1.jpg",
    "creator-photo-2.jpg",
    "creator-photo-3.jpg",
    "icon-192.png",
    "icon-512.png",
]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", default=".")
    parser.add_argument("--target", default="assets/webcore")
    args = parser.parse_args()

    source = Path(args.source).resolve()
    target = Path(args.target).resolve()
    target.mkdir(parents=True, exist_ok=True)

    missing = [name for name in FILES if not (source / name).is_file() or (source / name).stat().st_size == 0]
    if missing:
        raise SystemExit("Missing required root assets: " + ", ".join(missing))

    copied = []
    for name in FILES:
        destination = target / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source / name, destination)
        copied.append(name)

    # The base app source is V25.4; ArcPilot and the V26 shell already exist.
    # Stamp the deployed copy only, leaving the root source/data untouched.
    app_path = target / "app.js"
    app = app_path.read_text(encoding="utf-8")
    old_marker = "const VERSION='V25.4';"
    new_marker = "const VERSION='V26.0';"
    if old_marker in app:
        app, replacements = re.subn(re.escape(old_marker), new_marker, app, count=1)
        if replacements != 1:
            raise SystemExit("Could not safely version-stamp copied app.js.")
        app_path.write_text(app, encoding="utf-8")
    elif new_marker not in app:
        raise SystemExit("Unexpected app.js version marker; refusing to rewrite it.")

    print("Prepared web bundle:", target)
    print("Copied", len(copied), "files; copied app.js is stamped V26.0.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
