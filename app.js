(function(){
'use strict';

const VERSION='V12';
const KEY='progress_tracker_v12';
const OLD_KEYS=['progress_tracker_v11','progress_tracker_v10','progress_tracker_v9','progress_tracker_v8','progress_tracker_v6','progress_tracker_v5','progress_tracker_v4','progress_tracker_v3_plain'];
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const currentMonth=()=>today().slice(0,7);
const daysInMonth=m=>{const [y,mo]=m.split('-').map(Number);return new Date(y,mo,0).getDate()};
const makeDays=m=>Array.from({length:daysInMonth(m)},(_,i)=>m+'-'+String(i+1).padStart(2,'0'));
const dateObj=d=>new Date(d+'T12:00:00');
const localDate=d=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const addDays=(d,n)=>{const x=dateObj(d);x.setDate(x.getDate()+n);return localDate(x)};
const dateDiff=(a,b)=>Math.round((dateObj(b)-dateObj(a))/86400000);
const canEdit=d=>String(d)<=today();
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const formatDay=d=>dateObj(d).toLocaleDateString(undefined,{day:'numeric',month:'short'});
const formatLong=d=>dateObj(d).toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short'});

const PRESETS=[
 {name:'Exercise',icon:'🏃',cat:'Health',difficulty:'Medium',action:'5 minutes of movement'},
 {name:'Study / Work',icon:'📚',cat:'Focus',difficulty:'Hard',action:'10 minutes of focused work'},
 {name:'Drink Water',icon:'💧',cat:'Health',difficulty:'Easy',action:'Drink 1 glass now'},
 {name:'Read',icon:'📖',cat:'Mind',difficulty:'Easy',action:'Read 2 pages'},
 {name:'Meditation',icon:'🧘',cat:'Mind',difficulty:'Easy',action:'2 minutes of breathing'},
 {name:'Sleep on Time',icon:'😴',cat:'Health',difficulty:'Medium',action:'Start a wind-down routine'},
 {name:'Walk',icon:'🚶',cat:'Health',difficulty:'Easy',action:'5 minutes of walking'},
 {name:'Healthy Food',icon:'🥗',cat:'Health',difficulty:'Medium',action:'Make one healthy choice'},
 {name:'Less Phone',icon:'📵',cat:'Focus',difficulty:'Medium',action:'Keep phone away for 15 min'},
 {name:'Masturbation',icon:'🔒',cat:'Private',private:true,difficulty:'Medium',action:'Follow your chosen boundary'}
];

const DAY_MESSAGES={
1:'Aaj result chase mat karo. Bas ek habit complete karo — tumne start kar diya, wahi first win hai.',
2:'Day 2. Kal start kiya tha, aaj repeat karna important hai.',
3:'3 days complete. Ab goal perfect hona nahi, next action ko easy rakhna hai.',
4:'Day 4. Small actions ko routine ka part banne do.',
5:'5 days. Tumhara system ab sirf plan nahi raha — actions bhi collect ho rahe hain.',
6:'Day 6. Agar difficult lag raha hai to smallest useful version choose karo.',
7:'7 days complete! Ek week pehle ye plan tha; ab tumhare actions ka part ban raha hai.',
8:'Day 8. Consistency ka matlab har din perfect hona nahi.',
9:'9 days. Jo habit easy repeat hoti hai, wahi long-term system banati hai.',
10:'Day 10. Double digits! Ab next target ko simple rakho.',
11:'11 days. Aaj ka ek small win kal ke momentum ko support karega.',
12:'12 days. Jo difficult hai uska smaller version try karo.',
13:'13 days. Progress ko notice karo, sirf streak ko nahi.',
14:'14 days! Do weeks complete. Ab dekho kya naturally easier lag raha hai.',
15:'Day 15. Ek aur useful checkpoint — perfect hone ki zarurat nahi.',
16:'16 days. Apne routine ko realistic rakhna consistency ko support karta hai.',
17:'17 days. Aaj bas next action par focus karo.',
18:'18 days. Normal days par repeat karna bhi progress hai.',
19:'19 days. Small wins ko underestimate mat karo.',
20:'20 days. Pichhle weeks ke pattern ko dekho aur learn karo.',
21:'21 days! 🎯 Teen weeks complete. System ko sustainable rakhna ab focus hai.',
22:'22 days. Missed day history ko erase nahi karta.',
23:'23 days. Aaj ka action kal ke liye ek easy starting point bana sakta hai.',
24:'24 days. Strong habit ko protect karo aur weak habit ko simplify karo.',
25:'25 days. Consistency ka real test normal days hote hain.',
26:'26 days. Tumhara data batata hai kya kaam kar raha hai.',
27:'27 days. Ek aur small win.',
28:'28 days. Four weeks of practice — reflection useful hai.',
29:'29 days. Kal ek month complete hoga; aaj simply show up karo.',
30:'30 days complete! 🎉 Pichhle 30 din dekho: kya better hua, kya difficult raha, aur next month kya build karna hai.',
45:'45 days! Tumne ek longer consistency milestone cross kiya.',
60:'60 days! Two months of practice. Ab system ko sustainable rakhna focus hai.',
75:'75 days! Tumhare actions ka meaningful history ban chuka hai.',
90:'90 days! 🔥 Teen months of practice. Review karo kaunse habits genuinely fit hue.',
100:'100 days! Strong consistency milestone. Ab next chapter ko intentional rakho.'
};

function defaults(){return {
 schema:12,name:'',month:currentMonth(),habits:[],checks:{},freezes:{},freezeUsed:{},xpEvents:{},bonusEvents:{},sleep:{},notes:{},habitNotes:{},
 goal:'',target:7,achieved:0,win:'',barrier:'',ifThen:'',dark:false,xp:0,onboardingDone:false,journeyStart:'',mood:{},energy:{},planner:{},
 routines:[],activeRoutine:null,goalLinks:[],reminders:{},pinHash:'',profileCreated:false,lastLogin:'',coachEnabled:true,installHint:true
}};

let data=load();
let tab='today';
let morePanel='';
let selectedHabit=null;
let quickOpen=false;
let focusMode=false;
let habitFilter='all';
let habitSearch='';
let toastTimer=null;
let installPrompt=null;
let sessionUnlocked=!data.pinHash;

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;window.__v11InstallPrompt=e});
window.addEventListener('appinstalled',()=>{installPrompt=null;window.__v11InstallPrompt=null;showToast('App installed 📱')});

function normalize(x){
 const d=Object.assign(defaults(),x||{});
 if(!d.checks||typeof d.checks!=='object')d.checks={};
 if(!d.freezes||typeof d.freezes!=='object')d.freezes={};
 if(!d.freezeUsed||typeof d.freezeUsed!=='object')d.freezeUsed={};
 if(!d.xpEvents||typeof d.xpEvents!=='object')d.xpEvents={};
 if(!d.bonusEvents||typeof d.bonusEvents!=='object')d.bonusEvents={};
 ['sleep','notes','habitNotes','mood','energy','planner','reminders'].forEach(k=>{if(!d[k]||typeof d[k]!=='object')d[k]={}});
 if(!Array.isArray(d.routines))d.routines=[];
 if(!Array.isArray(d.goalLinks))d.goalLinks=[];
 if(!Array.isArray(d.habits))d.habits=[];
 d.habits=d.habits.filter(Boolean).map(h=>Object.assign({
   id:uid(),name:'Habit',icon:'✅',private:false,created:currentMonth(),difficulty:'Medium',action:'Do the smallest useful version',time:'',smallWin:'Do the smallest useful version',why:''
 },typeof h==='string'?{name:h}:h));
 d.routines=d.routines.filter(r=>r&&r.name).map(r=>Object.assign({id:uid(),name:'Routine',icon:'🔁',items:[],step:0},r));
 d.xp=Number(d.xp)||0;
 d.target=Math.max(1,Number(d.target)||7);
 d.achieved=Math.max(0,Math.min(d.target,Number(d.achieved)||0));
 d.month=/^\d{4}-\d{2}$/.test(d.month)?d.month:currentMonth();
 d.pinHash=String(d.pinHash||'');
 d.lastLogin=String(d.lastLogin||'');
 d.schema=12;
 return d;
}

function saveObj(o){try{localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}}
function save(){saveObj(data)}

function load(){
 try{
  const cur=JSON.parse(localStorage.getItem(KEY)||'null');
  if(cur)return normalize(cur);
  for(const k of OLD_KEYS){
   const old=JSON.parse(localStorage.getItem(k)||'null');
   if(old){
    const m=normalize(old);
    m.onboardingDone=!!(old.onboardingDone||old.name);
    m.name=old.name||m.name;
    m.journeyStart=old.journeyStart||m.journeyStart||today();
    m.schema=12;
    saveObj(m);
    return m;
   }
  }
 }catch(e){}
 return defaults();
}

function showToast(msg){
 clearTimeout(toastTimer);
 document.querySelector('.toast')?.remove();
 const el=document.createElement('div');el.className='toast';el.textContent=msg;document.body.appendChild(el);
 toastTimer=setTimeout(()=>el.remove(),1900);
}

function celebrate(){['✨','🔥','🎉','💪','⭐'].forEach((e,i)=>{const el=document.createElement('div');el.className='spark';el.textContent=e;el.style.left=(38+Math.random()*24)+'%';el.style.bottom=(90+Math.random()*28)+'px';el.style.setProperty('--dx',((Math.random()-.5)*180)+'px');document.body.appendChild(el);setTimeout(()=>el.remove(),850+i*50);});}

function key(h,d){return h.id+'|'+d}
function done(h,d){return !!data.checks[key(h,d)]}
function frozen(h,d){return !!data.freezes[key(h,d)]}
function active(h,d){return done(h,d)||frozen(h,d)}
function preset(name){return PRESETS.find(p=>p.name.toLowerCase()===String(name).toLowerCase())||null}
function canUseHabitOn(h,d){return d>=(h.created||'0000-00-00')}

function journeyStart(){
 if(data.journeyStart&&/^\d{4}-\d{2}-\d{2}$/.test(data.journeyStart))return data.journeyStart;
 const dates=[today(),...data.habits.map(h=>h.created).filter(Boolean),...Object.keys(data.checks).map(k=>k.split('|')[1]).filter(Boolean)].sort();
 data.journeyStart=dates[0]||today();save();return data.journeyStart;
}
function journeyDay(){return Math.max(1,dateDiff(journeyStart(),today())+1)}
function dayMessage(n){return DAY_MESSAGES[n]||`Day ${n}. Aaj ka next small action complete karo.`}
function nextMilestone(day){const ms=[3,7,14,21,30,45,60,75,90,100,150,180,365];return ms.find(x=>x>day)||Math.ceil((day+1)/100)*100}

function allDates(){
 const start=journeyStart();
 const n=Math.min(3650,Math.max(1,dateDiff(start,today())+1));
 return Array.from({length:n},(_,i)=>addDays(today(),i-(n-1)));
}

function habitStats(h){
 const dates=allDates().filter(d=>canUseHabitOn(h,d));
 let run=0,longest=0,cur=0;
 let startedToday=false;
 if(dates.length){
  if(active(h,today()))startedToday=true;
  let idx=dates.length-1;
  if(!startedToday&&dates[idx]===today())idx--;
  for(;idx>=0;idx--){if(active(h,dates[idx]))run++;else break;}
 }
 for(const d of dates){if(active(h,d)){cur++;longest=Math.max(longest,cur)}else cur=0}
 const total=dates.filter(d=>done(h,d)).length;
 const last7=dates.slice(-7);const weekDone=last7.filter(d=>active(h,d)).length;
 const md=makeDays(data.month).filter(d=>canUseHabitOn(h,d));
 const eligible=md.filter(d=>d<=today()).length||1;
 const monthDone=md.filter(d=>d<=today()&&done(h,d)).length;
 return {run,longest,total,weekDone,weekPct:Math.round(weekDone/7*100),monthDone,monthPct:Math.round(monthDone/eligible*100)};
}

