#!/usr/bin/env python3
"""Phase 5: add a local-only Virtual Pet and small premium UI layer.

Requires Phase 2/3/4 markers. All companion state is stored as a field inside
Winter Arc's existing progress_tracker_v17 object. No new storage key, backend,
network request, database, or XP grant is introduced.
"""
from __future__ import annotations
import argparse
from pathlib import Path
import re

STORE_KEY = "const KEY='progress_tracker_v17';"
P2_BINDING = "let cloudSync = async function"
P3_MARKER = "PHASE 3 — XP, LEVELS & ACHIEVEMENTS"
P4_MARKER = "/* ========================= PHASE 4 — LOCAL ARCADE ========================= */"
P5_MARKER = "/* ========================= PHASE 5 — VIRTUAL PET & PREMIUM UI ========================= */"
TODAY_ANCHOR = '${v24RecoveryCard()}${v26XpCard()}<section class="v24-statbar">'
TODAY_REPLACEMENT = '${v24RecoveryCard()}${v26XpCard()}${v26PetCard()}<section class="v24-statbar">'
MORE_HEAD = "  function v20More(){"
MORE_END = "\n  function v20Shell()"
PANEL_ANCHOR = "morePanel==='arcade'?v26ArcadeLaunchPage():"
TILE_ANCHOR = "${tile('🎮','Arcade','24 offline games from YaarJam','arcade')}"
FINAL_RENDER = "  v25RecordOpen();\n  renderV20();"

