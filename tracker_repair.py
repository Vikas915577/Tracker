#!/usr/bin/env python3
"""Safe, backup-first repair for Winter Arc Tracker V25.4.

Run from the repository root. Default mode is dry-run; use --apply to write changes.
Only these five source files are modified:
  app.js, assets/webcore/app.js, sw.js, assets/webcore/sw.js,
  .github/workflows/build.yml
No tracker progress, localStorage export, Supabase rows, or backend schema is touched.
"""
from __future__ import annotations

import argparse
import datetime as dt
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path.cwd()
APK_OLD = '''      <p class="muted">APK Releases button official repository ke Releases page par le jaata hai. Wahan real APK release asset available ho to download kar sakte ho. Website version ko APK ke bina bhi normally use kiya ja sakta hai.</p>
      <a class="v14-pill-btn primary v16-wide-link" href="${V16_APK_RELEASES_URL}" target="_blank" rel="noopener">Open APK Releases ↗</a>
'''
APK_NEW = '''      <p class="muted">Android APK ko isi page se directly download karo. Ye GitHub Actions se bana direct-install test build hai; Play Store signing alag process hai.</p>
      <a class="v14-pill-btn primary v16-wide-link" href="./downloads/winter-arc-tracker.apk" download="winter-arc-tracker.apk">Download Android APK ↓</a>
      <a class="v14-pill-btn v16-link-btn" href="${V16_APK_RELEASES_URL}" target="_blank" rel="noopener">Other APK builds ↗</a>
'''


def must_read(rel: str) -> str:
    p = ROOT / rel
    if not p.is_file():
        raise RuntimeError(f"Required file missing: {rel}. Run this script from the Tracker repository root.")
    return p.read_text(encoding="utf-8")


def exactly_once(text: str, old: str, new: str, label: str) -> str:
    n = text.count(old)
    if n != 1:
        raise RuntimeError(f"Expected exactly 1 match for {label}; found {n}. No files have been changed.")
    return text.replace(old, new, 1)


def prepare() -> dict[str, str]:
    changed: dict[str, str] = {}

    # Fix the legacy root copy: it has one extra IIFE closer after the valid app.
    root_app = must_read("app.js")
    duplicate_tail = "\n\n})();\n"
    if not root_app.endswith(duplicate_tail):
        raise RuntimeError("Root app.js did not end with the expected duplicate closure; no files have been changed.")
    root_app = root_app[:-len(duplicate_tail)] + "\n"
    changed["app.js"] = root_app

    # Fix the actual deployed web core as well as root's fallback copy.
    for rel in ("app.js", "assets/webcore/app.js"):
        src = changed[rel] if rel in changed else must_read(rel)
        old_call = "morePanel==='getapp'?getAppPage()"
        count = src.count(old_call)
        if count < 1:
            raise RuntimeError(f"Missing Get App handler in {rel}; no files have been changed.")
        src = src.replace(old_call, "morePanel==='getapp'?v16GetAppPage()")
        if APK_OLD not in src:
            raise RuntimeError(f"APK panel block not found in {rel}; no files have been changed.")
        if src.count(APK_OLD) != 1:
            raise RuntimeError(f"Expected one APK panel block in {rel}; no files have been changed.")
        src = src.replace(APK_OLD, APK_NEW, 1)
        changed[rel] = src

    # Root and deployed web-core copies must stay byte-identical.
    if changed["app.js"] != changed["assets/webcore/app.js"]:
        raise RuntimeError("Root app.js and assets/webcore/app.js do not reconcile after the safe fix; no files have been changed.")

    # Bump the PWA cache so existing V25.3 caches are discarded on activation.
    for rel in ("sw.js", "assets/webcore/sw.js"):
        src = must_read(rel)
        src = exactly_once(src, "const CACHE='winter-arc-v25.3';", "const CACHE='winter-arc-v25.4';", f"{rel} cache version")
        src = exactly_once(src, "'./styles.css','./app.js'", "'./styles.css','./v25-overrides.css','./app.js'", f"{rel} offline CSS cache")
        changed[rel] = src

    # Keep the website deployment independent of the repository-root legacy files,
    # while bundling the APK produced by the same successful workflow run.
    workflow = must_read(".github/workflows/build.yml")
    checkout_anchor = "      - name: Checkout repository\n        uses: actions/checkout@v4\n\n      - name: Setup Flutter"
    checkout_replacement = (
        "      - name: Checkout repository\n"
        "        uses: actions/checkout@v4\n\n"
        "      - name: Check tracker JavaScript syntax\n"
        "        run: |\n"
        "          node --check app.js\n"
        "          node --check assets/webcore/app.js\n"
        "          node --check sw.js\n"
        "          node --check assets/webcore/sw.js\n"
        "          grep -q \"morePanel==='getapp'?v16GetAppPage()\" assets/webcore/app.js\n\n"
        "      - name: Setup Flutter"
    )
    workflow = exactly_once(workflow, checkout_anchor, checkout_replacement, "workflow JavaScript check insertion point")
    workflow = exactly_once(workflow, "  deploy-pages:\n    runs-on:", "  deploy-pages:\n    needs: build-apk\n    runs-on:", "Pages job build dependency")
    old_upload = (
        "      - name: Upload Winter Arc web core\n"
        "        uses: actions/upload-pages-artifact@v3\n"
        "        with:\n"
        "          path: assets/webcore"
    )
    new_upload = (
        "      - name: Download Android APK artifact\n"
        "        uses: actions/download-artifact@v4\n"
        "        with:\n"
        "          name: winter-arc-v25-debug-apk\n"
        "          path: .apk-artifact\n\n"
        "      - name: Assemble website and APK download\n"
        "        shell: bash\n"
        "        run: |\n"
        "          set -euo pipefail\n"
        "          mkdir -p _site/downloads\n"
        "          cp -a assets/webcore/. _site/\n"
        "          cp .apk-artifact/app-debug.apk _site/downloads/winter-arc-tracker.apk\n\n"
        "      - name: Upload Winter Arc web core\n"
        "        uses: actions/upload-pages-artifact@v3\n"
        "        with:\n"
        "          path: _site"
    )
    workflow = exactly_once(workflow, old_upload, new_upload, "Pages APK bundle block")
    changed[".github/workflows/build.yml"] = workflow

    # Last pre-write guards.
    if "getAppPage()" in changed["assets/webcore/app.js"]:
        raise RuntimeError("An obsolete getAppPage() call remains; no files have been changed.")
    for rel in ("sw.js", "assets/webcore/sw.js"):
        if "const CACHE='winter-arc-v25.4';" not in changed[rel] or "'./v25-overrides.css'" not in changed[rel]:
            raise RuntimeError(f"Service-worker validation failed for {rel}; no files have been changed.")
    if "needs: build-apk" not in changed[".github/workflows/build.yml"] or "path: _site" not in changed[".github/workflows/build.yml"]:
        raise RuntimeError("Workflow validation failed; no files have been changed.")
    if "./downloads/winter-arc-tracker.apk" not in changed["assets/webcore/app.js"]:
        raise RuntimeError("Direct APK download link is missing; no files have been changed.")
    return changed