function stats(){
 const md=makeDays(data.month).filter(d=>d<=today());
 let total=0,completed=0;
 for(const d of md){for(const h of data.habits){if(canUseHabitOn(h,d)){total++;if(done(h,d))completed++}}}
 const todayDone=data.habits.filter(h=>done(h,today())).length;
 const all=allDates();
 let full=0;
 for(let i=all.length-1;i>=0;i--){const d=all[i];if(d===today()&&!data.habits.every(h=>active(h,d)))continue;if(data.habits.length&&data.habits.every(h=>active(h,d)))full++;else break}
 let longest=0,cur=0;
 for(const d of all){if(data.habits.length&&data.habits.every(h=>active(h,d))){cur++;longest=Math.max(longest,cur)}else cur=0}
 let bestH=null,best=0;
 for(const h of data.habits){const n=habitStats(h).total;if(n>best){best=n;bestH=h}}
 const sleepVals=md.map(d=>Number(data.sleep[d]?.hours)).filter(v=>v>0);
 const avg=sleepVals.length?sleepVals.reduce((a,b)=>a+b,0)/sleepVals.length:0;
 const firstWin=Object.keys(data.checks).some(k=>k.endsWith('|'+today()));
 return {total,completed,pct:total?Math.round(completed/total*100):0,todayDone,fullStreak:full,longest,bestH,best,avg,score:weeklyScore(),firstWin};
}

function weeklyScore(){
 const ds=allDates().slice(-7);let eligible=0,doneN=0;
 for(const d of ds){for(const h of data.habits){if(canUseHabitOn(h,d)){eligible++;if(active(h,d))doneN++}}}
 return eligible?Math.min(100,Math.round(doneN/eligible*100)):0;
}
function personalScore(){
 if(!data.habits.length)return 0;
 const s=stats();
 const todayPart=Math.round(s.todayDone/data.habits.length*100);
 const streakPart=Math.min(20,s.fullStreak*3);
 return Math.min(100,Math.round(todayPart*.4+s.score*.4+streakPart));
}

function focusHabit(){
 if(!data.habits.length)return null;
 const open=data.habits.filter(h=>!done(h,today()));
 return (open.length?open:data.habits).slice().sort((a,b)=>{
  const ar=habitStats(a).run,br=habitStats(b).run;
  if(ar!==br)return ar-br;
  const ad=a.time||'23:59',bd=b.time||'23:59';return ad.localeCompare(bd);
 })[0];
}
function coach(){
 if(!data.habits.length)return ['🌱 Coach','Start with one habit. The first win is more useful than a perfect plan.'];
 const s=stats(),f=focusHabit();
 if(s.todayDone===data.habits.length)return ['🔥 Coach','Today is complete. Write tomorrow’s easiest first action before you leave.'];
 if(s.todayDone===0)return ['🌱 Coach',f?`Pick ${f.name} and do this: ${f.action||'the smallest useful version'}.`:'Pick one easy action and begin.'];
 if(f)return ['🎯 Coach',`You have ${s.todayDone}/${data.habits.length} done. Next: ${f.name} — ${f.action||'smallest useful version'}.`];
 return ['🧠 Coach','Keep the next action smaller than the excuse. One more win is enough for now.'];
}
function recovery(h){const r=habitStats(h).run;if(r===0)return 'Restart mode: use the easiest version today.';if(r<3)return 'Rebuilding momentum — protect the next small win.';if(r<7)return 'Momentum is growing — keep the action easy to repeat.';return 'Strong momentum — protect the routine, not only the number.'}

function addXpEvent(k,n){data.xpEvents[k]=n;data.xp=(data.xp||0)+n}
function removeXpEvent(k){if(data.xpEvents[k]){data.xp-=Number(data.xpEvents[k])||0;delete data.xpEvents[k]}}
function recalcBonus(d){
 const hasAny=data.habits.some(h=>done(h,d));
 const allDone=data.habits.length>0&&data.habits.every(h=>done(h,d));
 const b=data.bonusEvents[d]||{first:0,full:0};
 const desired={first:hasAny?15:0,full:allDone?25:0};
 data.xp+=desired.first-b.first;
 data.xp+=desired.full-b.full;
 data.bonusEvents[d]=desired;
 data.xp=Math.max(0,Math.round(data.xp));
}
function toggleHabit(h,d){
 if(!canEdit(d)){showToast('Future dates cannot be completed.');return}
 if(frozen(h,d)){showToast('This day is frozen. Tap Undo Freeze first.');return}
 const k=key(h,d);
 if(!done(h,d)){data.checks[k]=true;addXpEvent(k,10);recalcBonus(d);save();celebrate();showToast('Nice! +10 XP 🔥')}else{delete data.checks[k];removeXpEvent(k);recalcBonus(d);save();showToast('Check removed')}
 if(data.activeRoutine){const r=data.routines.find(x=>x.id===data.activeRoutine);if(r&&routineCurrent(r)?.id===h.id&&done(h,d)){r.step=Math.min(r.items.length,r.step+1);save()}}
 render();
}
function freezeMonthKey(){return currentMonth()}
function freezeAvailable(){return !data.freezeUsed[freezeMonthKey()]}
function toggleFreeze(h,d){
 if(!canEdit(d)){showToast('Future dates cannot be frozen.');return}
 const k=key(h,d);
 if(done(h,d)){showToast('Undo the completion first.');return}
 if(frozen(h,d)){delete data.freezes[k];delete data.freezeUsed[freezeMonthKey()];save();showToast('Freeze removed 🛡️');render();return}
 if(!freezeAvailable()){showToast('This month’s freeze is already used 🛡️');return}
 data.freezes[k]=true;data.freezeUsed[freezeMonthKey()]=true;save();showToast('Monthly freeze used 🛡️');render();
}

function addHabit(name,icon='✅',privateFlag=false,difficulty='Medium',action='Do the smallest useful version'){
 const n=String(name||'').trim();if(!n)return false;
 if(data.habits.some(h=>h.name.toLowerCase()===n.toLowerCase())){showToast('That habit already exists.');return false}
 data.habits.push({id:uid(),name:n,icon,private:!!privateFlag,created:currentMonth(),difficulty,action,time:'',smallWin:action,why:''});save();return true;
}
function removeHabit(h){
 if(!confirm('Delete this habit and its history?'))return;
 data.habits=data.habits.filter(x=>x.id!==h.id);
 Object.keys(data.checks).forEach(k=>{if(k.startsWith(h.id+'|')){removeXpEvent(k);delete data.checks[k]}});
 Object.keys(data.freezes).forEach(k=>{if(k.startsWith(h.id+'|'))delete data.freezes[k]});
 delete data.habitNotes[h.id];delete data.reminders[h.id];data.goalLinks=data.goalLinks.filter(id=>id!==h.id);
 selectedHabit=null;save();render();showToast('Habit deleted');
}

function habitMatches(h){
 const q=habitSearch.toLowerCase();
 const match=!q||h.name.toLowerCase().includes(q)||String(h.action||'').toLowerCase().includes(q);
 if(!match)return false;
 if(habitFilter==='private')return !!h.private;
 if(habitFilter==='easy')return h.difficulty==='Easy';
 if(habitFilter==='medium')return h.difficulty==='Medium';
 if(habitFilter==='hard')return h.difficulty==='Hard';
 return true;
}

function routineItems(r){return r.items.map(id=>data.habits.find(h=>h.id===id)).filter(Boolean)}
function routineCurrent(r){
 const items=routineItems(r);if(!items.length)return null;
 const current=items[r.step]||items.find(h=>!done(h,today()));return current||items[items.length-1];
}
function routineProgress(r){const items=routineItems(r);const doneCount=items.filter(h=>done(h,today())).length;return {items,doneCount,pct:items.length?Math.round(doneCount/items.length*100):0}}
function startRoutine(id){const r=data.routines.find(x=>x.id===id);if(!r)return;r.step=0;data.activeRoutine=id;save();tab='today';morePanel='';render();showToast(`${r.name} started ▶`)}
function finishRoutine(){data.activeRoutine=null;save();render();showToast('Routine finished ✅')}

function achievements(){
 const s=stats();const best=Math.max(0,...data.habits.map(h=>habitStats(h).longest));
 return [
  ['First Win',s.completed>=1],['3-Day Streak',best>=3],['7-Day Streak',best>=7],['30-Day Streak',best>=30],['100 Checks',s.completed>=100],['Perfect Week',weeklyScore()===100],['Level 5',level()>=5],['Day 30 Journey',journeyDay()>=30]
 ];
}
function level(){return Math.floor(Math.max(0,data.xp)/100)+1}
function levelXp(){return Math.max(0,data.xp)%100}

function weeklyBars(){const ds=allDates().slice(-7);return `<div class="week-bars">${ds.map(d=>{let eligible=0,n=0;data.habits.forEach(h=>{if(canUseHabitOn(h,d)){eligible++;if(active(h,d))n++}});const pct=eligible?Math.round(n/eligible*100):0;return `<div class="wbar"><div class="barfill" style="height:${Math.max(5,pct)}%"></div><small>${dateObj(d).toLocaleDateString(undefined,{weekday:'short'}).slice(0,2)}</small></div>`}).join('')}</div>`}
function moodChart(){const ds=allDates().slice(-7);return `<div class="chart-grid">${ds.map(d=>{const m=Number(data.mood[d]||0);const e=Number(data.energy[d]||0);const v=Math.max(m,e);return `<div class="chart-col"><div class="col-bar" style="height:${Math.max(7,v*20)}%"></div><small>${dateObj(d).toLocaleDateString(undefined,{weekday:'short'}).slice(0,2)}</small></div>`}).join('')}</div>`}
function scoreBreakdown(){const s=stats();return `<div class="grid three"><div class="stat"><small>Today</small><b>${s.todayDone}/${data.habits.length}</b></div><div class="stat"><small>Week</small><b>${s.score}%</b></div><div class="stat"><small>Level</small><b>${level()}</b></div></div>`}

function nav(){return [['home','🏠 Home'],['today','✅ Today'],['habits','☑️ Habits'],['stats','📊 Stats'],['more','••• More']]}
function bottomNav(){return `<nav class="bottom">${nav().map(([n,l])=>`<button data-tab="${n}" class="${tab===n?'active':''}">${l}</button>`).join('')}</nav>`}

