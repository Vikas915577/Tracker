#!/usr/bin/env python3
"""Check that the exact published bundle can load all local resources and V26 logic."""

from __future__ import annotations

import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

REQUIRED = [
    "index.html", "app.js", "cloud-config.js", "styles.css",
    "v25-overrides.css", "v26-arcpilot.css", "arcpilot.js",
    "sw.js", "manifest.json", "creator-dashboard.html",
    "creator-hero.jpg", "creator-profile.jpg", "creator-photo-1.jpg",
    "creator-photo-2.jpg", "creator-photo-3.jpg", "icon-192.png",
    "icon-512.png",
]
V19_ANCHOR = "/* ========================= V19 — ARC LEAGUE ========================="


class ResourceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.resources: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        values = dict(attrs)
        for key in ("src", "href"):
            value = values.get(key)
            if value:
                self.resources.append(value)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", default=".")
    args = parser.parse_args()
    site = Path(args.site).resolve()

    errors: list[str] = []
    for name in REQUIRED:
        item = site / name
        if not item.is_file() or item.stat().st_size == 0:
            errors.append(f"Missing or empty file: {name}")

    if errors:
        raise SystemExit("Bundle incomplete:\n- " + "\n- ".join(errors))

    html = (site / "index.html").read_text(encoding="utf-8")
    app = (site / "app.js").read_text(encoding="utf-8")
    arcpilot = (site / "arcpilot.js").read_text(encoding="utf-8")
    sw = (site / "sw.js").read_text(encoding="utf-8")
    manifest = json.loads((site / "manifest.json").read_text(encoding="utf-8"))

    for marker in [
        'id="app"', 'src="app.js"', 'src="arcpilot.js"',
        'href="v26-arcpilot.css"', 'href="manifest.json"',
    ]:
        if marker not in html:
            errors.append(f"index.html missing reference: {marker}")

    # Confirm the real runtime binding exists in the SAME outer app scope,
    # before the nested V19 IIFE reads/captures it.
    anchor = app.find(V19_ANCHOR)
    binding = re.search(r"\blet\s+cloudSync\s*=", app)
    base_capture = app.find("const baseCloudSyncV19=cloudSync;")
    if anchor < 0:
        errors.append("V19 Arc League boundary missing from app.js.")
    if binding is None:
        errors.append("Missing outer-scope `let cloudSync` declaration.")
    elif anchor >= 0 and binding.start() > anchor:
        errors.append("cloudSync declaration is inside/after the nested V19 scope.")
    if base_capture < 0:
        errors.append("V19 baseCloudSyncV19 capture is missing.")
    elif binding is not None and binding.start() > base_capture:
        errors.append("cloudSync is not declared before V19 captures it.")

    if "const VERSION='V26.0';" not in app:
        errors.append("Application source is not stamped V26.0.")
    if "progress_tracker_v17" not in app:
        errors.append("Existing local progress store key was not found.")
    if "winter_arc_arcpilot_v1" not in arcpilot:
        errors.append("ArcPilot's separate preference key is missing.")
    if "winter-arc-v26.0" not in sw:
        errors.append("Service-worker cache is not V26.0.")
    if "skipWaiting" not in sw or "clients.claim" not in sw:
        errors.append("Service-worker update activation hooks are missing.")
    if "./arcpilot.js" not in sw or "./v26-arcpilot.css" not in sw:
        errors.append("ArcPilot files are not in the offline cache list.")

    parser_obj = ResourceParser()
    parser_obj.feed(html)
    for raw in parser_obj.resources:
        parsed = urlparse(raw)
        if parsed.scheme or parsed.netloc or raw.startswith("//") or raw.startswith("#"):
            continue
        path = unquote(parsed.path.split("?", 1)[0])
        if path.startswith("/"):
            errors.append(f"Absolute local path breaks GitHub project Pages: {raw}")
        elif path and not (site / path).is_file():
            errors.append(f"index.html refers to missing local file: {raw}")

    for icon in manifest.get("icons", []):
        src = icon.get("src", "")
        if src and not (site / src).is_file():
            errors.append(f"Manifest icon missing: {src}")

    if errors:
        raise SystemExit("V26 DEPLOYMENT VALIDATION FAILED:\n- " + "\n- ".join(errors))

    print(f"V26 DEPLOYMENT VALIDATION PASSED: {site}")
    print(f"Local HTML references checked: {len(parser_obj.resources)}")
    print("cloudSync outer binding: PASS")
    print("Existing tracker data key: PASS")
    print("ArcPilot and service-worker assets: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
