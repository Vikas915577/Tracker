(function(){
'use strict';

const VERSION='V22.1';
const START='2026-10-01';
const END='2026-12-31';
const ARC_DAYS=92;
const KEY='progress_tracker_v17';
const OLD_KEYS=['progress_tracker_v20','progress_tracker_v19','progress_tracker_v18','progress_tracker_v17','progress_tracker_v16','progress_tracker_v14_2','progress_tracker_v14_1','progress_tracker_v14','progress_tracker_v13','progress_tracker_v12','progress_tracker_v11','progress_tracker_v10','progress_tracker_v9','progress_tracker_v8','progress_tracker_v6','progress_tracker_v5','progress_tracker_v4','progress_tracker_v3_plain'];
const WEBSITE='https://vikas915577.github.io/Tracker/';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-5);
const iso=d=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const today=()=>iso(new Date());
const dObj=d=>new Date(d+'T12:00:00');
const addDays=(d,n)=>{const x=dObj(d);x.setDate(x.getDate()+n);return iso(x)};
const diff=(a,b)=>Math.round((dObj(b)-dObj(a))/86400000);
const fmtDay=dObj;
const monthDays=m=>{const [y,mo]=m.split('-').map(Number);const n=new Date(y,mo,0).getDate();return Array.from({length:n},(_,i)=>m+'-'+String(i+1).padStart(2,'0'))};
const arcDay=()=>{const delta=diff(START,today());return delta<0?0:Math.min(ARC_DAYS,delta+1)};
const arcPct=()=>{const n=arcDay();return Math.round(Math.min(1,n/ARC_DAYS)*100)};
const key=(h,d)=>h.id+'|'+d;
const isFuture=d=>d>today();
const canEdit=d=>!isFuture(d);

const GOALS={
 discipline:{icon:'🎯',label:'Build discipline',desc:'Simple routines and consistency',habits:['Morning walk','Study / Work','Less Phone']},
 study:{icon:'📚',label:'Study / Work',desc:'Protect your focus and learning',habits:['Study / Work','Read','Less Phone']},
 fitness:{icon:'💪',label:'Get fitter',desc:'Movement, food and recovery',habits:['Exercise','Walk','Drink Water']},
 mind:{icon:'🧠',label:'Improve my mind',desc:'Calm, focus and reflection',habits:['Meditation','Read','Journal']},
 personal:{icon:'✨',label:'Personal growth',desc:'A balanced daily system',habits:['Exercise','Read','Sleep on Time']},
 custom:{icon:'⚡',label:'My own goal',desc:'Make your own Arc',habits:['Exercise','Study / Work','Read']}
};
const PRESETS=[
 {name:'Exercise',icon:'🏃',difficulty:'Medium',action:'5 minutes of movement'},
 {name:'Study / Work',icon:'📚',difficulty:'Hard',action:'10 minutes of focused work'},
 {name:'Drink Water',icon:'💧',difficulty:'Easy',action:'Drink 1 glass now'},
 {name:'Read',icon:'📖',difficulty:'Easy',action:'Read 2 pages'},
 {name:'Meditation',icon:'🧘',difficulty:'Easy',action:'2 minutes of breathing'},
 {name:'Sleep on Time',icon:'😴',difficulty:'Medium',action:'Start your wind-down routine'},
 {name:'Walk',icon:'🚶',difficulty:'Easy',action:'5 minutes of walking'},
 {name:'Healthy Food',icon:'🥗',difficulty:'Medium',action:'Make one healthy choice'},
 {name:'Less Phone',icon:'📵',difficulty:'Medium',action:'Keep your phone away for 15 min'},
 {name:'Morning walk',icon:'🌅',difficulty:'Easy',action:'Take a 5 minute morning walk'},
 {name:'Journal',icon:'✍️',difficulty:'Easy',action:'Write one useful sentence'},
 {name:'Private Wellness',icon:'🔒',difficulty:'Medium',action:'Follow your chosen boundary',private:true}
];

function defaults(){return {
 schema:21,arcStart:START,arcLength:ARC_DAYS,name:'',goal:'',profileCreated:false,onboardingDone:false,journeyStart:'',lastLogin:'',
 habits:[],checks:{},freezes:{},freezeUsed:{},xpEvents:{},bonusEvents:{},xp:0,
 sleep:{},notes:{},habitNotes:{},mood:{},energy:{},planner:{},reminders:{},
 routines:[],activeRoutine:null,goalLinks:[],target:7,achieved:0,win:'',barrier:'',ifThen:'',
 dark:false,pinHash:'',publicProfile:false,profileInstagram:'',cloudOptIn:false,cloudUserId:'',cloudLastSync:'',cloudStatus:'',
 creatorName:'Vashu Sharmaa',creatorHandle:'@pandatvikas1',creatorBio:'Hi, I’m Vashu Sharmaa — a Data Engineer. I built Winter Arc Tracker for people who want to turn small daily actions into real progress.',creatorLink:'https://instagram.com/pandatvikas1',creatorPhoto:'creator-profile.jpg',
 communityCount:0,invitedBy:'',installHint:true,compareSnapshot:'',shareCode:'',v21TourDone:false
}}
function preset(name){return PRESETS.find(p=>p.name.toLowerCase()===String(name).toLowerCase())||null}
function normalize(x){
 const d=Object.assign(defaults(),x||{});
 for(const k of ['checks','freezes','freezeUsed','xpEvents','bonusEvents','sleep','notes','habitNotes','mood','energy','planner','reminders'])if(!d[k]||typeof d[k]!=='object')d[k]={};
 if(!Array.isArray(d.habits))d.habits=[];
 if(!Array.isArray(d.routines))d.routines=[];
 if(!Array.isArray(d.goalLinks))d.goalLinks=[];
 d.habits=d.habits.filter(Boolean).map(h=>Object.assign({id:uid(),name:'Habit',icon:'✅',private:false,created:START,difficulty:'Medium',action:'Do the smallest useful version',time:'',smallWin:'',why:''},typeof h==='string'?{name:h}:h));
 d.routines=d.routines.filter(Boolean).map(r=>Object.assign({id:uid(),name:'Routine',icon:'🔁',items:[],step:0},r));
 d.xp=Number(d.xp)||0; d.target=Math.max(1,Number(d.target)||7); d.achieved=Math.max(0,Math.min(d.target,Number(d.achieved)||0));
 d.name=String(d.name||''); d.goal=String(d.goal||''); d.pinHash=String(d.pinHash||''); d.profileInstagram=String(d.profileInstagram||'').slice(0,80);
 d.arcStart=START;d.arcLength=ARC_DAYS;d.schema=21;
 d.creatorName=String(d.creatorName||'Vashu Sharmaa');d.creatorHandle=String(d.creatorHandle||'@pandatvikas1');d.creatorBio=String(d.creatorBio||defaults().creatorBio);d.creatorLink=String(d.creatorLink||defaults().creatorLink);d.creatorPhoto=String(d.creatorPhoto||'creator-profile.jpg');
 d.cloudOptIn=!!d.cloudOptIn;d.publicProfile=!!d.publicProfile;d.cloudUserId=String(d.cloudUserId||'');d.cloudLastSync=String(d.cloudLastSync||'');d.cloudStatus=String(d.cloudStatus||'');
 d.communityCount=Math.max(0,Number(d.communityCount)||0);d.invitedBy=String(d.invitedBy||'').slice(0,80);d.v21TourDone=!!d.v21TourDone;
 if(!d.journeyStart)d.journeyStart=today();
 if(!d.lastLogin&&d.profileCreated)d.lastLogin=today();
 return d;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}}
function load(){
 try{
  const cur=JSON.parse(localStorage.getItem(KEY)||'null');
  if(cur)return normalize(cur);
  for(const k of OLD_KEYS){const old=JSON.parse(localStorage.getItem(k)||'null');if(old){const m=normalize(old);m.profileCreated=!!(old.profileCreated||old.name);m.onboardingDone=!!(old.onboardingDone||old.habits?.length||old.name);m.name=old.name||m.name;m.journeyStart=old.journeyStart||today();save();return m}}
 }catch(e){}
 return defaults();
}
let data=load();
if(Array.isArray(data.habits))data.habits=data.habits.map(h=>h.name==='Masturbation'?Object.assign({},h,{name:'Private Wellness',private:true}):h);
if(data.habitNotes?.Masturbation){data.habitNotes['Private Wellness']=data.habitNotes.Masturbation;delete data.habitNotes.Masturbation;}
let tab=(()=>{try{return new URL(location.href).searchParams.get('tab')||'today'}catch(e){return 'today'}})();
let morePanel='';let onboardingStep=0;let onboardingGoal=data.goal||'discipline';let onboardingSelected=[];let menuOpen=false;let selectedHabit=null;let search='';let rankRows=[];let rankState='idle';let rankError='';let rankActive={state:'idle',rows:[],count:0};let remoteRank=null;let monthCursor=(today()>=START&&today()<=END)?today().slice(0,7):'2026-10';let sprint=null;let installPrompt=null;let toastTimer=null;let sessionUnlocked=!data.pinHash;