P5_BLOCK = r'''/* ========================= PHASE 5 — VIRTUAL PET & PREMIUM UI ========================= */
  // A small local companion. Its growth is derived from existing XP; pet care
  // never awards XP and is saved inside the existing progress_tracker_v17 data.
  function v26PetState(){
    const raw=data.arcPet&&typeof data.arcPet==='object'?data.arcPet:{};
    const actions=raw.actionsByDate&&typeof raw.actionsByDate==='object'?raw.actionsByDate:{};
    const todayActions=Array.isArray(actions[today()])?actions[today()].filter(x=>['feed','play','rest'].includes(x)):[];
    const bond=Math.max(0,Math.floor(Number(raw.bond)||0));
    return {name:String(raw.name||'Frost').slice(0,18),bond,actionsByDate:actions,todayActions};
  }

  function v26PetLevel(){
    const total=Math.max(0,Math.floor(Number(data.xp)||0));
    const level=Math.floor(total/250)+1;
    const xp=total%250;
    const forms=[['🥚','Snow Egg'],['🐣','Snowling'],['🦊','Frost Fox'],['🐺','Arc Guardian'],['🐉','Winter Legend']];
    const form=forms[Math.min(forms.length-1,Math.floor((level-1)/3))];
    return {level,xp,toNext:250-xp,pct:Math.round(xp/250*100),icon:form[0],form:form[1]};
  }

  function v26EnsurePetStyles(){
    if(document.getElementById('v26-pet-style'))return;
    const style=document.createElement('style');style.id='v26-pet-style';
    style.textContent=`
      .v26-pet-card,.v26-pet-page{position:relative;overflow:hidden;margin:10px 0;padding:14px;border:1px solid var(--line,#e5e9e5);border-radius:20px;background:linear-gradient(135deg,#edf7f0 0%,#fff 72%);color:#202922;}
      body.dark .v26-pet-card,body.dark .v26-pet-page{background:linear-gradient(135deg,#1c3024 0%,#182019 72%);border-color:#344b3b;color:#edf6ef;}
      .v26-pet-card:after,.v26-pet-page:after{content:"";position:absolute;width:150px;height:150px;right:-75px;top:-85px;border-radius:50%;background:rgba(91,167,111,.12);pointer-events:none;}
      .v26-pet-top{display:grid;grid-template-columns:68px minmax(0,1fr) auto;gap:10px;align-items:center;position:relative;z-index:1;}
      .v26-pet-avatar{width:68px;height:68px;border-radius:22px;display:grid;place-items:center;font-size:37px;background:linear-gradient(145deg,#d9f0df,#f9fff9);border:1px solid #c8e1ce;box-shadow:inset 0 1px 0 #fff;}
      body.dark .v26-pet-avatar{background:linear-gradient(145deg,#304f39,#1f3024);border-color:#45624b;}
      .v26-pet-kicker{font-size:9px;letter-spacing:.12em;font-weight:950;text-transform:uppercase;color:#31824a;}
      body.dark .v26-pet-kicker{color:#9bd7a9;}
      .v26-pet-name{font-size:18px;font-weight:950;letter-spacing:-.03em;margin:2px 0;}
      .v26-pet-sub{font-size:10px;color:var(--muted,#68736a);line-height:1.35;}
      .v26-pet-level{font-size:11px;font-weight:950;border:1px solid #cde2d1;border-radius:11px;padding:7px 9px;background:rgba(255,255,255,.65);white-space:nowrap;}
      body.dark .v26-pet-level{background:#263b2c;border-color:#45624b;color:#eaf5ec;}
      .v26-pet-track{height:8px;border-radius:99px;background:rgba(90,130,98,.16);overflow:hidden;margin-top:11px;position:relative;z-index:1;}
      .v26-pet-track i{display:block;height:100%;background:linear-gradient(90deg,#3c9a59,#83c992);border-radius:99px;}
      .v26-pet-foot{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:6px;font-size:10px;color:var(--muted,#68736a);position:relative;z-index:1;}
      .v26-pet-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:12px;position:relative;z-index:1;}
      .v26-pet-action{min-height:42px;border:1px solid #d7e6da;border-radius:12px;background:rgba(255,255,255,.76);color:#26392b;font-size:11px;font-weight:900;padding:7px 4px;}
      .v26-pet-action:disabled{opacity:.52;}
      body.dark .v26-pet-action{background:#23372a;color:#ecf5ee;border-color:#405b47;}
      .v26-pet-open{display:block;width:100%;min-height:40px;margin-top:10px;border:1px solid #cfe2d3;border-radius:12px;background:rgba(255,255,255,.58);color:#2d7242;font-size:11px;font-weight:950;position:relative;z-index:1;}
      body.dark .v26-pet-open{background:#223629;color:#a8e0b4;border-color:#405b47;}
      .v26-pet-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:12px 0;position:relative;z-index:1;}
      .v26-pet-stat{padding:10px 7px;border-radius:13px;background:rgba(128,165,135,.12);text-align:center;}
      .v26-pet-stat b{display:block;font-size:17px;line-height:1.1;}
      .v26-pet-stat span{display:block;font-size:9px;color:var(--muted,#68736a);margin-top:4px;}
      .v26-pet-note{font-size:10px;line-height:1.45;color:var(--muted,#68736a);margin-top:9px;position:relative;z-index:1;}
      @media(max-width:350px){.v26-pet-top{grid-template-columns:56px minmax(0,1fr);}.v26-pet-avatar{width:56px;height:56px;font-size:31px}.v26-pet-level{grid-column:2;justify-self:start}.v26-pet-name{font-size:16px}}
    `;
    document.head.appendChild(style);
  }

  function v26PetCard(){
    v26EnsurePetStyles();
    const pet=v26PetState(),lv=v26PetLevel(),used=pet.todayActions;
    const labels=[['feed','🍎 Feed'],['play','🎾 Play'],['rest','🌙 Rest']];
    return `<section class="v26-pet-card"><div class="v26-pet-top"><div class="v26-pet-avatar" aria-hidden="true">${lv.icon}</div><div><div class="v26-pet-kicker">YOUR ARC COMPANION</div><div class="v26-pet-name">${escapeHtml(pet.name)}</div><div class="v26-pet-sub">${escapeHtml(lv.form)} · growing with your Arc progress</div></div><span class="v26-pet-level">Lv ${lv.level}</span></div><div class="v26-pet-track"><i style="width:${lv.pct}%"></i></div><div class="v26-pet-foot"><span>${lv.xp}/250 companion XP</span><span>${lv.toNext} to next form</span></div><div class="v26-pet-actions">${labels.map(([id,label])=>`<button class="v26-pet-action" data-v26-pet-action="${id}" ${used.includes(id)||used.length>=3?'disabled':''}>${used.includes(id)?'✓ ':''}${label}</button>`).join('')}</div><button class="v26-pet-open" data-v20-more="pet">Open companion & care history →</button></section>`;
  }

  function v26PetPage(){
    v26EnsurePetStyles();
    const pet=v26PetState(),lv=v26PetLevel(),used=pet.todayActions;
    const history=Object.keys(pet.actionsByDate).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort().slice(-7).reverse();
    const actions=[['feed','🍎 Feed'],['play','🎾 Play'],['rest','🌙 Rest']];
    return `<div class="v24-page"><section class="v26-pet-page"><div class="v26-pet-top"><div class="v26-pet-avatar">${lv.icon}</div><div><div class="v26-pet-kicker">WINTER ARC COMPANION</div><div class="v26-pet-name">${escapeHtml(pet.name)}</div><div class="v26-pet-sub">${escapeHtml(lv.form)} · your progress companion</div></div><span class="v26-pet-level">Lv ${lv.level}</span></div><div class="v26-pet-track"><i style="width:${lv.pct}%"></i></div><div class="v26-pet-foot"><span>${lv.xp}/250 companion XP</span><span>${lv.toNext} to next level</span></div><div class="v26-pet-stats"><div class="v26-pet-stat"><b>${pet.bond}</b><span>Bond points</span></div><div class="v26-pet-stat"><b>${used.length}/3</b><span>Today's care</span></div><div class="v26-pet-stat"><b>${history.length}</b><span>Care days</span></div></div><h2 style="font-size:15px;margin:14px 0 4px">Give ${escapeHtml(pet.name)} some care</h2><p class="v26-pet-sub">Each action can be used once per day. Actions build your bond, not your XP score.</p><div class="v26-pet-actions">${actions.map(([id,label])=>`<button class="v26-pet-action" data-v26-pet-action="${id}" ${used.includes(id)||used.length>=3?'disabled':''}>${used.includes(id)?'✓ ':''}${label}</button>`).join('')}</div><p class="v26-pet-note">Companion growth is linked to your existing Winter Arc XP. No extra XP is awarded and no account or backend is required.</p></section><section class="v24-simple-card"><div class="v20-head"><h2>Recent care</h2><span>${history.length} days</span></div>${history.length?history.map(d=>{const a=Array.isArray(pet.actionsByDate[d])?pet.actionsByDate[d]:[];return `<div style="display:flex;justify-content:space-between;gap:8px;padding:9px 0;border-bottom:1px solid var(--line)"><b style="font-size:11px">${escapeHtml(formatDay(d))}</b><span style="font-size:11px;color:var(--muted)">${a.map(x=>x==='feed'?'🍎':x==='play'?'🎾':'🌙').join(' ')||'—'}</span></div>`}).join(''):'<div class="v24-empty"><b>Your companion is waiting.</b><span>Choose one small care action today.</span></div>'}</section></div>`;
  }

  // Capture at window level so the care buttons are handled before the legacy
  // document-level navigation delegates; unrelated clicks pass through untouched.
  window.addEventListener('click',function(e){
    const button=e.target&&e.target.closest?e.target.closest('[data-v26-pet-action]'):null;
    if(!button)return;
    e.preventDefault();e.stopImmediatePropagation();
    const action=button.getAttribute('data-v26-pet-action');
    if(!['feed','play','rest'].includes(action))return;
    const pet=v26PetState();
    if(pet.todayActions.includes(action)){showToast('You already did this care action today.');return;}
    if(pet.todayActions.length>=3){showToast('Your companion has had enough care for today.');return;}
    const next=pet.todayActions.concat(action);
    const actionsByDate=Object.assign({},pet.actionsByDate);
    actionsByDate[today()]=next;
    // Keep only the latest 45 days of care records to keep the saved object small.
    const dates=Object.keys(actionsByDate).sort();
    dates.slice(0,Math.max(0,dates.length-45)).forEach(d=>delete actionsByDate[d]);
    data.arcPet={name:pet.name,bond:pet.bond+5,actionsByDate};
    save();renderV20();showToast(action==='feed'?'Frost enjoyed a snack 🍎':action==='play'?'A little playtime 🎾':'A peaceful rest 🌙');
  },true);

'''


