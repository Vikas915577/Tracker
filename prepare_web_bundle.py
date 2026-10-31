#!/usr/bin/env python3
"""Prepare the exact GitHub Pages and Android web bundle from root assets."""

from __future__ import annotations

import argparse
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

    missing = [
        name for name in FILES
        if not (source / name).is_file() or (source / name).stat().st_size == 0
    ]
    if missing:
        raise SystemExit("Missing required root assets: " + ", ".join(missing))

    for name in FILES:
        shutil.copy2(source / name, target / name)

    # No folder is cleared; existing unrelated webcore files are preserved.
    print(f"Prepared {len(FILES)} files in {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
