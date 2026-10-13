#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/tracker_repair.py"
printf '\nDry-run passed. Review the listed five files.\n'
read -r -p 'Apply safe repair and create backups now? Type YES: ' confirm
if [[ "$confirm" == "YES" ]]; then
  python3 "$SCRIPT_DIR/tracker_repair.py" --apply
  python3 "$SCRIPT_DIR/qa_after_repair.py"
else
  echo 'No files changed. To apply later, run: python3 '"$SCRIPT_DIR"'/tracker_repair.py --apply'
fi