def patch_app_text(source: str) -> tuple[str, list[str]]:
    changes: list[str] = []
    if STORE_KEY not in source:
        raise ValueError("Tracker localStorage key changed; refusing to patch.")
    if P2_BINDING not in source:
        raise ValueError("Phase 2 cloudSync fix is missing; do not add the pet to a broken app.")
    if P3_MARKER not in source or "function v26LevelInfo()" not in source or "function achievementsPage()" not in source:
        raise ValueError("Phase 3 is not complete; apply XP/achievement patch first.")
    if P4_MARKER not in source or "function v26ArcadeLaunchPage()" not in source:
        raise ValueError("Phase 4 arcade is not complete; apply Phase 4 first.")

    if P5_MARKER in source:
        required=("function v26PetState()","function v26PetCard()","function v26PetPage()","data-v26-pet-action")
        if any(x not in source for x in required):
            raise ValueError("A partial Phase 5 patch exists; manual review required.")
        return source,["Phase 5 already present (idempotent no-op)"]

    if source.count(TODAY_ANCHOR)!=1:
        raise ValueError("Expected exactly one Phase 3 Today-card insertion point.")
    starts=[m.start() for m in re.finditer(re.escape(MORE_HEAD),source)]
    if not starts:
        raise ValueError("More screen renderer not found.")
    start=starts[-1]
    end=source.find(MORE_END,start)
    if end<0:
        raise ValueError("Active More renderer end boundary not found.")
    segment=source[start:end]
    if segment.count(PANEL_ANCHOR)!=1:
        raise ValueError("Expected one active Arcade panel route in More screen.")
    if segment.count(TILE_ANCHOR)!=1:
        raise ValueError("Expected one Arcade tile insertion point in More screen.")
    if source.count(FINAL_RENDER)!=1:
        raise ValueError("Expected one final render registration boundary.")

    source=source.replace(TODAY_ANCHOR,TODAY_REPLACEMENT,1)
    # Recompute final renderer after the bounded Today replacement.
    starts=[m.start() for m in re.finditer(re.escape(MORE_HEAD),source)]
    start=starts[-1];end=source.find(MORE_END,start);segment=source[start:end]
    segment=segment.replace(PANEL_ANCHOR,"morePanel==='pet'?v26PetPage():"+PANEL_ANCHOR,1)
    segment=segment.replace(TILE_ANCHOR,TILE_ANCHOR+"${tile('🐾','Arc Companion','Care for your growing pet','pet')}",1)
    source=source[:start]+P5_BLOCK+segment+source[end:]
    if source.count(P5_MARKER)!=1 or source.count("function v26PetCard()")!=1 or source.count("function v26PetPage()")!=1:
        raise ValueError("Phase 5 insertion postcondition failed.")
    if "${v24RecoveryCard()}${v26XpCard()}${v26PetCard()}<section class=\"v24-statbar\">" not in source:
        raise ValueError("Today screen pet card was not inserted.")
    if "morePanel==='pet'?v26PetPage():morePanel==='arcade'?" not in source:
        raise ValueError("Pet page route was not inserted in the active More renderer.")
    if "data-v26-pet-action" not in source or source.count(FINAL_RENDER)!=1:
        raise ValueError("Pet care controls or final boot boundary missing.")
    if "progress_tracker_v17" not in source or "localStorage.removeItem" in P5_BLOCK or "fetch(" in P5_BLOCK or "supabase" in P5_BLOCK.lower():
        raise ValueError("Phase 5 must remain local-only and preserve existing progress.")
    return source,changes+["Virtual pet card added to Today","Arc Companion page added to More","Daily pet care stored inside existing progress object","Premium mobile-first companion styling added"]