function showToast(msg){clearTimeout(toastTimer);document.querySelector('.toast')?.remove();const x=document.createElement('div');x.className='toast';x.textContent=msg;document.body.appendChild(x);toastTimer=setTimeout(()=>x.remove(),2100)}
function celebrate(){const items=['✨','🔥','⭐','💪'];items.forEach((e,i)=>{const x=document.createElement('span');x.className='burst';x.textContent=e;x.style.left=(42+i*5)+'%';x.style.bottom='115px';document.body.appendChild(x);setTimeout(()=>x.remove(),700+i*80)})}
function habitActive(h,d){return !!data.checks[key(h,d)]||!!data.freezes[key(h,d)]}
function done(h,d){return !!data.checks[key(h,d)]}
function frozen(h,d){return !!data.freezes[key(h,d)]}
function canUse(h,d){return d>=(h.created||START)}
function datesSinceStart(){const s=data.journeyStart&&/^\d{4}-\d{2}-\d{2}$/.test(data.journeyStart)?data.journeyStart:START;const n=Math.max(1,diff(s,today())+1);return Array.from({length:Math.min(365,n)},(_,i)=>addDays(today(),i-(n-1)))}
function habitStats(h){const ds=datesSinceStart().filter(d=>canUse(h,d));let run=0,longest=0,cur=0;for(let i=ds.length-1;i>=0;i--){if(ds[i]===today()&&!habitActive(h,ds[i]))continue;if(habitActive(h,ds[i]))run++;else break}for(const d of ds){if(habitActive(h,d)){cur++;longest=Math.max(longest,cur)}else cur=0}const total=ds.filter(d=>done(h,d)).length;const week=ds.slice(-7).filter(d=>habitActive(h,d)).length;return {run,longest,total,week,pct:Math.round(week/7*100)}}
function stats(){const hs=data.habits;const todayDone=hs.filter(h=>done(h,today())).length;const completed=Object.keys(data.checks).length;const totalEligible=datesSinceStart().reduce((n,d)=>n+hs.filter(h=>canUse(h,d)).length,0);const pct=totalEligible?Math.round(completed/totalEligible*100):0;const day=Math.min(ARC_DAYS,Math.max(1,diff(START,today())+1));const best=Math.max(0,...hs.map(h=>habitStats(h).longest));let streak=0;for(let i=datesSinceStart().length-1;i>=0;i--){const d=datesSinceStart()[i];if(hs.length&&hs.every(h=>habitActive(h,d))){streak++}else if(d===today())continue;else break}const week=weeklyScore();return {todayDone,completed,totalEligible,pct,day,best,streak,week}}
function weeklyScore(){const ds=datesSinceStart().slice(-7);let e=0,n=0;for(const d of ds)for(const h of data.habits){if(!canUse(h,d))continue;e++;if(habitActive(h,d))n++}return e?Math.round(n/e*100):0}
function weeklyWins(){const ds=datesSinceStart().slice(-7);return ds.reduce((n,d)=>n+data.habits.filter(h=>done(h,d)).length,0)}
function arcScore(){if(!data.habits.length)return 0;const s=stats();return Math.max(0,Math.min(100,Math.round(s.week*0.75+Math.min(100,s.best*3)*0.15+Math.min(100,weeklyWins()*5)*0.10)))}
function level(){return Math.floor(data.xp/100)+1}
function nextMilestone(day){return [3,7,14,21,30,45,60,75,90].find(x=>x>day)||92}
function focusHabit(){const open=data.habits.filter(h=>!done(h,today()));if(!open.length)return null;return open.slice().sort((a,b)=>{const ar=habitStats(a).run,br=habitStats(b).run;if(ar!==br)return ar-br;return String(a.time||'23:59').localeCompare(String(b.time||'23:59'))})[0]||null}
function addXp(k,n){data.xpEvents[k]=n;data.xp=(data.xp||0)+n}
function removeXp(k){if(data.xpEvents[k]){data.xp-=Number(data.xpEvents[k])||0;delete data.xpEvents[k]}}
function recalcBonus(d){const any=data.habits.some(h=>done(h,d));const all=data.habits.length&&data.habits.every(h=>done(h,d));const old=data.bonusEvents[d]||{first:0,full:0};const next={first:any?15:0,full:all?25:0};data.xp+=next.first-old.first+next.full-old.full;data.bonusEvents[d]=next;data.xp=Math.max(0,Math.round(data.xp))}
function toggleHabit(h,d){if(!canEdit(d))return showToast('Future date is locked');if(frozen(h,d))return showToast('Undo Freeze first');const k=key(h,d);const before=done(h,d);if(before){delete data.checks[k];removeXp(k);recalcBonus(d);showToast('Check removed')}else{data.checks[k]=true;addXp(k,10);recalcBonus(d);celebrate();showToast('Nice! +10 XP 🔥')}save();render()}
function addHabit(name,meta={}){const n=String(name||'').trim();if(!n)return false;if(data.habits.some(h=>h.name.toLowerCase()===n.toLowerCase()))return false;const p=preset(n)||{};data.habits.push({id:uid(),name:n,icon:meta.icon||p.icon||'✅',private:!!meta.private||!!p.private,created:today(),difficulty:meta.difficulty||p.difficulty||'Medium',action:meta.action||p.action||'Do the smallest useful version',time:'',smallWin:meta.action||p.action||'',why:''});return true}
function deleteHabit(id){const h=data.habits.find(x=>x.id===id);if(!h)return;if(!confirm(`Delete “${h.name}” and its history?`))return;for(const k of Object.keys(data.checks))if(k.startsWith(id+'|')){removeXp(k);delete data.checks[k]}for(const k of Object.keys(data.freezes))if(k.startsWith(id+'|'))delete data.freezes[k];data.habits=data.habits.filter(x=>x.id!==id);delete data.habitNotes[id];delete data.reminders[id];save();selectedHabit=null;render();showToast('Habit deleted')}
function toggleFreeze(h,d){if(!canEdit(d))return showToast('Future date is locked');const k=key(h,d);if(done(h,d))return showToast('Undo completion first');if(frozen(h,d)){delete data.freezes[k];delete data.freezeUsed[today().slice(0,7)];save();render();return}const mk=today().slice(0,7);if(data.freezeUsed[mk])return showToast('Monthly freeze already used');data.freezes[k]=true;data.freezeUsed[mk]=true;save();showToast('Day protected 🛡️');render()}

async function hashPin(pin){if(window.crypto?.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(pin));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}return btoa(pin)}
function locked(){return !!data.pinHash&&!sessionUnlocked}
function profileReady(){return !!data.profileCreated&&!!data.onboardingDone}

function onboardingView(){
 const goal=GOALS[onboardingGoal]||GOALS.discipline;
 const choices=[...new Set((goal.habits||[]).map(x=>x).concat(onboardingSelected))].map(n=>preset(n)||{name:n,icon:'✅',difficulty:'Medium',action:'Do the smallest useful version'});
 const sel=new Set(onboardingSelected);
 if(onboardingStep===0)return `<div class="entry"><div class="entry-card hero-entry"><div class="app-icon">❄️</div><span class="eyebrow">WINTER ARC 2026 · ${VERSION}</span><h1>Build your Arc.<br><span>One win at a time.</span></h1><p class="lead">A simple daily tracker for habits, focus and consistency. No complicated setup.</p><div class="feature-chips"><span>⚡ 10-sec daily check-in</span><span>🏆 Top 20 Arc League</span><span>🔒 Local-first privacy</span></div><button class="primary big" data-action="on-next">Start My Arc →</button><button class="textbtn" data-action="on-tour">See how it works</button></div></div>`;
 if(onboardingStep===1)return `<div class="entry"><div class="entry-card"><div class="stepper"><i class="on"></i><i class="on"></i><i></i><i></i></div><span class="eyebrow">STEP 1 OF 3</span><h1>What should we call you?</h1><p class="lead">Just your first name. You can change it later.</p><label class="label">Your name<input id="onName" value="${esc(data.name)}" maxlength="40" placeholder="e.g. Vashu" autofocus></label><div class="goal-head"><span class="label">Your main focus</span></div><div class="goal-grid">${Object.entries(GOALS).map(([id,g])=>`<button class="goal-card ${onboardingGoal===id?'selected':''}" data-goal="${id}"><b>${g.icon}</b><span>${esc(g.label)}</span><small>${esc(g.desc)}</small></button>`).join('')}</div><button class="primary big" data-action="on-next">Continue →</button><button class="backbtn" data-action="on-back">Back</button></div></div>`;
 if(onboardingStep===2)return `<div class="entry"><div class="entry-card"><div class="stepper"><i class="on"></i><i class="on"></i><i class="on"></i><i></i></div><span class="eyebrow">STEP 2 OF 3</span><h1>Pick 3 habits.</h1><p class="lead">Keep it light. You can add more later.</p><div class="selected-count"><b>${sel.size}/3</b><span>habits selected</span></div><div class="habit-pick-grid">${choices.map(h=>`<button class="pick-card ${sel.has(h.name)?'selected':''} ${sel.size>=3&&!sel.has(h.name)?'disabled':''}" data-pick="${esc(h.name)}"><span>${esc(h.icon)}</span><div><b>${esc(h.name)}</b><small>${esc(h.action)}</small></div><strong>${sel.has(h.name)?'✓':'+'}</strong></button>`).join('')}</div><div class="custom-row"><input id="customHabit" maxlength="40" placeholder="Add your own habit"><button class="secondary" data-action="add-custom">Add</button></div><button class="primary big" data-action="on-next" ${sel.size!==3?'disabled':''}>Continue →</button><button class="backbtn" data-action="on-back">Back</button></div></div>`;
 return `<div class="entry"><div class="entry-card ready-entry"><div class="success-mark">✓</div><span class="eyebrow">ARC READY</span><h1>${esc(data.name||'Your')} Arc is ready.</h1><p class="lead">You chose <b>${esc(goal.label.toLowerCase())}</b> and 3 simple habits.</p><div class="ready-list">${onboardingSelected.map(n=>{const p=preset(n)||{};return `<div><span>${esc(p.icon||'✅')}</span><b>${esc(n)}</b><small>${esc(p.action||'Your smallest useful action')}</small></div>`}).join('')}</div><div class="tour-strip"><b>What happens next?</b><span>Today = one clear action.</span><span>Week = see your pattern.</span><span>Rank = optional public Top 20.</span></div><button class="primary big" data-action="finish-onboarding">Start Day 1 🚀</button><button class="backbtn" data-action="on-back">Back</button></div></div>`;
}
function loginView(){return `<div class="entry"><div class="entry-card"><div class="app-icon">🔒</div><span class="eyebrow">LOCAL PROFILE</span><h1>Welcome back${data.name?', '+esc(data.name):''}.</h1><p class="lead">Enter your local PIN to continue.</p><label class="label">4–6 digit PIN<input id="loginPin" type="password" inputmode="numeric" maxlength="6" placeholder="••••" autofocus></label><button class="primary big" data-action="login">Unlock 🔓</button><button class="textbtn danger" data-action="reset-profile">Reset this local profile</button><div class="privacy-note">Your tracker is stored on this device. Local data is not encrypted.</div></div></div>`}