function homePage(){
 const s=stats(),score=personalScore(),f=focusHabit(),c=coach(),day=journeyDay();
 const target=nextMilestone(day);
 return `
 <section class="card hero"><div class="hero-flex"><div class="hero-copy"><div class="kicker">PERSONAL GROWTH OS · ${VERSION}</div><h2>${data.name?`Welcome, ${escapeHtml(data.name)} 👋`:'Your progress, one small win at a time'}</h2><p>${s.todayDone}/${data.habits.length} habits complete today. Start with the next small action instead of planning everything.</p><div class="quick-actions"><button class="btn primary" data-action="focus">🎯 ${f?'Start focus':'Add first habit'}</button><button class="btn" data-tab="today">Open Today</button></div></div><div class="score-ring" style="--score:${score}"><span><b>${score}</b><small>score</small></span></div></div></section>
 <section class="card"><div class="section"><h2>⚡ Your level</h2><span class="badge">${data.xp} XP</span></div>${scoreBreakdown()}<div class="top-progress" style="margin-top:10px"><i style="width:${levelXp()}%"></i></div><div class="muted smalltext">Level ${level()} · ${100-levelXp()} XP to next level</div></section>
 ${f?`<section class="card focus"><div class="section"><h2>🎯 Today’s Focus</h2><span class="badge">${focusMode?'Focus mode':'Small win'}</span></div><div class="focus-row"><div class="focus-icon">${escapeHtml(f.icon)}</div><div class="focus-copy"><div class="habit-title">${escapeHtml(f.name)}</div><div class="focus-action">${escapeHtml(f.action||'Do the smallest useful version')}</div><div class="muted smalltext">${recovery(f)}</div></div><button class="focus-check ${done(f,today())?'done':''}" data-toggle="${f.id}|${today()}">${done(f,today())?'✓':'→'}</button></div></section>`:''}
 <section class="card"><div class="section"><h2>${c[0]}</h2><span class="badge">Actionable</span></div><div class="note">${escapeHtml(c[1])}</div></section>
 <section class="card day-journey"><div class="journey-head"><div><div class="kicker">YOUR JOURNEY</div><div class="quote">Day ${day}</div></div><span class="day-badge">${s.fullStreak} 🔥</span></div><div class="quote">${escapeHtml(dayMessage(day))}</div><div class="subquote">Next milestone: Day ${target}</div><div class="milestones">${[3,7,14,21,30,45,60,75,90,100].map(m=>`<div class="milestone ${day>=m?'on':''}"><b>${m}</b>${day>=m?'✓':'🔒'}</div>`).join('')}</div></section>
 <section class="card"><div class="section"><h2>📈 This week</h2><span class="badge">${s.score}%</span></div>${weeklyBars()}</section>
 <section class="card"><div class="section"><h2>🏆 Achievements</h2><span class="muted smalltext">Small wins become history</span></div>${achievements().map(([n,on])=>`<span class="achievement ${on?'':'locked'}">${on?'🏆':'🔒'} ${escapeHtml(n)}</span>`).join('')}</section>
 <section class="card"><div class="section"><h2>🚀 Quick actions</h2><span class="muted smalltext">Open any tool</span></div><div class="quick-actions"><button class="btn" data-more="goals">🎯 Goals</button><button class="btn" data-more="routine">🔁 Routine</button><button class="btn" data-more="checkin">🌤️ Mood</button><button class="btn" data-more="journal">✍️ Journal</button><button class="btn" data-more="sleep">😴 Sleep</button></div></section>`;
}

function todayPage(){
 const d=today(),s=stats(),f=focusHabit();
 const activeRoutine=data.activeRoutine?data.routines.find(r=>r.id===data.activeRoutine):null;
 const list=focusMode&&f?[f]:data.habits;
 const rp=activeRoutine?routineProgress(activeRoutine):null;
 const rc=activeRoutine?routineCurrent(activeRoutine):null;
 return `<section class="card hero"><div class="section"><div><div class="kicker">TODAY · ${VERSION}</div><h2 style="margin:4px 0 0">${formatLong(d)}</h2></div><span class="badge">${s.todayDone}/${data.habits.length} done</span></div><div class="progress" style="height:11px"><i style="width:${data.habits.length?Math.round(s.todayDone/data.habits.length*100):0}%"></i></div></section>
 ${activeRoutine?`<section class="card focus"><div class="section"><h2>🔁 ${escapeHtml(activeRoutine.name)}</h2><button class="btn small" data-finish-routine>Finish routine</button></div><div class="note">Step ${Math.min(activeRoutine.step+1,rp.items.length)} of ${rp.items.length} · ${rp.doneCount} complete today</div>${rc?`<div class="focus-row" style="margin-top:10px"><div class="focus-icon">${escapeHtml(rc.icon)}</div><div class="focus-copy"><div class="habit-title">${escapeHtml(rc.name)}</div><div class="focus-action">${escapeHtml(rc.action||'Smallest useful version')}</div></div><button class="focus-check ${done(rc,d)?'done':''}" data-toggle="${rc.id}|${d}">${done(rc,d)?'✓':'→'}</button></div>`:'<div class="notice" style="margin-top:10px">Routine complete for today 🎉</div>'}</section>`:''}
 ${f?`<section class="card focus"><div class="section"><h2>🎯 Start here</h2><button class="btn small" data-action="focus">${focusMode?'Show all':'Focus mode'}</button></div><div class="focus-row"><div class="focus-icon">${escapeHtml(f.icon)}</div><div class="focus-copy"><div class="habit-title">${escapeHtml(f.name)}</div><div class="focus-action">${escapeHtml(f.action||'Smallest useful version')}</div><div class="muted smalltext">${recovery(f)}</div></div><button class="focus-check ${done(f,d)?'done':''}" data-toggle="${f.id}|${d}">${done(f,d)?'✓':'→'}</button></div></section>`:''}
 ${s.todayDone===0&&data.habits.length?`<section class="card"><div class="section"><h2>🛟 Recovery mode</h2><span class="badge">No pressure</span></div><div class="note">Yesterday doesn’t erase your history. Make the smallest useful version of one habit and restart from there.</div></section>`:''}
 <section class="card"><div class="section"><h2>✅ Today’s habits</h2><span class="badge">One tap</span></div><div class="habit-grid">${list.length?list.map(h=>todayHabitRow(h,d)).join(''):'<div class="empty">Add at least one habit first.</div>'}</div></section>
 <section class="card"><div class="section"><h2>🧠 Daily reflection</h2><span class="muted smalltext">Optional</span></div><div class="note">${s.todayDone===data.habits.length&&data.habits.length?'Perfect-day check: what made today easier?':'One sentence is enough: what would make tomorrow easier?'}</div><button class="btn primary" data-more="journal" style="margin-top:9px">Write reflection ✍️</button></section>`;
}
function todayHabitRow(h,d){const is=done(h,d),fr=frozen(h,d),hs=habitStats(h);return `<div class="habit-card"><div class="habit-head"><div class="habit-icon">${escapeHtml(h.icon)}</div><div style="flex:1"><div class="habit-title">${escapeHtml(h.name)} ${h.private?'<span class="badge private-pill">🔒 Private</span>':''}</div><div class="muted smalltext">${escapeHtml(h.action||'Smallest useful version')}</div></div></div><div class="habit-meta"><span>🔥 ${hs.run} days</span><span>${hs.weekPct}% week</span><span>${escapeHtml(h.difficulty||'Medium')}</span>${h.time?`<span>⏰ ${escapeHtml(h.time)}</span>`:''}</div><div class="habit-actions"><button class="btn ${is?'habit-done':''}" data-toggle="${h.id}|${d}">${is?'✓ Done':'○ Complete'}</button><button class="btn" data-open-habit="${h.id}">Details</button><button class="btn" data-freeze="${h.id}|${d}">${fr?'Undo Freeze':'🛡 Freeze'}</button></div></div>`}

function habitsPage(){
 const shown=data.habits.filter(habitMatches);
 return `<section class="card hero"><div class="section"><div><div class="kicker">MY HABITS</div><h2 style="margin:4px 0 0">Each habit has its own lane.</h2></div><span class="badge">${data.habits.length} total</span></div><p class="muted" style="margin:0">Streak, smallest action, notes, goal link and full calendar history for every habit.</p><div class="search-row" style="margin-top:10px"><input id="habitSearch" value="${escapeHtml(habitSearch)}" placeholder="Search habits..."><button class="btn primary" data-add-custom>Add</button></div><div class="filter-row">${[['all','All'],['easy','Easy'],['medium','Medium'],['hard','Hard'],['private','Private']].map(([v,l])=>`<button class="filter-chip ${habitFilter===v?'active':''}" data-habit-filter="${v}">${l}</button>`).join('')}</div></section>
 <section class="card"><div class="section"><h2>📌 Quick add</h2><span class="muted smalltext">Preset habits</span></div><div class="preset-grid">${PRESETS.filter(p=>!p.private).map(p=>`<button class="preset" data-add-preset="${escapeHtml(p.name)}"><div class="line"><span style="font-size:23px">${p.icon}</span><div><b>${escapeHtml(p.name)}</b><div class="muted">${escapeHtml(p.cat)}</div></div></div></button>`).join('')}</div><div class="private-section"><div class="section"><h2>🔒 Private habit</h2><span class="muted smalltext">Discreet label</span></div><button class="preset" style="width:100%" data-add-preset="Masturbation"><div class="line"><span style="font-size:23px">🔒</span><div><b>Masturbation</b><div class="muted">Optional private tracker</div></div></div></button></div></section>
 <section class="card"><div class="section"><h2>🔥 Habit cards</h2><span class="muted smalltext">Complete → XP</span></div><div class="habit-grid">${shown.map(h=>streakCard(h)).join('')||'<div class="empty">No habits match your search.</div>'}</div></section>`;
}
function streakCard(h){const hs=habitStats(h);return `<div class="habit-card"><div class="habit-head"><div class="habit-icon">${escapeHtml(h.icon)}</div><div style="flex:1"><div class="habit-title">${escapeHtml(h.name)} ${h.private?'<span class="badge private-pill">🔒 Private</span>':''}</div><div class="muted smalltext">${escapeHtml(h.action||'Smallest useful version')}</div></div></div><div class="grid three" style="margin-top:9px"><div class="stat"><small>Current</small><b>${hs.run}</b></div><div class="stat"><small>Best</small><b>${hs.longest}</b></div><div class="stat"><small>Week</small><b>${hs.weekPct}%</b></div></div><div class="calendar7">${allDates().slice(-7).map(d=>`<div class="calday"><small>${dateObj(d).toLocaleDateString(undefined,{weekday:'short'}).slice(0,2)}</small><div class="dot ${active(h,d)?'on':''} ${d===today()?'today':''}">${active(h,d)?'✓':''}</div></div>`).join('')}</div><div class="habit-actions"><button class="btn ${done(h,today())?'habit-done':''}" data-toggle="${h.id}|${today()}">${done(h,today())?'✓ Done':'Complete'}</button><button class="btn" data-open-habit="${h.id}">Details</button></div></div>`}

function statsPage(){
 const s=stats(),ds=makeDays(data.month);const md=ds.filter(d=>d<=today());
 const best=s.bestH?`${escapeHtml(s.bestH.icon)} ${escapeHtml(s.bestH.name)} · ${s.best} checks`: 'No data yet';
 return `<section class="card hero"><div class="section"><div><div class="kicker">ANALYTICS</div><h2 style="margin:4px 0 0">See the pattern, not just the number.</h2></div><span class="badge">${s.score}% week</span></div><div class="form"><div class="field"><label>View month</label><input id="monthPicker" type="month" value="${escapeHtml(data.month)}"></div><div class="field"><label>Personal score</label><input value="${personalScore()}/100" disabled></div><div class="field"><label>Top habit</label><input value="${escapeHtml(best)}" disabled></div></div></section>
 <section class="grid stats-grid"><div class="stat"><small>Completion</small><b>${s.pct}%</b></div><div class="stat"><small>Today</small><b>${s.todayDone}/${data.habits.length}</b></div><div class="stat"><small>Full-day streak</small><b>${s.fullStreak}</b></div><div class="stat"><small>Avg sleep</small><b>${s.avg?s.avg.toFixed(1):'—'}h</b></div></section>
 <section class="card"><div class="section"><h2>📈 Last 7 days</h2><span class="muted smalltext">Active = done or freeze</span></div>${weeklyBars()}</section>
 <section class="card"><div class="section"><h2>🌤️ Mood & energy</h2><span class="muted smalltext">Last 7 days</span></div>${moodChart()}<div class="note" style="margin-top:9px">${data.mood[today()]?'Today: '+moodText(data.mood[today()])+' · '+energyText(data.energy[today()]):'Add a check-in from More to start building personal patterns.'}</div></section>
 <section class="card"><div class="section"><h2>🔥 Habit progress</h2><span class="muted smalltext">Individual streaks</span></div>${data.habits.map(h=>{const hs=habitStats(h);return `<div style="margin:11px 0"><div style="display:flex;justify-content:space-between;gap:8px"><b>${escapeHtml(h.icon)} ${escapeHtml(h.name)}</b><span>${hs.run} 🔥</span></div><div class="progress" style="margin-top:5px"><i style="width:${Math.min(100,hs.run*5)}%"></i></div><div class="muted smalltext" style="margin-top:3px">${hs.total} total · ${hs.weekPct}% week · ${hs.monthPct}% month</div></div>`}).join('')||'<div class="empty">Add habits to see analytics.</div>'}</section>
 <section class="card"><div class="section"><h2>📅 Monthly tracker</h2><span class="muted smalltext">Future days are locked</span></div><div class="matrix-wrap"><table class="matrix"><thead><tr><th>Habit</th>${ds.map(d=>`<th>${Number(d.slice(-2))}</th>`).join('')}</tr></thead><tbody>${data.habits.map(h=>`<tr><td class="habit-cell">${escapeHtml(h.icon)} ${escapeHtml(h.name)}</td>${ds.map(d=>{const future=d>today(),fr=frozen(h,d);return `<td><button class="daycheck ${done(h,d)?'done':''} ${fr?'freeze':''} ${future?'future-day':''} ${d===today()?'today':''}" data-toggle="${h.id}|${d}" ${future?'disabled':''}>${done(h,d)?'✓':fr?'🛡':future?'·':''}</button></td>`}).join('')}</tr>`).join('')||`<tr><td class="empty" colspan="${ds.length+1}">No habits yet.</td></tr>`}</tbody></table></div></section>`;
}
function moodText(v){return ({1:'😣 Low',2:'😴 Tired',3:'😐 Okay',4:'🙂 Good',5:'😊 Great'})[v]||'Not set'}
function energyText(v){return ({1:'🪫 Very low',2:'🔋 Low',3:'⚡ Okay',4:'⚡ Good',5:'🚀 High'})[v]||'Energy not set'}