def patch_repo(root: Path) -> list[str]:
    path=root/"app.js"
    if not path.is_file(): raise ValueError("app.js not found; run from Tracker root.")
    original=path.read_text(encoding="utf-8")
    updated,changes=patch_app_text(original)
    if updated!=original:path.write_text(updated,encoding="utf-8")
    return changes


def self_test() -> None:
    fixture=r'''(function(){
const VERSION='V26.0';
const KEY='progress_tracker_v17';
let cloudSync = async function(){return false};
/* PHASE 3 — XP, LEVELS & ACHIEVEMENTS */
function v26LevelInfo(){}
function achievementsPage(){}
const todayAnchor='${v24RecoveryCard()}${v26XpCard()}<section class="v24-statbar">';
/* ========================= PHASE 4 — LOCAL ARCADE ========================= */
function v26ArcadeLaunchPage(){}
  function v20More(){ return 'old renderer'; }
  function v20More(){
  let body='';
  try{body=morePanel==='arcade'?v26ArcadeLaunchPage():morePanel==='rank'?v20Rank():'empty'}
  const tile=(icon,title,sub,id)=>`<button>${title}</button>`;
  return `${tile('🎮','Arcade','24 offline games from YaarJam','arcade')}${tile('📱','Get the App','Install PWA when supported.','getapp')}`;
}
  function v20Shell(){}
function v25RecordOpen(){}
  v25RecordOpen();
  renderV20();
})();
'''
    fixed,changes=patch_app_text(fixture)
    assert P5_MARKER in fixed and "function v26PetState()" in fixed
    assert "${v24RecoveryCard()}${v26XpCard()}${v26PetCard()}<section class=\"v24-statbar\">" in fixed
    assert "morePanel==='pet'?v26PetPage():morePanel==='arcade'?" in fixed
    assert fixed.count("tile('🐾','Arc Companion'") == 1
    assert "const KEY='progress_tracker_v17';" in fixed
    again,_=patch_app_text(fixed)
    assert again==fixed
    print("PASS: Phase 5 self-test (Today card, active More route, daily care actions, existing store, idempotency)")


def main()->int:
    p=argparse.ArgumentParser();p.add_argument("--repo",default=".");p.add_argument("--self-test",action="store_true");a=p.parse_args()
    if a.self_test:self_test();return 0
    for item in patch_repo(Path(a.repo).resolve()):print("- "+item)
    print("No backend/database changes; no new localStorage key; no XP farming.")
    return 0

if __name__=="__main__":
    try:raise SystemExit(main())
    except (OSError,ValueError,AssertionError) as e:raise SystemExit("PHASE 5 PATCH STOPPED SAFELY: "+str(e))
