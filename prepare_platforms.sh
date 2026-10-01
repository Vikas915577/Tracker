#!/usr/bin/env bash
set -euo pipefail
flutter create --platforms=android,ios,web .
python3 tool/patch_android_manifest.py
