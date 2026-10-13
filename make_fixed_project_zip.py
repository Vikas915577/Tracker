#!/usr/bin/env python3
"""Download the current public Tracker source, safely repair it, QA it, and zip the full project.

Run on a computer or in GitHub Codespaces with Python 3 and network access:
    python3 make_fixed_project_zip.py
It does not write to or push anything to GitHub. It creates Tracker-FIXED.zip locally.
"""
from __future__ import annotations
import argparse
import datetime as dt
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path, PurePosixPath

REPO_ZIP_URL = "https://github.com/Vikas915577/Tracker/archive/refs/heads/main.zip"
KIT_DIR = Path(__file__).resolve().parent


def safe_extract(zf: zipfile.ZipFile, dest: Path) -> None:
    root = dest.resolve()
    for info in zf.infolist():
        path = PurePosixPath(info.filename)
        if path.is_absolute() or ".." in path.parts:
            raise RuntimeError(f"Unsafe archive path rejected: {info.filename}")
        target = (dest / Path(*path.parts)).resolve()
        if target != root and root not in target.parents:
            raise RuntimeError(f"Archive path escapes destination: {info.filename}")
    zf.extractall(dest)


def find_repo(folder: Path) -> Path:
    candidates = [p for p in folder.iterdir() if p.is_dir()]
    for p in candidates:
        if (p / "app.js").is_file() and (p / "assets/webcore/app.js").is_file() and (p / ".github/workflows/build.yml").is_file():
            return p
    raise RuntimeError("Downloaded ZIP did not contain the expected Tracker source layout.")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--output", default="Tracker-FIXED.zip", help="output path for complete repaired project ZIP")
    ap.add_argument("--source-zip", help="optional already-downloaded GitHub source ZIP (offline/test use)")
    args = ap.parse_args()
    output = Path(args.output).resolve()
    with tempfile.TemporaryDirectory(prefix="tracker-v254-fix-") as tmp_name:
        work = Path(tmp_name)
        archive_path = Path(args.source_zip).resolve() if args.source_zip else work / "tracker-main.zip"
        if not args.source_zip:
            req = urllib.request.Request(REPO_ZIP_URL, headers={"User-Agent": "WinterArcTracker-Repair-Kit/1.0"})
            try:
                with urllib.request.urlopen(req, timeout=90) as response, archive_path.open("wb") as f:
                    shutil.copyfileobj(response, f)
            except Exception as exc:
                raise RuntimeError(f"Could not download current Tracker source from GitHub: {exc}") from exc
        if not archive_path.is_file():
            raise RuntimeError(f"Source ZIP not found: {archive_path}")
        extracted = work / "source"
        extracted.mkdir()
        with zipfile.ZipFile(archive_path) as zf:
            bad = zf.testzip()
            if bad:
                raise RuntimeError(f"Source ZIP integrity check failed at {bad}")
            safe_extract(zf, extracted)
        repo = find_repo(extracted)

        print("Applying backup-first repair to temporary source copy...")
        subprocess.run([sys.executable, str(KIT_DIR / "tracker_repair.py"), "--apply"], cwd=repo, check=True)
        print("Running post-repair QA...")
        subprocess.run([sys.executable, str(KIT_DIR / "qa_after_repair.py")], cwd=repo, check=True)

        report = (
            "WINTER ARC TRACKER — REPAIRED PROJECT EXPORT\n"
            f"Created: {dt.datetime.now(dt.timezone.utc).isoformat()}\n"
            "Source: Vikas915577/Tracker main archive downloaded for this run.\n"
            "Repairs: root JS wrapper, Get App page, direct APK path, PWA cache version, Pages/APK artifact workflow.\n"
            "QA: tracker_repair.py syntax checks and qa_after_repair.py passed before export.\n"
            "Data: user browser localStorage and live Supabase rows were not downloaded or changed.\n"
            "Publishing: this ZIP does not push or deploy to GitHub. Merge repaired source and wait for GitHub Actions to deploy.\n"
            "APK: this export contains the app source; GitHub Actions builds the APK. No prebuilt APK is claimed to be included.\n"
        )
        output.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=7) as out:
            for p in repo.rglob("*"):
                rel = p.relative_to(repo)
                parts = set(rel.parts)
                if ".git" in parts or "__pycache__" in parts or any(part.startswith(".tracker-repair-backup-") for part in rel.parts):
                    continue
                if p.is_file():
                    out.write(p, rel.as_posix())
            out.writestr("REPAIR-EXPORT-REPORT.txt", report)
        with zipfile.ZipFile(output) as zf:
            bad = zf.testzip()
            if bad:
                raise RuntimeError(f"Output ZIP integrity check failed: {bad}")
        print(f"Created complete repaired project ZIP: {output}")
        print("Reminder: this is a local ZIP only; it has not been pushed or deployed.")
    return 0

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"STOP: {exc}", file=sys.stderr)
        raise SystemExit(1)