function goalsHtml(){const linked=data.goalLinks;const p=Math.min(100,Math.round((goalProgress()/Math.max(1,data.target))*100));return `<section class="card"><div class="section"><h2>🎯 Goal builder</h2><button class="btn small" data-close-more>Close</button></div><div class="form"><div class="field"><label>Goal</label><input id="goal" value="${escapeHtml(data.goal)}" placeholder="e.g. Study consistently"></div><div class="field"><label>Target</label><input id="target" type="number" min="1" max="365" value="${data.target}"></div><div class="field"><label>Manual achieved</label><input id="achieved" type="number" min="0" max="365" value="${data.achieved}"></div></div><div class="smalltext muted" style="margin:10px 0 7px">Link habits to this goal</div>${data.habits.map(h=>`<label class="plan-item"><input type="checkbox" data-goallink="${h.id}" ${linked.includes(h.id)?'checked':''}><span style="flex:1">${escapeHtml(h.icon)} ${escapeHtml(h.name)}</span></label>`).join('')||'<div class="empty">Add habits first.</div>'}<button class="btn primary" data-save-goal style="margin-top:10px">Save goal 🎯</button><div style="margin-top:11px;display:flex;align-items:center;gap:8px"><b>${goalProgress()}/${data.target}</b><div class="progress" style="flex:1"><i style="width:${p}%"></i></div></div><div class="muted smalltext" style="margin-top:4px">${linked.length?'Linked progress is counted from completed checks in the selected month.':'No linked habits yet.'}</div></section><section class="card"><div class="section"><h2>🧠 Weekly reflection</h2><span class="muted smalltext">Feedback → next action</span></div><div class="form"><div class="field"><label>What went well?</label><textarea id="win">${escapeHtml(data.win)}</textarea></div><div class="field"><label>What got in the way?</label><textarea id="barrier">${escapeHtml(data.barrier)}</textarea></div><div class="field"><label>My If–Then plan</label><textarea id="ifThen">${escapeHtml(data.ifThen)}</textarea></div></div><button class="btn primary" data-save-review style="margin-top:9px">Save review</button></section>`}
function goalProgress(){if(!data.goalLinks.length)return Math.min(data.achieved,data.target);let n=0;makeDays(data.month).filter(d=>d<=today()).forEach(d=>data.habits.filter(h=>data.goalLinks.includes(h.id)).forEach(h=>{if(done(h,d))n++}));return n}

function routineHtml(){return `<section class="card"><div class="section"><h2>🔁 Routine builder</h2><button class="btn small" data-close-more>Close</button></div><div class="form"><div class="field"><label>Routine name</label><input id="routineName" placeholder="Morning routine"></div><div class="field"><label>Icon</label><input id="routineIcon" maxlength="3" value="🔁"></div><div class="field"><label>Tip</label><input value="Routines run one step at a time." disabled></div></div><div class="smalltext muted" style="margin:9px 0 7px">Choose habits in order</div>${data.habits.map(h=>`<label class="plan-item"><input type="checkbox" data-routinehabit="${h.id}"><span style="flex:1">${escapeHtml(h.icon)} ${escapeHtml(h.name)}</span></label>`).join('')||'<div class="empty">Add habits first.</div>'}<button class="btn primary" data-save-routine style="margin-top:10px">Save routine 🔁</button></section><section class="card"><div class="section"><h2>Saved routines</h2><span class="muted smalltext">Step-by-step</span></div>${data.routines.map(r=>{const p=routineProgress(r);return `<div class="routine"><div class="routine-head"><span style="font-size:24px">${escapeHtml(r.icon)}</span><div style="flex:1"><b>${escapeHtml(r.name)}</b><div class="muted smalltext">${p.doneCount}/${p.items.length} complete today</div></div><button class="btn small" data-start-routine="${r.id}">Start ▶</button></div><div class="routine-list">${p.items.map((h,i)=>`<div class="routine-step ${i===r.step?'current':''}">${i+1}. ${done(h,today())?'✅':'○'} ${escapeHtml(h.name)}</div>`).join('')}</div></div>`}).join('')||'<div class="empty">No routines yet.</div>'}</section>`}

function plannerHtml(){const ordered=data.habits.slice().sort((a,b)=>String(a.time||'99:99').localeCompare(String(b.time||'99:99')));return `<section class="card"><div class="section"><h2>🗓️ Day planner</h2><button class="btn small" data-close-more>Close</button></div><p class="muted smalltext">Optional times help the focus engine choose a next action.</p>${ordered.map(h=>`<div class="plan-item"><div class="plan-time"><input type="time" data-plantime="${h.id}" value="${escapeHtml(h.time||'')}"></div><div class="plan-copy"><b>${escapeHtml(h.icon)} ${escapeHtml(h.name)}</b><div class="muted smalltext">${escapeHtml(h.action||'Smallest useful version')}</div></div><span>${done(h,today())?'✅':'○'}</span></div>`).join('')||'<div class="empty">Add a habit first.</div>'}<button class="btn primary" data-save-planner style="margin-top:10px">Save day plan 🗓️</button></section>`}
function checkinHtml(){const d=today(),m=Number(data.mood[d]||0),e=Number(data.energy[d]||0);return `<section class="card"><div class="section"><h2>🌤️ Mood & energy</h2><button class="btn small" data-close-more>Close</button></div><p class="muted smalltext">Optional. Use this to understand which days feel easier or harder.</p><div class="smalltext muted" style="margin:9px 0 7px">Mood · ${moodText(m)}</div><div class="mood-row">${[1,2,3,4,5].map(v=>`<button class="mood-btn ${m===v?'selected':''}" data-mood="${v}">${['😣','😴','😐','🙂','😊'][v-1]}</button>`).join('')}</div><div class="smalltext muted" style="margin:11px 0 7px">Energy · ${energyText(e)}</div><div class="mood-row">${[1,2,3,4,5].map(v=>`<button class="mood-btn ${e===v?'selected':''}" data-energy="${v}">${['🪫','🔋','⚡','⚡','🚀'][v-1]}</button>`).join('')}</div></section>`}
function sleepHtml(){const d=today(),o=data.sleep[d]||{};return `<section class="card"><div class="section"><h2>😴 Sleep</h2><button class="btn small" data-close-more>Close</button></div><div class="form"><div class="field"><label>Hours</label><input id="sleepHours" type="number" min="0" max="24" step="0.1" value="${escapeHtml(o.hours||'')}"></div><div class="field"><label>Bedtime</label><input id="bed" type="time" value="${escapeHtml(o.bed||'')}"></div><div class="field"><label>Wake time</label><input id="wake" type="time" value="${escapeHtml(o.wake||'')}"></div></div><button class="btn primary" data-save-sleep style="margin-top:10px">Save sleep 😴</button></section>`}
function journalHtml(){const d=today();const history=Object.keys(data.notes).filter(Boolean).sort().reverse().slice(0,7);return `<section class="card"><div class="section"><h2>✍️ Daily journal</h2><button class="btn small" data-close-more>Close</button></div><textarea id="dailyNote" placeholder="How was today?">${escapeHtml(data.notes[d]||'')}</textarea><button class="btn primary" data-save-note style="margin-top:10px">Save today’s note</button></section><section class="card"><div class="section"><h2>📚 Recent notes</h2><span class="muted smalltext">Last 7 saved</span></div>${history.map(k=>`<div class="note" style="margin-top:7px"><b>${formatLong(k)}</b><div style="margin-top:3px">${escapeHtml(data.notes[k])}</div></div>`).join('')||'<div class="empty">No journal notes yet.</div>'}</section>`}
function remindersHtml(){return `<section class="card"><div class="section"><h2>⏰ Reminders</h2><button class="btn small" data-close-more>Close</button></div><div class="notice">Reminders run while this page is open. Browser notifications require permission.</div><button class="btn" data-notify style="margin-top:9px">🔔 Allow notifications</button>${data.habits.map(h=>{const r=data.reminders[h.id]||{};return `<div class="plan-item"><div class="plan-time"><input type="time" data-remtime="${h.id}" value="${escapeHtml(r.time||h.time||'')}"></div><div class="plan-copy"><b>${escapeHtml(h.icon)} ${escapeHtml(h.name)}</b><div class="muted smalltext">${r.enabled?'Reminder on':'Reminder off'}</div></div><input type="checkbox" data-remon="${h.id}" ${r.enabled?'checked':''}></div>`}).join('')||'<div class="empty" style="margin-top:8px">Add a habit first.</div>'}<button class="btn primary" data-save-reminders style="margin-top:10px">Save reminders ⏰</button></section>`}
function securityHtml(){return `<section class="card"><div class="section"><h2>🔐 Profile & local security</h2><button class="btn small" data-close-more>Close</button></div><div class="note">Profile: <b>${escapeHtml(data.name||'Not set')}</b><br>Last login: ${escapeHtml(data.lastLogin||'This session')}</div><div class="form" style="margin-top:10px"><div class="field"><label>New PIN</label><input id="newPin" type="password" inputmode="numeric" maxlength="6" placeholder="4–6 digits"></div><div class="field"><label>Confirm PIN</label><input id="confirmPin" type="password" inputmode="numeric" maxlength="6" placeholder="Repeat PIN"></div><div class="field"><label>Name</label><input id="profileName2" value="${escapeHtml(data.name||'')}"></div></div><div class="quick-actions"><button class="btn primary" data-save-pin>Save PIN 🔒</button>${data.pinHash?'<button class="btn" data-remove-pin>Remove PIN</button>':''}<button class="btn" data-lock-now>Lock now</button></div><div class="security-note" style="margin-top:10px">The PIN is stored as a local hash. Device storage and exported backups are not encrypted.</div></section>`}
function settingsHtml(){return `<section class="card"><div class="section"><h2>⚙️ Settings</h2><button class="btn small" data-close-more>Close</button></div><div class="quick-actions"><button class="btn" data-dark>${data.dark?'☀️ Light mode':'🌙 Dark mode'}</button><button class="btn" data-backup>💾 JSON backup</button><button class="btn" data-csv>📊 CSV</button><button class="btn" data-restore>📥 Restore</button><button class="btn" data-install>📱 Install app</button><input id="restoreFile" type="file" accept=".json" hidden></div><div class="note" style="margin-top:10px">Offline-first core tracking is stored on this device. Back up before clearing browser storage or changing devices.</div><div class="danger-note" style="margin-top:10px">Reset profile permanently erases this device’s local progress.</div><button class="btn" data-reset style="margin-top:9px">Reset local profile</button></section>`}
function morePage(){return `<section class="card hero"><div class="kicker">MORE TOOLS</div><h2 style="margin:4px 0 6px">Build your system around real life.</h2><p class="muted" style="margin:0">Goals, routines, planner, check-in, sleep, journal, reminders, security and data tools.</p></section><section class="drawer-grid"><button class="more-tile" data-more="goals"><span>🎯</span><b>Goals & review</b><small>Link goals to habits and reflect.</small></button><button class="more-tile" data-more="routine"><span>🔁</span><b>Routines</b><small>Run habits step by step.</small></button><button class="more-tile" data-more="planner"><span>🗓️</span><b>Day planner</b><small>Set preferred times.</small></button><button class="more-tile" data-more="checkin"><span>🌤️</span><b>Mood & energy</b><small>Build a simple personal history.</small></button><button class="more-tile" data-more="sleep"><span>😴</span><b>Sleep</b><small>Log hours and timing.</small></button><button class="more-tile" data-more="journal"><span>✍️</span><b>Journal</b><small>Keep one-line reflections.</small></button><button class="more-tile" data-more="reminders"><span>⏰</span><b>Reminders</b><small>Time your next action.</small></button><button class="more-tile" data-more="security"><span>🔐</span><b>Profile & security</b><small>Local PIN and session lock.</small></button><button class="more-tile" data-more="settings"><span>⚙️</span><b>Settings & backup</b><small>Theme, export, restore, install.</small></button></section>${morePanel?panelHtml():'<section class="card"><div class="section"><h2>💾 Backup tip</h2><span class="badge">Recommended</span></div><div class="note">Take a JSON backup after major changes. Restore now correctly re-locks a PIN-protected profile.</div></section>'}`}
function panelHtml(){return {goals:goalsHtml,routine:routineHtml,planner:plannerHtml,checkin:checkinHtml,sleep:sleepHtml,journal:journalHtml,reminders:remindersHtml,security:securityHtml,settings:settingsHtml}[morePanel]?.()||settingsHtml()}

