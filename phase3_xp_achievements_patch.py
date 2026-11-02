#!/usr/bin/env python3
"""Phase 3 local-only XP, levels, achievements and insights enhancement.

Run only after the Phase 2 V26.0 stability patch has been applied and verified.
This patch changes app.js only. It does not touch backend files or user data.
"""
from __future__ import annotations
import argparse
from pathlib import Path

PHASE3_MARKER = "  /* ========================= PHASE 3 — XP, LEVELS & ACHIEVEMENTS ========================= */"
TODAY_ANCHOR = '${v24RecoveryCard()}<section class="v24-statbar">'
TODAY_REPLACEMENT = '${v24RecoveryCard()}${v26XpCard()}<section class="v24-statbar">'
TODAY_REPLACEMENT_WITH_PET = '${v24RecoveryCard()}${v26XpCard()}${v26PetCard()}<section class="v24-statbar">'
MORE_ANCHOR = "  function v20More(){"
STORE_KEY = "const KEY='progress_tracker_v17';"

PHASE3_BLOCK = r'''  /* ========================= PHASE 3 — XP, LEVELS & ACHIEVEMENTS ========================= */
  // Derived from the existing local XP ledger. Nothing is written to the backend.
  function v26LevelInfo(){
    const total=Math.max(0,Math.floor(Number(data.xp)||0));
    const level=Math.floor(total/100)+1;
    const inLevel=total%100;
    const title=level>=30?'Arc Legend':level>=20?'Champion':level>=10?'Consistent':level>=5?'Builder':'Starter';
    return {total,level,inLevel,toNext:100-inLevel,title,pct:inLevel};
  }

  function v26EnsureProgressStyles(){
    if(document.getElementById('v26-progress-style'))return;
    const style=document.createElement('style');
    style.id='v26-progress-style';
    style.textContent=`
      .v26-xp-card,.v26-achievement-card,.v26-insight-card{background:var(--card,#fff);color:var(--ink,#202522);border:1px solid var(--line,#e5e9e5);border-radius:18px;padding:13px;margin:10px 0;}
      .v26-xp-head,.v26-ach-head,.v26-insight-head{display:flex;align-items:center;justify-content:space-between;gap:9px;}
      .v26-xp-kicker{font-size:10px;letter-spacing:.11em;font-weight:950;color:var(--green,#318b4a);text-transform:uppercase;}
      .v26-xp-title{font-size:17px;font-weight:950;margin:3px 0 0;}
      .v26-xp-total{font-size:13px;font-weight:950;white-space:nowrap;}
      .v26-xp-track,.v26-ach-track,.v26-daily-track{height:9px;border-radius:99px;background:var(--soft,#edf1ed);overflow:hidden;margin-top:10px;}
      .v26-xp-track i,.v26-ach-track i,.v26-daily-track i{display:block;height:100%;border-radius:99px;background:var(--green,#318b4a);}
      .v26-xp-foot{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:7px;color:var(--muted,#68736a);font-size:11px;}
      .v26-xp-action{margin-top:10px;min-height:40px;width:100%;border:1px solid var(--line,#e5e9e5);background:var(--soft,#f2f5f2);color:var(--ink,#202522);border-radius:12px;font-size:12px;font-weight:900;}
      .v26-page-summary{padding:15px;border-radius:18px;background:linear-gradient(140deg,#eaf5ed,#fff);border:1px solid #d1e5d5;color:#202522;margin-bottom:12px;}
      body.dark .v26-page-summary{background:linear-gradient(140deg,#1c3023,#182019);border-color:#334b39;color:#eef5ef;}
      .v26-page-summary h2{font-size:22px;margin:5px 0 3px;}
      .v26-page-summary p{font-size:12px;line-height:1.45;margin:0;color:var(--muted,#68736a);}
      .v26-ach-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
      .v26-achievement-card{padding:11px;margin:0;min-width:0;}
      .v26-achievement-card.locked{opacity:.72;}
      .v26-ach-icon{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:var(--soft,#edf1ed);font-size:19px;flex:0 0 auto;}
      .v26-ach-title{font-size:12px;font-weight:950;line-height:1.25;margin-top:9px;}
      .v26-ach-desc{font-size:10px;line-height:1.4;color:var(--muted,#68736a);margin-top:4px;min-height:28px;}
      .v26-ach-progress{font-size:10px;color:var(--muted,#68736a);display:flex;justify-content:space-between;gap:5px;margin-top:7px;}
      .v26-ach-track{height:6px;margin-top:5px;}
      .v26-daily-row{display:grid;grid-template-columns:42px minmax(0,1fr) 48px;gap:8px;align-items:center;margin:10px 0;}
      .v26-daily-day{font-size:11px;font-weight:850;}
      .v26-daily-value{text-align:right;font-size:11px;font-weight:950;font-variant-numeric:tabular-nums;}
      .v26-daily-track{height:8px;margin:0;}
      .v26-insight-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
      .v26-insight-metric{padding:11px;border-radius:14px;background:var(--soft,#f1f4f1);min-width:0;}
      .v26-insight-metric b{display:block;font-size:19px;line-height:1.1;}
      .v26-insight-metric span{display:block;font-size:10px;color:var(--muted,#68736a);margin-top:4px;}
      .v26-section-title{font-size:14px;font-weight:950;margin:0 0 9px;}
      .v26-local-note{font-size:10px;line-height:1.45;color:var(--muted,#68736a);margin-top:10px;}
      @media(max-width:360px){.v26-ach-grid{grid-template-columns:1fr}.v26-xp-title{font-size:15px;}}
    `;
    document.head.appendChild(style);
  }

  function v26AchievementCatalog(){
    const s=stats();
    const wins=Math.max(0,Number(s.completed)||0);
    const best=Math.max(0,...data.habits.map(h=>Number(habitStats(h).longest)||0));
    const day=typeof v13ArcDay==='function'?v13ArcDay():0;
    const lv=v26LevelInfo().level;
    const eligibleToday=data.habits.filter(h=>canUseHabitOn(h,today()));
    const perfectDay=eligibleToday.length>0&&eligibleToday.every(h=>done(h,today()));
    const last7=allDates().slice(-7);
    const perfectWeek=last7.length===7&&data.habits.length>0&&last7.every(d=>{
      const eligible=data.habits.filter(h=>canUseHabitOn(h,d));
      return eligible.length>0&&eligible.every(h=>done(h,d));
    });
    return [
      {id:'first-win',group:'Wins',icon:'🌱',title:'First Win',description:'Complete your first habit.',value:wins,target:1,unit:'wins'},
      {id:'wins-10',group:'Wins',icon:'✅',title:'10 Wins',description:'Build your first set of completed actions.',value:wins,target:10,unit:'wins'},
      {id:'wins-25',group:'Wins',icon:'🎯',title:'25 Wins',description:'Keep showing up for the small actions.',value:wins,target:25,unit:'wins'},
      {id:'wins-50',group:'Wins',icon:'⚡',title:'50 Wins',description:'A meaningful history of daily progress.',value:wins,target:50,unit:'wins'},
      {id:'wins-100',group:'Wins',icon:'💯',title:'100 Wins',description:'Cross the 100 completed-habit mark.',value:wins,target:100,unit:'wins'},
      {id:'wins-250',group:'Wins',icon:'🏅',title:'250 Wins',description:'A quarter-thousand useful actions.',value:wins,target:250,unit:'wins'},
      {id:'streak-3',group:'Streaks',icon:'🔥',title:'3-Day Streak',description:'Repeat one habit for three days.',value:best,target:3,unit:'days'},
      {id:'streak-7',group:'Streaks',icon:'🗓️',title:'7-Day Streak',description:'Keep one habit moving for a full week.',value:best,target:7,unit:'days'},
      {id:'streak-14',group:'Streaks',icon:'💪',title:'14-Day Streak',description:'Two weeks of repeatable action.',value:best,target:14,unit:'days'},
      {id:'streak-30',group:'Streaks',icon:'🏆',title:'30-Day Streak',description:'A full month of consistency.',value:best,target:30,unit:'days'},
      {id:'streak-60',group:'Streaks',icon:'🌟',title:'60-Day Streak',description:'Two months on one habit.',value:best,target:60,unit:'days'},
      {id:'streak-92',group:'Streaks',icon:'❄️',title:'92-Day Streak',description:'Carry one habit across the full Arc.',value:best,target:92,unit:'days'},
      {id:'perfect-day',group:'Consistency',icon:'☀️',title:'Perfect Day',description:'Complete every habit eligible today.',value:perfectDay?1:0,target:1,unit:'day'},
      {id:'perfect-week',group:'Consistency',icon:'📅',title:'Perfect Week',description:'Complete every eligible habit for seven Arc days.',value:perfectWeek?1:0,target:1,unit:'week'},
      {id:'level-5',group:'Levels',icon:'🧱',title:'Level 5',description:'Reach Builder level.',value:lv,target:5,unit:'level'},
      {id:'level-10',group:'Levels',icon:'🚀',title:'Level 10',description:'Reach Consistent level.',value:lv,target:10,unit:'level'},
      {id:'arc-day-7',group:'Arc Journey',icon:'🌿',title:'Day 7',description:'Reach the first Arc week.',value:day,target:7,unit:'day'},
      {id:'arc-day-30',group:'Arc Journey',icon:'🌙',title:'Day 30',description:'Complete the first month of the Arc journey.',value:day,target:30,unit:'day'},
      {id:'arc-day-60',group:'Arc Journey',icon:'🌠',title:'Day 60',description:'Reach the second-month checkpoint.',value:day,target:60,unit:'day'},
      {id:'arc-day-90',group:'Arc Journey',icon:'🏁',title:'Day 90',description:'Reach the final stretch of the Arc.',value:day,target:90,unit:'day'},
      {id:'arc-day-92',group:'Arc Journey',icon:'👑',title:'Arc Day 92',description:'Reach the final day of Winter Arc 2026.',value:day,target:92,unit:'day'}
    ].map(x=>Object.assign({},x,{unlocked:Number(x.value)>=Number(x.target)}));
  }

  function v26XpCard(){
    v26EnsureProgressStyles();
    const x=v26LevelInfo();
    const next=v26AchievementCatalog().find(a=>!a.unlocked);
    return `<section class="v26-xp-card"><div class="v26-xp-head"><div><div class="v26-xp-kicker">XP & LEVEL</div><div class="v26-xp-title">Level ${x.level} · ${x.title}</div></div><div class="v26-xp-total">${x.total.toLocaleString()} XP</div></div><div class="v26-xp-track"><i style="width:${x.pct}%"></i></div><div class="v26-xp-foot"><span>${x.inLevel}/100 XP this level</span><span>${x.toNext} XP to next level</span></div><button class="v26-xp-action" data-v20-more="achievements">🏆 View ${next?`next: ${escapeHtml(next.title)}`:'all achievements'} →</button></section>`;
  }

  function achievementsPage(){
    v26EnsureProgressStyles();
    const rows=v26AchievementCatalog();
    const unlocked=rows.filter(x=>x.unlocked).length;
    const groups=['Wins','Streaks','Consistency','Levels','Arc Journey'];
    return `<div class="v24-page"><section class="v26-page-summary"><span class="v26-xp-kicker">WINTER ARC MILESTONES</span><h2>${unlocked} / ${rows.length} unlocked</h2><p>Badges are calculated from your existing Arc history. No extra claims, accounts or cloud sync are required.</p></section>${groups.map(group=>{const items=rows.filter(x=>x.group===group);return `<section class="v26-insight-card"><h2 class="v26-section-title">${escapeHtml(group)}</h2><div class="v26-ach-grid">${items.map(x=>{const pct=Math.min(100,Math.round(Math.max(0,Number(x.value)||0)/Math.max(1,Number(x.target)||1)*100));const shown=Math.min(Math.max(0,Number(x.value)||0),Number(x.target)||1);return `<article class="v26-achievement-card ${x.unlocked?'':'locked'}"><div class="v26-ach-head"><span class="v26-ach-icon">${x.unlocked?x.icon:'🔒'}</span><span class="v26-xp-kicker">${x.unlocked?'UNLOCKED':'IN PROGRESS'}</span></div><div class="v26-ach-title">${escapeHtml(x.title)}</div><div class="v26-ach-desc">${escapeHtml(x.description)}</div><div class="v26-ach-progress"><span>${shown.toLocaleString()} / ${Number(x.target).toLocaleString()} ${escapeHtml(x.unit)}</span><b>${pct}%</b></div><div class="v26-ach-track"><i style="width:${pct}%"></i></div></article>`;}).join('')}</div></section>`;}).join('')}<p class="v26-local-note">Your badges use the existing local tracker data. They do not change XP, rewrite history or send data to a server.</p></div>`;
  }

  function v26XpForDate(d){
    let points=0;
    for(const [key,value] of Object.entries(data.xpEvents||{})){
      if(String(key).slice(String(key).lastIndexOf('|')+1)===d)points+=Math.max(0,Number(value)||0);
    }
    const bonus=data.bonusEvents?.[d]||{};
    return Math.max(0,Math.round(points+(Number(bonus.first)||0)+(Number(bonus.full)||0)));
  }

  function insightsPage(){
    v26EnsureProgressStyles();
    const x=v26LevelInfo();
    const days=allDates().slice(-7);
    const values=days.map(d=>({date:d,xp:v26XpForDate(d),wins:data.habits.filter(h=>canUseHabitOn(h,d)&&done(h,d)).length}));
    const weekXp=values.reduce((n,d)=>n+d.xp,0);
    const weekWins=values.reduce((n,d)=>n+d.wins,0);
    const maxXp=Math.max(1,...values.map(d=>d.xp));
    const best=data.habits.map(h=>({name:h.name,icon:h.icon||'✅',wins:habitStats(h).total})).sort((a,b)=>b.wins-a.wins)[0];
    return `<div class="v24-page"><section class="v26-page-summary"><span class="v26-xp-kicker">YOUR PROGRESS</span><h2>${x.total.toLocaleString()} XP · Level ${x.level}</h2><p>${x.toNext} XP to the next level. Your local history remains available without Community Sync.</p></section><section class="v26-insight-card"><h2 class="v26-section-title">Last 7 Arc days</h2><div class="v26-insight-grid"><div class="v26-insight-metric"><b>${weekXp.toLocaleString()}</b><span>XP earned</span></div><div class="v26-insight-metric"><b>${weekWins.toLocaleString()}</b><span>Completed wins</span></div><div class="v26-insight-metric"><b>${values.filter(d=>d.wins>0).length}</b><span>Active days</span></div><div class="v26-insight-metric"><b>${weeklyScore()}%</b><span>Weekly consistency</span></div></div></section><section class="v26-insight-card"><h2 class="v26-section-title">Daily XP</h2>${values.length?values.map(d=>{const pct=Math.round(d.xp/maxXp*100);return `<div class="v26-daily-row"><span class="v26-daily-day">${dateObj(d.date).toLocaleDateString(undefined,{weekday:'short'})}</span><div class="v26-daily-track"><i style="width:${pct}%"></i></div><span class="v26-daily-value">${d.xp} XP</span></div>`;}).join(''):'<div class="v24-empty"><b>No Arc days yet.</b><span>Your XP history will appear here after the Arc starts.</span></div>'}</section><section class="v26-insight-card"><h2 class="v26-section-title">Strongest habit</h2>${best&&best.wins?`<div class="v24-routine-next"><span>${escapeHtml(best.icon)}</span><div><b>${escapeHtml(best.name)}</b><small>${best.wins} completed Arc days</small></div></div>`:'<div class="v24-empty"><b>Your first win is waiting.</b><span>Complete a habit to start seeing your strongest pattern.</span></div>'}</section><p class="v26-local-note">XP is calculated from the existing check and daily-bonus ledger. This screen is local-only and does not require a backend.</p></div>`;
  }

'''


