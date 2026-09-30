const fs=require('fs');
const assert=require('assert');
const app=fs.readFileSync('app.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const idx=fs.readFileSync('index.html','utf8');
const man=JSON.parse(fs.readFileSync('manifest.json','utf8'));
new Function(app); new Function(sw);
function has(x){assert(app.includes(x),`missing: ${x}`)}
assert(idx.includes('V19'));
assert(/src="app\.js"/.test(idx));
assert(man.shortcuts.some(x=>x.url.includes('tab=rank')),'rank shortcut missing');
assert(/winter-arc-v19\.0/.test(sw),'v19 cache missing');
for(const x of ['V19 — ARC LEAGUE','data-v19-nav','function v19RankPage','function v19ShareRank','function v19WeekInfo','week_score','rank_score','league','data-v19-challenge-create','data-v19-challenge-share'])has(x);
assert(/canvas\.width=1080;canvas\.height=1350/.test(app));
assert(/public_profile = true/.test(fs.readFileSync('backend-schema.sql','utf8')),'public select policy missing');
console.log('V19 static test: PASS');