function quickModal(){return `<div class="overlay" data-close-overlay><div class="modal"><div class="section"><h2>⚡ Quick add</h2><button class="btn small" data-close-quick>Close</button></div><div class="drawer-grid"><button class="more-tile" data-quick="habit"><span>✅</span><b>Habit</b><small>Add something to repeat.</small></button><button class="more-tile" data-quick="goals"><span>🎯</span><b>Goal</b><small>Set a target.</small></button><button class="more-tile" data-quick="routine"><span>🔁</span><b>Routine</b><small>Group habits.</small></button><button class="more-tile" data-quick="journal"><span>✍️</span><b>Journal</b><small>Write one line.</small></button></div></div></div>`}

function onboarding(){return `<div class="overlay"><div class="modal"><div class="kicker">V12 SETUP</div><h2>👋 Build your system.</h2><p class="muted smalltext">Start with a realistic group of habits. You can change everything later.</p><label class="smalltext muted">Your name</label><input id="onName" value="${escapeHtml(data.name)}" placeholder="Enter your name"><div class="section" style="margin-top:13px"><h2>Choose habits</h2><span class="badge" id="onCount">0 selected</span></div><div class="preset-grid" id="onPresets">${PRESETS.filter(p=>!p.private).map((p,i)=>`<button class="preset ${i<4?'selected':''}" data-onpreset="${escapeHtml(p.name)}"><div class="line"><input type="checkbox" ${i<4?'checked':''}><span style="font-size:22px">${p.icon}</span><div><b>${escapeHtml(p.name)}</b><div class="muted">${escapeHtml(p.cat)}</div></div></div></button>`).join('')}</div><div class="private-section"><div class="section"><h2>🔒 Private habit</h2><span class="muted smalltext">Optional</span></div><button class="preset" style="width:100%" data-onpreset="Masturbation"><div class="line"><input type="checkbox"><span style="font-size:22px">🔒</span><div><b>Masturbation</b><div class="muted">Discreet label</div></div></div></button></div><label class="smalltext muted" style="display:block;margin-top:12px">Add a custom habit</label><div class="search-row" style="margin-top:6px"><input id="onCustom" placeholder="e.g. Stretch"><button class="btn" data-on-custom>Add</button></div><div id="customSetupList" style="display:grid;gap:6px;margin-top:7px"></div><div class="note" style="margin-top:10px">💡 You do not need a perfect routine. Pick habits you can realistically repeat.</div><button class="btn primary block" data-finish-onboarding style="margin-top:12px;padding:12px">Save My System 🚀</button></div></div>`}

function habitOverlay(){const h=data.habits.find(x=>x.id===selectedHabit);if(!h)return '';const hs=habitStats(h),ds=makeDays(data.month);return `<div class="overlay"><div class="modal"><div class="section"><div><div class="kicker">HABIT DETAILS</div><h2 style="margin:3px 0 0">${escapeHtml(h.icon)} ${escapeHtml(h.name)}</h2></div><button class="btn small" data-close-habit>Close</button></div><div class="grid three"><div class="stat"><small>Current</small><b>${hs.run} 🔥</b></div><div class="stat"><small>Longest</small><b>${hs.longest}</b></div><div class="stat"><small>Total</small><b>${hs.total}</b></div></div><div class="form" style="margin-top:10px"><div class="field"><label>Icon</label><input id="habitIcon" value="${escapeHtml(h.icon)}" maxlength="3"></div><div class="field"><label>Difficulty</label><select id="habitDifficulty"><option ${h.difficulty==='Easy'?'selected':''}>Easy</option><option ${h.difficulty==='Medium'?'selected':''}>Medium</option><option ${h.difficulty==='Hard'?'selected':''}>Hard</option></select></div><div class="field"><label>Private label</label><select id="habitPrivate"><option value="0" ${!h.private?'selected':''}>No</option><option value="1" ${h.private?'selected':''}>Yes</option></select></div></div><div class="form" style="margin-top:10px"><div class="field"><label>Best time</label><input id="habitTime" type="time" value="${escapeHtml(h.time||'')}"></div><div class="field"><label>Smallest action</label><input id="habitAction" value="${escapeHtml(h.action||'')}"></div><div class="field"><label>Why</label><input id="habitWhy" value="${escapeHtml(h.why||'')}"></div></div><label class="smalltext muted" style="display:block;margin-top:10px">Habit note</label><textarea id="habitNote">${escapeHtml(data.habitNotes[h.id]||'')}</textarea><button class="btn primary block" data-save-habit style="margin-top:10px">Save settings ✅</button><div class="section" style="margin-top:15px"><h2>📅 Monthly history</h2><span class="muted smalltext">${escapeHtml(data.month)}</span></div><div class="matrix-wrap"><table class="matrix"><thead><tr><th>Habit</th>${ds.map(d=>`<th>${Number(d.slice(-2))}</th>`).join('')}</tr></thead><tbody><tr><td class="habit-cell">${escapeHtml(h.name)}</td>${ds.map(d=>{const future=d>today(),fr=frozen(h,d);return `<td><button class="daycheck ${done(h,d)?'done':''} ${fr?'freeze':''} ${future?'future-day':''} ${d===today()?'today':''}" data-toggle="${h.id}|${d}" ${future?'disabled':''}>${done(h,d)?'✓':fr?'🛡':future?'·':''}</button></td>`}).join('')}</tr></tbody></table></div><div class="quick-actions"><button class="btn" data-rename-habit>Rename</button><button class="btn" data-delete-habit>Delete</button></div><div class="note" style="margin-top:9px">🛡 Monthly freeze: ${freezeAvailable()?'available':'used this month'}. Future dates stay locked.</div></div></div>`}

function profileLogin(){return `<div class="login-shell"><div class="login-card"><div class="brand-mark">🚀</div><div class="kicker" style="margin-top:10px">LOCAL PROFILE</div>${data.pinHash?`<h1>Welcome back${data.name?', '+escapeHtml(data.name):''} 👋</h1><p>Enter your local PIN to unlock this device profile.</p><div class="stack"><input id="loginPin" type="password" inputmode="numeric" maxlength="6" placeholder="4–6 digit PIN"><button class="btn primary block" data-login>Unlock 🔓</button><button class="btn block" data-forgot-pin>Reset local profile</button></div>`:`<h1>Create your profile</h1><p>This profile is stored locally on this device. It is not a cloud account.</p><div class="stack"><input id="profileName" placeholder="Your name" value="${escapeHtml(data.name||'')}"><button class="btn primary block" data-create-profile>Continue 🚀</button></div>`}<div class="security-note" style="margin-top:12px">Local profile only. Storage and backups are not encrypted.</div></div></div>`}

function resetProfile(){if(!confirm('Reset the local profile and erase all progress?'))return;if(!confirm('Final confirmation: permanently erase this device profile?'))return;try{localStorage.removeItem(KEY)}catch(e){}data=defaults();sessionUnlocked=true;tab='home';morePanel='';selectedHabit=null;focusMode=false;quickOpen=false;save();render();showToast('Profile reset')}
function lockNow(){if(!data.pinHash){tab='more';morePanel='security';render();showToast('Create a PIN first');return}sessionUnlocked=false;render()}

function downloadBackup(){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='progress-tracker-v11-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function csvBackup(){const rows=[['Date','Habit','Status','Current streak']];allDates().forEach(d=>data.habits.forEach(h=>rows.push([d,h.name,done(h,d)?'Done':frozen(h,d)?'Freeze':'Open',habitStats(h).run])));const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='progress-tracker-v11-report.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function restoreFile(input){const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const restored=normalize(JSON.parse(r.result));data=restored;sessionUnlocked=!data.pinHash;selectedHabit=null;morePanel='';tab='home';focusMode=false;quickOpen=false;save();render();showToast(data.pinHash?'Backup restored. PIN lock is active 🔒':'Backup restored ✅')}catch(e){alert('Could not restore that backup file.')}};r.readAsText(f)}

async function hashPin(pin){if(crypto?.subtle){const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(pin));return [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('')}return btoa(pin)}
async function savePin(){const a=$('#newPin')?.value.trim()||'',b=$('#confirmPin')?.value.trim()||'',n=$('#profileName2')?.value.trim()||'';if(!n){alert('Enter your name.');return}if(!/^\d{4,6}$/.test(a)||a!==b){alert('PIN must be 4–6 digits and match.');return}data.pinHash=await hashPin(a);data.name=n;data.profileCreated=true;data.lastLogin=today();sessionUnlocked=true;save();render();showToast('Local PIN saved 🔒')}

function appShell(){const s=stats();const body=tab==='home'?homePage():tab==='today'?todayPage():tab==='habits'?habitsPage():tab==='stats'?statsPage():morePage();return `<div class="app"><header class="top"><div class="title"><h1>Progress Tracker</h1><p>Personal Growth OS · ${VERSION} · offline-first</p></div><div class="actions"><button class="btn icon-btn" data-dark title="Theme">${data.dark?'☀️':'🌙'}</button><button class="btn icon-btn" data-backup title="Backup">💾</button></div></header><div class="top-progress"><i style="width:${data.habits.length?Math.round(s.todayDone/data.habits.length*100):0}%"></i></div><main>${body}</main><div class="footer-line">Local data · Future dates locked · XP follows actual completion state</div></div>${bottomNav()}<button class="quick-fab" data-fab aria-label="Quick add">${quickOpen?'×':'＋'}</button>${quickOpen?`<div class="quick-menu"><button data-quick="habit">✅ New habit</button><button data-quick="goals">🎯 New goal</button><button data-quick="routine">🔁 New routine</button><button data-quick="journal">✍️ Journal</button></div>`:''}${selectedHabit?habitOverlay():''}${!data.onboardingDone&&!data.pinHash?onboarding():''}${window.__v11QuickModal?quickModal():''}`}