def patch_app_text(source: str) -> tuple[str, list[str]]:
    changes: list[str] = []
    if "const VERSION='V26.0';" not in source:
        raise ValueError("Phase 2 V26.0 must be present before Phase 3; refusing to patch old source.")
    if STORE_KEY not in source:
        raise ValueError("Existing progress_tracker_v17 store key missing; refusing to patch.")
    binding=source.find("let cloudSync = async function")
    v19=source.find("/* ========================= V19 — ARC LEAGUE =========================")
    capture=source.find("const baseCloudSyncV19=cloudSync;")
    boot=source.find("window.__WINTER_ARC_BOOTED = true;")
    if binding < 0 or v19 < 0 or capture < 0 or not (binding < v19 < capture) or boot < 0:
        raise ValueError("Phase 2 cloudSync binding / boot marker checks failed; finish Phase 2 first.")

    marker_count=source.count(PHASE3_MARKER)
    if marker_count:
        required=("function v26LevelInfo()", "function v26AchievementCatalog()", "function v26XpCard()", "function achievementsPage()", "function insightsPage()")
        if marker_count != 1 or any(x not in source for x in required) or not any(x in source for x in (TODAY_REPLACEMENT, TODAY_REPLACEMENT_WITH_PET)):
            raise ValueError("A partial Phase 3 block exists; manual review is required.")
        return source, ["Phase 3 already applied (idempotent no-op)"]

    if source.count(TODAY_ANCHOR) != 1:
        raise ValueError("Expected one V24.1 Today-screen XP insertion point; refusing to modify UI.")
    if source.count(MORE_ANCHOR) < 1:
        raise ValueError("V24.1 More-screen function boundary not found; refusing to modify UI.")
    if "function achievementsPage()" in source or "function insightsPage()" in source:
        raise ValueError("Achievement/insight page already exists; manual merge required.")

    source=source.replace(TODAY_ANCHOR,TODAY_REPLACEMENT,1)
    # The source currently has an earlier V20 More renderer and a later V24.1
    # replacement. Insert before the last (active) renderer, not the legacy one.
    at=source.rindex(MORE_ANCHOR)
    source=source[:at]+PHASE3_BLOCK+source[at:]
    changes.extend(["XP and level progress card added to Today", "21 derived achievement milestones added", "Achievements and Insights pages implemented"])

    # Postconditions: data store and backend remain outside the patch.
    if source.count(PHASE3_MARKER)!=1:
        raise ValueError("Phase 3 marker validation failed.")
    for fn in ("function v26LevelInfo()", "function v26AchievementCatalog()", "function v26XpCard()", "function achievementsPage()", "function insightsPage()"):
        if source.count(fn)!=1:
            raise ValueError(f"Expected one {fn} declaration.")
    if source.count(TODAY_REPLACEMENT)!=1:
        raise ValueError("Today-screen XP card insertion validation failed.")
    if STORE_KEY not in source or "progress_tracker_v16" not in source:
        raise ValueError("Local progress/migration keys must remain unchanged.")
    marker_pos=source.index(PHASE3_MARKER)
    next_more=source.find(MORE_ANCHOR,marker_pos)
    if next_more < 0:
        raise ValueError("Phase 3 block is not placed before the active More renderer.")
    block=source[marker_pos:next_more]
    for forbidden in ("fetch(", "supabase", "CLOUD_CFG", "localStorage.setItem", "localStorage.removeItem"):
        if forbidden.lower() in block.lower():
            raise ValueError(f"Phase 3 must remain local-only; found {forbidden}.")
    return source, changes


