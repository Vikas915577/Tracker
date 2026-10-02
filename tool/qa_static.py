from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parents[1]
web = root / 'assets' / 'webcore'
app = (web / 'app.js').read_text(encoding='utf-8')
sql = (root / 'backend' / 'backend-schema.sql').read_text(encoding='utf-8')
required = {
    'v24.1 core version preserved marker': 'V24.1' in app,
    'v25.4 version': "const VERSION='V25.4'" in app,
    'canEdit': 'const canEdit=d=>String(d)<=today()' in app or 'function canEdit' in app,
    'Month': 'function v24Month()' in app,
    'Arc': 'function v24Arc()' in app,
    'Recovery': 'function v24RecoveryCard()' in app,
    'Routine': 'function v24RoutineCard()' in app,
    '15 habit cap': 'Maximum 15 habits reached' in app,
    'name-only Rank': 'Search Top 20 by name' in app,
    'anonymous auth': 'auth.signInAnonymously()' in app,
    'owner RLS': ('using (id = (select auth.uid()))' in sql or 'with check (id = (select auth.uid()))' in sql),
    'no tautological RLS': 'using (id = id)' not in sql,
    'no anon insert write policy': not re.search(r'for insert to anon', sql, re.I),
    'no anon update write policy': not re.search(r'for update to anon', sql, re.I),
}
failed=[]
for k,v in required.items():
    ok=bool(v)
    print(('PASS' if ok else 'FAIL')+': '+k)
    if not ok: failed.append(k)

for p in ['index.html','styles.css','cloud-config.js','manifest.json','sw.js',
          'creator-profile.jpg','creator-photo-1.jpg','creator-photo-2.jpg','creator-photo-3.jpg']:
    ok=(web/p).exists()
    print(('PASS' if ok else 'FAIL')+': asset '+p)
    if not ok: failed.append('asset '+p)

if 'data-v20-nav' not in app or 'data-v20-more' not in app:
    failed.append('legacy navigation hooks')
    print('FAIL: legacy navigation hooks')
else:
    print('PASS: legacy navigation hooks')

if failed:
    print('\nFAILED:', ', '.join(failed))
    sys.exit(1)
print('\nALL STATIC CHECKS PASS')
