const fs=require('fs');
const path=require('path');
const dir=__dirname;
function fail(msg){console.error('FAIL:',msg);process.exitCode=1}
function ok(msg){console.log('PASS:',msg)}
const app=fs.readFileSync(path.join(dir,'app.js'),'utf8');
const sql=fs.readFileSync(path.join(dir,'backend-schema.sql'),'utf8');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
try{new Function(app);ok('JS syntax')}catch(e){fail('JS syntax: '+e.message)}
const tests=[
 [/const VERSION='V24\.1'/,'version V24.1'],
 [/const WINTER_ARC_START='2026-10-01'/,'Arc start'],
 [/const WINTER_ARC_END='2026-12-31'/,'Arc end'],
 [/const WINTER_ARC_LENGTH=92/,'Arc length 92'],
 [/function v24RebuildXp\(\)/,'XP rebuild present'],
 [/d<WINTER_ARC_START\|\|d>WINTER_ARC_END/,'XP current Arc guard'],
 [/Maximum 15 habits reached/,'15-habit cap'],
 [/data-add-custom/,'modal add-habit hook'],
 [/function v24Month\(\)/,'Month screen'],
 [/function v24Arc\(\)/,'Arc screen'],
 [/placeholder="Search Top 20 by name"/,'name-only rank search'],
 [/function v24RoutineCard\(\)/,'active routine card'],
 [/function v24RecoveryCard\(\)/,'recovery pass'],
 [/data-v24-freeze/,'freeze UI action'],
 [/Community sharing removed\/private/,'community off feedback'],
 [/function v24CloudSession\(\)/,'authenticated cloud session'],
 [/auth\.signInAnonymously\(\)/,'anonymous auth'],
 [/using \(id = auth\.uid\(\)\)/,'RLS own-row update'],
];
for(const [re,msg] of tests){if(re.test(app)||re.test(sql))ok(msg);else fail(msg)}
if(/using \(id = id\)/.test(sql))fail('tautological arc_users policy remains');else ok('no id=id policy');
if(/for insert to anon/i.test(sql))fail('anon insert policy remains');else ok('no anon write policies');
if(/for update to anon/i.test(sql))fail('anon update policy remains');else ok('no anon update policies');
if(/service-role/i.test(fs.readFileSync(path.join(dir,'cloud-config.js'),'utf8')) && !/Never put/.test(fs.readFileSync(path.join(dir,'cloud-config.js'),'utf8')))fail('possible service-role guidance issue'); else ok('frontend key guidance');
if(!html.includes('supabase-js@2'))fail('Supabase client not loaded by index');else ok('Supabase client tag');
if(!sw.includes("winter-arc-v24.1"))fail('SW cache not V24.1');else ok('SW cache version');
for(const f of ['icon-192.png','icon-512.png','creator-profile.jpg','creator-photo-1.jpg','creator-photo-2.jpg','creator-photo-3.jpg']){if(fs.existsSync(path.join(dir,f)))ok('asset '+f);else fail('missing asset '+f)}