def patch_repo(root: Path) -> dict[str, object]:
    app_path=root/"app.js"
    if not app_path.is_file():
        raise ValueError("Run from Tracker repository root; app.js missing.")
    original=app_path.read_text(encoding="utf-8")
    updated,changes=patch_app_text(original)
    if updated!=original:
        app_path.write_text(updated,encoding="utf-8")
    return {"app_changes":changes,"files_modified":["app.js"] if updated!=original else [],"store_key":"progress_tracker_v17 (unchanged)","backend_touched":False}


def self_test() -> None:
    fixture="""(function(){
'use strict';
const VERSION='V26.0';
const KEY='progress_tracker_v17';
const OLD_KEYS=['progress_tracker_v16'];
let cloudSync = async function (_opts = {}) { return false; };
/* ========================= V19 — ARC LEAGUE ========================= */
const baseCloudSyncV19=cloudSync;
window.__WINTER_ARC_BOOTED = true;
function v20Today(){return `today`; }
${v24RecoveryCard()}<section class="v24-statbar">
  function v20More(){ return 'legacy'; }
  function v20Menu(){ return ''; }
  function v20More(){ return 'active'; }
})();
"""
    fixed,changes=patch_app_text(fixture)
    assert PHASE3_MARKER in fixed
    assert fixed.rfind(MORE_ANCHOR) > fixed.index(PHASE3_MARKER)
    assert fixed.count(MORE_ANCHOR) == 2
    assert TODAY_REPLACEMENT in fixed
    assert "function achievementsPage()" in fixed and "function insightsPage()" in fixed
    again,second=patch_app_text(fixed)
    assert again==fixed and second==["Phase 3 already applied (idempotent no-op)"]
    pet_ready=fixed.replace(TODAY_REPLACEMENT,TODAY_REPLACEMENT_WITH_PET,1)
    pet_again,pet_changes=patch_app_text(pet_ready)
    assert pet_again==pet_ready and pet_changes==["Phase 3 already applied (idempotent no-op)"]
    print("PASS: Phase 3 patch self-test (duplicate More renderers, Phase 5-compatible idempotency, local-only)")


def main() -> int:
    parser=argparse.ArgumentParser()
    parser.add_argument("--repo",default=".")
    parser.add_argument("--self-test",action="store_true")
    args=parser.parse_args()
    if args.self_test:
        self_test();return 0
    result=patch_repo(Path(args.repo).resolve())
    print("Phase 3 patch result:")
    for k,v in result.items(): print(f"- {k}: {v}")
    print("No local data key, backend, database or cloud setting was changed.")
    return 0

if __name__=="__main__":
    try: raise SystemExit(main())
    except (OSError,ValueError,AssertionError) as exc: raise SystemExit(f"PHASE 3 PATCH STOPPED SAFELY: {exc}")
