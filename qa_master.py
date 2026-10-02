from pathlib import Path
import re
import sys

root=Path(__file__).resolve().parents[1]
web=root/'assets'/'webcore'
app=(web/'app.js').read_text(encoding='utf-8')
sql=(root/'backend'/'backend-schema.sql').read_text(encoding='utf-8')
main=(root/'lib'/'main.dart').read_text(encoding='utf-8')
pub=(root/'pubspec.yaml').read_text(encoding='utf-8')
html=(web/'index.html').read_text(encoding='utf-8')
checks=[
 ('V25.3 release version', "const VERSION='V25.3'" in app),
 ('V24.1 feature core preserved', 'function v24Month()' in app and 'function v24Arc()' in app and 'function routineHtml()' in app),
 ('canEdit present', bool(re.search(r'canEdit\s*=',app))),
 ('Month preserved', 'function v24Month()' in app),
 ('Arc preserved', 'function v24Arc()' in app),
 ('Recovery preserved', 'function v24RecoveryCard()' in app),
 ('Routine preserved', 'function v24RoutineCard()' in app),
 ('15 habit cap', 'Maximum 15 habits reached' in app),
 ('name-only rank search', 'Search Top 20 by name' in app),
 ('anonymous auth', 'auth.signInAnonymously()' in app),
 ('owner RLS', 'using (id = auth.uid())' in sql),
 ('no tautological id=id policy', 'using (id = id)' not in sql),
 ('no anon write policy', not re.search(r'for (insert|update) to anon',sql,re.I)),
 ('Flutter shell uses InAppWebView', 'InAppWebView(' in main),
 ('Flutter shell bundles local web core', 'assets/webcore/' in pub and 'assets/webcore/index.html' in main),
 ('no package.json', not (root/'package.json').exists()),
 ('no npm build command', 'npm ' not in '\n'.join((root/'.github/workflows/build.yml').read_text().splitlines())),
 ('V25 readability override linked', 'v25-overrides.css' in html),
 ('creator credit today present', 'v24CreatorCompact()' in app and 'CREDIT BY' in app),
 ('rank player does not render Instagram', 'v20-ranksub\">${escapeHtml(x.instagram_handle' not in app),
]
failed=[]
for k,v in checks:
    print(('PASS' if v else 'FAIL')+': '+k)
    if not v: failed.append(k)

for f in ['creator-profile.jpg','creator-photo-1.jpg','creator-photo-2.jpg','creator-photo-3.jpg','icon-192.png','icon-512.png','styles.css','cloud-config.js','manifest.json','sw.js','v25-overrides.css']:
    ok=(web/f).exists();print(('PASS' if ok else 'FAIL')+': asset '+f)
    if not ok: failed.append('asset '+f)

if failed:
    print('\nFAILED:',', '.join(failed));sys.exit(1)
print('\nALL MASTER STATIC CHECKS PASS')