function nextWin(){const f=focusHabit();return f}
function topGreeting(){const hour=new Date().getHours();return hour<12?'Good morning':hour<18?'Good afternoon':'Good evening'}
function missedDaysBeforeToday(){
 let missed=0;
 for(let i=1;i<=2;i++){
  const d=addDays(today(),-i);
  const eligible=data.habits.filter(h=>canUse(h,d));
  if(!eligible.length||!eligible.every(h=>!habitActive(h,d)))break;
  missed++;
 }
 return missed;
}
function recoveryCard(){
 const n=missedDaysBeforeToday();
 if(!n)return '';
 const f=focusHabit();
 return '<section class=\'info-card\'><b>🛟 Recovery Pass · '+n+' missed day'+(n>1?'s':'')+'</b><span>No reset needed. Start again with the smallest version today. Your Arc history stays intact.</span>'+(f?'<button class=\'secondary full\' data-action=\'toggle\' data-id=\''+f.id+'\'>Start with your next win →</button>':'')+'</section>';
}
function daily3Markup(){
 const hs=data.habits.slice(0,3);
 if(!hs.length)return emptyState('🌱','No habits yet','Your Arc is waiting for the first 3 actions.','Add habits','manage');
 const labels=['MUST DO','SHOULD DO','BONUS'];
 return hs.map((h,i)=>'<div class=\'info-card\'><span class=\'eyebrow\'>'+labels[i]+'</span>'+habitRow(h)+'</div>').join('');
}
function creatorCredit(){
 return '<section class=\'section\'><button class=\'share-card creator-credit\' data-more=\'creator\'><img src=\''+esc(data.creatorPhoto||'creator-profile.jpg')+'\' alt=\''+esc(data.creatorName||'Creator')+'\' style=\'width:48px;height:48px;border-radius:14px;object-fit:cover;flex:none\'><div><small>MADE WITH ❤️ BY</small><b>'+esc(data.creatorName||'Vashu Sharmaa')+'</b><small>Data Engineer · '+esc(data.creatorHandle||'@pandatvikas1')+'</small></div><span>→</span></button></section>';
}

