from pathlib import Path
import re
import sys

ROOT=Path(__file__).resolve().parents[1]
APP=(ROOT/'assets/webcore/app.js').read_text()
SW=(ROOT/'assets/webcore/sw.js').read_text()
SQL=(ROOT/'backend/backend-schema.sql').read_text()
WF=(ROOT/'.github/workflows/build.yml').read_text()

checks=[]
def ok(name,cond): checks.append((name,bool(cond)))

for p in [
    '.github/workflows/build.yml','.github/workflows/pages.yml','assets/webcore/index.html','assets/webcore/app.js',
    'assets/webcore/cloud-config.js','assets/webcore/v25-overrides.css','lib/main.dart','backend/backend-schema.sql',
    'tool/prepare_platforms.sh','tool/patch_android_manifest.py']:
    ok(f'file:{p}',(ROOT/p).is_file())

ok('arc constants',"WINTER_ARC_START='2026-10-01'" in APP and "WINTER_ARC_END='2026-12-31'" in APP and 'WINTER_ARC_LENGTH=92' in APP)
ok('max 15 habits', re.search(r'data\.habits\.length>=15',APP) is not None and 'slice(0,15)' in APP)
ok('habit creation date',"created:today()" in APP)
ok('future edit lock','Only Winter Arc dates can be edited.' in APP and "!canEdit(d)" in APP)
ok('today missing helper fixed',re.search(r'arcScore\s*=\s*function',APP) is not None and re.search(r'weeklyWins\s*=\s*function',APP) is not None)
ok('rank helper fixed',re.search(r'async function rankFetch',APP) is not None)
ok('rank name-only','instagram_handle||' not in APP and "String(x.display_name||'').toLowerCase().includes(q)" in APP)
ok('deterministic SQL order','u.id asc' in SQL)
ok('top20 SQL limit','least(coalesce(p_limit,20),100)' in SQL)
ok('exact rank RPC','create or replace function public.get_public_rank' in SQL and "rankFetch('get_public_rank'" in APP)
ok('cloud default off','cloudOptIn:false' in APP and 'publicProfile:false' in APP)
ok('public profile required for publish',"if(!data.cloudOptIn||!data.publicProfile)" in APP)
ok('private cloud snapshot','instagram_handle:data.profileInstagram' not in APP and 'habitNotes' not in APP.split('function cloudSnapshot',1)[1].split('async function cloudSync',1)[0])
ok('remote cleanup policy','arc_challenge_members_owner_delete' in SQL and 'arc_challenges_owner_delete' in SQL)
ok('service worker busts cache',"CACHE='winter-arc-v25.4'" in SW and "'./v25-overrides.css'" in SW)
ok('release APK workflow','flutter build apk --release' in WF and 'app-release.apk' in WF)
ok('workflow helper path','bash tool/prepare_platforms.sh' in WF and 'path: assets/webcore' in WF)

failed=[x for x in checks if not x[1]]
for name,p in checks: print(('PASS' if p else 'FAIL')+'  '+name)
print(f'\n{len(checks)-len(failed)}/{len(checks)} checks passed')
if failed: sys.exit(1)
