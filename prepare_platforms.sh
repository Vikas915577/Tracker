#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

for f in assets/webcore/index.html assets/webcore/app.js assets/webcore/cloud-config.js assets/webcore/manifest.json assets/webcore/v25-overrides.css; do
  test -f "$f" || { echo "Missing canonical webcore asset: $f" >&2; exit 1; }
done

flutter create --platforms=android,ios,web .
python3 tool/patch_android_manifest.py