function todayView(){
 const s=stats(), f=nextWin(), pct=data.habits.length?Math.round(s.todayDone/data.habits.length*100):0;const next=nextMilestone(s.day);
 return `<div class="page"><section class="greet"><div><span class="eyebrow">DAY ${s.day} / ${ARC_DAYS}</span><h1>${topGreeting()}, ${esc(data.name||'there')}.</h1><p>${s.todayDone}/${data.habits.length} wins today · ${arcPct()}% through your Arc</p></div><div class="ring" style="--p:${pct}%"><span><b>${pct}%</b><small>today</small></span></div></section>
 ${f?`<section class="next-card"><div class="eyebrow">NEXT WIN</div><div class="next-row"><div class="big-icon">${esc(f.icon)}</div><div class="next-copy"><h2>${esc(f.name)}</h2><p>${esc(f.action||'Do the smallest useful version')}</p><small>🔥 ${habitStats(f).run} day streak · ${f.difficulty||'Medium'}</small></div><button class="main-check ${done(f,today())?'done':''}" data-action="toggle" data-id="${f.id}">${done(f,today())?'✓':'→'}</button></div><button class="mini-link" data-action="sprint">🎯 Focus Sprint</button></section>`:data.habits.length&&s.todayDone===data.habits.length?`<section class="next-card complete-card"><div class="eyebrow">DAY COMPLETE</div><h2>All ${data.habits.length} wins are done. 🎉</h2><p>Nice work. Protect tomorrow’s easiest first action and leave today complete.</p><button class="secondary full" data-nav="week">See this week →</button></section>`:`<section class="next-card empty-next"><div class="eyebrow">YOUR NEXT WIN</div><h2>Your first win starts here.</h2><p>Add 3 habits to turn today into an action plan.</p><button class="primary" data-nav="more" data-more="manage">Add habits →</button></section>`}
 <section class="section"><div class="section-head"><div><span class="eyebrow">TODAY</span><h2>Daily 3</h2></div><span class="count-pill">${s.todayDone}/${data.habits.length}</span></div><div class="habit-list">${daily3Markup()}</div>${data.habits.length>3?`<button class="secondary full" data-nav="more" data-more="manage">View all ${data.habits.length} habits →</button>`:''}</section>
 <section class="stats-mini"><div><b>🔥 ${s.streak}</b><small>Current streak</small></div><div><b>${s.completed}</b><small>Total wins</small></div><div><b>#${localRank()}</b><small>Local rank</small></div></section>
 ${recoveryCard()}${creatorCredit()}<section class="milestone-card"><div><span class="eyebrow">NEXT CHECKPOINT</span><h3>Day ${next}</h3><p>${next-s.day>0?`${next-s.day} days to go. Keep today's action small.`:'Arc checkpoint reached 🎉'}</p></div><span class="milestone-icon">🏁</span></section>
 </div>`;
}
function habitRow(h){return `<button class="habit-row ${done(h,today())?'completed':''}" data-action="toggle" data-id="${h.id}"><span class="habit-icon">${esc(h.icon)}</span><span class="habit-main"><b>${esc(h.name)}</b><small>${esc(h.action||'Smallest useful action')}</small></span><span class="habit-check">${done(h,today())?'✓':'○'}</span></button>`}
function emptyState(icon,title,sub,action,id){return `<div class="empty-state"><div>${icon}</div><b>${esc(title)}</b><small>${esc(sub)}</small><button class="secondary" data-nav="more" data-more="${id}">${esc(action)} →</button></div>`}

function weekView(){const ds=Array.from({length:7},(_,i)=>addDays(today(),i-6));return `<div class="page"><section class="simple-head"><span class="eyebrow">THIS WEEK</span><h1>Your 7-day pattern.</h1><p>Tap a day to see what got done.</p></section><section class="week-summary"><div><b>${weeklyScore()}%</b><small>completion</small></div><div><b>${weeklyWins()}</b><small>wins</small></div><div><b>🔥 ${stats().best}</b><small>best streak</small></div></section><div class="week-table">${data.habits.map(h=>`<div class="week-habit"><div class="week-name"><span>${esc(h.icon)}</span><b>${esc(h.name)}</b></div><div class="week-days">${ds.map(d=>`<button class="day-dot ${done(h,d)?'done':''} ${frozen(h,d)?'freeze':''} ${d===today()?'today':''}" data-action="toggle-date" data-id="${h.id}" data-date="${d}" ${isFuture(d)?'disabled':''}><small>${fmtDay(d).toLocaleDateString(undefined,{weekday:'short'}).slice(0,2)}</small><span>${done(h,d)?'✓':frozen(h,d)?'🛡':''}</span></button>`).join('')}</div></div>`).join('')||emptyState('🗓️','No habits yet','Your week will appear after setup.','Add habits','manage')}</div><section class="info-card"><b>Tip</b><span>Missed days stay in your history. Your next win still counts.</span></section></div>`}

function localRank(){
 const me=arcScore();
 const peers=rankRows.map(x=>Number(x.rank_score??x.rankScore)||0);
 return peers.length?1+peers.filter(x=>x>me).length:null;
}
function league(score){return score>=90?'Diamond':score>=75?'Platinum':score>=60?'Gold':score>=40?'Silver':'Bronze'}
function cloudConfig(){const c=window.WINTER_ARC_CLOUD||window.CLOUD_CFG||{};return {url:String(c.url||'').replace(/\/$/,''),anonKey:String(c.anonKey||'')}}
async function cloudCount(query){
 const c=cloudConfig();
 if(!c.url||!c.anonKey)return null;
 const r=await fetch(c.url+'/rest/v1/arc_users?'+query,{method:'HEAD',headers:{apikey:c.anonKey,Authorization:'Bearer '+c.anonKey,Prefer:'count=exact',Range:'0-0'}});
 if(!r.ok)throw new Error('HTTP '+r.status);
 const range=r.headers?.get?.('content-range')||r.headers?.get?.('Content-Range')||'';
 const m=range.match(/\/([0-9]+|\*)$/);
 return m&&m[1]!=='*'?Number(m[1]):0;
}
async function myGlobalRank(score,lastSeen){
 try{
  const higher=await cloudCount('select=id&public_profile=eq.true&rank_score=gt.'+encodeURIComponent(score));
  let earlier=0;
  if(lastSeen) earlier=await cloudCount('select=id&public_profile=eq.true&rank_score=eq.'+encodeURIComponent(score)+'&last_seen=lt.'+encodeURIComponent(lastSeen));
  return (higher??0)+(earlier??0)+1;
 }catch(e){return null}
}
async function loadActive(){
 const c=cloudConfig();
 if(!c.url||!c.anonKey)return {state:'offline',rows:[],count:0};
 try{
  const now=Date.now();
  const sinceNow=new Date(now-15*60000).toISOString();
  const sinceToday=new Date(now-24*60*60000).toISOString();
  const base='select=id,display_name,rank_score,last_seen&public_profile=eq.true&order=last_seen.desc&limit=20';
  const [rNow,rToday]=await Promise.all([
   fetch(c.url+'/rest/v1/arc_users?'+base+'&last_seen=gte.'+encodeURIComponent(sinceNow),{headers:{apikey:c.anonKey,Authorization:'Bearer '+c.anonKey}}),
   fetch(c.url+'/rest/v1/arc_users?'+base+'&last_seen=gte.'+encodeURIComponent(sinceToday),{headers:{apikey:c.anonKey,Authorization:'Bearer '+c.anonKey}})
  ]);
  if(!rNow.ok||!rToday.ok)throw new Error('HTTP '+(!rNow.ok?rNow.status:rToday.status));
  const rows=await rNow.json();
  const activeTodayCount=await cloudCount('select=id&public_profile=eq.true&last_seen=gte.'+encodeURIComponent(sinceToday));
  return {state:'ready',rows:Array.isArray(rows)?rows:[],count:Number(activeTodayCount)||0};
 }catch(e){return {state:'error',rows:[],count:0}}
}
async function loadRank(){
 rankState='loading';rankError='';rankActive={state:'loading',rows:[],count:0};render();
 const c=cloudConfig();
 if(!c.url||!c.anonKey){rankState='offline';rankError='Community backend is not configured. Connect Community Sync to see the public Top 20.';rankRows=[];rankActive={state:'offline',rows:[],count:0};remoteRank=null;render();return}
 try{
  await syncCloud(false);
  const url=c.url+'/rest/v1/arc_users?select=id,display_name,arc_day,arc_progress,total_wins,best_streak,rank_score,week_score,league,last_seen&public_profile=eq.true&order=rank_score.desc,last_seen.asc,id.asc&limit=20';
  const r=await fetch(url,{headers:{apikey:c.anonKey,Authorization:'Bearer '+c.anonKey}});if(!r.ok)throw new Error('HTTP '+r.status);
  rankRows=await r.json();rankState='ready';
  rankActive=await loadActive();
  const s=arcScore();
  const last=data.cloudLastSync||new Date().toISOString();
  remoteRank=await myGlobalRank(s,last);
  render();
 }catch(e){rankState='error';rankError='Could not load the public leaderboard. Your personal tracker is safe.';rankRows=[];rankActive={state:'error',rows:[],count:0};remoteRank=null;render()}
}
function myRankFromRows(){const score=arcScore();const rank=remoteRank||localRank()||'—';return {rank,score,league:league(score)}}
function rankView(){
 const me=myRankFromRows();
 const shown=rankRows.slice(0,20);
 const q=search.trim().toLowerCase();
 const filtered=shown.map((x,i)=>({x,i})).filter(o=>String(o.x.display_name||'').toLowerCase().includes(q));
 const activeRows=(rankActive?.rows||[]).slice(0,6);
 return '<div class="page">'+
 '<section class="rank-hero"><div><span class="eyebrow">ARC LEAGUE</span><h1>'+(typeof me.rank==='number'?'#'+me.rank:'—')+'</h1><p>'+(rankState==='ready'?'Your exact public rank':'Your current local score')+'</p></div><div class="rank-score"><b>'+me.score+'</b><small>/100</small></div><div class="rank-bar"><i style="width:'+me.score+'%"></i></div><div class="rank-chips"><span>'+me.league+'</span><span>'+weeklyScore()+'% week</span><span>🔥 '+stats().best+' best</span></div></section>'+
 '<section class="active-strip"><div><span class="eyebrow">COMMUNITY</span><h2>'+(rankActive?.count||0)+' active today</h2><p>'+(rankActive?.state==='ready'?(activeRows.length?'Names from the community are shown below.':'No active public profiles yet.'):'Connect community to see active members.')+'</p></div><span class="live-dot">●</span></section>'+
 (activeRows.length?'<section class="section"><div class="section-head"><div><span class="eyebrow">ACTIVE NOW</span><h2>People on the Arc</h2></div></div><div class="active-list">'+activeRows.map(x=>'<div class="active-row"><span class="active-avatar">'+esc(String(x.display_name||'A').slice(0,1).toUpperCase())+'</span><div><b>'+esc(x.display_name||'Arc member')+'</b><small>Active now · #'+(rankRows.findIndex(r=>r.id===x.id)+1||'—')+'</small></div></div>').join('')+'</div></section>':'')+
 '<section class="section"><div class="section-head"><div><span class="eyebrow">GLOBAL</span><h2>Top 20</h2></div><button class="icon-btn" data-action="rank-refresh" aria-label="Refresh">↻</button></div><input class="search" id="rankSearch" value="'+esc(search)+'" placeholder="Search Top 20 by name"><div class="top20-list">'+(rankState==='loading'?'<div class="info-card">Loading public Top 20…</div>':rankState==='ready'&&filtered.length?filtered.map(o=>rankRow(o.x,o.i)).join(''):rankState==='ready'?'<div class="info-card"><b>No matching name.</b><span>Search only filters by display name. Rank numbers stay unchanged.</span></div>':'<div class="info-card"><b>No public Top 20 loaded.</b><span>'+esc(rankError||'Turn on Community Sync and make your profile public to join.')+'</span></div>')+'</div>'+
 (rankState==='ready'&&rankRows.length<20?'<div class="info-card"><b>Showing '+rankRows.length+'/20 public profiles.</b><span>The leaderboard always keeps the public list capped at 20.</span></div>':'')+
 (rankState==='ready'?'<div class="my-position"><b>Your public position: '+(typeof me.rank==='number'?'#'+me.rank:'—')+'</b><span>'+(typeof me.rank==='number'&&me.rank<=20?'You are inside the visible Top 20.':'The exact public position is calculated across all public profiles.')+'</span></div>':'')+
 '</section>'+
 '<section class="challenge-card"><div><span class="eyebrow">WEEKLY CHALLENGE</span><h3>Show up 5 times.</h3><p>'+Math.min(5,weeklyWins())+'/5 wins this week</p></div><b>'+Math.min(100,Math.round(Math.min(5,weeklyWins())/5*100))+'%</b></section>'+
 '<section class="info-card"><b>How rank works</b><span>75% weekly consistency + 15% best streak + 10% weekly wins. Public names are shown; Instagram handles are not displayed or searched here.</span></section>'+
 '</div>';
}
function rankRow(x,i){const name=String(x.display_name||'Arc member');const score=Number(x.rank_score)||0;const isMe=data.cloudUserId&&x.id===data.cloudUserId;return '<div class="rank-row '+(isMe?'me':'')+'"><span class="rank-num">#'+(i+1)+'</span><span class="avatar">'+esc(name.slice(0,1).toUpperCase())+'</span><span class="rank-person"><b>'+esc(name)+'</b><small>'+Number(x.total_wins||0)+' wins · 🔥 '+Number(x.best_streak||0)+' streak</small></span><span class="rank-side"><b>'+score+'</b><small>'+esc(x.league||league(score))+'</small></span></div>'}

function profileView(){const s=stats(),score=arcScore(),best=s.best;return `<div class="page"><section class="profile-hero"><div class="profile-avatar">${esc((data.name||'A').slice(0,1).toUpperCase())}</div><div><span class="eyebrow">MY ARC</span><h1>${esc(data.name||'Your Arc')}</h1><p>${esc(data.goal||'Personal growth')} · Day ${s.day}/${ARC_DAYS}</p></div><button class="icon-btn" data-more="settings" data-nav="more">⚙</button></section><section class="profile-stats"><div><b>${arcPct()}%</b><small>Arc progress</small></div><div><b>${score}</b><small>Arc score</small></div><div><b>🔥 ${best}</b><small>Best streak</small></div><div><b>${s.completed}</b><small>Total wins</small></div></section><section class="section"><div class="section-head"><div><span class="eyebrow">SHARE</span><h2>Show your progress.</h2></div></div><button class="share-card" data-action="share"><span>↗</span><div><b>Share my Arc</b><small>Generate a clean 4:5 progress card for WhatsApp or Instagram.</small></div></button><button class="secondary full" data-nav="rank">🏆 Open Top 20 Rank</button></section><section class="section"><div class="section-head"><div><span class="eyebrow">IDENTITY</span><h2>Profile</h2></div></div><div class="setting-row"><span><b>Name</b><small>${esc(data.name||'Not set')}</small></span><button class="secondary" data-action="edit-profile">Edit</button></div><div class="setting-row"><span><b>Main focus</b><small>${esc(data.goal||'Personal growth')}</small></span><button class="secondary" data-action="edit-goal">Edit</button></div></section></div>`}

function monthLabel(m){return new Date(m+'-01T12:00:00').toLocaleDateString(undefined,{month:'long',year:'numeric'});}
function monthStats(m){
 const ds=monthDays(m).filter(d=>d>=START&&d<=END&&d<=today());
 let eligible=0,doneN=0;
 for(const d of ds)for(const h of data.habits){if(!canUse(h,d))continue;eligible++;if(done(h,d))doneN++;}
 return {days:ds.length,eligible,doneN,pct:eligible?Math.round(doneN/eligible*100):0};
}
function arcView(){
 const s=stats();
 let html='<div class="page"><section class="simple-head detail-head"><button class="back-link" data-nav="today">← Today</button><span class="eyebrow">ARC DETAILS</span><h1>Winter Arc 2026</h1><p>1 Oct → 31 Dec · 92 days</p></section>';
 html+='<section class="rank-hero"><div><span class="eyebrow">YOUR ARC</span><h1>Day '+s.day+' / '+ARC_DAYS+'</h1><p>'+arcPct()+'% through the Arc</p></div><div class="rank-score"><b>'+arcScore()+'</b><small>/100</small></div><div class="rank-bar"><i style="width:'+arcPct()+'%"></i></div></section>';
 html+='<section class="section"><div class="section-head"><div><span class="eyebrow">TIMELINE</span><h2>Oct · Nov · Dec</h2></div></div>';
 ['2026-10','2026-11','2026-12'].forEach(m=>{const ms=monthStats(m);html+='<div class="info-card"><b>'+monthLabel(m)+'</b><span>'+ms.doneN+' wins · '+ms.pct+'% completion'+(m===today().slice(0,7)?' · Current month':'')+'</span><div class="progress-box"><div><b>'+ms.pct+'%</b><span>'+ms.days+' days elapsed</span></div><i style="width:'+ms.pct+'%"></i></div></div>';});
 html+='</section><section class="section"><div class="section-head"><div><span class="eyebrow">ARC SNAPSHOT</span><h2>Your milestones</h2></div></div><div class="profile-stats"><div><b>'+s.completed+'</b><small>Arc wins</small></div><div><b>🔥 '+s.best+'</b><small>Best streak</small></div><div><b>'+weeklyScore()+'%</b><small>7-day pace</small></div><div><b>'+nextMilestone(s.day)+'</b><small>Next checkpoint</small></div></div></section>';
 html+=recoveryCard()+'<button class="primary full" data-nav="month">Open Month view →</button></div>';
 return html;
}
function monthView(){
 const ms=monthStats(monthCursor),ds=monthDays(monthCursor).filter(d=>d>=START&&d<=END&&d<=today());
 let html='<div class="page"><section class="simple-head detail-head"><button class="back-link" data-nav="today">← Today</button><span class="eyebrow">MONTH</span><h1>'+monthLabel(monthCursor)+'</h1><p>A simple monthly view of your daily pattern.</p></section><div class="choice-row">';
 ['2026-10','2026-11','2026-12'].forEach(m=>{html+='<button class="choice '+(monthCursor===m?'selected':'')+'" data-action="month-set" data-month="'+m+'">'+monthLabel(m).split(' ')[0]+'</button>';});
 html+='</div><section class="month-summary"><div><b>'+ms.pct+'%</b><small>completion</small></div><div><b>'+ms.doneN+'</b><small>wins</small></div><div><b>'+ms.days+'</b><small>days elapsed</small></div></section>';
 html+='<section class="section"><div class="section-head"><div><span class="eyebrow">HABITS</span><h2>Monthly pattern</h2></div></div>';
 data.habits.forEach(h=>{const el=ds.filter(d=>canUse(h,d));const dn=el.filter(d=>done(h,d)).length;const p=el.length?Math.round(dn/el.length*100):0;html+='<div class="info-card"><b>'+esc(h.icon)+' '+esc(h.name)+'</b><span>'+dn+'/'+el.length+' days · '+p+'%</span><div class="progress-box"><div><b>'+p+'%</b><span></span></div><i style="width:'+p+'%"></i></div></div>';});
 if(!data.habits.length)html+='<div class="info-card">Add habits to see a monthly pattern.</div>';
 html+='</section><div class="info-card"><b>Arc note</b><span>Missed days stay in your history. Use the Recovery Pass instead of resetting the Arc.</span></div></div>';
 return html;
}
function wellnessView(){return '<div class="page">'+backHeader("Private Wellness","A quiet space for personal check-ins.")+'<div class="info-card"><b>🔒 Private by default</b><span>Mood, energy, sleep and journal details stay on this device. They are not part of the public Rank.</span></div><button class="primary full" data-more="checkin">Open Mood & Energy →</button><button class="secondary full" data-more="journal">Open Journal →</button><button class="secondary full" data-more="sleep">Open Sleep →</button></div>';}

function moreView(){
 if(morePanel)return moreDetail(morePanel);
 return '<div class="page"><section class="simple-head"><span class="eyebrow">MORE</span><h1>Everything else, organized.</h1><p>Today stays simple; advanced features stay one tap away.</p></section>'+
 '<section class="tool-group"><h2>YOUR PROGRESS</h2>'+tile('📈','Insights','Spot patterns in your week.','insights')+tile('🏆','Achievements','See your milestones.','achievements')+tile('❄️','Arc Details','Day 1–92 timeline, milestones and recovery.','arc')+tile('🗓️','Month','Monthly habit pattern.','month')+'</section>'+
 '<section class="tool-group"><h2>TOOLS</h2>'+tile('✅','Manage habits','Add, edit and remove habits.','manage')+tile('🎯','Goals','Set a focus and target.','goals')+tile('🔁','Routines','Group habits into a quick sequence.','routine')+tile('✍️','Journal','One useful sentence a day.','journal')+tile('😴','Sleep','Track sleep basics.','sleep')+tile('🌤️','Mood & Energy','Quick private check-in.','checkin')+tile('🔒','Private Wellness','Private journal, sleep, mood and recovery space.','wellness')+tile('⏰','Reminders','Optional local reminders.','reminders')+'</section>'+
 '<section class="tool-group"><h2>APP</h2>'+tile('📱','Get the App','Install Winter Arc on your phone.','getapp')+tile('💾','Backup','Export or restore this profile.','backup')+tile('⚙️','Settings','Privacy, theme, PIN and sync.','settings')+tile('ℹ️','About Winter Arc','How Winter Arc works.','about')+'</section>'+
 '<section class="tool-group"><h2>COMMUNITY</h2>'+tile('🏆','Arc League','Public Top 20 and your exact public rank.','rank')+tile('☁️','Community Sync','Optional sharing and public profile control.','community')+tile('👤','Creator','Meet the creator.','creator')+'</section></div>';
}
function tile(icon,title,sub,id){return `<button class="tool-row" data-more="${id}" data-nav="more"><span>${icon}</span><div><b>${esc(title)}</b><small>${esc(sub)}</small></div><strong>→</strong></button>`}
function backHeader(title,sub){return `<section class="simple-head detail-head"><button class="back-link" data-action="more-back">← More</button><span class="eyebrow">${esc(title.toUpperCase())}</span><h1>${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</section>`}
function moreDetail(id){
 if(id==='community')return communitySettings();
 if(id==='manage')return manageView();
 if(id==='goals')return goalsView();
 if(id==='achievements')return achievementsView();
 if(id==='insights')return insightsView();
 if(id==='arc')return arcView();
 if(id==='month')return monthView();
 if(id==='routine')return routineView();
 if(id==='checkin')return checkinView();
 if(id==='wellness')return wellnessView();
 if(id==='journal')return journalView();
 if(id==='sleep')return sleepView();
 if(id==='reminders')return remindersView();
 if(id==='getapp')return getAppView();
 if(id==='creator')return creatorView();
 if(id==='settings')return settingsView();
 if(id==='backup')return backupView();
 if(id==='about')return aboutView();
 if(id==='rank'){tab='rank';morePanel='';return rankView()}
 return '<div class="page">'+backHeader('Tool','')+'<div class="info-card">This tool is unavailable.</div></div>';
}
function manageView(){return `<div class="page">${backHeader('Manage habits','Keep your daily list small and useful.')}<div class="manage-list">${data.habits.map(h=>`<div class="manage-row"><span class="habit-icon">${esc(h.icon)}</span><div><b>${esc(h.name)}</b><small>${esc(h.action||'Smallest useful action')}</small></div><button class="secondary" data-action="habit-edit" data-id="${h.id}">Edit</button><button class="icon-btn danger" data-action="habit-delete" data-id="${h.id}">×</button></div>`).join('')||emptyState('🌱','No habits yet','Start with one small action.','Add habit','manage')} </div><button class="primary full" data-action="habit-add">＋ Add habit</button><div class="info-card"><b>3 is a good starting point.</b><span>You can keep up to 15 habits, but only your first 3 appear on Today.</span></div></div>`}
function goalsView(){const p=Math.min(100,Math.round((goalProgress()/Math.max(1,data.target))*100));return `<div class="page">${backHeader('Goals','Choose one focus and make it measurable.')}<label class="label">Goal<input id="goalInput" value="${esc(data.goal)}" placeholder="e.g. Study consistently"></label><label class="label">Target<input id="goalTarget" type="number" min="1" max="365" value="${data.target}"></label><label class="label">Manual achieved<input id="goalAchieved" type="number" min="0" max="365" value="${data.achieved}"></label><button class="primary full" data-action="goal-save">Save goal</button><div class="progress-box"><div><b>${goalProgress()}/${data.target}</b><span>${p}%</span></div><i style="width:${p}%"></i></div><div class="info-card"><b>Focus tip</b><span>One clear goal makes your daily choices easier.</span></div></div>`}
function goalProgress(){if(!data.goalLinks.length)return Math.min(data.target,data.achieved||0);const ds=monthDays(today().slice(0,7)).filter(d=>d<=today());return ds.reduce((n,d)=>n+data.habits.filter(h=>data.goalLinks.includes(h.id)&&done(h,d)).length,0)}
function achievementsView(){const s=stats(),b=s.best,items=[['First Win',s.completed>=1,'Complete any habit'],['3-Day Streak',b>=3,'Reach a 3-day streak'],['7-Day Streak',b>=7,'Reach a 7-day streak'],['30-Day Streak',b>=30,'Reach a 30-day streak'],['100 Wins',s.completed>=100,'Complete 100 habit checks'],['Perfect Week',weeklyScore()===100,'Finish a perfect 7-day week'],['Level 5',level()>=5,'Reach level 5'],['Day 30',s.day>=30,'Reach Arc Day 30']];return `<div class="page">${backHeader('Achievements','Small milestones turn into a story.')}<div class="achievement-grid">${items.map(x=>`<div class="achievement ${x[1]?'on':''}"><span>${x[1]?'🏆':'🔒'}</span><b>${esc(x[0])}</b><small>${esc(x[2])}</small></div>`).join('')}</div></div>`}
function insightsView(){const s=stats(), best=data.habits.slice().sort((a,b)=>habitStats(b).total-habitStats(a).total)[0];return `<div class="page">${backHeader('Insights','Useful patterns, not a wall of charts.')}<div class="insight-big"><b>${weeklyScore()}%</b><span>7-day consistency</span></div><div class="insight-grid"><div><b>${s.completed}</b><small>Total wins</small></div><div><b>🔥 ${s.best}</b><small>Best streak</small></div><div><b>${level()}</b><small>Level</small></div><div><b>${data.xp}</b><small>XP</small></div></div>${best?`<div class="info-card"><b>Strongest habit: ${esc(best.name)}</b><span>${habitStats(best).total} total wins · ${habitStats(best).run} current streak.</span></div>`:''}<div class="info-card"><b>Next useful move</b><span>${s.todayDone===data.habits.length?'Today is complete. Protect tomorrow’s easiest first action.':`Finish ${Math.min(1,data.habits.length-s.todayDone)} more habit today.`}</span></div></div>`}
function routineView(){return `<div class="page">${backHeader('Routines','Group habits into a simple sequence.')}<label class="label">Routine name<input id="routineName" placeholder="Morning routine"></label><div class="pick-stack">${data.habits.map(h=>`<label class="check-line"><input type="checkbox" data-routine="${h.id}"><span>${esc(h.icon)} ${esc(h.name)}</span></label>`).join('')||'<div class="info-card">Add habits first.</div>'}</div><button class="primary full" data-action="routine-save">Save routine</button>${data.routines.map(r=>`<div class="routine-card"><div><b>${esc(r.name)}</b><small>${r.items.length} steps</small></div><button class="secondary" data-action="routine-start" data-id="${r.id}">Start →</button></div>`).join('')}</div>`}
function checkinView(){const m=data.mood[today()]||0,e=data.energy[today()]||0;return `<div class="page">${backHeader('Check-in','Optional. Two taps and you’re done.')}<div class="mood-block"><b>Mood</b><div class="choice-row">${[1,2,3,4,5].map(v=>`<button class="choice ${Number(m)===v?'selected':''}" data-action="mood" data-value="${v}">${['😣','😴','😐','🙂','😊'][v-1]}</button>`).join('')}</div></div><div class="mood-block"><b>Energy</b><div class="choice-row">${[1,2,3,4,5].map(v=>`<button class="choice ${Number(e)===v?'selected':''}" data-action="energy" data-value="${v}">${['🪫','🔋','⚡','⚡','🚀'][v-1]}</button>`).join('')}</div></div><div class="info-card"><b>Private by default</b><span>Mood and energy stay on this device.</span></div></div>`}
function journalView(){return `<div class="page">${backHeader('Journal','One useful sentence is enough.')}<textarea id="journalText" class="big-textarea" placeholder="What would make tomorrow easier?">${esc(data.notes[today()]||'')}</textarea><button class="primary full" data-action="journal-save">Save reflection</button></div>`}
function sleepView(){const s=data.sleep[today()]||{};return `<div class="page">${backHeader('Sleep','Track the basics, nothing more.')}<label class="label">Hours<input id="sleepHours" type="number" min="0" max="24" step="0.25" value="${esc(s.hours||'')}"></label><div class="two-col"><label class="label">Bed<input id="sleepBed" type="time" value="${esc(s.bed||'')}"></label><label class="label">Wake<input id="sleepWake" type="time" value="${esc(s.wake||'')}"></label></div><button class="primary full" data-action="sleep-save">Save sleep</button><div class="info-card"><b>Private by default</b><span>Sleep data stays local.</span></div></div>`}
function remindersView(){return `<div class="page">${backHeader('Reminders','Optional local reminders for planned habits.')} ${data.habits.map(h=>{const r=data.reminders[h.id]||{};return `<div class="setting-row"><span><b>${esc(h.name)}</b><small>${r.enabled?'Enabled':'Off'}</small></span><input class="time-input" type="time" data-rem-time="${h.id}" value="${esc(r.time||'')}"><input type="checkbox" data-rem-on="${h.id}" ${r.enabled?'checked':''}></div>`}).join('')||'<div class="info-card">Add habits first.</div>'}<button class="primary full" data-action="reminders-save">Save reminders</button></div>`}
function getAppView(){return `<div class="page">${backHeader('Install app','Use Winter Arc like a native app.')}<div class="install-hero"><img src="icon-192.png" alt="Winter Arc"><b>${vStandalone()?'Already installed ✅':'Install Winter Arc'}</b><small>${vStandalone()?'You are already using the installed app shell.':'Use your browser menu or the install button when available.'}</small><button class="primary full" data-action="install">${installPrompt?'Install now 📱':'Open install help'}</button></div><div class="info-card"><b>Android / Chrome</b><span>Browser menu → Install app / Add to Home screen.</span></div><div class="info-card"><b>iPhone / Safari</b><span>Safari → Share → Add to Home Screen.</span></div></div>`}
function vStandalone(){try{return window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true}catch(e){return false}}
function creatorView(){return `<div class="page">${backHeader('Creator','Built and maintained by the creator.')}<section class="creator-card"><img src="${esc(data.creatorPhoto)}" alt="Creator"><div><b>${esc(data.creatorName)}</b><small>${esc(data.creatorHandle)}</small><p>${esc(data.creatorBio)}</p></div>${data.creatorLink?`<a href="${esc(data.creatorLink)}" target="_blank" rel="noopener" class="secondary full">Visit Instagram ↗</a>`:''}</section><div class="info-card"><b>Why this app is local-first</b><span>Your private habit details, journal, sleep and mood stay on this device unless you explicitly enable community sync.</span></div></div>`}
function settingsView(){return `<div class="page">${backHeader('Settings','Privacy, theme and sync.')}<div class="setting-row"><span><b>Dark mode</b><small>Change the app theme.</small></span><button class="secondary" data-action="theme">${data.dark?'Light':'Dark'}</button></div><div class="setting-row"><span><b>Local PIN</b><small>${data.pinHash?'PIN enabled':'No PIN set'}</small></span><button class="secondary" data-action="pin">${data.pinHash?'Change':'Set PIN'}</button></div><div class="setting-row"><span><b>Community sync</b><small>${data.cloudOptIn?'Enabled':'Off by default'}</small></span><button class="secondary" data-action="community">Manage</button></div><div class="setting-row"><span><b>Public profile</b><small>${data.publicProfile?'Visible in Top 20 when synced':'Private'}</small></span><button class="secondary" data-action="public-toggle">${data.publicProfile?'On':'Off'}</button></div><div class="setting-row"><span><b>Lock now</b><small>Require your local PIN next time.</small></span><button class="secondary" data-action="lock">Lock</button></div><div class="info-card"><b>Privacy</b><span>Private habit names, journal, sleep, mood and PIN are not sent to the community leaderboard.</span></div><button class="danger-btn full" data-action="reset-profile">Reset local profile</button></div>`}
function backupView(){return `<div class="page">${backHeader('Backup','Keep one fresh backup of this profile.')}<button class="primary full" data-action="backup">⬇ Export latest backup</button><label class="file-btn"><span>Restore a backup</span><input id="restoreFile" type="file" accept="application/json"></label><div class="info-card"><b>Recommended</b><span>Export a fresh backup after major changes. Restore replaces the current local profile.</span></div></div>`}
function aboutView(){return `<div class="page">${backHeader('About','Simple by design.')}<div class="about-hero"><b>Winter Arc Tracker ${VERSION}</b><span>1 Oct → 31 Dec · 92 days</span></div><div class="info-card"><b>Daily</b><span>Complete a few habits and keep the next action visible.</span></div><div class="info-card"><b>Week</b><span>See your 7-day pattern.</span></div><div class="info-card"><b>Rank</b><span>Optional public Top 20 community view.</span></div><div class="info-card"><b>More</b><span>Advanced tools stay out of the main screen.</span></div></div>`}

function shell(){
 const labels=[['today','⌂','Today'],['week','▦','Week'],['rank','🏆','Rank'],['profile','◯','Profile'],['more','•••','More']];
 const body=tab==='today'?todayView():tab==='week'?weekView():tab==='month'?monthView():tab==='arc'?arcView():tab==='rank'?rankView():tab==='profile'?profileView():moreView();
 return '<div class="app-shell"><header class="topbar"><button class="icon-btn" data-action="menu" aria-label="Menu">☰</button><div class="brand"><b>Winter Arc</b><small>2026 · '+esc(data.name||'Your Arc')+'</small></div><button class="icon-btn" data-action="share" aria-label="Share">↗</button><button class="profile-mini" data-action="account" aria-label="Account">'+esc((data.name||'A').slice(0,1).toUpperCase())+'</button></header><main>'+body+'</main><nav class="bottom-nav">'+labels.map(([id,icon,label])=>'<button class="'+(tab===id?'active':'')+'" data-nav="'+id+'"><b>'+icon+'</b><span>'+label+'</span></button>').join('')+'</nav>'+(menuOpen?menuSheet():'')+(selectedHabit?habitModal():'')+(sprint?sprintModal():'')+'</div>';
}
function menuSheet(){return '<div class="overlay" data-action="menu-close"><aside class="sheet"><div class="sheet-head"><div><span class="eyebrow">WINTER ARC</span><h2>Quick navigation</h2></div><button class="icon-btn" data-action="menu-close">×</button></div><button class="menu-link" data-nav="today"><b>Today</b><small>Your next win.</small><strong>→</strong></button><button class="menu-link" data-nav="week"><b>Week</b><small>Your 7-day pattern.</small><strong>→</strong></button><button class="menu-link" data-nav="month"><b>Month</b><small>Monthly pattern.</small><strong>→</strong></button><button class="menu-link" data-nav="arc"><b>Arc Details</b><small>Your full 92-day story.</small><strong>→</strong></button><button class="menu-link" data-nav="rank"><b>Top 20 Rank</b><small>Community leaderboard.</small><strong>→</strong></button><button class="menu-link" data-nav="profile"><b>Profile</b><small>Your identity and share card.</small><strong>→</strong></button><button class="menu-link" data-nav="more"><b>More</b><small>Tools and settings.</small><strong>→</strong></button></aside></div>'}

function habitModal(){const h=data.habits.find(x=>x.id===selectedHabit);if(!h)return '';return `<div class="overlay" data-action="habit-close"><div class="modal"><div class="sheet-head"><div><span class="eyebrow">HABIT</span><h2>${esc(h.icon)} ${esc(h.name)}</h2></div><button class="icon-btn" data-action="habit-close">×</button></div><div class="profile-stats compact"><div><b>${habitStats(h).run}</b><small>Current</small></div><div><b>${habitStats(h).longest}</b><small>Best</small></div><div><b>${habitStats(h).total}</b><small>Wins</small></div></div><label class="label">Icon<input id="habitIcon" maxlength="4" value="${esc(h.icon)}"></label><label class="label">Smallest action<input id="habitAction" value="${esc(h.action||'')}"></label><label class="label">Best time<input id="habitTime" type="time" value="${esc(h.time||'')}"></label><label class="label">Difficulty<select id="habitDifficulty"><option ${h.difficulty==='Easy'?'selected':''}>Easy</option><option ${h.difficulty==='Medium'?'selected':''}>Medium</option><option ${h.difficulty==='Hard'?'selected':''}>Hard</option></select></label><label class="check-line"><input id="habitPrivate" type="checkbox" ${h.private?'checked':''}><span>Keep habit name private</span></label><button class="primary full" data-action="habit-save">Save changes</button><button class="danger-btn full" data-action="habit-delete" data-id="${h.id}">Delete habit</button></div></div>`}
function sprintModal(){const sec=Math.max(0,Math.ceil((sprint.ends-Date.now())/1000));return `<div class="overlay" data-action="sprint-close"><div class="modal center"><div class="eyebrow">FOCUS SPRINT</div><h2>One focused block.</h2><div class="timer">${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}</div><div class="choice-row">${[5,10,25].map(m=>`<button class="choice ${sprint.min===m?'selected':''}" data-action="sprint-min" data-value="${m}" ${sprint.running?'disabled':''}>${m}m</button>`).join('')}</div>${sprint.running?'<button class="primary full" data-action="sprint-stop">Finish sprint ✓</button>':'<button class="primary full" data-action="sprint-start">Start sprint →</button>'}<button class="secondary full" data-action="sprint-close">Not now</button></div></div>`}

async function shareArc(){
 const s=stats(),score=arcScore();
 try{
  const c=document.createElement('canvas');c.width=1080;c.height=1350;const ctx=c.getContext('2d');ctx.fillStyle='#173f3a';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='#bfe8ca';ctx.font='700 30px Arial';ctx.fillText('WINTER ARC 2026',80,110);ctx.fillStyle='#fff';ctx.font='900 86px Arial';ctx.fillText(`DAY ${s.day} / ${ARC_DAYS}`,80,240);ctx.font='800 58px Arial';ctx.fillText(`${arcPct()}% ARC PROGRESS`,80,330);ctx.font='600 32px Arial';ctx.fillStyle='#d8ece1';ctx.fillText(`${s.completed} total wins · 🔥 ${s.best} best streak`,80,390);ctx.fillStyle='#7bd29b';ctx.fillRect(80,440,920,28);ctx.fillStyle='#fff';ctx.fillRect(80,440,920*arcPct()/100,28);ctx.fillStyle='#fff';ctx.font='900 54px Arial';ctx.fillText(`${score}/100 ARC SCORE`,80,590);ctx.font='800 28px Arial';ctx.fillText(data.name||'My Arc',80,730);ctx.font='500 24px Arial';ctx.fillStyle='#cbe4d8';ctx.fillText('Small wins become your story.',80,780);ctx.fillText(WEBSITE.replace(/^https?:\/\//,''),80,1230);const blob=await new Promise(r=>c.toBlob(r,'image/png',.95));const file=new File([blob],'winter-arc-v22.1.png',{type:'image/png'});const text=`My Winter Arc progress: Day ${s.day}/${ARC_DAYS} · ${arcPct()}% · ${s.completed} wins 🔥`;if(navigator.share){if(navigator.canShare?.({files:[file]})){await navigator.share({title:'My Winter Arc',text,files:[file]});return}await navigator.share({title:'My Winter Arc',text,url:WEBSITE});return}const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='winter-arc-v22.1.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);showToast('Share card saved ↗');
 }catch(e){try{await navigator.clipboard?.writeText(`My Winter Arc progress: Day ${s.day}/${ARC_DAYS} · ${arcPct()}% · ${s.completed} wins 🔥\n${WEBSITE}`);showToast('Progress link copied ↗')}catch(_){showToast('Sharing is not available here')}}
}
async function syncCloud(){if(!data.cloudOptIn||!window.CLOUD_CFG?.url||!window.CLOUD_CFG?.anonKey)return false;try{const u=String(CLOUD_CFG.url).replace(/\/$/,'');const id=data.cloudUserId||crypto.randomUUID();data.cloudUserId=id;const s=stats();const body={id,display_name:data.name||'Anonymous',instagram_handle:data.profileInstagram||'',arc_day:s.day,total_arc_days:ARC_DAYS,arc_progress:arcPct(),today_completed:s.todayDone,total_habits:data.habits.length,total_wins:s.completed,best_streak:s.best,public_profile:!!data.publicProfile,week_score:weeklyScore(),rank_score:arcScore(),league:league(arcScore()),week_key:today(),last_seen:new Date().toISOString()};const r=await fetch(u+'/rest/v1/arc_users',{method:'POST',headers:{apikey:CLOUD_CFG.anonKey,Authorization:'Bearer '+CLOUD_CFG.anonKey,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates'},body:JSON.stringify(body)});if(!r.ok)throw new Error(String(r.status));data.cloudLastSync=new Date().toISOString();data.cloudStatus='Synced ✓';save();return true}catch(e){data.cloudStatus='Sync failed';save();return false}}
function communitySettings(){return `<div class="page">${backHeader('Community sync','Off by default. Only opt-in data is shared.')}<label class="check-line"><input id="cloudOpt" type="checkbox" ${data.cloudOptIn?'checked':''}><span><b>Join the community</b><small>Your name, Arc progress, wins, best streak and last seen can sync.</small></span></label><label class="check-line"><input id="publicOpt" type="checkbox" ${data.publicProfile?'checked':''}><span><b>Allow public profile</b><small>Lets your shared stats appear in Top 20.</small></span></label><button class="primary full" data-action="community-save">Save choice</button><div class="info-card"><b>Private data stays local</b><span>Habit names marked private, journal, sleep, mood, PIN and notes are not part of the public leaderboard payload.</span></div></div>`}
function pinModal(){return `<div class="overlay" data-action="generic-close"><div class="modal"><div class="sheet-head"><div><span class="eyebrow">LOCAL PIN</span><h2>${data.pinHash?'Change PIN':'Set a PIN'}</h2></div><button class="icon-btn" data-action="generic-close">×</button></div><label class="label">Your name<input id="pinName" value="${esc(data.name)}"></label><label class="label">New PIN<input id="pinA" type="password" inputmode="numeric" maxlength="6" placeholder="4–6 digits"></label><label class="label">Confirm PIN<input id="pinB" type="password" inputmode="numeric" maxlength="6"></label><button class="primary full" data-action="pin-save">Save PIN</button>${data.pinHash?'<button class="danger-btn full" data-action="pin-remove">Remove PIN</button>':''}</div></div>`}

function render(){document.body.classList.toggle('dark',!!data.dark);if(locked()){document.body.innerHTML=loginView();return}if(!profileReady()){document.body.innerHTML=onboardingView();return}document.body.innerHTML=shell()}

// Single delegated event system keeps the UI responsive and avoids the duplicate listener layers of older builds.
document.addEventListener('click',async e=>{
 const b=e.target.closest('button,a,[data-action],[data-nav],[data-more]');if(!b)return;if(b.classList?.contains('overlay')&&e.target!==b)return;
 if(b.tagName==='A'&&b.getAttribute('href')?.startsWith('http'))return;
 const nav=b.dataset.nav,more=b.dataset.more,action=b.dataset.action;
 if(more){e.preventDefault();tab='more';morePanel=more;menuOpen=false;selectedHabit=null;render();if(more==='rank')loadRank();return}
 if(nav){e.preventDefault();tab=nav;morePanel='';menuOpen=false;selectedHabit=null;render();if(tab==='rank'&&rankState==='idle')loadRank();return}
 if(action==='login'){const pin=$('#loginPin')?.value.trim()||'';if(!/^\d{4,6}$/.test(pin))return showToast('Enter your 4–6 digit PIN');const h=await hashPin(pin);if(h!==data.pinHash)return showToast('Wrong PIN');sessionUnlocked=true;data.lastLogin=today();save();render();showToast('Welcome back 👋');if(data.cloudOptIn)syncCloud(false);return}
 if(action==='on-next'){if(onboardingStep===1){const n=$('#onName')?.value.trim();if(!n)return showToast('Enter your name first');data.name=n;data.goal=onboardingGoal;save()}onboardingStep=Math.min(3,onboardingStep+1);render();return}
 if(action==='on-back'){onboardingStep=Math.max(0,onboardingStep-1);render();return}
 if(action==='on-tour'){showToast('Today → Week → Rank → More. Start simple.');return}
 if(action==='add-custom'){const n=$('#customHabit')?.value.trim();if(!n)return;if(onboardingSelected.length>=3)return showToast('Pick up to 3 habits');if(!onboardingSelected.some(x=>x.toLowerCase()===n.toLowerCase()))onboardingSelected.push(n);render();return}
 if(action==='finish-onboarding'){if(onboardingSelected.length!==3)return showToast('Pick exactly 3 habits');data.name=data.name.trim();data.goal=onboardingGoal;data.habits=[];onboardingSelected.forEach(n=>addHabit(n));data.profileCreated=true;data.onboardingDone=true;data.journeyStart=today();data.lastLogin=today();save();tab='today';render();showToast('Your Arc is live 🚀');return}
 if(action==='toggle'){const h=data.habits.find(x=>x.id===b.dataset.id);if(h)toggleHabit(h,today());return}
 if(action==='toggle-date'){const h=data.habits.find(x=>x.id===b.dataset.id);if(h)toggleHabit(h,b.dataset.date);return}
 if(action==='month-set'){const m=b.dataset.month;if(['2026-10','2026-11','2026-12'].includes(m)){monthCursor=m;render()}return}
 if(action==='account'){tab='profile';morePanel='';menuOpen=false;selectedHabit=null;render();return}
 if(action==='menu'){menuOpen=true;render();return}
 if(action==='menu-close'){menuOpen=false;render();return}
 if(action==='habit-close'){selectedHabit=null;render();return}
 if(action==='habit-edit'){selectedHabit=b.dataset.id;render();return}
 if(action==='habit-add'){const n=prompt('Habit name','Drink Water');if(n&&addHabit(n)){save();render();showToast('Habit added ✅')}return}
 if(action==='habit-delete'){deleteHabit(b.dataset.id||selectedHabit);return}
 if(action==='habit-save'){const h=data.habits.find(x=>x.id===selectedHabit);if(!h)return;h.icon=$('#habitIcon')?.value||h.icon;h.action=$('#habitAction')?.value.trim()||h.action;h.time=$('#habitTime')?.value||'';h.difficulty=$('#habitDifficulty')?.value||h.difficulty;h.private=!!$('#habitPrivate')?.checked;save();selectedHabit=null;render();showToast('Habit updated ✅');return}
 if(action==='goal-save'){data.goal=$('#goalInput')?.value.trim()||'';data.target=Math.max(1,Math.min(365,Number($('#goalTarget')?.value||7)));data.achieved=Math.max(0,Math.min(data.target,Number($('#goalAchieved')?.value||0)));save();render();showToast('Goal saved 🎯');return}
 if(action==='routine-save'){const name=$('#routineName')?.value.trim();const items=$$('[data-routine]:checked').map(x=>x.dataset.routine);if(!name||!items.length)return showToast('Add a name and choose habits');data.routines.push({id:uid(),name,icon:'🔁',items,step:0});save();render();showToast('Routine saved 🔁');return}
 if(action==='routine-start'){const r=data.routines.find(x=>x.id===b.dataset.id);if(!r)return;data.activeRoutine=r.id;save();tab='today';morePanel='';render();showToast(`${r.name} started ▶`);return}
 if(action==='mood'){data.mood[today()]=Number(b.dataset.value);save();render();return}
 if(action==='energy'){data.energy[today()]=Number(b.dataset.value);save();render();return}
 if(action==='journal-save'){data.notes[today()]=$('#journalText')?.value||'';save();render();showToast('Reflection saved ✍️');return}
 if(action==='sleep-save'){data.sleep[today()]={hours:Number($('#sleepHours')?.value||0),bed:$('#sleepBed')?.value||'',wake:$('#sleepWake')?.value||''};save();render();showToast('Sleep saved 😴');return}
 if(action==='reminders-save'){data.habits.forEach(h=>{data.reminders[h.id]={time:$(`[data-rem-time="${h.id}"]`)?.value||'',enabled:!!$(`[data-rem-on="${h.id}"]`)?.checked}});save();render();showToast('Reminders saved ⏰');return}
 if(action==='theme'){data.dark=!data.dark;save();render();return}
 if(action==='community'){morePanel='community';render();return}
 if(action==='community-save'){data.cloudOptIn=!!$('#cloudOpt')?.checked;data.publicProfile=!!$('#publicOpt')?.checked;save();const ok=await syncCloud();render();showToast(data.cloudOptIn?(ok?'Community sync enabled ☁️':'Saved locally; sync unavailable'):'Community sync off');return}
 if(action==='public-toggle'){data.publicProfile=!data.publicProfile;save();if(data.cloudOptIn)await syncCloud();render();return}
 if(action==='lock'){if(!data.pinHash)return showToast('Set a PIN first');sessionUnlocked=false;render();return}
 if(action==='pin'){document.body.insertAdjacentHTML('beforeend',pinModal());return}
 if(action==='pin-save'){const a=$('#pinA')?.value.trim(),bb=$('#pinB')?.value.trim(),n=$('#pinName')?.value.trim();if(!/^\d{4,6}$/.test(a)||a!==bb)return showToast('PIN must be 4–6 digits and match');if(n)data.name=n;data.pinHash=await hashPin(a);sessionUnlocked=true;save();render();showToast('PIN saved 🔒');return}
 if(action==='pin-remove'){data.pinHash='';sessionUnlocked=true;save();render();showToast('PIN removed');return}
 if(action==='generic-close'){b.closest('.overlay')?.remove();return}
 if(action==='backup'){const blob=new Blob([JSON.stringify(Object.assign({},data,{schema:22,backupVersion:'V22.1',backupCreated:new Date().toISOString()}),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`winter-arc-v22.1-backup-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);showToast('Latest backup exported 💾');return}
 if(action==='reset-profile'){if(!confirm('Reset this local profile and delete local tracker data?'))return;[KEY,...OLD_KEYS].forEach(k=>localStorage.removeItem(k));location.href=location.pathname;return}
 if(action==='install'){if(vStandalone())return showToast('Already installed 📱');if(installPrompt){await installPrompt.prompt();installPrompt=null;return}showToast('Browser menu → Install app / Add to Home screen');return}
 if(action==='share'){await shareArc();return}
 if(action==='sprint'){sprint={min:10,ends:Date.now()+10*60000,running:false};render();return}
 if(action==='sprint-close'){sprint=null;clearInterval(window.__v21SprintTimer);render();return}
 if(action==='sprint-min'){if(!sprint||sprint.running)return;sprint.min=Number(b.dataset.value)||10;sprint.ends=Date.now()+sprint.min*60000;render();return}
 if(action==='sprint-start'){if(!sprint)return;sprint.running=true;sprint.ends=Date.now()+sprint.min*60000;clearInterval(window.__v21SprintTimer);window.__v21SprintTimer=setInterval(()=>{if(!sprint)return clearInterval(window.__v21SprintTimer);if(Date.now()>=sprint.ends){clearInterval(window.__v21SprintTimer);sprint=null;showToast('Focus sprint complete 🎯');render()}else{const el=document.querySelector('.timer');if(el){const sec=Math.ceil((sprint.ends-Date.now())/1000);el.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')}}},250);render();return}
 if(action==='sprint-stop'){clearInterval(window.__v21SprintTimer);sprint=null;render();showToast('Sprint finished 🎯');return}
 if(action==='rank-refresh'){await loadRank();return}
 if(action==='more-back'){morePanel='';render();return}
 if(action==='edit-profile'){const n=prompt('Your name',data.name);if(n?.trim()){data.name=n.trim();save();render();}return}
 if(action==='edit-goal'){const g=prompt('Main focus',data.goal||'Personal growth');if(g?.trim()){data.goal=g.trim();save();render();}return}
});
document.addEventListener('click',e=>{const g=e.target.closest('[data-goal]');if(g){onboardingGoal=g.dataset.goal;data.goal=onboardingGoal;save();render();return}const p=e.target.closest('[data-pick]');if(p){const name=p.dataset.pick;const i=onboardingSelected.indexOf(name);if(i>=0)onboardingSelected.splice(i,1);else if(onboardingSelected.length<3)onboardingSelected.push(name);else showToast('Pick up to 3 habits');render();return}},true);
document.addEventListener('input',e=>{if(e.target.id==='rankSearch'){search=e.target.value;render();const el=$('#rankSearch');if(el){el.focus();el.setSelectionRange(search.length,search.length)}}});
document.addEventListener('change',async e=>{if(e.target.id==='restoreFile'&&e.target.files?.[0]){try{const raw=await e.target.files[0].text();const parsed=normalize(JSON.parse(raw));if(!parsed.name&&!parsed.habits.length)throw new Error('empty');data=parsed;sessionUnlocked=true;save();render();showToast('Backup restored ✅')}catch(err){showToast('Invalid backup file')}}});
function reminderTick(){if(locked()||!data.habits.length)return;const hm=new Date().toTimeString().slice(0,5);for(const h of data.habits){const r=data.reminders[h.id];if(r?.enabled&&r.time===hm&&r.lastSent!==today()){r.lastSent=today();save();try{if('Notification'in window&&Notification.permission==='granted')new Notification('Winter Arc Tracker',{body:`${h.icon} ${h.name}: ${h.action||'Your planned action is ready.'}`})}catch(e){}showToast(`⏰ ${h.name} — time for your action`)}}}
setInterval(reminderTick,30000);

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});
window.addEventListener('appinstalled',()=>{installPrompt=null;showToast('App installed 📱')});
try{if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').then(r=>r.update()).catch(()=>{})}catch(e){}

// Initial setup for brand-new users: preload the suggested 3 habits only after the wizard is completed.
if(profileReady()&&tab==='rank'&&rankState==='idle')setTimeout(loadRank,0);
render();
})();