function render(){
 document.body.classList.toggle('dark',!!data.dark);
 document.body.innerHTML=isLocked()?profileLogin():appShell();
 bindDomState();
 if(window.__v11QuickModal){};
}
function isLocked(){return !!data.pinHash&&!sessionUnlocked}

let customSetup=[];
function updateOnCount(){const n=$$('[data-onpreset] input:checked').length+customSetup.length;const el=$('#onCount');if(el)el.textContent=n+' selected'}
function finishOnboarding(){const name=$('#onName')?.value.trim()||'';if(!name){alert('Please enter your name.');return}const chosen=[];$$('[data-onpreset]').forEach(b=>{const cb=$('input',b);if(cb?.checked){const p=preset(b.dataset.onpreset);chosen.push({name:b.dataset.onpreset,icon:p?.icon||'✅',private:!!p?.private,difficulty:p?.difficulty||'Medium',action:p?.action||'Do the smallest useful version'})}});customSetup.forEach(n=>chosen.push({name:n,icon:'✅',private:false,difficulty:'Medium',action:'Do the smallest useful version'}));if(!chosen.length){alert('Select at least one habit.');return}data.name=name;data.habits=chosen.slice(0,15).map(x=>Object.assign({id:uid(),created:currentMonth(),time:'',smallWin:x.action,why:''},x));data.onboardingDone=true;data.profileCreated=true;data.journeyStart=today();data.lastLogin=today();save();render();showToast('Your V11 system is ready 🚀')}

function bindDomState(){
 updateOnCount();
}

function routeMore(which){tab='more';morePanel=which;selectedHabit=null;quickOpen=false;window.__v11QuickModal=false;render()}

document.addEventListener('click',async e=>{
 const b=e.target.closest('button');
 if(!b)return;
 const go=b.dataset.tab;if(go){tab=go;morePanel='';selectedHabit=null;window.__v11QuickModal=false;render();return}
 if(b.dataset.more){routeMore(b.dataset.more);return}
 if(b.dataset.action==='focus'){if(!data.habits.length){tab='habits';render();return}focusMode=!focusMode;tab=tab==='today'?'today':'home';render();return}
 if(b.dataset.toggle){const [id,d]=b.dataset.toggle.split('|');const h=data.habits.find(x=>x.id===id);if(h)toggleHabit(h,d);return}
 if(b.dataset.freeze){const [id,d]=b.dataset.freeze.split('|');const h=data.habits.find(x=>x.id===id);if(h)toggleFreeze(h,d);return}
 if(b.dataset.openHabit){selectedHabit=b.dataset.openHabit;render();return}
 if(b.hasAttribute('data-close-habit')){selectedHabit=null;render();return}
 if(b.dataset.addPreset){const p=preset(b.dataset.addPreset);if(p&&addHabit(p.name,p.icon,!!p.private,p.difficulty,p.action)){render();showToast(`${p.name} added ✅`)}return}
 if(b.dataset.addCustom!==undefined){const v=prompt('Enter habit name');if(v&&addHabit(v.trim())){render();showToast('Habit added ✅')}return}
 if(b.dataset.habitFilter){habitFilter=b.dataset.habitFilter;render();return}
 if(b.id===''){}
 if(b.dataset.startRoutine){startRoutine(b.dataset.startRoutine);return}
 if(b.dataset.finishRoutine!==undefined){finishRoutine();return}
 if(b.dataset.closeMore!==undefined){morePanel='';render();return}
 if(b.dataset.closeQuick!==undefined){window.__v11QuickModal=false;render();return}
 if(b.dataset.quick){const q=b.dataset.quick;window.__v11QuickModal=false;quickOpen=false;if(q==='habit'){tab='habits';morePanel=''}else routeMore(q);render();return}
 if(b.dataset.fab!==undefined){quickOpen=!quickOpen;render();return}
 if(b.dataset.notify!==undefined){if(!('Notification' in window)){showToast('Notifications are not supported in this browser.');return}const p=await Notification.requestPermission();showToast(p==='granted'?'Notifications allowed 🔔':'Notifications not allowed');return}
 if(b.dataset.mood){data.mood[today()]=Number(b.dataset.mood);save();render();return}
 if(b.dataset.energy){data.energy[today()]=Number(b.dataset.energy);save();render();return}
 if(b.dataset.saveGoal!==undefined){data.goal=$('#goal')?.value.trim()||'';data.target=Math.max(1,Math.min(365,Number($('#target')?.value||7)));data.achieved=Math.max(0,Math.min(data.target,Number($('#achieved')?.value||0)));data.goalLinks=$$('[data-goallink]:checked').map(x=>x.dataset.goallink);save();render();showToast('Goal saved 🎯');return}
 if(b.dataset.saveReview!==undefined){data.win=$('#win')?.value||'';data.barrier=$('#barrier')?.value||'';data.ifThen=$('#ifThen')?.value||'';save();render();showToast('Review saved 🧠');return}
 if(b.dataset.saveRoutine!==undefined){const name=$('#routineName')?.value.trim()||'';if(!name){alert('Enter a routine name.');return}const items=$$('[data-routinehabit]:checked').map(x=>x.dataset.routinehabit);if(!items.length){alert('Choose at least one habit.');return}data.routines.push({id:uid(),name,icon:$('#routineIcon')?.value||'🔁',items,step:0});save();render();showToast('Routine saved 🔁');return}
 if(b.dataset.savePlanner!==undefined){$$('[data-plantime]').forEach(x=>{const h=data.habits.find(h=>h.id===x.dataset.plantime);if(h)h.time=x.value||''});save();render();showToast('Day plan saved 🗓️');return}
 if(b.dataset.saveSleep!==undefined){data.sleep[today()]={hours:Number($('#sleepHours')?.value||0),bed:$('#bed')?.value||'',wake:$('#wake')?.value||''};save();render();showToast('Sleep saved 😴');return}
 if(b.dataset.saveNote!==undefined){data.notes[today()]=$('#dailyNote')?.value||'';save();render();showToast('Journal saved ✍️');return}
 if(b.dataset.saveReminders!==undefined){data.habits.forEach(h=>{const time=$(`[data-remtime="${h.id}"]`)?.value||'';const enabled=!!$(`[data-remon="${h.id}"]`)?.checked;data.reminders[h.id]=Object.assign({},data.reminders[h.id],{time,enabled})});save();render();showToast('Reminders saved ⏰');return}
 if(b.dataset.savePin!==undefined){await savePin();return}
 if(b.dataset.removePin!==undefined){data.pinHash='';sessionUnlocked=true;save();render();showToast('PIN removed');return}
 if(b.dataset.lockNow!==undefined){lockNow();return}
 if(b.dataset.dark!==undefined){data.dark=!data.dark;save();render();return}
 if(b.dataset.backup!==undefined){downloadBackup();return}
 if(b.dataset.csv!==undefined){csvBackup();return}
 if(b.dataset.restore!==undefined){$('#restoreFile')?.click();return}
 if(b.dataset.install!==undefined){if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;window.__v11InstallPrompt=null}else showToast('Browser menu → Add to Home screen 📱');return}
 if(b.dataset.reset!==undefined){resetProfile();return}
 if(b.dataset.createProfile!==undefined){const n=$('#profileName')?.value.trim()||'';if(!n){alert('Please enter your name.');return}data.name=n;data.profileCreated=true;data.lastLogin=today();save();sessionUnlocked=true;render();return}
 if(b.dataset.login!==undefined){const p=$('#loginPin')?.value.trim()||'';if(!/^\d{4,6}$/.test(p)){alert('Enter a 4–6 digit PIN.');return}const h=await hashPin(p);if(h!==data.pinHash){alert('Wrong PIN.');return}data.lastLogin=today();save();sessionUnlocked=true;render();showToast('Unlocked 🔓');return}
 if(b.dataset.forgotPin!==undefined){resetProfile();return}
 if(b.dataset.finishOnboarding!==undefined){finishOnboarding();return}
 if(b.dataset.closeOverlay!==undefined&&e.target===b){window.__v11QuickModal=false;render();return}
 if(b.dataset.renameHabit!==undefined){const h=data.habits.find(x=>x.id===selectedHabit);if(h){const n=prompt('Habit name',h.name);if(n&&n.trim()){h.name=n.trim();save();render();showToast('Habit renamed')}}return}
 if(b.dataset.deleteHabit!==undefined){const h=data.habits.find(x=>x.id===selectedHabit);if(h)removeHabit(h);return}
 if(b.dataset.saveHabit!==undefined){const h=data.habits.find(x=>x.id===selectedHabit);if(!h)return;h.icon=$('#habitIcon')?.value||h.icon;h.difficulty=$('#habitDifficulty')?.value||h.difficulty;h.private=$('#habitPrivate')?.value==='1';h.time=$('#habitTime')?.value||'';h.action=$('#habitAction')?.value.trim()||h.action;h.why=$('#habitWhy')?.value.trim()||'';data.habitNotes[h.id]=$('#habitNote')?.value||'';save();selectedHabit=null;render();showToast('Habit settings saved ✅');return}
});

document.addEventListener('change',e=>{
 if(e.target.id==='monthPicker'){data.month=e.target.value||currentMonth();save();render();return}
 if(e.target.id==='restoreFile'){restoreFile(e.target);e.target.value='';return}
 if(e.target.matches('[data-onpreset]')){e.stopPropagation();return}
});

document.addEventListener('input',e=>{
 if(e.target.id==='habitSearch'){habitSearch=e.target.value;render();const el=$('#habitSearch');if(el){el.focus();el.setSelectionRange(habitSearch.length,habitSearch.length)}return}
});

document.addEventListener('click',e=>{
 const p=e.target.closest('[data-onpreset]');
 if(!p)return;
 if(e.target.matches('input'))return;
 const cb=$('input',p);if(cb)cb.checked=!cb.checked;p.classList.toggle('selected',!!cb?.checked);updateOnCount();
});

document.addEventListener('click',e=>{
 if(e.target.closest('[data-on-custom]')){
  const v=$('#onCustom')?.value.trim()||'';if(v&&!customSetup.some(x=>x.toLowerCase()===v.toLowerCase())){customSetup.push(v);const row=document.createElement('div');row.className='note';row.textContent='✅ '+v;$('#customSetupList')?.appendChild(row);$('#onCustom').value='';updateOnCount()}
 }
});

function reminderTick(){
 if(isLocked())return;
 const hm=new Date().toTimeString().slice(0,5);
 data.habits.forEach(h=>{const r=data.reminders[h.id];if(r?.enabled&&r.time===hm&&r.lastSent!==today()){r.lastSent=today();save();if('Notification' in window&&Notification.permission==='granted')new Notification('Progress Tracker',{body:`${h.icon} ${h.name}: ${h.action||'Your planned action is ready.'}`});showToast(`⏰ ${h.name} — time for your action`)}});
}
setInterval(reminderTick,30000);

