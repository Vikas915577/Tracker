#!/usr/bin/env python3
"""Fail CI if the exact folder intended for GitHub Pages is incomplete."""

from __future__ import annotations

import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote

REQUIRED = [
    "index.html", "app.js", "cloud-config.js", "styles.css",
    "v25-overrides.css", "v26-arcpilot.css", "arcpilot.js",
    "sw.js", "manifest.json", "creator-dashboard.html",
    "creator-hero.jpg", "creator-profile.jpg", "creator-photo-1.jpg",
    "creator-photo-2.jpg", "creator-photo-3.jpg", "icon-192.png",
    "icon-512.png",
]


class ResourceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.resources: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        values = dict(attrs)
        for name in ("src", "href"):
            value = values.get(name)
            if value:
                self.resources.append(value)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", default=".")
    parser.add_argument("--allow-v25", action="store_true",
                        help="Allow the canonical source app.js to remain V25.4 before bundle preparation.")
    parser.add_argument("--require-v26", action="store_true")
    args = parser.parse_args()
    site = Path(args.site).resolve()

    problems: list[str] = []
    for name in REQUIRED:
        path = site / name
        if not path.is_file() or path.stat().st_size == 0:
            problems.append(f"Missing or empty required file: {name}")

    if problems:
        raise SystemExit("\n".join(problems))

    html = (site / "index.html").read_text(encoding="utf-8")
    app = (site / "app.js").read_text(encoding="utf-8")
    arcpilot = (site / "arcpilot.js").read_text(encoding="utf-8")
    sw = (site / "sw.js").read_text(encoding="utf-8")

    for marker, label in [
        ('id="app"', "app mount element"),
        ('src="app.js"', "main application script"),
        ('src="arcpilot.js"', "ArcPilot script"),
        ('href="v26-arcpilot.css"', "ArcPilot stylesheet"),
    ]:
        if marker not in html:
            problems.append(f"index.html is missing {label}: {marker}")

    parser_obj = ResourceParser()
    parser_obj.feed(html)
    for raw in parser_obj.resources:
        parsed = urlparse(raw)
        if parsed.scheme or parsed.netloc or raw.startswith("//") or raw.startswith("#"):
            continue
        if parsed.path.startswith("/"):
            problems.append(f"Root-absolute URL breaks GitHub project-site paths: {raw}")
            continue
        relative = unquote(parsed.path.split("?", 1)[0])
        if not relative:
            continue
        if not (site / relative).is_file():
            problems.append(f"index.html references missing local resource: {raw}")

    try:
        manifest = json.loads((site / "manifest.json").read_text(encoding="utf-8"))
    except Exception as exc:
        manifest = {}
        problems.append(f"manifest.json is invalid JSON: {exc}")

    for icon in manifest.get("icons", []):
        icon_src = icon.get("src")
        if icon_src and not (site / icon_src).is_file():
            problems.append(f"Manifest icon is missing: {icon_src}")

    if "progress_tracker_v17" not in app:
        problems.append("Main app no longer references the existing progress_tracker_v17 data store.")
    if "winter_arc_arcpilot_v1" not in arcpilot:
        problems.append("ArcPilot preference key is missing.")
    if "navigator.serviceWorker.register('./sw.js')" not in app:
        problems.append("Main app is not registering the project-relative service worker.")
    if "winter-arc-v26.0" not in sw:
        problems.append("Service-worker cache is not versioned as V26.0.")
    if "skipWaiting" not in sw or "clients.claim" not in sw:
        problems.append("Service-worker update activation hooks are missing.")
    if "./arcpilot.js" not in sw or "./v26-arcpilot.css" not in sw:
        problems.append("V26 ArcPilot files are missing from the offline cache list.")

    has_v26 = "const VERSION='V26.0';" in app
    has_v25 = "const VERSION='V25.4';" in app
    if args.require_v26 and not has_v26:
        problems.append("Published app.js is not stamped V26.0.")
    if not args.allow_v25 and not args.require_v26 and not has_v26:
        problems.append("app.js is not stamped V26.0.")
    if args.allow_v25 and not (has_v25 or has_v26):
        problems.append("Source app.js has an unexpected version marker.")

    if problems:
        raise SystemExit("WEB BUNDLE VALIDATION FAILED:\n- " + "\n- ".join(problems))

    print(f"WEB BUNDLE VALIDATION PASSED: {site}")
    print(f"Resources checked: {len(parser_obj.resources)}")
    print(f"App version: {'V26.0' if has_v26 else 'V25.4 source; prepare step will stamp V26.0'}")
    print("Existing tracker store and ArcPilot store keys are present.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