def syntax_check(changed: dict[str, str]) -> tuple[bool, str]:
    try:
        subprocess.run(["node", "--version"], check=True, capture_output=True, text=True)
    except (FileNotFoundError, subprocess.CalledProcessError):
        return True, "Node.js not installed here; GitHub Actions will run the syntax checks after push."
    checks = []
    for rel in ("app.js", "assets/webcore/app.js", "sw.js", "assets/webcore/sw.js"):
        with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as tmp:
            tmp.write(changed[rel])
            temp_path = Path(tmp.name)
        try:
            r = subprocess.run(["node", "--check", str(temp_path)], capture_output=True, text=True)
            if r.returncode:
                return False, f"JavaScript syntax check failed for {rel}: {(r.stderr or r.stdout).strip()}"
            checks.append(rel)
        finally:
            temp_path.unlink(missing_ok=True)
    return True, "Node syntax passed: " + ", ".join(checks)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="apply changes after validating all five target files")
    args = parser.parse_args()
    try:
        changed = prepare()
        ok, result = syntax_check(changed)
        print(result)
        if not ok:
            print("STOP: no files have been changed.", file=sys.stderr)
            return 1
        print("\nValidated changes:")
        for rel in sorted(changed):
            print(f"  - {rel}")
        print("\nData safety: no progress data, backend tables, SQL schema, or localStorage data files are modified.")
        if not args.apply:
            print("\nDRY RUN ONLY. To apply after reviewing this list, run: python3 tracker_repair.py --apply")
            return 0

        stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        backup = ROOT / f".tracker-repair-backup-{stamp}"
        backup.mkdir(parents=True, exist_ok=False)
        for rel in changed:
            source = ROOT / rel
            dest = backup / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, dest)
        for rel, content in changed.items():
            path = ROOT / rel
            path.write_text(content, encoding="utf-8", newline="")
        print(f"\nApplied. Original files backed up to: {backup.relative_to(ROOT)}")
        print("Next: inspect git diff, then commit/push only the five listed files.")
        return 0
    except Exception as exc:
        print(f"STOP: {exc}", file=sys.stderr)
        print("No target files have been written.", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