try{if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').then(r=>r.update()).catch(()=>{})}catch(e){}

/* ========================= V12 COMPACT UI ========================= */

function finishOnboarding(){const name=$('#onName')?.value.trim()||'';if(!name){alert('Please enter your name.');return}const chosen=[];$$('[data-onpreset]').forEach(b=>{const cb=$('input',b);if(cb?.checked){const p=preset(b.dataset.onpreset);chosen.push({name:b.dataset.onpreset,icon:p?.icon||'✅',private:!!p?.private,difficulty:p?.difficulty||'Medium',action:p?.action||'Do the smallest useful version'})}});customSetup.forEach(n=>chosen.push({name:n,icon:'✅',private:false,difficulty:'Medium',action:'Do the smallest useful version'}));if(!chosen.length){alert('Select at least one habit.');return}data.name=name;data.habits=chosen.slice(0,15).map(x=>Object.assign({id:uid(),created:currentMonth(),time:'',smallWin:x.action,why:''},x));data.onboardingDone=true;data.profileCreated=true;data.journeyStart=today();data.lastLogin=today();save();tab='today';morePanel='';selectedHabit=null;focusMode=false;quickOpen=false;render();showToast('Your V12 system is ready 🚀')}


function habitOverlay(){
  const h=data.habits.find(x=>x.id===selectedHabit);
  if(!h)return '';
  const hs=habitStats(h),ds=makeDays(data.month);
  return `<div class="overlay" data-close-overlay><div class="modal v12-detail-modal">
    <div class="section"><div><div class="kicker">HABIT</div><h2 style="margin:3px 0 0">${escapeHtml(h.icon)} ${escapeHtml(h.name)}</h2></div><button class="btn small" data-close-habit>Close</button></div>
    <div class="v12-number-grid" style="grid-template-columns:repeat(3,1fr)"><div><b>${hs.run}</b><span>Current streak</span></div><div><b>${hs.longest}</b><span>Best streak</span></div><div><b>${hs.total}</b><span>Total wins</span></div></div>
    <div class="form" style="margin-top:10px"><div class="field"><label>Difficulty</label><select id="habitDifficulty"><option ${h.difficulty==='Easy'?'selected':''}>Easy</option><option ${h.difficulty==='Medium'?'selected':''}>Medium</option><option ${h.difficulty==='Hard'?'selected':''}>Hard</option></select></div><div class="field"><label>Best time</label><input id="habitTime" type="time" value="${escapeHtml(h.time||'')}"></div><div class="field"><label>Private</label><select id="habitPrivate"><option value="0" ${!h.private?'selected':''}>No</option><option value="1" ${h.private?'selected':''}>Yes</option></select></div></div>
    <label class="smalltext muted" style="display:block;margin-top:10px">Smallest useful action</label><input id="habitAction" value="${escapeHtml(h.action||'')}">
    <label class="smalltext muted" style="display:block;margin-top:10px">Why this habit?</label><input id="habitWhy" value="${escapeHtml(h.why||'')}">
    <label class="smalltext muted" style="display:block;margin-top:10px">Private note</label><textarea id="habitNote">${escapeHtml(data.habitNotes[h.id]||'')}</textarea>
    <div class="quick-actions" style="margin-top:10px"><button class="btn primary" data-save-habit>Save</button><button class="btn" data-freeze="${h.id}|${today()}" ${(!frozen(h,today())&&!freezeAvailable())?'disabled':''}>${frozen(h,today())?'Undo today freeze':freezeAvailable()?'🛡 Protect today':'🛡 Used this month'}</button><button class="btn" data-rename-habit>Rename</button><button class="btn" data-delete-habit>Delete</button></div>
    <div class="note" style="margin-top:10px">🛡 One freeze per month. You can use it for today or yesterday; undoing it does not restore the monthly allowance.</div>
    <div class="section" style="margin-top:15px"><h2>Month</h2><span class="muted smalltext">${escapeHtml(data.month)}</span></div>
    <div class="matrix-wrap"><table class="matrix"><thead><tr><th>Day</th>${ds.map(d=>`<th>${Number(d.slice(-2))}</th>`).join('')}</tr></thead><tbody><tr><td class="habit-cell">${escapeHtml(h.name)}</td>${ds.map(d=>{const future=d>today();return `<td><button class="daycheck ${done(h,d)?'done':''} ${frozen(h,d)?'freeze':''} ${future?'future-day':''} ${d===today()?'today':''}" data-toggle="${h.id}|${d}" ${future?'disabled':''}>${done(h,d)?'✓':frozen(h,d)?'🛡':future?'':''}</button></td>`}).join('')}</tr></tbody></table></div>
  </div></div>`;
}

function v12Tone(h){
  const n=Math.max(0,data.habits.indexOf(h));
  return ['sun','blue','green','rose','purple','orange','teal'][n%7];
}

function v12DayLabel(d){
  return dateObj(d).toLocaleDateString(undefined,{weekday:'short'}).slice(0,3);
}

function v12MiniDays(){
  return Array.from({length:7},(_,i)=>addDays(today(),i-6));
}

function v12ProgressPercent(){
  return data.habits.length
    ? Math.round(stats().todayDone/data.habits.length*100)
    : 0;
}

function v12StatusLabel(h,d){
  if(done(h,d)) return 'Done';
  if(frozen(h,d)) return 'Protected';
  if(d>today()) return 'Later';
  return 'Open';
}

function v12HabitCard(h,mode='today'){
  const hs=habitStats(h);
  const days=mode==='week'
    ? v12MiniDays()
    : v12MiniDays();
  const d=today();
  const isDone=done(h,d);
  const tone=v12Tone(h);

  return `<article class="v12-habit tone-${tone}">
    <div class="v12-habit-top">
      <div class="v12-icon">${escapeHtml(h.icon||'✅')}</div>
      <div class="v12-habit-main">
        <div class="v12-habit-name">
          ${escapeHtml(h.name)}
          ${h.private?'<span class="v12-private">🔒</span>':''}
        </div>
        <div class="v12-streak">🔥 ${hs.run} day${hs.run===1?'':'s'}</div>
      </div>
      <button class="v12-edit" data-open-habit="${h.id}" aria-label="Edit ${escapeHtml(h.name)}">✎</button>
      <button class="v12-main-check ${isDone?'is-done':''}" data-toggle="${h.id}|${d}" aria-label="${isDone?'Undo':'Complete'} ${escapeHtml(h.name)}">
        ${isDone?'✓':'○'}
      </button>
    </div>
    <div class="v12-action">${escapeHtml(h.action||'Do the smallest useful version')}</div>
    <div class="v12-week">
      ${days.map(x=>{
        const future=x>d;
        const state=done(h,x)?'done':frozen(h,x)?'freeze':future?'future':'open';
        return `<div class="v12-day-cell">
          <span>${v12DayLabel(x)}</span>
          <button class="v12-dot ${state} ${x===d?'is-today':''}" data-toggle="${h.id}|${x}" ${future?'disabled':''} aria-label="${v12StatusLabel(h,x)} ${formatDay(x)}">
            ${done(h,x)?'✓':frozen(h,x)?'🛡':future?'':''}
          </button>
        </div>`;
      }).join('')}
    </div>
  </article>`;
}

function v12ProgressCard(title,sub){
  const pct=v12ProgressPercent();
  return `<section class="v12-progress-card">
    <div class="v12-ring" style="--p:${pct}"><div><b>${pct}%</b><span>today</span></div></div>
    <div class="v12-progress-copy">
      <div class="v12-made">Progress</div>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(sub)}</p>
      <div class="v12-progress-bar"><i style="width:${pct}%"></i></div>
    </div>
  </section>`;
}

function v12CoachCard(){
  const [head,msg]=coach();
  const f=focusHabit();
  return `<section class="v12-coach">
    <div class="v12-coach-head"><span>${head}</span><small>Next best action</small></div>
    <div class="v12-coach-text">${escapeHtml(msg)}</div>
    ${f?`<button class="v12-coach-action" data-toggle="${f.id}|${today()}">${done(f,today())?'✓ Completed':'Complete'} · ${escapeHtml(f.name)}</button>`:''}
  </section>`;
}

function v12TodayPage(){
  const s=stats();
  const f=focusHabit();
  const day=journeyDay();
  const pct=v12ProgressPercent();
  return `<div class="v12-page">
    ${v12ProgressCard(
      `${s.todayDone} of ${data.habits.length} scheduled`,
      s.todayDone===data.habits.length&&data.habits.length ? 'All scheduled habits are complete.' : 'One small win at a time.'
    )}

    ${f?`<section class="v12-focus">
      <div class="v12-focus-kicker">TODAY'S FOCUS</div>
      <div class="v12-focus-row">
        <div class="v12-focus-icon">${escapeHtml(f.icon)}</div>
        <div class="v12-focus-copy">
          <h2>${escapeHtml(f.name)}</h2>
          <p>${escapeHtml(f.smallWin||f.action||'Do the smallest useful version')}</p>
          <small>${escapeHtml(recovery(f))}</small>
        </div>
        <button class="v12-focus-btn ${done(f,today())?'done':''}" data-toggle="${f.id}|${today()}">${done(f,today())?'✓':'→'}</button>
      </div>
      <button class="v12-link-btn" data-action="smallwin" data-habit-id="${f.id}">Make it smaller</button>
    </section>`:''}

    ${v12CoachCard()}

    <section class="v12-section-head">
      <div><div class="kicker">TODAY · DAY ${day}</div><h2>Your habits</h2></div>
      <span class="badge">${pct}%</span>
    </section>

    <div class="v12-list">
      ${data.habits.length?data.habits.map(h=>v12HabitCard(h,'today')).join(''):'<div class="v12-empty">Add your first habit with the + button.</div>'}
    </div>

    ${s.todayDone===data.habits.length&&data.habits.length?`<section class="v12-celebrate"><b>🔥 Today complete</b><span>Protect tomorrow by choosing the easiest first action.</span></section>`:''}

    <section class="v12-journey-mini">
      <div><span>YOUR ARC</span><b>Day ${day}</b></div>
      <p>${escapeHtml(dayMessage(day))}</p>
      <small>Next milestone · Day ${nextMilestone(day)}</small>
    </section>
  </div>`;
}

function v12WeekPage(){
  const s=stats();
  const ds=v12MiniDays();
  return `<div class="v12-page">
    ${v12ProgressCard(`This week's progress`,`Active days include streak protection · ${s.score}%`)}
    <section class="v12-simple-card">
      <div class="v12-section-head"><div><div class="kicker">7 DAYS</div><h2>Week at a glance</h2></div><span class="badge">${s.score}%</span></div>
      <div class="v12-week-summary">
        ${ds.map(d=>{
          const eligible=data.habits.filter(h=>canUseHabitOn(h,d)).length;
          const n=data.habits.filter(h=>active(h,d)).length;
          const pct=eligible?Math.round(n/eligible*100):0;
          return `<div class="v12-week-day ${d===today()?'today':''}"><b>${v12DayLabel(d)}</b><div class="v12-week-pillar" style="--h:${Math.max(8,pct)}%"><i></i></div><small>${pct}%</small></div>`;
        }).join('')}
      </div>
    </section>
    <div class="v12-list">
      ${data.habits.map(h=>v12HabitCard(h,'week')).join('')||'<div class="v12-empty">Add a habit to see your week.</div>'}
    </div>
  </div>`;
}

function v12MonthGrid(h){
  const ds=makeDays(data.month);
  const first=dateObj(ds[0]).getDay();
  const cells=[];
  for(let i=0;i<first;i++)cells.push({blank:true});
  ds.forEach(d=>cells.push({d}));
  return `<div class="v12-month-grid">
    ${['S','M','T','W','T','F','S'].map(x=>`<div class="v12-month-label">${x}</div>`).join('')}
    ${cells.map(c=>c.blank?'<div class="v12-month-blank"></div>':(()=>{
      const future=c.d>today();
      const state=done(h,c.d)?'done':frozen(h,c.d)?'freeze':future?'future':'open';
      return `<button class="v12-month-dot ${state} ${c.d===today()?'today':''}" data-toggle="${h.id}|${c.d}" ${future?'disabled':''} title="${formatDay(c.d)}">${done(h,c.d)?'✓':frozen(h,c.d)?'🛡':future?'':''}</button>`;
    })()).join('')}
  </div>`;
}

function v12MonthPage(){
  const s=stats();
  return `<div class="v12-page">
    ${v12ProgressCard(`${s.completed} of ${s.total} completed`,`${formatMonthName(data.month)} · future days are locked`)}
    <section class="v12-month-picker">
      <button class="btn small" data-month-shift="-1">‹</button>
      <input id="monthPicker" type="month" value="${escapeHtml(data.month)}" aria-label="Month">
      <button class="btn small" data-month-shift="1">›</button>
    </section>
    <div class="v12-list">
      ${data.habits.map(h=>`<article class="v12-month-card tone-${v12Tone(h)}">
        <div class="v12-month-head"><div class="v12-icon">${escapeHtml(h.icon)}</div><div><h2>${escapeHtml(h.name)}</h2><span>🔥 ${habitStats(h).run} days · ${habitStats(h).monthPct}% this month</span></div><button class="v12-edit" data-open-habit="${h.id}">✎</button></div>
        <div class="v12-calendar-title"><span>S M T W T F S</span></div>
        ${v12MonthGrid(h)}
      </article>`).join('')||'<div class="v12-empty">Add a habit first.</div>'}
    </div>
  </div>`;
}

function formatMonthName(m){
  return dateObj(m+'-01').toLocaleDateString(undefined,{month:'long',year:'numeric'});
}

function v12ArcPage(){
  const day=journeyDay();
  const target=nextMilestone(day);
  const s=stats();
  const pct=Math.min(100,Math.round(day/Math.max(1,target)*100));
  const goal=data.goal||'Your next personal goal';
  return `<div class="v12-page">
    <section class="v12-arc-hero">
      <div class="v12-arc-kicker">PERSONAL ARC</div>
      <div class="v12-arc-number">Day ${day}</div>
      <p>${escapeHtml(dayMessage(day))}</p>
      <div class="v12-arc-progress"><i style="width:${Math.max(4,pct)}%"></i></div>
      <div class="v12-arc-meta"><span>Next · Day ${target}</span><span>${s.completed} total wins</span></div>
    </section>

    <section class="v12-simple-card">
      <div class="v12-section-head"><div><div class="kicker">GOAL</div><h2>${escapeHtml(goal)}</h2></div><button class="btn small" data-more="goals">Edit</button></div>
      <div class="v12-goal-row"><b>${Math.min(data.target,goalProgress())}/${data.target}</b><div class="v12-progress-bar"><i style="width:${Math.min(100,Math.round(goalProgress()/Math.max(1,data.target)*100))}%"></i></div></div>
    </section>

    <section class="v12-simple-card">
      <div class="v12-section-head"><div><div class="kicker">MILESTONES</div><h2>Keep the next one visible.</h2></div></div>
      <div class="v12-milestone-row">${[3,7,14,21,30,45,60,75,90,100].map(m=>`<div class="v12-milestone ${day>=m?'on':''}"><b>${m}</b><span>${day>=m?'✓':'🔒'}</span></div>`).join('')}</div>
    </section>

    <section class="v12-simple-card">
      <div class="v12-section-head"><div><div class="kicker">YOUR NUMBERS</div><h2>Only what matters.</h2></div></div>
      <div class="v12-number-grid">
        <div><b>${s.fullStreak}</b><span>Full-day streak</span></div>
        <div><b>${Math.max(0,...data.habits.map(h=>habitStats(h).longest))}</b><span>Best habit streak</span></div>
        <div><b>${data.xp}</b><span>XP</span></div>
        <div><b>${level()}</b><span>Level</span></div>
      </div>
    </section>
  </div>`;
}

function v12Drawer(){
  return `<div class="v12-drawer-backdrop" data-close-drawer></div><aside class="v12-drawer">
    <div class="v12-drawer-brand"><div class="kicker">PROGRESS TRACKER V12</div><h2>Simple. Personal. Yours.</h2><p>Everything is here, but only when you need it.</p></div>
    <button class="v12-drawer-item active" data-tab="today">🏠 <span>Progress</span></button>
    <button class="v12-drawer-item" data-tab="week">📅 <span>Week</span></button>
    <button class="v12-drawer-item" data-tab="month">🗓️ <span>Month</span></button>
    <button class="v12-drawer-item" data-tab="arc">❄️ <span>Arc</span></button>
    <div class="v12-drawer-line"></div>
    <div class="v12-drawer-label">TOOLS</div>
    <button class="v12-drawer-item" data-more="manage">✅ <span>Manage habits</span></button>
    <button class="v12-drawer-item" data-more="goals">🎯 <span>Goals</span></button>
    <button class="v12-drawer-item" data-more="routine">🔁 <span>Routines</span></button>
    <button class="v12-drawer-item" data-more="planner">🗓️ <span>Day planner</span></button>
    <button class="v12-drawer-item" data-more="checkin">🌤️ <span>Mood & energy</span></button>
    <button class="v12-drawer-item" data-more="sleep">😴 <span>Sleep</span></button>
    <button class="v12-drawer-item" data-more="journal">✍️ <span>Journal</span></button>
    <button class="v12-drawer-item" data-more="reminders">⏰ <span>Reminders</span></button>
    <button class="v12-drawer-item" data-more="security">🔐 <span>Privacy</span></button>
    <button class="v12-drawer-item" data-more="settings">⚙️ <span>Settings & data</span></button>
    <div class="v12-drawer-bottom"><span>Made for small wins.</span><b>❄️ V12</b></div>
  </aside>`;
}

function v12Topbar(){
  const labels={today:'Today',week:'Week',month:'Month',arc:'Arc'};
  return `<header class="v12-topbar">
    <button class="v12-menu-btn" data-open-drawer aria-label="Open menu">☰</button>
    <div class="v12-brand"><strong>Progress Tracker</strong> <span>V12</span></div>
    <div class="v12-top-actions">
      <button class="v12-round-btn" data-dark title="Theme">${data.dark?'☀️':'◔'}</button>
      <button class="v12-round-btn frost" data-tab="arc" title="Arc">❄️</button>
    </div>
  </header>
  <nav class="v12-tabs">
    ${Object.entries(labels).map(([n,l])=>`<button data-tab="${n}" class="${tab===n?'active':''}">${l}</button>`).join('')}
  </nav>`;
}

function v12Shell(){
  const body=tab==='today'?v12TodayPage():tab==='week'?v12WeekPage():tab==='month'?v12MonthPage():tab==='more'?morePage():v12ArcPage();
  const s=stats();
  return `<div class="v12-app">
    ${v12Topbar()}
    <div class="v12-global-line"><span>${data.name?`Hi, ${escapeHtml(data.name)} 👋`:'Your progress'}</span><span>${s.todayDone}/${data.habits.length} today</span></div>
    <main class="v12-main">${body}</main>
    <button class="v12-fab" data-fab aria-label="Add">${quickOpen?'×':'+'}</button>
    ${quickOpen?`<div class="v12-fab-menu"><button data-quick="habit">✅ Add habit</button><button data-quick="goals">🎯 Goal</button><button data-quick="routine">🔁 Routine</button></div>`:''}
    ${selectedHabit?habitOverlay():''}
    ${!data.onboardingDone&&!data.pinHash?onboarding():''}
    ${window.__v11QuickModal?quickModal():''}
  </div>`;
}

function appShell(){return v12Shell()}
function nav(){return [['today','Today'],['week','Week'],['month','Month'],['arc','Arc']]}
function bottomNav(){return ''}
function morePage(){return v12Drawer()}

function routeMore(which){
  tab='more';morePanel=which;selectedHabit=null;quickOpen=false;window.__v11QuickModal=false;render();
}

function toggleFreeze(h,d){
  if(!canEdit(d)){showToast('Future dates cannot be frozen.');return}
  const k=key(h,d);
  if(done(h,d)){showToast('Undo the completion first.');return}
  if(frozen(h,d)){delete data.freezes[k];save();showToast('Freeze removed 🛡️');render();return}
  if(d!==today()&&d!==addDays(today(),-1)){
    showToast('Freeze is only available for today or yesterday.');return;
  }
  if(!freezeAvailable()){showToast('This month’s freeze is already used 🛡️');return}
  data.freezes[k]=true;
  data.freezeUsed[freezeMonthKey()]=true;
  save();showToast('Monthly freeze used 🛡️');render();
}

function routineCurrent(r){
  const items=routineItems(r);
  if(!items.length)return null;
  const start=Math.max(0,Math.min(r.step||0,items.length));
  for(let i=start;i<items.length;i++) if(!done(items[i],today())) return items[i];
  for(let i=0;i<start;i++) if(!done(items[i],today())) return items[i];
  return null;
}
function startRoutine(id){const r=data.routines.find(x=>x.id===id);if(!r)return;const items=routineItems(r);r.step=items.findIndex(h=>!done(h,today()));if(r.step<0)r.step=items.length;data.activeRoutine=id;save();tab='today';morePanel='';render();showToast(`${r.name} started ▶`)}

function manageHabitsHtml(){
  const list=data.habits.filter(h=>habitMatches(h));
  return `<section class="v12-manage"><div class="v12-simple-card"><div class="v12-section-head"><div><div class="kicker">MANAGE</div><h2>Your habits</h2></div><button class="btn small" data-close-more>Close</button></div><div class="search-row"><input id="habitSearch" value="${escapeHtml(habitSearch)}" placeholder="Search habits"></div></div><div class="v12-list">${list.map(h=>`<div class="v12-manage-row tone-${v12Tone(h)}"><span class="v12-icon">${escapeHtml(h.icon)}</span><div><b>${escapeHtml(h.name)}</b><small>${escapeHtml(h.action||'')}</small></div><button class="v12-edit" data-open-habit="${h.id}">✎</button></div>`).join('')||'<div class="v12-empty">No matching habits.</div>'}</div><div class="v12-simple-card"><button class="btn primary block" data-add-custom>＋ Add custom habit</button></div></section>`;
}

function morePage(){
  if(morePanel==='manage')return manageHabitsHtml();
  return `<div class="v12-tool-page">${panelHtml()}</div>`;
}

/* V12 direct menu routing: capture phase keeps drawer buttons reliable after re-renders. */
document.addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(!b||!b.hasAttribute('data-more'))return;
  const which=b.getAttribute('data-more')||'';
  e.stopImmediatePropagation();
  tab='more';morePanel=which;selectedHabit=null;quickOpen=false;window.__v11QuickModal=false;
  document.body.classList.remove('drawer-open');
  render();
},{capture:true});

/* V12 drawer + month shift + small-win interactions */
document.addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(!b)return;
  if(b.dataset.openDrawer!==undefined){document.body.classList.add('drawer-open');if(!document.querySelector('.v12-drawer'))document.body.insertAdjacentHTML('beforeend',v12Drawer());return}
  if(b.dataset.closeDrawer!==undefined){document.body.classList.remove('drawer-open');document.querySelector('.v12-drawer')?.remove();document.querySelector('.v12-drawer-backdrop')?.remove();return}
  if(b.dataset.monthShift){
    const cur=dateObj(data.month+'-01');cur.setMonth(cur.getMonth()+Number(b.dataset.monthShift));data.month=localDate(cur).slice(0,7);save();render();return;
  }
  if(b.dataset.action==='smallwin'){
    const h=data.habits.find(x=>x.id===b.dataset.habitId);if(h&&!done(h,today()))toggleHabit(h,today());return;
  }
  if(b.dataset.tab&&document.body.classList.contains('drawer-open')){
    const n=b.dataset.tab;document.body.classList.remove('drawer-open');document.querySelector('.v12-drawer')?.remove();document.querySelector('.v12-drawer-backdrop')?.remove();tab=n;morePanel='';selectedHabit=null;render();return;
  }
});

/* Keep month/date inputs and search behaving after V12 renders. */
document.addEventListener('input',e=>{
  if(e.target.id==='habitSearch'){
    habitSearch=e.target.value;if(morePanel==='manage')render();return;
  }
});

render();

})();
