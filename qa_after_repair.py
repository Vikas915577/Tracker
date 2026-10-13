#!/usr/bin/env python3
"""Static checks after tracker_repair.py --apply; run from repository root."""
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path.cwd()
required = [
    'app.js', 'assets/webcore/app.js', 'sw.js', 'assets/webcore/sw.js',
    '.github/workflows/build.yml', 'assets/webcore/index.html',
    'assets/webcore/styles.css', 'assets/webcore/manifest.json',
    'assets/webcore/cloud-config.js', 'assets/webcore/v25-overrides.css',
]
failed = []
for name in required:
    ok = (ROOT / name).is_file()
    print(('PASS' if ok else 'FAIL') + '  file exists: ' + name)
    if not ok:
        failed.append(name)
if failed:
    print('Missing required files; run from repository root.')
    sys.exit(1)

root_app = (ROOT / 'app.js').read_text(encoding='utf-8')
web_app = (ROOT / 'assets/webcore/app.js').read_text(encoding='utf-8')
checks = {
    'root/webcore app sources match': root_app == web_app,
    'no duplicate IIFE ending': not root_app.endswith('\n\n})();\n\n})();\n'),
    'Get App calls existing view': "morePanel==='getapp'?v16GetAppPage()" in web_app,
    'direct APK path present': './downloads/winter-arc-tracker.apk' in web_app,
    'legacy Get App function call removed': "morePanel==='getapp'?getAppPage()" not in web_app,
}
for rel in ('sw.js', 'assets/webcore/sw.js'):
    sw = (ROOT / rel).read_text(encoding='utf-8')
    checks[f'{rel} cache version refreshed'] = "CACHE='winter-arc-v25.4'" in sw
    checks[f'{rel} CSS is precached'] = "'./styles.css','./v25-overrides.css','./app.js'" in sw
workflow = (ROOT / '.github/workflows/build.yml').read_text(encoding='utf-8')
checks['Pages waits for APK build'] = bool(re.search(r'deploy-pages:\s*\n\s+needs:\s+build-apk', workflow))
checks['APK artifact downloaded'] = 'actions/download-artifact@v4' in workflow and 'winter-arc-v25-debug-apk' in workflow
checks['APK copied to website downloads'] = 'downloads/winter-arc-tracker.apk' in workflow
checks['Pages publishes assembled site'] = 'path: _site' in workflow
for name, ok in checks.items():
    print(('PASS' if ok else 'FAIL') + '  ' + name)
    if not ok:
        failed.append(name)

try:
    node = subprocess.run(['node', '--version'], text=True, capture_output=True, check=False)
    if node.returncode == 0:
        for rel in ('app.js', 'assets/webcore/app.js', 'sw.js', 'assets/webcore/sw.js'):
            r = subprocess.run(['node', '--check', rel], text=True, capture_output=True)
            ok = r.returncode == 0
            print(('PASS' if ok else 'FAIL') + '  node --check ' + rel)
            if not ok:
                print((r.stderr or r.stdout).strip())
                failed.append('node syntax ' + rel)
    else:
        print('WARN  Node.js unavailable; GitHub Actions must perform JS syntax checks.')
except FileNotFoundError:
    print('WARN  Node.js unavailable; GitHub Actions must perform JS syntax checks.')

print(f'\nQA result: {"PASS" if not failed else "FAIL"} ({len(failed)} failed checks)')
sys.exit(1 if failed else 0)
