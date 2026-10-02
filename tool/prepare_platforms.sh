#!/usr/bin/env bash
set -euo pipefail
flutter create --platforms=android,ios,web .
python3 ./tool/patch_android_manifest.py
# assets/webcore is already part of the production package; keep it intact.
# Do not delete it because the Flutter WebView loads the bundled local web core.
echo "Flutter platforms prepared; assets/webcore preserved."
