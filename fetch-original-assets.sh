#!/usr/bin/env bash
# Fetch the exact source CSS, PWA icons and creator photos from the original V25.4 repo.
set -euo pipefail
cd "$(dirname "$0")/.."
SOURCE_ASSETS="${SOURCE_ASSETS:-https://raw.githubusercontent.com/Vikas915577/Tracker/main}"
for asset in styles.css v25-overrides.css manifest.json icon-192.png icon-512.png creator-profile.jpg creator-photo-1.jpg creator-photo-2.jpg creator-photo-3.jpg; do
  echo "Fetching $asset"
  curl --fail --silent --show-error --location --retry 3 --retry-delay 2 "$SOURCE_ASSETS/$asset" -o "$asset"
  test -s "$asset"
done
echo "Original website assets are ready."
