(function(){
'use strict';

const VERSION='V25.3';
const WINTER_ARC_START='2026-10-01';
const WINTER_ARC_END='2026-12-31';
const WINTER_ARC_LENGTH=92;
const COMMUNITY_NS='winter-arc-2026';
const KEY='progress_tracker_v17';
const OLD_KEYS=['progress_tracker_v16','progress_tracker_v14_2','progress_tracker_v14_1','progress_tracker_v14','progress_tracker_v13','progress_tracker_v12','progress_tracker_v11','progress_tracker_v10','progress_tracker_v9','progress_tracker_v8','progress_tracker_v6','progress_tracker_v5','progress_tracker_v4','progress_tracker_v3_plain'];
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
 {name:'Private Wellness',icon:'🔒',cat:'Private',private:true,difficulty:'Medium',action:'Follow your chosen boundary'}
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
 schema:16,arcStart:WINTER_ARC_START,arcLength:WINTER_ARC_LENGTH,name:'',month:currentMonth(),habits:[],checks:{},freezes:{},freezeUsed:{},xpEvents:{},bonusEvents:{},sleep:{},notes:{},habitNotes:{},
 goal:'',target:7,achieved:0,win:'',barrier:'',ifThen:'',dark:false,xp:0,onboardingDone:false,journeyStart:'',mood:{},energy:{},planner:{},
 routines:[],activeRoutine:null,goalLinks:[],reminders:{},pinHash:'',profileCreated:false,lastLogin:'',coachEnabled:true,installHint:true,creatorName:'',creatorHandle:'',creatorBio:'',creatorLink:'',creatorPhoto:'creator-profile.jpg',communityCount:0,communityCheckinDate:'',v25UserRegistered:false,invitedBy:'',cloudOptIn:false,cloudUserId:'',cloudLastSync:'',cloudStatus:'',compareSnapshot:'',shareCode:'',publicProfile:false
}};

let data=load();
// V14.2 privacy-label migration: keep older saved trackers working without exposing the old label.
if(Array.isArray(data.habits)){
  data.habits=data.habits.map(h=>h&&h.name==='Masturbation'?Object.assign({},h,{name:'Private Wellness',private:true}):h);
}
if(data.habitNotes&&data.habitNotes.Masturbation){data.habitNotes['Private Wellness']=data.habitNotes.Masturbation;delete data.habitNotes.Masturbation;}
let tab='today';
let morePanel='';
let selectedHabit=null;
let quickOpen=false;
let newHabitOpen=false;
let focusMode=false;
let habitFilter='all';
let habitSearch='';
let toastTimer=null;
let installPrompt=null;
let sessionUnlocked=!data.pinHash;

/* V14 migration-safe defaults */
data.schema=15;
/* Winter Arc 2026 starts tomorrow: 1 Oct → 31 Dec (92 days). */
if(!data.arcStart || !/^\d{4}-\d{2}-\d{2}$/.test(data.arcStart)){data.arcStart=WINTER_ARC_START;}
if(data.arcStart===WINTER_ARC_START){data.arcLength=WINTER_ARC_LENGTH;}
else{data.arcLength=Math.max(14,Math.min(3650,Number(data.arcLength)||WINTER_ARC_LENGTH));}
if(!data.journeyStart)data.journeyStart=today();
if(!data.creatorName)data.creatorName='Vashu Sharmaa';
if(!data.creatorHandle)data.creatorHandle='@pandatvikas1';
if(!data.creatorBio || data.creatorBio==='Hi, I’m Vashu Sharmaa — a Data Engineer. I built Winter Arc Tracker for people who want to turn small daily actions into real progress. Keep it simple, stay consistent, and build your own Arc.')data.creatorBio='Hi, I’m Vashu Sharmaa — a Data Engineer. I built Winter Arc Tracker for people who want to turn small daily actions into real progress. Keep it simple, stay consistent, and build your own Arc.';
if(!data.creatorLink)data.creatorLink='https://instagram.com/pandatvikas1';
data.creatorPhoto='creator-profile.jpg';
if(typeof data.communityCount!=='number')data.communityCount=0;
if(!data.communityCheckinDate)data.communityCheckinDate='';
save();
try{const inv=new URL(location.href).searchParams.get('from');if(inv&&!data.invitedBy){data.invitedBy=inv.replace(/^@/,'').slice(0,80);save();}}catch(e){}

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;window.__v11InstallPrompt=e;if(tab==='download')render();});
window.addEventListener('appinstalled',()=>{installPrompt=null;window.__v11InstallPrompt=null;showToast('App installed 📱');if(tab==='download')render();});

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
   id:uid(),name:'Habit',icon:'✅',private:false,created:today(),difficulty:'Medium',action:'Do the smallest useful version',time:'',smallWin:'Do the smallest useful version',why:''
 },typeof h==='string'?{name:h}:h));
 d.routines=d.routines.filter(r=>r&&r.name).map(r=>Object.assign({id:uid(),name:'Routine',icon:'🔁',items:[],step:0},r));
 d.xp=Number(d.xp)||0;
 d.target=Math.max(1,Number(d.target)||7);
 d.achieved=Math.max(0,Math.min(d.target,Number(d.achieved)||0));
 d.arcStart=/^\d{4}-\d{2}-\d{2}$/.test(d.arcStart)?d.arcStart:WINTER_ARC_START;
 d.arcLength=Math.max(14,Math.min(3650,Number(d.arcLength)||WINTER_ARC_LENGTH));
 d.creatorName=String(d.creatorName||'Vashu Sharmaa');d.creatorHandle=String(d.creatorHandle||'@pandatvikas1');d.creatorBio=String((d.creatorBio&&d.creatorBio!=='Hi, I’m Vashu Sharmaa — a Data Engineer. I built Winter Arc Tracker for people who want to turn small daily actions into real progress. Keep it simple, stay consistent, and build your own Arc.')?d.creatorBio:'Hi, I’m Vashu Sharmaa — a Data Engineer. I built Winter Arc Tracker for people who want to turn small daily actions into real progress. Keep it simple, stay consistent, and build your own Arc.');d.creatorLink=String(d.creatorLink||'https://instagram.com/pandatvikas1');d.creatorPhoto=String(d.creatorPhoto||'creator-profile.jpg');
 d.communityCount=Math.max(0,Number(d.communityCount)||0);d.communityCheckinDate=String(d.communityCheckinDate||'');d.v25UserRegistered=!!d.v25UserRegistered;d.invitedBy=String(d.invitedBy||'').slice(0,80);d.cloudOptIn=!!d.cloudOptIn;d.cloudUserId=String(d.cloudUserId||'');d.cloudLastSync=String(d.cloudLastSync||'');d.cloudStatus=String(d.cloudStatus||'');d.compareSnapshot=String(d.compareSnapshot||'');d.shareCode=String(d.shareCode||'');d.publicProfile=!!d.publicProfile;d.profileInstagram=String(d.profileInstagram||'').slice(0,80);
 d.month=/^\d{4}-\d{2}$/.test(d.month)?d.month:currentMonth();
 d.pinHash=String(d.pinHash||'');
 d.lastLogin=String(d.lastLogin||'');
 d.schema=16;
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
    m.schema=16;
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
 <section class="card"><div class="section"><h2>📌 Quick add</h2><span class="muted smalltext">Preset habits</span></div><div class="preset-grid">${PRESETS.filter(p=>!p.private).map(p=>`<button class="preset" data-add-preset="${escapeHtml(p.name)}"><div class="line"><span style="font-size:23px">${p.icon}</span><div><b>${escapeHtml(p.name)}</b><div class="muted">${escapeHtml(p.cat)}</div></div></div></button>`).join('')}</div><div class="private-section"><div class="section"><h2>🔒 Private habit</h2><span class="muted smalltext">Discreet label</span></div><button class="preset" style="width:100%" data-add-preset="Private Wellness"><div class="line"><span style="font-size:23px">🔒</span><div><b>Private Wellness</b><div class="muted">Optional private tracker</div></div></div></button></div></section>
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
function remindersHtml(){return `<section class="card"><div class="section"><h2>⏰ Reminders</h2><button class="btn small" data-close-more>Close</button></div><div class="notice"><b>How reminders work:</b> notifications require browser permission and this tracker page/app to be running. They are not guaranteed background-native alarms.</div><button class="btn" data-notify style="margin-top:9px">🔔 Allow notifications</button>${data.habits.map(h=>{const r=data.reminders[h.id]||{};const t=r.time||h.time||'';return `<div class="plan-item"><div class="plan-time"><input type="time" data-remtime="${h.id}" value="${escapeHtml(t)}"></div><div class="plan-copy"><b>${escapeHtml(h.icon)} ${escapeHtml(h.name)}</b><div class="muted smalltext">${r.enabled&&t?'Reminder on':'Off · choose a time'}</div></div><input type="checkbox" data-remon="${h.id}" ${r.enabled&&t?'checked':''} ${t?'':'disabled'} aria-label="Enable reminder for ${escapeHtml(h.name)}"></div>`}).join('')||'<div class="empty" style="margin-top:8px">Add a habit first.</div>'}<button class="btn primary" data-save-reminders style="margin-top:10px">Save reminders ⏰</button></section>`}
function securityHtml(){return `<section class="card"><div class="section"><h2>🔐 Profile & local security</h2><button class="btn small" data-close-more>Close</button></div><div class="note">Profile: <b>${escapeHtml(data.name||'Not set')}</b><br>Last login: ${escapeHtml(data.lastLogin||'This session')}</div><div class="form" style="margin-top:10px"><div class="field"><label>New PIN</label><input id="newPin" type="password" inputmode="numeric" maxlength="6" placeholder="4–6 digits"></div><div class="field"><label>Confirm PIN</label><input id="confirmPin" type="password" inputmode="numeric" maxlength="6" placeholder="Repeat PIN"></div><div class="field"><label>Name</label><input id="profileName2" value="${escapeHtml(data.name||'')}"></div></div><div class="quick-actions"><button class="btn primary" data-save-pin>Save PIN 🔒</button>${data.pinHash?'<button class="btn" data-remove-pin>Remove PIN</button>':''}<button class="btn" data-lock-now>Lock now</button></div><div class="security-note" style="margin-top:10px">The PIN is stored as a local hash. Device storage and exported backups are not encrypted.</div></section>`}
function settingsHtml(){return `<section class="card"><div class="section"><h2>⚙️ Settings</h2><button class="btn small" data-close-more>Close</button></div><div class="quick-actions"><button class="btn" data-dark>${data.dark?'☀️ Light mode':'🌙 Dark mode'}</button><button class="btn" data-backup>💾 JSON backup</button><button class="btn" data-csv>📊 CSV</button><button class="btn" data-restore>📥 Restore</button><button class="btn" data-install>📱 Install app</button><input id="restoreFile" type="file" accept=".json" hidden></div><div class="note" style="margin-top:10px">Offline-first core tracking is stored on this device. Back up before clearing browser storage or changing devices.</div><div class="danger-note" style="margin-top:10px">Reset profile permanently erases this device’s local progress.</div><button class="btn" data-reset style="margin-top:9px">Reset local profile</button></section>`}
function morePage(){return `<section class="card hero"><div class="kicker">MORE TOOLS</div><h2 style="margin:4px 0 6px">Build your system around real life.</h2><p class="muted" style="margin:0">Goals, routines, planner, check-in, sleep, journal, reminders, security and data tools.</p></section><section class="drawer-grid"><button class="more-tile" data-more="goals"><span>🎯</span><b>Goals & review</b><small>Link goals to habits and reflect.</small></button><button class="more-tile" data-more="routine"><span>🔁</span><b>Routines</b><small>Run habits step by step.</small></button><button class="more-tile" data-more="planner"><span>🗓️</span><b>Day planner</b><small>Set preferred times.</small></button><button class="more-tile" data-more="checkin"><span>🌤️</span><b>Mood & energy</b><small>Build a simple personal history.</small></button><button class="more-tile" data-more="sleep"><span>😴</span><b>Sleep</b><small>Log hours and timing.</small></button><button class="more-tile" data-more="journal"><span>✍️</span><b>Journal</b><small>Keep one-line reflections.</small></button><button class="more-tile" data-more="reminders"><span>⏰</span><b>Reminders</b><small>Time your next action.</small></button><button class="more-tile" data-more="security"><span>🔐</span><b>Profile & security</b><small>Local PIN and session lock.</small></button><button class="more-tile" data-more="settings"><span>⚙️</span><b>Settings & backup</b><small>Theme, export, restore, install.</small></button></section>${morePanel?panelHtml():'<section class="card"><div class="section"><h2>💾 Backup tip</h2><span class="badge">Recommended</span></div><div class="note">Take a JSON backup after major changes. Restore now correctly re-locks a PIN-protected profile.</div></section>'}`}
function panelHtml(){return {goals:goalsHtml,routine:routineHtml,planner:plannerHtml,checkin:checkinHtml,sleep:sleepHtml,journal:journalHtml,reminders:remindersHtml,security:securityHtml,settings:settingsHtml}[morePanel]?.()||settingsHtml()}

function quickModal(){return `<div class="overlay" data-close-overlay><div class="modal"><div class="section"><h2>⚡ Quick add</h2><button class="btn small" data-close-quick>Close</button></div><div class="drawer-grid"><button class="more-tile" data-quick="habit"><span>✅</span><b>Habit</b><small>Add something to repeat.</small></button><button class="more-tile" data-quick="goals"><span>🎯</span><b>Goal</b><small>Set a target.</small></button><button class="more-tile" data-quick="routine"><span>🔁</span><b>Routine</b><small>Group habits.</small></button><button class="more-tile" data-quick="journal"><span>✍️</span><b>Journal</b><small>Write one line.</small></button></div></div></div>`}

function onboarding(){return `<div class="overlay"><div class="modal"><div class="kicker">V14 SETUP</div><h2>👋 Build your system.</h2><p class="muted smalltext">Start with a realistic group of habits. You can change everything later.</p><label class="smalltext muted">Your name</label><input id="onName" value="${escapeHtml(data.name)}" placeholder="Enter your name"><div class="section" style="margin-top:13px"><h2>Choose habits</h2><span class="badge" id="onCount">0 selected</span></div><div class="preset-grid" id="onPresets">${PRESETS.filter(p=>!p.private).map((p,i)=>`<button class="preset ${i<4?'selected':''}" data-onpreset="${escapeHtml(p.name)}"><div class="line"><input type="checkbox" ${i<4?'checked':''}><span style="font-size:22px">${p.icon}</span><div><b>${escapeHtml(p.name)}</b><div class="muted">${escapeHtml(p.cat)}</div></div></div></button>`).join('')}</div><div class="private-section"><div class="section"><h2>🔒 Private habit</h2><span class="muted smalltext">Optional</span></div><button class="preset" style="width:100%" data-onpreset="Private Wellness"><div class="line"><input type="checkbox"><span style="font-size:22px">🔒</span><div><b>Private Wellness</b><div class="muted">Discreet label</div></div></div></button></div><label class="smalltext muted" style="display:block;margin-top:12px">Add a custom habit</label><div class="search-row" style="margin-top:6px"><input id="onCustom" placeholder="e.g. Stretch"><button class="btn" data-on-custom>Add</button></div><div id="customSetupList" style="display:grid;gap:6px;margin-top:7px"></div><div class="note" style="margin-top:10px">💡 You do not need a perfect routine. Pick habits you can realistically repeat.</div>${data.invitedBy?`<div class="v133-invite-note">🤝 Invited by <b>@${escapeHtml(data.invitedBy)}</b></div>`:''}<button class="btn primary block" data-finish-onboarding style="margin-top:12px;padding:12px">Save My System 🚀</button></div></div>`}

function habitOverlay(){const h=data.habits.find(x=>x.id===selectedHabit);if(!h)return '';const hs=habitStats(h),ds=makeDays(data.month);return `<div class="overlay"><div class="modal"><div class="section"><div><div class="kicker">HABIT DETAILS</div><h2 style="margin:3px 0 0">${escapeHtml(h.icon)} ${escapeHtml(h.name)}</h2></div><button class="btn small" data-close-habit>Close</button></div><div class="grid three"><div class="stat"><small>Current</small><b>${hs.run} 🔥</b></div><div class="stat"><small>Longest</small><b>${hs.longest}</b></div><div class="stat"><small>Total</small><b>${hs.total}</b></div></div><div class="form" style="margin-top:10px"><div class="field"><label>Icon</label><input id="habitIcon" value="${escapeHtml(h.icon)}" maxlength="3"></div><div class="field"><label>Difficulty</label><select id="habitDifficulty"><option ${h.difficulty==='Easy'?'selected':''}>Easy</option><option ${h.difficulty==='Medium'?'selected':''}>Medium</option><option ${h.difficulty==='Hard'?'selected':''}>Hard</option></select></div><div class="field"><label>Private label</label><select id="habitPrivate"><option value="0" ${!h.private?'selected':''}>No</option><option value="1" ${h.private?'selected':''}>Yes</option></select></div></div><div class="form" style="margin-top:10px"><div class="field"><label>Best time</label><input id="habitTime" type="time" value="${escapeHtml(h.time||'')}"></div><div class="field"><label>Smallest action</label><input id="habitAction" value="${escapeHtml(h.action||'')}"></div><div class="field"><label>Why</label><input id="habitWhy" value="${escapeHtml(h.why||'')}"></div></div><label class="smalltext muted" style="display:block;margin-top:10px">Habit note</label><textarea id="habitNote">${escapeHtml(data.habitNotes[h.id]||'')}</textarea><button class="btn primary block" data-save-habit style="margin-top:10px">Save settings ✅</button><div class="section" style="margin-top:15px"><h2>📅 Monthly history</h2><span class="muted smalltext">${escapeHtml(data.month)}</span></div><div class="matrix-wrap"><table class="matrix"><thead><tr><th>Habit</th>${ds.map(d=>`<th>${Number(d.slice(-2))}</th>`).join('')}</tr></thead><tbody><tr><td class="habit-cell">${escapeHtml(h.name)}</td>${ds.map(d=>{const future=d>today(),fr=frozen(h,d);return `<td><button class="daycheck ${done(h,d)?'done':''} ${fr?'freeze':''} ${future?'future-day':''} ${d===today()?'today':''}" data-toggle="${h.id}|${d}" ${future?'disabled':''}>${done(h,d)?'✓':fr?'🛡':future?'·':''}</button></td>`}).join('')}</tr></tbody></table></div><div class="quick-actions"><button class="btn" data-rename-habit>Rename</button><button class="btn" data-delete-habit>Delete</button></div><div class="note" style="margin-top:9px">🛡 Monthly freeze: ${freezeAvailable()?'available':'used this month'}. Future dates stay locked.</div></div></div>`}

function profileLogin(){return `<div class="login-shell"><div class="login-card"><div class="brand-mark">🚀</div><div class="kicker" style="margin-top:10px">LOCAL PROFILE</div>${data.pinHash?`<h1>Welcome back${data.name?', '+escapeHtml(data.name):''} 👋</h1><p>Enter your local PIN to unlock this device profile.</p><div class="stack"><input id="loginPin" type="password" inputmode="numeric" maxlength="6" placeholder="4–6 digit PIN"><button class="btn primary block" data-login>Unlock 🔓</button><button class="btn block" data-forgot-pin>Reset local profile</button></div>`:`<h1>Create your profile</h1><p>This profile is stored locally on this device. It is not a cloud account.</p><div class="stack"><input id="profileName" placeholder="Your name" value="${escapeHtml(data.name||'')}"><button class="btn primary block" data-create-profile>Continue 🚀</button></div>`}<div class="security-note" style="margin-top:12px">Local profile only. Storage and backups are not encrypted.</div></div></div>`}

function resetProfile(){if(!confirm('Reset the local profile and erase all progress?'))return;if(!confirm('Final confirmation: permanently erase this device profile?'))return;try{localStorage.removeItem(KEY)}catch(e){}data=defaults();sessionUnlocked=true;tab='home';morePanel='';selectedHabit=null;focusMode=false;quickOpen=false;save();render();showToast('Profile reset')}
function lockNow(){if(!data.pinHash){tab='more';morePanel='security';render();showToast('Create a PIN first');return}sessionUnlocked=false;render()}

function downloadBackup(){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='progress-tracker-v14-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function csvBackup(){const rows=[['Date','Habit','Status','Current streak']];allDates().forEach(d=>data.habits.forEach(h=>rows.push([d,h.name,done(h,d)?'Done':frozen(h,d)?'Freeze':'Open',habitStats(h).run])));const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='progress-tracker-v14-report.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function restoreFile(input){const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const restored=normalize(JSON.parse(r.result));data=restored;sessionUnlocked=!data.pinHash;selectedHabit=null;morePanel='';tab='today';focusMode=false;quickOpen=false;save();render();showToast(data.pinHash?'Backup restored. PIN lock is active 🔒':'Backup restored ✅')}catch(e){alert('Could not restore that backup file.')}};r.readAsText(f)}

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
function finishOnboarding(){const name=$('#onName')?.value.trim()||'';if(!name){alert('Please enter your name.');return}const chosen=[];$$('[data-onpreset]').forEach(b=>{const cb=$('input',b);if(cb?.checked){const p=preset(b.dataset.onpreset);chosen.push({name:b.dataset.onpreset,icon:p?.icon||'✅',private:!!p?.private,difficulty:p?.difficulty||'Medium',action:p?.action||'Do the smallest useful version'})}});customSetup.forEach(n=>chosen.push({name:n,icon:'✅',private:false,difficulty:'Medium',action:'Do the smallest useful version'}));if(!chosen.length){alert('Select at least one habit.');return}data.name=name;if(!data.creatorName)data.creatorName=name;data.habits=chosen.slice(0,15).map(x=>Object.assign({id:uid(),created:today(),time:'',smallWin:x.action,why:''},x));data.onboardingDone=true;data.profileCreated=true;data.journeyStart=today();data.lastLogin=today();save();render();showToast('Your V17 system is ready 🚀')}

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
 if(b.dataset.install!==undefined){v16Install();return}
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
 data.habits.forEach(h=>{const r=data.reminders[h.id];if(r?.enabled&&r.time===hm&&r.lastSent!==today()){r.lastSent=today();save();if('Notification' in window&&Notification.permission==='granted')new Notification('Winter Arc Tracker',{body:`${h.icon} ${h.name}: ${h.action||'Your planned action is ready.'}`});showToast(`⏰ ${h.name} — time for your action`)}});
}
setInterval(reminderTick,30000);

try{if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').then(r=>r.update()).catch(()=>{})}catch(e){}

/* ========================= V12 COMPACT UI ========================= */

function finishOnboarding(){const name=$('#onName')?.value.trim()||'';if(!name){alert('Please enter your name.');return}const chosen=[];$$('[data-onpreset]').forEach(b=>{const cb=$('input',b);if(cb?.checked){const p=preset(b.dataset.onpreset);chosen.push({name:b.dataset.onpreset,icon:p?.icon||'✅',private:!!p?.private,difficulty:p?.difficulty||'Medium',action:p?.action||'Do the smallest useful version'})}});customSetup.forEach(n=>chosen.push({name:n,icon:'✅',private:false,difficulty:'Medium',action:'Do the smallest useful version'}));if(!chosen.length){alert('Select at least one habit.');return}data.name=name;if(!data.creatorName)data.creatorName=name;data.habits=chosen.slice(0,15).map(x=>Object.assign({id:uid(),created:today(),time:'',smallWin:x.action,why:''},x));data.onboardingDone=true;data.profileCreated=true;data.journeyStart=today();data.lastLogin=today();save();tab='today';morePanel='';selectedHabit=null;focusMode=false;quickOpen=false;render();showToast('Your V17 system is ready 🚀')}


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
    <div class="v12-drawer-brand"><div class="kicker">PROGRESS TRACKER V14</div><h2>Simple. Personal. Yours.</h2><p>Everything is here, but only when you need it.</p></div>
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
    <div class="v12-brand"><strong>Winter Arc</strong> <span>Tracker</span></div>
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

function newHabitModal(){
  return `<div class="overlay new-habit-overlay" data-close-new-habit>
    <div class="modal new-habit-modal">
      <div class="section"><div><div class="kicker">NEW HABIT</div><h2 style="margin:3px 0 0">Add a habit</h2></div><button class="btn small" data-close-new-habit>Close</button></div>
      <p class="muted smalltext" style="margin-top:6px">Create it here — no browser popup. Your habit will appear immediately.</p>
      <div class="form" style="margin-top:10px">
        <div class="field"><label>Habit name</label><input id="newHabitName" maxlength="40" placeholder="e.g. Wake early" autocomplete="off"></div>
        <div class="form new-habit-two"><div class="field"><label>Icon</label><input id="newHabitIcon" value="✅" maxlength="3"></div><div class="field"><label>Difficulty</label><select id="newHabitDifficulty"><option>Easy</option><option selected>Medium</option><option>Hard</option></select></div></div>
        <div class="field"><label>Smallest useful action</label><input id="newHabitAction" value="Do the smallest useful version" maxlength="80"></div>
        <label class="plan-item" style="margin-top:4px"><input id="newHabitPrivate" type="checkbox"><span>🔒 Private habit</span></label>
      </div>
      <div class="note" style="margin-top:10px">💡 Keep the first version easy enough to repeat tomorrow.</div>
      <button class="btn primary block" data-save-new-habit style="margin-top:10px;padding:12px">Add habit ✅</button>
    </div>
  </div>`;
}

function openNewHabit(){newHabitOpen=true;quickOpen=false;render();setTimeout(()=>$('#newHabitName')?.focus(),0);}
function saveNewHabit(){
  const name=$('#newHabitName')?.value.trim()||'';
  if(!name){alert('Enter a habit name.');return}
  const icon=$('#newHabitIcon')?.value.trim()||'✅';
  const difficulty=$('#newHabitDifficulty')?.value||'Medium';
  const action=$('#newHabitAction')?.value.trim()||'Do the smallest useful version';
  const isPrivate=!!$('#newHabitPrivate')?.checked;
  if(addHabit(name,icon,isPrivate,difficulty,action)){newHabitOpen=false;tab='more';morePanel='manage';save();render();showToast(`${name} added ✅`);}
}

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


/* ========================= V13 JOURNEY + UX UPGRADE ========================= */
function v13ArcLength(){return Math.max(14,Math.min(3650,Number(data.arcLength)||122));}
function v13ArcDay(){return Math.min(v13ArcLength(),journeyDay());}
function v13ArcProgress(){return Math.min(100,Math.round(v13ArcDay()/v13ArcLength()*100));}
function v13ArcEnd(){return addDays(journeyStart(),v13ArcLength()-1);}
function v13ArcRemaining(){return Math.max(0,v13ArcLength()-v13ArcDay());}
function v13RecentDays(n=14){return allDates().slice(-n);}
function v13TotalWins(){return data.habits.reduce((n,h)=>n+habitStats(h).total,0);}
function v13BestHabit(){
  if(!data.habits.length)return null;
  return data.habits.slice().sort((a,b)=>{
    const aw=habitStats(a),bw=habitStats(b);
    if(bw.total!==aw.total)return bw.total-aw.total;
    return bw.run-aw.run;
  })[0];
}
function v13RebuildHabit(){
  if(!data.habits.length)return null;
  const ds=v13RecentDays(14);
  return data.habits.slice().filter(h=>habitStats(h).total>0).sort((a,b)=>{
    const rate=(h)=>{
      let e=0,n=0;
      ds.forEach(d=>{if(canUseHabitOn(h,d)){e++;if(active(h,d))n++;}});
      return e?n/e:1;
    };
    const ar=rate(a),br=rate(b);
    if(ar!==br)return ar-br;
    return habitStats(a).run-habitStats(b).run;
  })[0]||focusHabit();
}
function v13WeekScore(ds){
  let eligible=0,activeN=0;
  ds.forEach(d=>data.habits.forEach(h=>{if(canUseHabitOn(h,d)){eligible++;if(active(h,d))activeN++;}}));
  return eligible?Math.round(activeN/eligible*100):0;
}
function v13BestWeek(){
  const ds=allDates();
  let best=null;
  for(let i=0;i<ds.length;i+=7){
    const part=ds.slice(i,i+7);
    if(!part.length)continue;
    const score=v13WeekScore(part);
    if(!best||score>best.score)best={score,start:part[0],end:part[part.length-1]};
  }
  return best;
}
function v13Recovery(){
  const ds=allDates();
  const start=Math.max(0,ds.length-9);
  let found=null;
  for(const h of data.habits){
    for(let i=ds.length-2;i>=start;i--){
      const miss=ds[i];
      if(!canUseHabitOn(h,miss)||active(h,miss))continue;
      const next=ds.slice(i+1).find(d=>canUseHabitOn(h,d)&&active(h,d));
      if(next){
        found={h,miss,next};
        break;
      }
    }
    if(found)break;
  }
  return found;
}
function v13MonthWinSummary(){
  const ds=makeDays(data.month).filter(d=>d<=today());
  return ds.reduce((n,d)=>n+data.habits.filter(h=>done(h,d)).length,0);
}
function v13ArcMilestones(){
  const L=v13ArcLength();
  return [...new Set([1,7,14,21,30,45,60,90,100,L].filter(n=>n<=L||n===L))].sort((a,b)=>a-b);
}
function v13ArcMap(){
  const day=v13ArcDay(),L=v13ArcLength();
  const ms=v13ArcMilestones();
  return `<div class="v13-arc-map">
    <div class="v13-arc-track"><i style="width:${v13ArcProgress()}%"></i></div>
    <div class="v13-arc-points">
      ${ms.map(m=>{
        const on=day>=m,here=Math.abs(day-m)<1;
        const left=L===1?0:Math.max(0,Math.min(100,(m-1)/(L-1)*100));
        const showLabel=m===1||m===L||m===day||m===nextMilestone(day);
        return `<div class="v13-arc-point ${on?'on':''} ${here?'here':''} ${showLabel?'show-label':'hide-label'}" style="left:${left}%"><span>${on?'✓':'○'}</span><small>${showLabel?'Day '+m:''}</small></div>`;
      }).join('')}
    </div>
    <div class="v13-arc-map-labels"><span>START · ${formatDay(journeyStart())}</span><span>${day>=L?'FINISH':'YOU ARE HERE'} · Day ${day}</span><span>END · ${formatDay(v13ArcEnd())}</span></div>
  </div>`;
}
function v13StoryCard(icon,title,main,sub){
  return `<div class="v13-story-card"><div class="v13-story-icon">${icon}</div><div><span>${escapeHtml(title)}</span><b>${escapeHtml(main)}</b><small>${escapeHtml(sub)}</small></div></div>`;
}
function v12ArcPage(){
  const day=v13ArcDay(),L=v13ArcLength(),pct=v13ArcProgress(),s=stats(),goal=data.goal||'Choose a personal goal';
  const best=v13BestHabit(),rebuild=v13RebuildHabit(),bw=v13BestWeek(),rec=v13Recovery();
  const consistency=Math.min(100,Math.round(v13TotalWins()/Math.max(1,data.habits.reduce((n,h)=>n+allDates().filter(d=>canUseHabitOn(h,d)).length,0))*100));
  const goalP=Math.min(data.target,goalProgress());
  const goalPct=Math.min(100,Math.round(goalP/Math.max(1,data.target)*100));
  return `<div class="v13-page">
    <section class="v13-arc-hero-new">
      <div class="v13-arc-hero-top">
        <div>
          <div class="v12-arc-kicker">❄️ WINTER ARC</div>
          <div class="v13-arc-kicker-line">${formatDay(journeyStart())} → ${formatDay(v13ArcEnd())}</div>
          <div class="v13-arc-title">Day ${day} <span>/ ${L}</span></div>
          <p>${escapeHtml(dayMessage(day))}</p>
        </div>
        <div class="v13-arc-percent"><b>${pct}%</b><span>ARC</span></div>
      </div>
      <div class="v13-arc-progress-big"><i style="width:${Math.max(2,pct)}%"></i></div>
      <div class="v13-arc-meta-new"><span>${v13ArcRemaining()?`${v13ArcRemaining()} days left`:'Arc complete 🎉'}</span><span>${v13TotalWins()} total wins</span></div>
    </section>

    <section class="v13-simple-card">
      <div class="v13-section-head"><div><div class="kicker">ARC JOURNEY</div><h2>See where you are.</h2></div><span class="badge">Day ${day}</span></div>
      ${v13ArcMap()}
    </section>

    <section class="v13-simple-card">
      <div class="v13-section-head"><div><div class="kicker">MILESTONES</div><h2>Your next checkpoints.</h2></div><span class="muted smalltext">Keep the next one visible</span></div>
      <div class="v13-milestone-grid">
        ${v13ArcMilestones().map(m=>{
          const on=day>=m,next=m>day&&m===nextMilestone(day);
          return `<div class="v13-milestone-card ${on?'on':''} ${next?'next':''}"><div><b>Day ${m}</b><span>${on?'✓ Unlocked':next?'Next':'Locked'}</span></div><strong>${on?'✓':next?'→':'🔒'}</strong></div>`;
        }).join('')}
      </div>
    </section>

    <section class="v13-simple-card">
      <div class="v13-section-head"><div><div class="kicker">ARC SNAPSHOT</div><h2>Only what matters.</h2></div></div>
      <div class="v13-snapshot-grid">
        <div><b>${day}</b><span>Arc days</span></div>
        <div><b>${consistency}%</b><span>Consistency</span></div>
        <div><b>${Math.max(0,...data.habits.map(h=>habitStats(h).longest))}</b><span>Best streak</span></div>
        <div><b>${v13TotalWins()}</b><span>Total wins</span></div>
      </div>
    </section>

    <section class="v13-simple-card">
      <div class="v13-section-head"><div><div class="kicker">YOUR ARC STORY</div><h2>What your data says.</h2></div></div>
      <div class="v13-story-grid">
        ${best?v13StoryCard('🔥','Strongest habit',best.name,`${habitStats(best).total} wins · ${habitStats(best).run} day streak`):v13StoryCard('🌱','Strongest habit','Not enough data','Complete a habit to build your story.')}
        ${bw?v13StoryCard('📈','Best week',`${bw.score}% completion`,`${formatDay(bw.start)} → ${formatDay(bw.end)}`):v13StoryCard('📈','Best week','Not enough data','Your first week will appear here.')}
        ${rebuild?v13StoryCard('🌱','Habit to rebuild',rebuild.name,`${habitStats(rebuild).run} day streak · keep the next action small`):v13StoryCard('🌱','Habit to rebuild','You are ready','Pick one habit to work on next.')}
        ${rec?v13StoryCard('🛟','Recent recovery',`${rec.h.name} restarted`,`Missed ${formatDay(rec.miss)} → showed up ${formatDay(rec.next)}`):v13StoryCard('🛟','Recent recovery','No recovery yet','That is okay — start with the next small win.')}
      </div>
    </section>

    <section class="v13-focus-arc">
      <div class="v13-focus-arc-head"><div><div class="kicker">FOCUS OF THE ARC</div><h2>${escapeHtml(goal)}</h2></div><button class="btn small" data-more="goals">Edit</button></div>
      <div class="v13-focus-arc-row">
        ${focusHabit()?`<div class="v13-focus-arc-icon">${escapeHtml(focusHabit().icon)}</div><div class="v13-focus-arc-copy"><b>${escapeHtml(focusHabit().name)}</b><span>${escapeHtml(focusHabit().smallWin||focusHabit().action||'Smallest useful version')}</span></div><button class="v13-focus-arc-btn" data-toggle="${focusHabit().id}|${today()}">${done(focusHabit(),today())?'✓':'→'}</button>`:`<div class="v13-empty">Add a habit to focus your Arc.</div>`}
      </div>
      <div class="v13-goal-line"><b>${goalP}/${data.target}</b><div><i style="width:${goalPct}%"></i></div><span>${goalPct}%</span></div>
    </section>

    ${rec?`<section class="v13-recovery-card"><div class="v13-recovery-icon">🛟</div><div><b>Recovery counts.</b><p>You missed ${formatDay(rec.miss)} and showed up again on ${formatDay(rec.next)}. Your Arc kept moving.</p></div></section>`:''}

    <section class="v13-month-mini">
      <div><div><div class="kicker">THIS MONTH</div><h2>${escapeHtml(formatMonthName(data.month))}</h2></div><b>${v13MonthWinSummary()} wins</b></div>
      <div class="v13-month-track"><i style="width:${Math.min(100,Math.round(v13MonthWinSummary()/Math.max(1,data.habits.length*makeDays(data.month).filter(d=>d<=today()).length)*100))}%"></i></div>
      <small>Future days stay locked. The Arc counts only days that exist so far.</small>
    </section>
  </div>`;
}

function v12TodayPage(){
  const s=stats(),f=focusHabit(),day=journeyDay(),pct=v12ProgressPercent();
  return `<div class="v13-page">
    <section class="v13-today-hero">
      <div class="v13-today-hero-copy">
        <div class="kicker">TODAY · DAY ${day}</div>
        <h1>${data.name?`Hey, ${escapeHtml(data.name)} 👋`:'Your next win starts here'}</h1>
        <p>${s.todayDone===data.habits.length&&data.habits.length?'Everything scheduled is done.':'You have '+s.todayDone+' of '+data.habits.length+' habits complete.'}</p>
      </div>
      <div class="v13-today-progress"><b>${pct}%</b><span>today</span></div>
    </section>
    ${f?`<section class="v13-next-card"><div class="v13-next-kicker">🎯 NEXT UP</div><div class="v13-next-row"><div class="v13-next-icon">${escapeHtml(f.icon)}</div><div class="v13-next-copy"><h2>${escapeHtml(f.name)}</h2><p>${escapeHtml(f.smallWin||f.action||'Do the smallest useful version')}</p><small>${escapeHtml(recovery(f))}</small></div><button class="v13-next-btn ${done(f,today())?'done':''}" data-toggle="${f.id}|${today()}">${done(f,today())?'✓':'→'}</button></div><button class="v13-smallwin" data-action="smallwin" data-habit-id="${f.id}">🌱 Do the small win</button></section>`:''}
    ${v12CoachCard()}
    <div class="v13-section-head"><div><div class="kicker">TODAY</div><h2>Your habits</h2></div><span class="badge">${s.todayDone}/${data.habits.length}</span></div>
    <div class="v12-list">${data.habits.length?data.habits.map(h=>v12HabitCard(h,'today')).join(''):`<div class="v13-empty-card"><div>🌱</div><b>Your first win starts here.</b><span>Add one habit and complete it today.</span><button class="btn primary" data-more="manage">＋ Add a habit</button></div>`}</div>
    ${s.todayDone===data.habits.length&&data.habits.length?`<section class="v13-complete-card"><b>✅ Day complete</b><span>Nice. You can stop here or prepare tomorrow's easiest first action.</span></section>`:''}
  </div>`;
}

function v12HabitCard(h,mode='today'){
  const hs=habitStats(h),days=v12MiniDays(),d=today(),isDone=done(h,d),tone=v12Tone(h);
  const lastWin=hs.total?formatDay(allDates().slice().reverse().find(x=>done(h,x))||d):'Not yet';
  return `<article class="v13-habit tone-${tone} ${isDone?'completed':''}">
    <div class="v13-habit-top">
      <div class="v12-icon">${escapeHtml(h.icon||'✅')}</div>
      <div class="v12-habit-main"><div class="v13-habit-name">${escapeHtml(h.name)} ${h.private?'<span class="v12-private">🔒</span>':''}</div><div class="v13-habit-meta"><b>🔥 ${hs.run} day${hs.run===1?'':'s'}</b><span>Best ${hs.longest}</span><span>${hs.total} wins</span></div></div>
      <button class="v12-edit" data-open-habit="${h.id}" aria-label="Edit ${escapeHtml(h.name)}">✎</button>
      <button class="v13-main-check ${isDone?'is-done':''}" data-toggle="${h.id}|${d}" aria-label="${isDone?'Undo':'Complete'} ${escapeHtml(h.name)}">${isDone?'✓':'○'}</button>
    </div>
    <div class="v13-action-line">${escapeHtml(h.smallWin||h.action||'Smallest useful version')}</div>
    <div class="v12-week">${days.map(x=>{const future=x>d,state=done(h,x)?'done':frozen(h,x)?'freeze':future?'future':'open';return `<div class="v12-day-cell"><span>${v12DayLabel(x)}</span><button class="v12-dot ${state} ${x===d?'is-today':''}" data-toggle="${h.id}|${x}" ${future?'disabled':''} aria-label="${v12StatusLabel(h,x)} ${formatDay(x)}">${done(h,x)?'✓':frozen(h,x)?'🛡':future?'':''}</button></div>`}).join('')}</div>
    <div class="v13-card-footer"><span>Last win · ${lastWin}</span><button class="v13-text-btn" data-open-habit="${h.id}">Details</button></div>
  </article>`;
}

function v13Drawer(){
  return `<div class="v12-drawer-backdrop" data-close-drawer></div><aside class="v12-drawer">
    <div class="v12-drawer-brand"><div class="kicker">PROGRESS TRACKER V14</div><h2>Simple outside. Powerful inside.</h2><p>Daily actions stay easy. Deeper tools stay here until you need them.</p></div>
    <button class="v12-drawer-item ${tab==='today'?'active':''}" data-tab="today">🏠 <span>Today</span></button>
    <button class="v12-drawer-item ${tab==='week'?'active':''}" data-tab="week">📅 <span>Week</span></button>
    <button class="v12-drawer-item ${tab==='month'?'active':''}" data-tab="month">🗓️ <span>Month</span></button>
    <button class="v12-drawer-item ${tab==='arc'?'active':''}" data-tab="arc">❄️ <span>Arc journey</span></button>
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
    <div class="v12-drawer-bottom"><span>Made for small wins.</span><b>❄️ V13</b></div>
  </aside>`;
}

function v12Topbar(){
  const labels={today:'Today',week:'Week',month:'Month',arc:'Arc'};
  return `<header class="v12-topbar">
    <button class="v12-menu-btn" data-open-drawer aria-label="Open menu">☰</button>
    <div class="v12-brand"><strong>Progress Tracker</strong> <span>V13</span></div>
    <div class="v12-top-actions"><button class="v12-round-btn" data-dark title="Theme">${data.dark?'☀️':'◔'}</button><button class="v12-round-btn frost" data-tab="arc" title="Arc">❄️</button></div>
  </header>
  <nav class="v12-tabs">${Object.entries(labels).map(([n,l])=>`<button data-tab="${n}" class="${tab===n?'active':''}">${l}</button>`).join('')}</nav>`;
}

function settingsHtml(){
  return `<section class="card"><div class="section"><h2>⚙️ Settings</h2><button class="btn small" data-close-more>Close</button></div>
    <div class="form">
      <div class="field"><label>Arc length (days)</label><input id="arcLength" type="number" min="14" max="3650" value="${v13ArcLength()}"></div>
      <div class="field"><label>Journey starts</label><input value="${escapeHtml(formatDay(journeyStart()))}" disabled></div>
      <div class="field"><label>Arc ends</label><input value="${escapeHtml(formatDay(v13ArcEnd()))}" disabled></div>
    </div>
    <button class="btn primary" data-save-arc style="margin-top:10px">Save Arc settings ❄️</button>
    <div class="quick-actions"><button class="btn" data-dark>${data.dark?'☀️ Light mode':'🌙 Dark mode'}</button><button class="btn" data-backup>💾 JSON backup</button><button class="btn" data-csv>📊 CSV</button><button class="btn" data-restore>📥 Restore</button><button class="btn" data-install>📱 Install app</button><input id="restoreFile" type="file" accept=".json" hidden></div>
    <div class="note" style="margin-top:10px">V13 keeps core tracking offline-first. Backup before clearing browser storage or changing devices.</div>
    <div class="danger-note" style="margin-top:10px">Reset profile permanently erases this device’s local progress.</div><button class="btn" data-reset style="margin-top:9px">Reset local profile</button>
  </section>`;
}

/* V13 freeze rule: undoing a used freeze does NOT restore the monthly allowance. */
function toggleFreeze(h,d){
  if(!canEdit(d)){showToast('Future dates cannot be frozen.');return;}
  const k=key(h,d);
  if(done(h,d)){showToast('Undo the completion first.');return;}
  if(frozen(h,d)){delete data.freezes[k];save();showToast('Freeze removed 🛡️');render();return;}
  if(d!==today()&&d!==addDays(today(),-1)){showToast('Freeze is only available for today or yesterday.');return;}
  if(!freezeAvailable()){showToast('This month’s freeze is already used 🛡️');return;}
  data.freezes[k]=true;data.freezeUsed[freezeMonthKey()]=true;save();showToast('Monthly freeze used 🛡️');render();
}

/* V13 Arc settings + drawer actions */
document.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b)return;
  if(b.dataset.saveArc!==undefined){
    const n=Math.max(14,Math.min(3650,Number($('#arcLength')?.value||122)));
    data.arcLength=n;save();render();showToast(`Arc set to ${n} days ❄️`);return;
  }
});

/* V13 small-win is explicit: make the task easier, then complete once. */
document.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b||b.dataset.action!=='smallwin')return;
  const h=data.habits.find(x=>x.id===b.dataset.habitId); if(!h)return;
  if(done(h,today())){showToast('Small win already completed ✅');return;}
  toggleHabit(h,today());
});

/* V13 versioned app shell uses the new default tab. */
function v12Shell(){
  const body=tab==='today'?v12TodayPage():tab==='week'?v12WeekPage():tab==='month'?v12MonthPage():tab==='more'?morePage():v12ArcPage();
  const s=stats();
  return `<div class="v12-app">${v12Topbar()}<div class="v12-global-line"><span>${data.name?`Hi, ${escapeHtml(data.name)} 👋`:'Your progress'}</span><span>${s.todayDone}/${data.habits.length} today · Day ${journeyDay()}</span></div><main class="v12-main">${body}</main><button class="v12-fab" data-fab aria-label="Add">${quickOpen?'×':'+'}</button>${quickOpen?`<div class="v12-fab-menu"><button data-quick="habit">✅ Add habit</button><button data-quick="goals">🎯 Goal</button><button data-quick="routine">🔁 Routine</button></div>`:''}${selectedHabit?habitOverlay():''}${!data.onboardingDone&&!data.pinHash?onboarding():''}${window.__v11QuickModal?quickModal():''}</div>`;
}


/* ========================= V14 PATCH ========================= */
function v13ArcStart(){return /^\d{4}-\d{2}-\d{2}$/.test(data.arcStart)?data.arcStart:WINTER_ARC_START;}
function v13ArcLength(){return v13ArcStart()===WINTER_ARC_START?WINTER_ARC_LENGTH:Math.max(14,Math.min(3650,Number(data.arcLength)||WINTER_ARC_LENGTH));}
function v13ArcEnd(){return v13ArcStart()===WINTER_ARC_START?WINTER_ARC_END:addDays(v13ArcStart(),v13ArcLength()-1);}
function v13ArcStarted(){return today()>=v13ArcStart();}
function v13ArcDay(){if(!v13ArcStarted())return 0;return Math.min(v13ArcLength(),dateDiff(v13ArcStart(),today())+1);}
function v13ArcProgress(){const d=v13ArcDay(),L=v13ArcLength();return d?Math.min(100,Math.round(d/L*100)):0;}
function v13ArcRemaining(){const d=v13ArcDay(),L=v13ArcLength();return d?Math.max(0,L-d):L;}
function v13ArcDates(){const start=v13ArcStart(),end=v13ArcEnd();if(today()<start)return [];const stop=today()>end?end:today();const n=dateDiff(start,stop)+1;return Array.from({length:Math.max(0,n)},(_,i)=>addDays(start,i));}
function v13ArcMessage(){const d=v13ArcDay();return d===0?'Arc starts tomorrow. Aaj setup complete karo — kal Day 1 se start. ❄️':dayMessage(d);}
function v13RecentDays(n=14){return v13ArcDates().slice(-n);}
function v13ArcEligiblePairs(){let eligible=0,activeN=0;for(const d of v13ArcDates())for(const h of data.habits)if(canUseHabitOn(h,d)){eligible++;if(active(h,d))activeN++;}return {eligible,activeN};}
function v13ArcWins(){const ds=v13ArcDates();return data.habits.reduce((n,h)=>n+ds.filter(d=>canUseHabitOn(h,d)&&done(h,d)).length,0);}
function v13TotalWins(){return v13ArcWins();}
function v13BestHabit(){if(!data.habits.length)return null;const ds=v13ArcDates();return data.habits.slice().sort((a,b)=>{const aw=ds.filter(d=>canUseHabitOn(a,d)&&done(a,d)).length,bw=ds.filter(d=>canUseHabitOn(b,d)&&done(b,d)).length;if(bw!==aw)return bw-aw;return habitStats(b).run-habitStats(a).run;})[0]||null;}
function v13RebuildHabit(){const ds=v13RecentDays(14);if(!data.habits.length||!ds.length)return null;return data.habits.slice().filter(h=>habitStats(h).total>0).sort((a,b)=>{const rate=h=>{let e=0,n=0;for(const d of ds)if(canUseHabitOn(h,d)){e++;if(active(h,d))n++;}return e?n/e:1;};const ar=rate(a),br=rate(b);if(ar!==br)return ar-br;return habitStats(a).run-habitStats(b).run;})[0]||null;}
function v13WeekScore(ds){let eligible=0,activeN=0;for(const d of ds)for(const h of data.habits)if(canUseHabitOn(h,d)){eligible++;if(active(h,d))activeN++;}return eligible?Math.round(activeN/eligible*100):0;}
function v13BestWeek(){const ds=v13ArcDates();let best=null;for(let i=0;i<ds.length;i+=7){const part=ds.slice(i,i+7);if(!part.length)continue;const score=v13WeekScore(part);if(!best||score>best.score)best={score,start:part[0],end:part[part.length-1]};}return best;}
function v13Recovery(){const ds=v13ArcDates(),start=Math.max(0,ds.length-9);for(const h of data.habits)for(let i=ds.length-2;i>=start;i--){const miss=ds[i];if(!canUseHabitOn(h,miss)||active(h,miss))continue;const next=ds.slice(i+1).find(d=>canUseHabitOn(h,d)&&active(h,d));if(next)return {h,miss,next};}return null;}
function v13MonthWinSummary(){const m=today().slice(0,7),start=v13ArcStart(),end=v13ArcEnd(),ds=makeDays(m).filter(d=>d<=today()&&d>=start&&d<=end);return ds.reduce((n,d)=>n+data.habits.filter(h=>canUseHabitOn(h,d)&&done(h,d)).length,0);}
function v13ArcMilestones(){const L=v13ArcLength();return [...new Set([1,7,14,21,30,45,60,90,L].filter(n=>n<=L))].sort((a,b)=>a-b);}
function v13ArcMap(){const day=v13ArcDay(),L=v13ArcLength(),ms=v13ArcMilestones();return `<div class="v13-arc-map"><div class="v13-arc-track"><i style="width:${v13ArcProgress()}%"></i></div><div class="v13-arc-points">${ms.map(m=>{const on=day>=m,here=day===m||(!day&&m===1),left=L===1?0:(m-1)/(L-1)*100,showLabel=m===1||m===L||m===day||m===nextMilestone(Math.max(day,1));return `<div class="v13-arc-point ${on?'on':''} ${here?'here':''} ${showLabel?'show-label':'hide-label'}" style="left:${Math.max(0,Math.min(100,left))}%"><span>${on?'✓':'○'}</span><small>${showLabel?'Day '+m:''}</small></div>`;}).join('')}</div><div class="v13-arc-map-labels"><span>START · ${formatDay(v13ArcStart())}</span><span>${day?`DAY ${day}`:'STARTS TOMORROW'}</span><span>END · ${formatDay(v13ArcEnd())}</span></div></div>`;}
function communityNumber(n){n=Number(n)||0;return n? (n>=1000?Math.floor(n/1000)+'k+':n.toLocaleString()):'—';}
let communityState={count:null,status:'Loading…',ok:false};
function communityEndpoint(){return `https://counterapi.com/api/${encodeURIComponent(COMMUNITY_NS)}/view/${encodeURIComponent('hustlers-'+today())}?unique=true`;}
async function communityCheckin(force=false){const d=today();if(!force&&data.communityCheckinDate===d&&Number(data.communityCount)>0){communityState={count:Number(data.communityCount),status:'You’re counted today ✓',ok:true};return;}try{communityState={count:Number(data.communityCount)||null,status:'Updating…',ok:false};const r=await fetch(communityEndpoint(),{cache:'no-store'});if(!r.ok)throw new Error('counter unavailable');const j=await r.json(),n=Math.max(0,Number(j.value)||0);data.communityCount=n;data.communityCheckinDate=d;save();communityState={count:n,status:'You’re counted today ✓',ok:true};render();}catch(e){communityState={count:Number(data.communityCount)||null,status:'Community count unavailable right now',ok:false};render();}}
function creatorName(){return (data.creatorName||data.name||'You').trim()||'You';}
function creatorHandle(){return (data.creatorHandle||'').trim();}
function safeHttpsUrl(v){try{const u=new URL(String(v||''));return u.protocol==='https:'?u.href:'';}catch(e){return '';}}
function creatorCard(){const n=creatorName(),h=creatorHandle(),bio=data.creatorBio||'Hi, I’m Vashu Sharmaa — a Data Engineer. I built Winter Arc Tracker for people who want to turn small daily actions into real progress. Keep it simple, stay consistent, and build your own Arc.',link=safeHttpsUrl(data.creatorLink),photo=data.creatorPhoto||'creator-profile.jpg';return `<section class="v13-creator-card"><div class="v13-creator-kicker">MADE WITH ❤️ BY <u>${escapeHtml(n)}</u></div><div class="v13-creator-row"><img class="v13-creator-photo" src="${escapeHtml(photo)}" alt="Creator profile" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="v13-creator-avatar" style="display:none">${escapeHtml(n.slice(0,2).toUpperCase())}</div><div class="v13-creator-copy"><b>${escapeHtml(n)}</b><p>${escapeHtml(bio)}</p>${h?`<span>${escapeHtml(h)}</span>`:''}</div></div><div class="v14-photo-strip"><img src="creator-photo-1.jpg" alt="Vashu Sharmaa"><img src="creator-photo-2.jpg" alt="Vashu Sharmaa"><img src="creator-photo-3.jpg" alt="Vashu Sharmaa"></div>${link?`<a class="v13-creator-link" href="${escapeHtml(link)}" target="_blank" rel="noopener">Open Instagram profile ↗</a>`:''}<button class="v13-share-btn" data-share>Share this tracker ↗</button></section>`;}
function v13CommunityCard(){const n=communityState.count??data.communityCount??0;return `<section class="v13-community-card"><div class="v13-community-label">TOTAL HUSTLERS TODAY</div><b>${communityNumber(n)}</b><span>${escapeHtml(communityState.status||'Daily community check-ins')}</span><button data-community-refresh class="v13-community-refresh">↻ Refresh</button></section>`;}
function v12ArcPage(){const day=v13ArcDay(),L=v13ArcLength(),pct=v13ArcProgress(),pairs=v13ArcEligiblePairs(),goal=data.goal||'Choose a personal goal',best=v13BestHabit(),rebuild=v13RebuildHabit(),bw=v13BestWeek(),rec=v13Recovery(),consistency=pairs.eligible?Math.round(pairs.activeN/pairs.eligible*100):0,goalP=Math.min(data.target,goalProgress()),goalPct=Math.min(100,Math.round(goalP/Math.max(1,data.target)*100)),monthLabel=(today()>=v13ArcStart()&&today()<=v13ArcEnd())?formatMonthName(today().slice(0,7)):'Arc preview';return `<div class="v13-page"><section class="v13-arc-hero-new"><div class="v13-arc-hero-top"><div><div class="v12-arc-kicker">❄️ WINTER ARC 2026</div><div class="v13-arc-kicker-line">${formatDay(v13ArcStart())} → ${formatDay(v13ArcEnd())} · 92 days</div><div class="v13-arc-title">${day?`Day ${day}`:'Starts tomorrow'} <span>${day?`/ ${L}`:''}</span></div><p>${escapeHtml(v13ArcMessage())}</p></div><div class="v13-arc-percent"><b>${pct}%</b><span>ARC</span></div></div><div class="v13-arc-progress-big"><i style="width:${pct}%"></i></div><div class="v13-arc-meta-new"><span>${day?(v13ArcRemaining()?`${v13ArcRemaining()} days left`:'Arc complete 🎉'):'Starts tomorrow'}</span><span>${v13TotalWins()} arc wins</span></div></section>${v13CommunityCard()}${creatorCard()}<section class="v13-simple-card"><div class="v13-section-head"><div><div class="kicker">ARC JOURNEY</div><h2>One path · three months.</h2></div><span class="badge">${day?`Day ${day}`:'Ready'}</span></div>${v13ArcMap()}<div class="v13-month-chips"><div class="future-month ${day>=1?'active-month':''}"><b>OCT</b><span>${day>=1?'In progress':'Starts tomorrow'}</span></div><div class="future-month ${day>=32?'active-month':''}"><b>NOV</b><span>${day>=32?'In progress':'Locked'}</span></div><div class="future-month ${day>=62?'active-month':''}"><b>DEC</b><span>${day>=62?'In progress':'Locked'}</span></div></div></section><section class="v13-simple-card"><div class="v13-section-head"><div><div class="kicker">MILESTONES</div><h2>Next checkpoints.</h2></div><span class="muted smalltext">7 · 30 · 60 · 90</span></div><div class="v13-milestone-grid">${v13ArcMilestones().map(m=>{const on=day>=m,next=!on&&m>day&&m===nextMilestone(Math.max(0,day));return `<div class="v13-milestone-card ${on?'on':''} ${next?'next':''}"><div><b>Day ${m}</b><span>${on?'Unlocked':next?'Next checkpoint':'Locked'}</span></div><strong>${on?'✓':next?'→':'🔒'}</strong></div>`;}).join('')}</div></section><section class="v13-simple-card"><div class="v13-section-head"><div><div class="kicker">ARC SNAPSHOT</div><h2>Only what matters.</h2></div></div><div class="v13-snapshot-grid"><div><b>${day}</b><span>Arc days</span></div><div><b>${consistency}%</b><span>Consistency</span></div><div><b>${Math.max(0,...data.habits.map(h=>habitStats(h).longest))}</b><span>Best streak</span></div><div><b>${v13TotalWins()}</b><span>Total wins</span></div></div></section><section class="v13-simple-card"><div class="v13-section-head"><div><div class="kicker">YOUR ARC STORY</div><h2>What your data says.</h2></div></div><div class="v13-story-grid">${best?v13StoryCard('🔥','Strongest habit',best.name,`${habitStats(best).total} total wins · ${habitStats(best).run} day streak`):v13StoryCard('🔥','Strongest habit','Not enough data','Your first win will start this story.')}${bw?v13StoryCard('📈','Best week',`${bw.score}% completion`,`${formatDay(bw.start)} → ${formatDay(bw.end)}`):v13StoryCard('📈','Best week','Starts after Day 1','Your first week will appear here.')}${rebuild?v13StoryCard('🌱','Habit to rebuild',rebuild.name,`${habitStats(rebuild).run} day streak · keep the next action small`):v13StoryCard('🌱','Habit to rebuild','You are ready','Pick one habit to work on next.')}${rec?v13StoryCard('🛟','Recent recovery',`${rec.h.name} restarted`,`Missed ${formatDay(rec.miss)} → showed up ${formatDay(rec.next)}`):v13StoryCard('🛟','Recent recovery','None yet','That is okay — start with the next small win.')}</div></section><section class="v13-focus-arc"><div class="v13-focus-arc-head"><div><div class="kicker">FOCUS OF THE ARC</div><h2>${escapeHtml(goal)}</h2></div><button class="btn small" data-more="goals">Edit</button></div><div class="v13-focus-arc-row">${focusHabit()?`<div class="v13-focus-arc-icon">${escapeHtml(focusHabit().icon)}</div><div class="v13-focus-arc-copy"><b>${escapeHtml(focusHabit().name)}</b><span>${escapeHtml(focusHabit().smallWin||focusHabit().action||'Smallest useful version')}</span></div><button class="v13-focus-arc-btn" data-toggle="${focusHabit().id}|${today()}" ${today()<v13ArcStart()?'disabled':''}>${done(focusHabit(),today())?'✓':'→'}</button>`:'<div class="v13-empty">Add a habit to focus your Arc.</div>'}</div><div class="v13-goal-line"><b>${goalP}/${data.target}</b><div><i style="width:${goalPct}%"></i></div><span>${goalPct}%</span></div></section>${rec?`<section class="v13-recovery-card"><div class="v13-recovery-icon">🛟</div><div><b>Recovery counts.</b><p>You missed ${formatDay(rec.miss)} and showed up again on ${formatDay(rec.next)}. Your Arc kept moving.</p></div></section>`:''}<section class="v13-month-mini"><div><div><div class="kicker">${escapeHtml(monthLabel).toUpperCase()}</div><h2>${escapeHtml(monthLabel==='Arc preview'?'Get ready':monthLabel)}</h2></div><b>${v13MonthWinSummary()} wins</b></div><div class="v13-month-track"><i style="width:${pairs.eligible?Math.min(100,Math.round(pairs.activeN/pairs.eligible*100)):0}%"></i></div><small>${day?`Future dates stay locked · ${v13ArcRemaining()} days remain.`:'Tomorrow is Day 1 · September stays outside the Winter Arc.'}</small></section></div>`;}
function v12TodayPage(){const s=stats(),f=focusHabit(),day=v13ArcDay(),pct=v12ProgressPercent();return `<div class="v13-page"><section class="v13-today-hero"><div class="v13-today-hero-copy"><div class="kicker">${day?`WINTER ARC · DAY ${day}`:'WINTER ARC · STARTS TOMORROW'}</div><h1>${data.name?`Hey, ${escapeHtml(data.name)} 👋`:'Your next win starts here'}</h1><p>${day?s.todayDone+' of '+data.habits.length+' habits complete.':'Set up today. Tomorrow starts the Arc.'}</p></div><div class="v13-today-progress"><b>${pct}%</b><span>today</span></div></section>${v13CommunityCard()}${f?`<section class="v13-next-card"><div class="v13-next-kicker">🎯 NEXT UP</div><div class="v13-next-row"><div class="v13-next-icon">${escapeHtml(f.icon)}</div><div class="v13-next-copy"><h2>${escapeHtml(f.name)}</h2><p>${escapeHtml(f.smallWin||f.action||'Smallest useful version')}</p><small>🔥 ${habitStats(f).run} day streak</small></div><button class="v13-next-btn ${done(f,today())?'done':''}" data-toggle="${f.id}|${today()}" ${today()<v13ArcStart()?'disabled':''}>${done(f,today())?'✓':'→'}</button></div><button class="v13-smallwin" data-action="smallwin" data-habit-id="${f.id}">Make it smaller</button></section>`:''}${v12CoachCard()}<div class="v13-section-head"><div><div class="kicker">TODAY</div><h2>Your habits</h2></div><span class="badge">${s.todayDone}/${data.habits.length}</span></div><div class="v12-list">${data.habits.length?data.habits.map(h=>v12HabitCard(h,'today')).join(''):'<div class="v13-empty-card"><div>🌱</div><b>Your first win starts here.</b><span>Add one habit and complete it today.</span><button class="btn primary" data-more="manage">＋ Add a habit</button></div>'}</div>${s.todayDone===data.habits.length&&data.habits.length?`<section class="v13-complete-card"><b>✅ Day complete</b><span>Nice. You can stop here or prepare tomorrow’s easiest first action.</span></section>`:''}${creatorCard()}</div>`;}
function v12Topbar(){const labels={today:'Today',week:'Week',month:'Month',arc:'Arc'};return `<header class="v12-topbar"><button class="v12-menu-btn" data-open-drawer aria-label="Open menu">☰</button><div class="v12-brand"><strong>Winter Arc</strong> <span>Tracker</span></div><div class="v12-top-actions"><button class="v12-round-btn" data-dark title="Theme">${data.dark?'☀️':'◔'}</button><button class="v12-round-btn frost" data-tab="arc" title="Arc">❄️</button></div></header><nav class="v12-tabs">${Object.entries(labels).map(([n,l])=>`<button data-tab="${n}" class="${tab===n?'active':''}">${l}</button>`).join('')}</nav>`;}
function settingsHtml(){const c=creatorName();return `<section class="card"><div class="section"><h2>⚙️ Settings</h2><button class="btn small" data-close-more>Close</button></div><div class="form"><div class="field"><label>Winter Arc start</label><input value="1 Oct 2026" disabled></div><div class="field"><label>Winter Arc end</label><input value="31 Dec 2026" disabled></div></div><div class="note" style="margin-top:10px">❄️ Winter Arc 2026 is fixed to 1 Oct → 31 Dec. Today is setup day; tomorrow is Day 1.</div><div class="section" style="margin-top:15px"><h2>Creator promotion</h2><span class="muted smalltext">Shown in Arc + Credits</span></div><div class="form"><div class="field"><label>Your name</label><input id="creatorName" value="${escapeHtml(c)}" placeholder="Your name"></div><div class="field"><label>Instagram / handle</label><input id="creatorHandle" value="${escapeHtml(data.creatorHandle||'')}" placeholder="@yourhandle"></div><div class="field"><label>Short bio</label><textarea id="creatorBio" placeholder="What you built or why you built it">${escapeHtml(data.creatorBio||'')}</textarea></div><div class="field"><label>Profile link (https only)</label><input id="creatorLink" value="${escapeHtml(data.creatorLink||'')}" placeholder="https://instagram.com/yourhandle"></div></div><button class="btn primary" data-save-creator style="margin-top:10px">Save creator profile ❤️</button><div class="quick-actions"><button class="btn" data-dark>${data.dark?'☀️ Light mode':'🌙 Dark mode'}</button><button class="btn" data-backup>💾 JSON backup</button><button class="btn" data-csv>📊 CSV</button><button class="btn" data-restore>📥 Restore</button><button class="btn" data-install>📱 Install app</button><input id="restoreFile" type="file" accept=".json" hidden></div><div class="note" style="margin-top:10px">Core tracking stays local. The shared community count uses CounterAPI and includes this device when today’s check-in succeeds.</div><div class="danger-note" style="margin-top:10px">Reset profile permanently erases this device’s local progress.</div><button class="btn" data-reset style="margin-top:9px">Reset local profile</button></section>`;}
function creditsHtml(){return `<div class="v13-credits-page"><div class="v13-section-head"><div><div class="kicker">CREDITS</div><h2>Built by the creator</h2></div><button class="btn small" data-close-more>Close</button></div>${creatorCard()}<div class="note" style="margin-top:10px">Your creator details are saved only on this device. Add your social link in Settings to turn this into a profile promo.</div></div>`;}
function panelHtml(){return {goals:goalsHtml,routine:routineHtml,planner:plannerHtml,checkin:checkinHtml,sleep:sleepHtml,journal:journalHtml,reminders:remindersHtml,security:securityHtml,settings:settingsHtml,credits:creditsHtml}[morePanel]?.()||settingsHtml();}
function morePage(){if(morePanel==='manage')return manageHabitsHtml();if(morePanel==='credits')return creditsHtml();return `<div class="v12-tool-page"><section class="card hero"><div class="kicker">MORE TOOLS</div><h2 style="margin:4px 0 6px">Everything else, when you need it.</h2><p class="muted" style="margin:0">Goals, routines, planner, check-in, sleep, journal, reminders, privacy, creator profile and data tools.</p></section><section class="drawer-grid"><button class="more-tile v133-share-tile" data-share-progress><span>↗</span><b>Share & invite</b><small>Make a progress card or invite friends.</small></button><button class="more-tile" data-more="manage"><span>✅</span><b>Manage habits</b><small>Add, edit or remove habits.</small></button><button class="more-tile" data-more="goals"><span>🎯</span><b>Goals & review</b><small>Link goals to habits and reflect.</small></button><button class="more-tile" data-more="routine"><span>🔁</span><b>Routines</b><small>Run habits step by step.</small></button><button class="more-tile" data-more="planner"><span>🗓️</span><b>Day planner</b><small>Set preferred times.</small></button><button class="more-tile" data-more="checkin"><span>🌤️</span><b>Mood & energy</b><small>Build a simple personal history.</small></button><button class="more-tile" data-more="sleep"><span>😴</span><b>Sleep</b><small>Log hours and timing.</small></button><button class="more-tile" data-more="journal"><span>✍️</span><b>Journal</b><small>Keep one-line reflections.</small></button><button class="more-tile" data-more="reminders"><span>⏰</span><b>Reminders</b><small>Time your next action.</small></button><button class="more-tile" data-more="security"><span>🔐</span><b>Privacy</b><small>Local PIN and session lock.</small></button><button class="more-tile" data-more="settings"><span>⚙️</span><b>Settings & data</b><small>Theme, backup, install, creator profile.</small></button><button class="more-tile" data-more="credits"><span>❤️</span><b>Credits</b><small>Promote the person who built it.</small></button></section>${v13CommunityCard()}</div>`;}
function v12Drawer(){return `<div class="v12-drawer-backdrop" data-close-drawer></div><aside class="v12-drawer"><div class="v12-drawer-brand"><div class="kicker">WINTER ARC 2026</div><h2>Winter Arc Tracker</h2><p>1 Oct – 31 Dec 2026 · Your progress stays on this device.</p></div><section class="v13-drawer-community">${v13CommunityCard()}</section><button class="v12-drawer-item" data-tab="today">🏠 <span>Today</span></button><button class="v12-drawer-item" data-tab="week">📅 <span>Week</span></button><button class="v12-drawer-item" data-tab="month">🗓️ <span>Month</span></button><button class="v12-drawer-item" data-tab="arc">❄️ <span>Arc</span></button><div class="v12-drawer-line"></div><div class="v12-drawer-label">TOOLS</div><button class="v12-drawer-item" data-more="manage">✅ <span>Manage habits</span></button><button class="v12-drawer-item" data-more="goals">🎯 <span>Goals</span></button><button class="v12-drawer-item" data-more="routine">🔁 <span>Routines</span></button><button class="v12-drawer-item" data-more="planner">🗓️ <span>Day planner</span></button><button class="v12-drawer-item" data-more="checkin">🌤️ <span>Mood & energy</span></button><button class="v12-drawer-item" data-more="sleep">😴 <span>Sleep</span></button><button class="v12-drawer-item" data-more="journal">✍️ <span>Journal</span></button><button class="v12-drawer-item" data-more="reminders">⏰ <span>Reminders</span></button><button class="v12-drawer-item" data-more="security">🔐 <span>Privacy</span></button><button class="v12-drawer-item" data-more="credits">❤️ <span>Credits</span></button><button class="v12-drawer-item" data-more="settings">⚙️ <span>Settings & data</span></button><div class="v12-drawer-bottom"><span>Made for small wins.</span><b>❄️ V17.0</b></div></aside>`;}
function v12Shell(){const body=tab==='today'?v12TodayPage():tab==='week'?v12WeekPage():tab==='month'?v12MonthPage():tab==='more'?morePage():v12ArcPage(),st=stats(),arcLine=v13ArcStarted()?`Arc Day ${v13ArcDay()}`:'Arc starts tomorrow';return `<div class="v12-app">${v12Topbar()}<div class="v12-global-line"><span>${data.name?`Hi, ${escapeHtml(data.name)} 👋`:'Your progress'}</span><span>${st.todayDone}/${data.habits.length} today · ${arcLine}</span></div><main class="v12-main">${body}</main><button class="v12-fab" data-fab aria-label="Add">${quickOpen?'×':'+'}</button>${quickOpen?`<div class="v12-fab-menu"><button data-quick="habit">✅ Add habit</button><button data-quick="goals">🎯 Goal</button><button data-quick="routine">🔁 Routine</button></div>`:''}${selectedHabit?habitOverlay():''}${!data.onboardingDone&&!data.pinHash?onboarding():''}${window.__v11QuickModal?quickModal():''}${newHabitOpen?newHabitModal():''}</div>`;}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(!b)return;
  if(b.hasAttribute('data-quick') && b.dataset.quick==='habit'){
    e.preventDefault();e.stopImmediatePropagation();openNewHabit();return;
  }
  if(b.hasAttribute('data-add-custom')){
    e.preventDefault();e.stopImmediatePropagation();openNewHabit();return;
  }
  if(b.hasAttribute('data-close-new-habit')){
    e.preventDefault();e.stopImmediatePropagation();newHabitOpen=false;render();return;
  }
  if(b.hasAttribute('data-save-new-habit')){
    e.preventDefault();e.stopImmediatePropagation();saveNewHabit();return;
  }
},{capture:true});

document.addEventListener('keydown',e=>{
  if(e.key==='Enter' && e.target.id==='newHabitName'){e.preventDefault();saveNewHabit();}
},{capture:true});

document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.saveCreator!==undefined){const n=$('#creatorName')?.value.trim()||data.name||'You',h=$('#creatorHandle')?.value.trim()||'',bio=$('#creatorBio')?.value.trim()||'',link=$('#creatorLink')?.value.trim()||'';if(link&&!safeHttpsUrl(link)){alert('Profile link must start with https://');return;}data.creatorName=n;data.creatorHandle=h;data.creatorBio=bio;data.creatorLink=link;data.profileInstagram=$('#profileInstagram')?.value.trim()||data.profileInstagram||'';save();render();showToast('Creator profile saved ❤️');return;}if(b.dataset.communityRefresh!==undefined){await communityCheckin(true);return;}if(b.dataset.share!==undefined){const share={title:'Winter Arc Tracker',text:'Join me on the Winter Arc 2026 ❄️',url:location.href};try{if(navigator.share){await navigator.share(share);return;}if(navigator.clipboard){await navigator.clipboard.writeText(share.url);showToast('Tracker link copied ↗');}}catch(err){}}});

/* ========================= V14 CLEAN + SHARING ========================= */
function v133ShareUrl(){
  try{const u=new URL(location.href);const h=creatorHandle().replace(/^@/,'');if(h)u.searchParams.set('from',h);return u.href;}catch(e){return location.href;}
}
function v133ShareText(){
  const s=stats(),day=v13ArcDay(),L=v13ArcLength(),best=Math.max(0,...data.habits.map(h=>habitStats(h).longest));
  const arc=day?`Day ${day}/${L}`:'Arc starts tomorrow';
  return `I’m on Winter Arc 2026 ❄️ ${arc}\nToday: ${s.todayDone}/${data.habits.length} habits complete\n🔥 Best streak: ${best} days\n🏁 Arc wins: ${v13TotalWins()}\n\nJoin me: ${v133ShareUrl()}`;
}
function v133LoadCreatorPhoto(){
  return new Promise(resolve=>{const src=data.creatorPhoto||'creator-profile.jpg';const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src;});
}
function v133RoundRect(ctx,x,y,w,h,r){
  r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}
function v133Text(ctx,text,x,y,size,weight='700',align='left',fill='#183b31'){
  ctx.fillStyle=fill;ctx.font=`${weight} ${size}px Arial, sans-serif`;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(text,x,y);
}
async function v133MakeShareBlob(){
  const c=document.createElement('canvas');c.width=1080;c.height=1350;const ctx=c.getContext('2d');
  const s=stats(),day=v13ArcDay(),L=v13ArcLength(),pct=day?Math.min(100,Math.round(day/L*100)):0,best=Math.max(0,...data.habits.map(h=>habitStats(h).longest)),wins=v13TotalWins();
  ctx.fillStyle='#f5f3ed';ctx.fillRect(0,0,c.width,c.height);
  const g=ctx.createLinearGradient(0,0,0,650);g.addColorStop(0,'#173f47');g.addColorStop(1,'#173e2c');ctx.fillStyle=g;v133RoundRect(ctx,48,48,984,720,46);ctx.fill();
  v133Text(ctx,'❄  WINTER ARC 2026',96,132,31,'800','left','#a7dfbf');
  v133Text(ctx,day?`DAY ${day} / ${L}`:'STARTS TOMORROW',96,235,76,'900','left','#ffffff');
  v133Text(ctx,day?`${pct}% of the Arc completed`:'Setup day · get ready for Day 1',96,290,29,'700','left','#d8eee4');
  v133RoundRect(ctx,96,342,888,24,12);ctx.fillStyle='rgba(255,255,255,.16)';ctx.fill();
  v133RoundRect(ctx,96,342,Math.max(10,888*pct/100),24,12);ctx.fillStyle='#72c991';ctx.fill();
  v133Text(ctx,`${s.todayDone}/${data.habits.length} habits today`,96,476,48,'800','left','#ffffff');
  v133Text(ctx,`🔥 Best streak ${best} days`,96,535,34,'700','left','#d8eee4');
  v133Text(ctx,`🏁 ${wins} Arc wins`,96,585,34,'700','left','#d8eee4');
  const img=await v133LoadCreatorPhoto();
  if(img){ctx.save();ctx.beginPath();ctx.arc(900,665,72,0,Math.PI*2);ctx.clip();ctx.drawImage(img,828,593,144,144);ctx.restore();}
  v133RoundRect(ctx,48,808,984,340,38);ctx.fillStyle='#ffffff';ctx.fill();
  v133Text(ctx,'SMALL WINS. REAL PROGRESS.',92,880,34,'900','left','#3da35d');
  v133Text(ctx,'Keep your Arc moving.',92,940,54,'900','left','#202020');
  v133Text(ctx,'Track less. Do more. Come back tomorrow.',92,995,26,'600','left','#666666');
  v133Text(ctx,creatorName(),92,1070,30,'800','left','#202020');
  const h=creatorHandle();if(h)v133Text(ctx,h,92,1112,28,'800','left','#3da35d');
  v133Text(ctx,'Join the Winter Arc →',988,1112,24,'800','right','#777777');
  return new Promise(resolve=>c.toBlob(resolve,'image/png',.95));
}
async function v133ShareProgress(){
  try{
    const blob=await v133MakeShareBlob();if(!blob)throw new Error('image');
    const file=new File([blob],'winter-arc-progress.png',{type:'image/png'});
    const text=v133ShareText();
    if(navigator.share){
      try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({title:'Winter Arc Tracker',text,files:[file]});showToast('Progress shared ❄️');return;}}catch(e){}
      try{await navigator.share({title:'Winter Arc Tracker',text});showToast('Progress shared ↗');return;}catch(e){}
    }
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='winter-arc-progress.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
    if(navigator.clipboard)try{await navigator.clipboard.writeText(text);}catch(e){}
    showToast('Share card saved + text copied 📤');
  }catch(e){
    const text=v133ShareText();if(navigator.clipboard)try{await navigator.clipboard.writeText(text);showToast('Share text copied ↗');return;}catch(err){};
    alert(text);
  }
}
async function v133InviteFriends(){
  const text=`Join me for Winter Arc 2026 ❄️\nA simple daily habit challenge from 1 Oct to 31 Dec.\n\n${v133ShareUrl()}`;
  try{if(navigator.share){await navigator.share({title:'Join Winter Arc 2026',text});showToast('Invite ready ↗');return;}}catch(e){}
  try{await navigator.clipboard.writeText(text);showToast('Invite copied ↗');}catch(e){alert(text)}
}
function v133ShareStrip(){return `<section class="v133-share-strip"><div class="v133-share-icon">↗</div><div class="v133-share-copy"><b>Share your progress</b><span>Post a clean 4:5 card or invite a friend.</span></div><div class="v133-share-actions"><button class="btn primary" data-share-progress>Share</button><button class="btn" data-share-invite>Invite</button></div></section>`;}
function v133CreatorMini(){const h=creatorHandle(),link=safeHttpsUrl(data.creatorLink);return `<section class="v133-creator-mini"><img src="${escapeHtml(data.creatorPhoto||'creator-profile.jpg')}" alt="Creator" onerror="this.style.display='none'"/><div><span>Made by</span><b>${escapeHtml(creatorName())}</b>${h?`<small>${escapeHtml(h)}</small>`:''}</div>${link?`<a href="${escapeHtml(link)}" target="_blank" rel="noopener">Instagram ↗</a>`:''}</section>`;}
function v133CreatorCard(){const n=creatorName(),h=creatorHandle(),bio=data.creatorBio||'Creator of Winter Arc Tracker',link=safeHttpsUrl(data.creatorLink),photo=data.creatorPhoto||'creator-profile.jpg';return `<section class="v13-creator-card"><div class="v13-creator-kicker">MADE WITH ❤️ BY <u>${escapeHtml(n)}</u></div><div class="v13-creator-row"><img class="v13-creator-photo" src="${escapeHtml(photo)}" alt="Creator profile" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="v13-creator-avatar" style="display:none">${escapeHtml(n.slice(0,2).toUpperCase())}</div><div class="v13-creator-copy"><b>${escapeHtml(n)}</b><p>${escapeHtml(bio)}</p>${h?`<span>${escapeHtml(h)}</span>`:''}</div></div><div class="v14-photo-strip"><img src="creator-photo-1.jpg" alt="Vashu Sharmaa"><img src="creator-photo-2.jpg" alt="Vashu Sharmaa"><img src="creator-photo-3.jpg" alt="Vashu Sharmaa"></div><div class="v133-creator-actions">${link?`<a class="v13-creator-link" href="${escapeHtml(link)}" target="_blank" rel="noopener">Follow on Instagram ↗</a>`:''}<button class="v13-share-btn" data-share-progress>Share my Arc ↗</button></div></section>`;}
function v133Topbar(){const labels={today:'Today',week:'Week',month:'Month',arc:'Arc'};return `<header class="v12-topbar"><button class="v12-menu-btn" data-open-drawer aria-label="Open menu">☰</button><div class="v12-brand"><strong>Winter Arc</strong> <span>Tracker</span></div><div class="v12-top-actions"><button class="v12-round-btn" data-share-progress title="Share progress">↗</button><button class="v12-round-btn" data-dark title="Theme">${data.dark?'☀️':'◔'}</button><button class="v12-round-btn frost" data-tab="arc" title="Arc">❄️</button></div></header><nav class="v12-tabs">${Object.entries(labels).map(([n,l])=>`<button data-tab="${n}" class="${tab===n?'active':''}">${l}</button>`).join('')}</nav>`;}
v12Topbar=v133Topbar;
function v133TodayPage(){const d=today(),s=stats(),f=focusHabit(),day=v13ArcDay();const pct=data.habits.length?Math.round(s.todayDone/data.habits.length*100):0;return `<div class="v13-page"><section class="v13-today-hero"><div class="v13-today-hero-copy"><div class="kicker">${day?`WINTER ARC · DAY ${day}`:'WINTER ARC · STARTS TOMORROW'}</div><h1>${data.name?`Hey, ${escapeHtml(data.name)} 👋`:'Your next win starts here'}</h1><p>${day?s.todayDone+' of '+data.habits.length+' habits complete.':'Today is setup day. Tomorrow starts Day 1.'}</p></div><div class="v13-today-progress"><b>${pct}%</b><span>today</span></div></section>${v13CommunityCard()}${v133ShareStrip()}${f?`<section class="v13-next-card"><div class="v13-next-kicker">🎯 NEXT UP</div><div class="v13-next-row"><div class="v13-next-icon">${escapeHtml(f.icon)}</div><div class="v13-next-copy"><h2>${escapeHtml(f.name)}</h2><p>${escapeHtml(f.smallWin||f.action||'Smallest useful version')}</p><small>🔥 ${habitStats(f).run} day streak</small></div><button class="v13-next-btn ${done(f,today())?'done':''}" data-toggle="${f.id}|${today()}" ${today()<v13ArcStart()?'disabled':''}>${done(f,today())?'✓':'→'}</button></div><button class="v13-smallwin" data-action="smallwin" data-habit-id="${f.id}">Make it smaller</button></section>`:''}<div class="v13-section-head"><div><div class="kicker">TODAY</div><h2>Your habits</h2></div><span class="badge">${s.todayDone}/${data.habits.length}</span></div><div class="v12-list">${data.habits.length?data.habits.map(h=>v12HabitCard(h,'today')).join(''):'<div class="v13-empty-card"><div>🌱</div><b>Your first win starts here.</b><span>Add one habit and complete it today.</span><button class="btn primary" data-more="manage">＋ Add a habit</button></div>'}</div>${s.todayDone===data.habits.length&&data.habits.length?`<section class="v13-complete-card"><b>✅ Day complete</b><span>Nice. Share your win or prepare tomorrow's easiest first action.</span><button class="btn primary" data-share-progress style="margin-top:9px">Share today's win ↗</button></section>`:''}${v133CreatorMini()}</div>`;}
v12TodayPage=v133TodayPage;
function v133ArcPage(){const day=v13ArcDay(),L=v13ArcLength(),pct=v13ArcProgress(),pairs=v13ArcEligiblePairs(),best=v13BestHabit(),bw=v13BestWeek(),rebuild=v13RebuildHabit(),rec=v13Recovery(),consistency=pairs.eligible?Math.round(pairs.activeN/pairs.eligible*100):0,goal=data.goal||'Choose a personal goal',goalP=Math.min(data.target,goalProgress()),goalPct=Math.min(100,Math.round(goalP/Math.max(1,data.target)*100));return `<div class="v13-page"><section class="v13-arc-hero-new"><div class="v13-arc-hero-top"><div><div class="v12-arc-kicker">❄️ WINTER ARC 2026</div><div class="v13-arc-kicker-line">1 Oct → 31 Dec · ${L} days</div><div class="v13-arc-title">${day?`Day ${day}`:'Starts tomorrow'} <span>${day?`/ ${L}`:''}</span></div><p>${escapeHtml(v13ArcMessage())}</p></div><div class="v13-arc-percent"><b>${pct}%</b><span>ARC</span></div></div><div class="v13-arc-progress-big"><i style="width:${pct}%"></i></div><div class="v13-arc-meta-new"><span>${day?(v13ArcRemaining()?`${v13ArcRemaining()} days left`:'Arc complete 🎉'):'1 Oct = Day 1'}</span><span>${v13TotalWins()} arc wins</span></div></section>${v13CommunityCard()}${v133ShareStrip()}<section class="v13-simple-card"><div class="v13-section-head"><div><div class="kicker">ARC JOURNEY</div><h2>One path · three months.</h2></div><span class="badge">${day?`Day ${day}`:'Ready'}</span></div>${v13ArcMap()}<div class="v13-month-chips"><div class="future-month active-month"><b>OCT</b><span>${day?'In progress':'Starts tomorrow'}</span></div><div class="future-month ${day>=32?'active-month':''}"><b>NOV</b><span>${day>=32?'In progress':'Locked'}</span></div><div class="future-month ${day>=62?'active-month':''}"><b>DEC</b><span>${day>=62?'In progress':'Locked'}</span></div></div></section><section class="v13-simple-card"><div class="v13-section-head"><div><div class="kicker">NEXT MILESTONE</div><h2>Keep the next checkpoint visible.</h2></div></div><div class="v133-next-milestone"><b>Day ${day?nextMilestone(day):1}</b><span>${day?'Keep stacking small wins.':'Your first checkpoint starts tomorrow.'}</span><strong>→</strong></div></section><section class="v13-simple-card"><div class="v13-section-head"><div><div class="kicker">ARC SNAPSHOT</div><h2>Only what matters.</h2></div></div><div class="v13-snapshot-grid"><div><b>${day}</b><span>Arc days</span></div><div><b>${consistency}%</b><span>Consistency</span></div><div><b>${Math.max(0,...data.habits.map(h=>habitStats(h).longest))}</b><span>Best streak</span></div><div><b>${v13TotalWins()}</b><span>Total wins</span></div></div></section><section class="v13-simple-card"><div class="v13-section-head"><div><div class="kicker">YOUR ARC STORY</div><h2>What your data says.</h2></div></div><div class="v13-story-grid">${best?v13StoryCard('🔥','Strongest habit',best.name,`${habitStats(best).total} total wins · ${habitStats(best).run} day streak`):v13StoryCard('🔥','Strongest habit','Not enough data','Your first win will start this story.')}${bw?v13StoryCard('📈','Best week',`${bw.score}% completion`,`${formatDay(bw.start)} → ${formatDay(bw.end)}`):v13StoryCard('📈','Best week','Starts after Day 1','Your first week will appear here.')}${rebuild?v13StoryCard('🌱','Habit to rebuild',rebuild.name,`${habitStats(rebuild).run} day streak · keep the next action small`):v13StoryCard('🌱','Habit to rebuild','You are ready','Pick one habit to work on next.')}${rec?v13StoryCard('🛟','Recent recovery',`${rec.h.name} restarted`,`Missed ${formatDay(rec.miss)} → showed up ${formatDay(rec.next)}`):v13StoryCard('🛟','Recent recovery','None yet','That is okay — start with the next small win.')}</div></section><section class="v13-focus-arc"><div class="v13-focus-arc-head"><div><div class="kicker">FOCUS OF THE ARC</div><h2>${escapeHtml(goal)}</h2></div><button class="btn small" data-more="goals">Edit</button></div><div class="v13-focus-arc-row">${focusHabit()?`<div class="v13-focus-arc-icon">${escapeHtml(focusHabit().icon)}</div><div class="v13-focus-arc-copy"><b>${escapeHtml(focusHabit().name)}</b><span>${escapeHtml(focusHabit().smallWin||focusHabit().action||'Smallest useful version')}</span></div><button class="v13-focus-arc-btn" data-toggle="${focusHabit().id}|${today()}" ${today()<v13ArcStart()?'disabled':''}>${done(focusHabit(),today())?'✓':'→'}</button>`:'<div class="v13-empty">Add a habit to focus your Arc.</div>'}</div><div class="v13-goal-line"><b>${goalP}/${data.target}</b><div><i style="width:${goalPct}%"></i></div><span>${goalPct}%</span></div></section>${rec?`<section class="v13-recovery-card"><div class="v13-recovery-icon">🛟</div><div><b>Recovery counts.</b><p>You missed ${formatDay(rec.miss)} and showed up again on ${formatDay(rec.next)}. Your Arc kept moving.</p></div></section>`:''}${v133CreatorMini()}</div>`;}
v12ArcPage=v133ArcPage;

/* Sharing controls are intentionally optional and non-blocking. */
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.shareProgress!==undefined){e.preventDefault();await v133ShareProgress();return;}if(b.dataset.shareInvite!==undefined){e.preventDefault();await v133InviteFriends();return;}if(b.dataset.openDrawer!==undefined){return;}});

/* ========================= V14 UX + SHARE PATCH ========================= */
window.__v14ShareCenter = false;

function v14CommunityMini(){
  const n=communityState.count??data.communityCount??0;
  return `<section class="v14-community-mini">
    <div><span>TOTAL HUSTLERS TODAY</span><b>${communityNumber(n)}</b></div>
    <div class="v14-community-right"><small>${escapeHtml(communityState.status||'Daily community check-ins')}</small><button data-community-refresh aria-label="Refresh community count">↻</button></div>
  </section>`;
}

function v14InviteBanner(){
  return data.invitedBy?`<section class="v14-invite-banner"><span>🤝</span><div><b>Invited by @${escapeHtml(data.invitedBy)}</b><small>Start your own Arc and build your first small win.</small></div></section>`:'';
}

function v14FocusCard(){
  const f=focusHabit();
  if(!f)return `<section class="v14-card v14-empty-focus"><div><span class="v14-kicker">TODAY'S FOCUS</span><b>Add one habit to choose a focus.</b></div><button class="v14-pill-btn" data-more="manage">＋ Add habit</button></section>`;
  const is=done(f,today());
  return `<section class="v14-card v14-focus-card">
    <div class="v14-focus-head"><div><span class="v14-kicker">TODAY'S FOCUS</span><h2>${escapeHtml(f.name)}</h2><p>${escapeHtml(f.smallWin||f.action||'Smallest useful version')}</p></div><div class="v14-focus-icon">${escapeHtml(f.icon)}</div></div>
    <div class="v14-focus-actions"><span>🔥 ${habitStats(f).run} day streak</span><button class="v14-round-check ${is?'done':''}" data-toggle="${f.id}|${today()}" ${today()<v13ArcStart()?'disabled':''}>${is?'✓':'→'}</button></div>
  </section>`;
}

function v14HabitRow(h){
  const d=today(), hs=habitStats(h), is=done(h,d), fr=frozen(h,d);
  return `<article class="v14-habit-row ${is?'completed':''}">
    <div class="v14-habit-icon">${escapeHtml(h.icon||'✅')}</div>
    <div class="v14-habit-body"><div class="v14-habit-title"><b>${escapeHtml(h.name)}</b>${h.private?'<span class="v14-private">🔒</span>':''}</div><div class="v14-habit-sub">🔥 ${hs.run} day streak · ${escapeHtml(h.action||'Smallest useful version')}</div></div>
    <button class="v14-main-check ${is?'done':''} ${fr?'freeze':''}" data-toggle="${h.id}|${d}" ${d<v13ArcStart()?'disabled':''} aria-label="${is?'Undo':'Complete'} ${escapeHtml(h.name)}">${is?'✓':'○'}</button>
    <button class="v14-edit" data-open-habit="${h.id}" aria-label="Edit ${escapeHtml(h.name)}">✎</button>
  </article>`;
}

function v14WeekHabit(h){
  const ds=v12MiniDays(), hs=habitStats(h);
  return `<article class="v14-week-habit">
    <div class="v14-week-head"><div class="v14-habit-icon">${escapeHtml(h.icon||'✅')}</div><div class="v14-habit-body"><b>${escapeHtml(h.name)}</b><span>🔥 ${hs.run} days · ${hs.weekPct}%</span></div><button class="v14-main-check ${done(h,today())?'done':''}" data-toggle="${h.id}|${today()}" ${today()<v13ArcStart()?'disabled':''}>${done(h,today())?'✓':'○'}</button></div>
    <div class="v14-dot-row">${ds.map(d=>`<div class="v14-day-dot-wrap"><small>${v12DayLabel(d)}</small><button class="v14-day-dot ${done(h,d)?'done':''} ${frozen(h,d)?'freeze':''} ${d===today()?'today':''}" data-toggle="${h.id}|${d}" ${d>today()?'disabled':''}>${done(h,d)?'✓':frozen(h,d)?'🛡':''}</button></div>`).join('')}</div>
  </article>`;
}

function v14MonthGrid(h){
  const ds=makeDays(data.month), first=dateObj(ds[0]).getDay(), cells=[];
  for(let i=0;i<first;i++)cells.push(''); ds.forEach(d=>cells.push(d));
  return `<div class="v14-calendar"><div class="v14-cal-week">${['S','M','T','W','T','F','S'].map(x=>`<span>${x}</span>`).join('')}</div><div class="v14-cal-grid">${cells.map(d=>d?(()=>{const future=d>today();return `<button class="v14-cal-cell ${done(h,d)?'done':''} ${frozen(h,d)?'freeze':''} ${d===today()?'today':''}" data-toggle="${h.id}|${d}" ${future?'disabled':''} title="${formatDay(d)}">${done(h,d)?'✓':frozen(h,d)?'🛡':d.slice(-2)}</button>`;})():'<i></i>').join('')}</div></div>`;
}

function v14TodayPage(){
  const s=stats(), day=v13ArcDay(), pct=data.habits.length?Math.round(s.todayDone/data.habits.length*100):0, remaining=Math.max(0,data.habits.length-s.todayDone);
  return `<div class="v14-page">
    ${v14InviteBanner()}
    <section class="v14-hero">
      <div><span class="v14-kicker">${day?`WINTER ARC · DAY ${day}`:'WINTER ARC · STARTS TOMORROW'}</span><h1>${data.name?`Hi, ${escapeHtml(data.name)} 👋`:'Your next win starts here'}</h1><p>${day?(remaining?`${s.todayDone}/${data.habits.length} habits done · ${remaining} left today.`:'All habits complete. You are done for today. 🔥'):'Today is setup day. Tomorrow is Day 1.'}</p></div>
      <div class="v14-progress-ring" style="--p:${pct}%"><span><b>${pct}%</b><small>today</small></span></div>
    </section>
    ${v14CommunityMini()}
    <section class="v14-share-bar"><div><b>Share the win</b><span>Generate a clean 4:5 progress card.</span></div><button class="v14-pill-btn primary" data-share-progress>Share ↗</button></section>
    ${v14FocusCard()}
    <section class="v14-section"><div class="v14-section-head"><div><span class="v14-kicker">TODAY</span><h2>Your habits</h2></div><span class="v14-counter">${s.todayDone}/${data.habits.length}</span></div>
      <div class="v14-habits-list">${data.habits.length?data.habits.map(v14HabitRow).join(''):`<div class="v14-empty-card"><div>🌱</div><b>Your first habit is waiting.</b><span>Add one habit and make your first win.</span><button class="v14-pill-btn primary" data-more="manage">＋ Add habit</button></div>`}</div>
    </section>
    ${s.todayDone===data.habits.length&&data.habits.length?`<section class="v14-complete"><span>✅</span><div><b>Today complete</b><small>Nice. Share the win or just enjoy the finish.</small></div><button class="v14-pill-btn" data-share-progress>Share ↗</button></section>`:''}
    ${v14CreatorMini()}
  </div>`;
}

function v14WeekPage(){
  const s=stats(), ds=v12MiniDays();
  return `<div class="v14-page">
    <section class="v14-simple-hero"><div><span class="v14-kicker">THIS WEEK</span><h1>${s.score}% complete</h1><p>Seven days, one small action at a time.</p></div><div class="v14-mini-score"><b>${s.todayDone}</b><span>today</span></div></section>
    <section class="v14-week-board">${ds.map(d=>{const eligible=data.habits.filter(h=>canUseHabitOn(h,d)).length,n=data.habits.filter(h=>active(h,d)).length,p=eligible?Math.round(n/eligible*100):0;return `<div class="v14-week-day ${d===today()?'today':''}"><small>${v12DayLabel(d)}</small><div class="v14-week-circle" style="--p:${p}%"><b>${p}</b></div><span>${n}/${eligible}</span></div>`}).join('')}</section>
    <section class="v14-section"><div class="v14-section-head"><div><span class="v14-kicker">HABITS</span><h2>Your week</h2></div><button class="v14-pill-btn" data-share-progress>Share ↗</button></div><div class="v14-stack">${data.habits.map(v14WeekHabit).join('')||'<div class="v14-empty-card"><b>Add a habit to see your week.</b></div>'}</div></section>
    <section class="v14-card v14-insight"><span>💡</span><div><b>Weekly insight</b><p>${v13BestWeek()?`Your best week so far reached ${v13BestWeek().score}%. Keep the next action easy.`:'Your first full week will create a useful baseline here.'}</p></div></section>
  </div>`;
}

function v14MonthPage(){
  const s=stats();
  return `<div class="v14-page">
    <section class="v14-simple-hero"><div><span class="v14-kicker">MONTH</span><h1>${formatMonthName(data.month)}</h1><p>${s.completed} completed checks · future days stay locked.</p></div><div class="v14-mini-score"><b>${v13MonthWinSummary()}</b><span>wins</span></div></section>
    <section class="v14-month-picker"><button class="v14-pill-btn" data-month-shift="-1">‹</button><input id="monthPicker" type="month" value="${escapeHtml(data.month)}" aria-label="Month"><button class="v14-pill-btn" data-month-shift="1">›</button></section>
    <section class="v14-stack">${data.habits.map(h=>`<article class="v14-month-card"><div class="v14-week-head"><div class="v14-habit-icon">${escapeHtml(h.icon||'✅')}</div><div class="v14-habit-body"><b>${escapeHtml(h.name)}</b><span>🔥 ${habitStats(h).run} day streak · ${habitStats(h).monthPct}%</span></div><button class="v14-edit" data-open-habit="${h.id}">✎</button></div>${v14MonthGrid(h)}</article>`).join('')||'<div class="v14-empty-card"><b>Add a habit first.</b></div>'}</section>
  </div>`;
}

function v14Milestones(){
  const day=v13ArcDay(),L=v13ArcLength(),raw=[1,7,14,30,45,60,75,90,L],ms=[...new Set(raw.filter(n=>n>=1&&n<=L))];
  return `<div class="v14-milestones">${ms.map(m=>`<div class="v14-milestone ${day>=m?'on':''}"><div>${day>=m?'✓':'○'}</div><b>Day ${m}</b><span>${m===1?'Start':m===7?'First week':m===30?'One month':m===60?'Two months':m===90?'Three months':m===L?'Finish':'Checkpoint'}</span></div>`).join('')}</div>`;
}

function v14ArcPage(){
  const day=v13ArcDay(),L=v13ArcLength(),pct=v13ArcProgress(),pairs=v13ArcEligiblePairs(),best=v13BestHabit(),bw=v13BestWeek(),rebuild=v13RebuildHabit(),rec=v13Recovery(),consistency=pairs.eligible?Math.round(pairs.activeN/pairs.eligible*100):0;
  const next=day?nextMilestone(day):1;
  return `<div class="v14-page">
    <section class="v14-arc-hero"><div class="v14-arc-top"><div><span class="v14-kicker">❄️ WINTER ARC 2026</span><h1>${day?`Day ${day}`:'Starts tomorrow'} <em>${day?`/ ${L}`:''}</em></h1><p>${escapeHtml(v13ArcMessage())}</p></div><div class="v14-arc-percent"><b>${pct}%</b><span>ARC</span></div></div><div class="v14-arc-line"><i style="width:${pct}%"></i></div><div class="v14-arc-meta"><span>${day?v13ArcRemaining()?`${v13ArcRemaining()} days left`:'Arc complete 🎉':'1 Oct = Day 1'}</span><span>${v13TotalWins()} Arc wins</span></div></section>
    ${v14CommunityMini()}
    <section class="v14-share-bar"><div><b>Make your progress shareable</b><span>4:5 card + creator handle + invite link.</span></div><button class="v14-pill-btn primary" data-open-share-center>Share ↗</button></section>
    <section class="v14-section"><div class="v14-section-head"><div><span class="v14-kicker">ARC JOURNEY</span><h2>One path · three months.</h2></div><span class="v14-counter">${day?`Day ${day}`:'Ready'}</span></div>${v13ArcMap()}${v14Milestones()}<div class="v14-month-strip"><div class="active"><b>OCT</b><span>${day?'In progress':'Starts tomorrow'}</span></div><div class="${day>=32?'active':''}"><b>NOV</b><span>${day>=32?'In progress':'Locked'}</span></div><div class="${day>=62?'active':''}"><b>DEC</b><span>${day>=62?'In progress':'Locked'}</span></div></div></section>
    <section class="v14-section"><div class="v14-section-head"><div><span class="v14-kicker">NEXT CHECKPOINT</span><h2>Day ${next}</h2></div><span class="v14-counter">${day?Math.max(0,next-day):1} days</span></div><div class="v14-next-row"><span>Keep the next checkpoint visible, not the whole mountain.</span><button class="v14-round-arrow" data-tab="today">→</button></div></section>
    <section class="v14-section"><div class="v14-section-head"><div><span class="v14-kicker">ARC SNAPSHOT</span><h2>Only what matters.</h2></div></div><div class="v14-snapshot"><div><b>${day}</b><span>Arc days</span></div><div><b>${consistency}%</b><span>Consistency</span></div><div><b>${Math.max(0,...data.habits.map(h=>habitStats(h).longest))}</b><span>Best streak</span></div><div><b>${v13TotalWins()}</b><span>Total wins</span></div></div></section>
    <section class="v14-section"><div class="v14-section-head"><div><span class="v14-kicker">YOUR ARC STORY</span><h2>What your data says.</h2></div></div><div class="v14-story-grid">${best?v14Story('🔥','Strongest habit',best.name,`${habitStats(best).total} wins · ${habitStats(best).run} day streak`):v14Story('🔥','Strongest habit','Waiting for data','Your first completed habit starts the story.')}${bw?v14Story('📈','Best week',`${bw.score}% completion`,`${formatDay(bw.start)} → ${formatDay(bw.end)}`):v14Story('📈','Best week','Coming soon','Your first week will appear here.')}${rebuild?v14Story('🌱','Habit to rebuild',rebuild.name,`${habitStats(rebuild).run} day streak · simplify the next action`):v14Story('🌱','Habit to rebuild','You are ready','Pick one habit to work on next.')}${rec?v14Story('🛟','Recent recovery',`${rec.h.name} restarted`,`Missed ${formatDay(rec.miss)} → showed up ${formatDay(rec.next)}`):v14Story('🛟','Recent recovery','None yet','That is okay — recovery can become part of the story.')}</div></section>
    <section class="v14-card v14-focus-arc"><div class="v14-focus-arc-top"><div><span class="v14-kicker">FOCUS OF THE ARC</span><h2>${escapeHtml(data.goal||'Choose one personal goal')}</h2></div><button class="v14-pill-btn" data-more="goals">Edit</button></div>${focusHabit()?`<div class="v14-focus-line"><span>${escapeHtml(focusHabit().icon)}</span><div><b>${escapeHtml(focusHabit().name)}</b><small>${escapeHtml(focusHabit().smallWin||focusHabit().action||'Smallest useful version')}</small></div><button class="v14-round-arrow" data-toggle="${focusHabit().id}|${today()}" ${today()<v13ArcStart()?'disabled':''}>${done(focusHabit(),today())?'✓':'→'}</button></div>`:'<div class="v14-empty">Add a habit to focus your Arc.</div>'}</section>
    ${rec?`<section class="v14-recovery"><span>🛟</span><div><b>Recovery counts.</b><small>You missed ${formatDay(rec.miss)} and showed up again ${formatDay(rec.next)}.</small></div></section>`:''}
    ${v14CreatorMini()}
  </div>`;
}

function v14Story(icon,title,main,sub){return `<div class="v14-story"><div class="v14-story-icon">${icon}</div><div><span>${escapeHtml(title)}</span><b>${escapeHtml(main)}</b><small>${escapeHtml(sub)}</small></div></div>`;}

function v14CreatorMini(){
  const h=creatorHandle(),link=safeHttpsUrl(data.creatorLink),photo=data.creatorPhoto||'creator-profile.jpg';
  return `<section class="v14-creator-mini"><img src="${escapeHtml(photo)}" alt="${escapeHtml(creatorName())}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="v14-creator-fallback">${escapeHtml(creatorName().slice(0,2).toUpperCase())}</div><div><span>Made with ❤️ by</span><b>${escapeHtml(creatorName())}</b>${h?`<small>${escapeHtml(h)}</small>`:''}</div>${link?`<a href="${escapeHtml(link)}" target="_blank" rel="noopener">Instagram ↗</a>`:''}</section>`;
}

function v14CreatorCard(){
  const n=creatorName(),h=creatorHandle(),link=safeHttpsUrl(data.creatorLink),photo='creator-profile.jpg';
  const bio=data.creatorBio||'Hi, I’m Vashu Sharmaa — a Data Engineer. I built Winter Arc Tracker for people who want to turn small daily actions into real progress. Keep it simple, stay consistent, and build your own Arc.';
  return `<section class="v14-creator-card"><div class="v14-section-head"><div><span class="v14-creator-kicker">CREDITS</span><h2 style="margin:3px 0 0;font-size:18px">Meet the creator</h2></div><button class="v14-pill-btn" data-close-more>Back</button></div><div class="v14-creator-profile"><img class="v14-creator-portrait" src="${photo}" alt="${escapeHtml(n)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="v14-creator-avatar v14-creator-portrait-fallback">${escapeHtml(n.slice(0,2).toUpperCase())}</div><div class="v14-creator-profile-copy"><h2>Hi, I’m ${escapeHtml(n)} 👋</h2><p>${escapeHtml(bio)}</p>${h?`<b class="v14-handle">${escapeHtml(h)}</b>`:''}</div></div><div class="v14-photo-strip"><img src="creator-photo-1.jpg" alt="${escapeHtml(n)}"><img src="creator-photo-2.jpg" alt="${escapeHtml(n)}"><img src="creator-photo-3.jpg" alt="${escapeHtml(n)}"></div><div class="v14-creator-actions">${link?`<a class="v14-creator-link" href="${escapeHtml(link)}" target="_blank" rel="noopener">Visit Instagram ↗</a>`:''}<button class="v14-pill-btn primary" data-open-share-center>Share Tracker ↗</button></div><div class="v14-creator-note">Built by a Data Engineer who wanted a simpler way to track progress — one day at a time. ❄️</div></section>`;
}

function v14ShareModal(){
  const s=stats(),day=v13ArcDay(),L=v13ArcLength(),best=Math.max(0,...data.habits.map(h=>habitStats(h).longest));
  return `<div class="v14-share-overlay" data-close-share-center><div class="v14-share-modal" role="dialog" aria-modal="true"><div class="v14-share-head"><div><span class="v14-kicker">SHARE CENTER</span><h2>Make your progress visible.</h2></div><button class="v14-close" data-close-share-center>×</button></div><div class="v14-share-preview"><div class="v14-share-preview-top">❄️ WINTER ARC 2026</div><strong>${day?`DAY ${day} / ${L}`:'STARTS TOMORROW'}</strong><span>${s.todayDone}/${data.habits.length} habits today · 🔥 ${best} day best streak</span><b>${creatorName()}</b><small>${creatorHandle()}</small></div><div class="v14-share-buttons"><button class="v14-pill-btn primary" data-share-progress>Share 4:5 card ↗</button><button class="v14-pill-btn" data-download-card>Save image ↓</button><button class="v14-pill-btn" data-share-invite>Invite a friend 🤝</button><button class="v14-pill-btn primary" data-open-compare>Compare with a friend ⚔️</button><button class="v14-pill-btn" data-open-instagram>Instagram ↗</button></div><p class="v14-share-note">The card includes your Arc day, wins, best streak and creator handle.</p></div></div>`;
}

function v14MorePage(){
  if(morePanel==='manage')return manageHabitsHtml();
  if(morePanel==='credits')return v14CreatorCard();
  if(morePanel)return `<div class="v14-page"><div class="v14-section-head"><div><span class="v14-kicker">MORE</span><h2>${escapeHtml(morePanel[0].toUpperCase()+morePanel.slice(1))}</h2></div><button class="v14-pill-btn" data-close-more>← More</button></div>${panelHtml()}</div>`;
  return `<div class="v14-page"><section class="v14-simple-hero"><div><span class="v14-kicker">MORE</span><h1>Tools without the clutter.</h1><p>Everything advanced lives here, so Today stays simple.</p></div></section><section class="v14-more-grid"><button class="v14-more-tile feature" data-open-share-center><span>↗</span><b>Share & invite</b><small>4:5 progress card, invite link and creator promo.</small></button><button class="v14-more-tile" data-open-compare><span>⚔️</span><b>Compare with a friend</b><small>Share a snapshot and compare Arc progress.</small></button><button class="v14-more-tile" data-open-cloud><span>☁️</span><b>Community sync</b><small>Optional creator dashboard sharing.</small></button><button class="v14-more-tile" data-more="manage"><span>✅</span><b>Manage habits</b><small>Add, edit, private labels.</small></button><button class="v14-more-tile" data-more="goals"><span>🎯</span><b>Goals</b><small>Link habits to one goal.</small></button><button class="v14-more-tile" data-more="routine"><span>🔁</span><b>Routines</b><small>Build a step-by-step sequence.</small></button><button class="v14-more-tile" data-more="planner"><span>🗓️</span><b>Day planner</b><small>Set preferred times.</small></button><button class="v14-more-tile" data-more="checkin"><span>🌤️</span><b>Mood & energy</b><small>Quick daily check-in.</small></button><button class="v14-more-tile" data-more="sleep"><span>😴</span><b>Sleep</b><small>Keep a simple sleep log.</small></button><button class="v14-more-tile" data-more="journal"><span>✍️</span><b>Journal</b><small>One-line reflection.</small></button><button class="v14-more-tile" data-more="reminders"><span>⏰</span><b>Reminders</b><small>Time your next action.</small></button><button class="v14-more-tile" data-more="security"><span>🔐</span><b>Privacy</b><small>Local PIN & session lock.</small></button><button class="v14-more-tile" data-more="settings"><span>⚙️</span><b>Settings</b><small>Creator, data, theme and install.</small></button><button class="v14-more-tile" data-more="credits"><span>❤️</span><b>Credits</b><small>Meet the creator.</small></button></section>${v14CommunityMini()}${v14CreatorMini()}</div>`;
}

function v14SettingsHtml(){
  return `<section class="v14-card"><div class="v14-section-head"><div><span class="v14-kicker">SETTINGS</span><h2>Personalize your app</h2></div><button class="v14-pill-btn" data-close-more>Close</button></div><div class="v14-settings-form"><label>Winter Arc start<input value="1 Oct 2026" disabled></label><label>Winter Arc end<input value="31 Dec 2026" disabled></label><label>Creator name<input id="creatorName" value="${escapeHtml(creatorName())}"></label><label>Instagram handle<input id="creatorHandle" value="${escapeHtml(data.creatorHandle||'')}"></label><label>Your Instagram (optional)<input id="profileInstagram" value="${escapeHtml(data.profileInstagram||'')}" placeholder="@yourhandle"></label><label class="full">Short intro<textarea id="creatorBio" rows="3">${escapeHtml(data.creatorBio||'')}</textarea></label><label class="full">Instagram link (https)<input id="creatorLink" value="${escapeHtml(data.creatorLink||'')}"></label></div><button class="v14-pill-btn primary" data-save-creator>Save creator profile ❤️</button><div class="v14-settings-actions"><button class="v14-pill-btn" data-dark>${data.dark?'☀️ Light':'🌙 Dark'}</button><button class="v14-pill-btn" data-backup>💾 Backup</button><button class="v14-pill-btn" data-restore>📥 Restore</button><button class="v14-pill-btn" data-csv>📊 CSV</button><button class="v14-pill-btn" data-install>📱 Install</button><input id="restoreFile" type="file" accept=".json" hidden></div><div class="note">Core progress stays local on this device. The community counter needs internet access.</div>${cloudSettingsHtml()}</section>`;
}


function v14Drawer(){
  return `<div class="v14-drawer-backdrop" data-close-drawer></div><aside class="v14-drawer"><div class="v14-drawer-head"><div><span class="v14-kicker">WINTER ARC 2026</span><h2>Winter Arc Tracker</h2><p>1 Oct → 31 Dec · Progress stays on this device.</p></div><button class="v14-close" data-close-drawer>×</button></div>${v14CommunityMini()}<div class="v14-drawer-links"><button data-tab="today">🏠 <span>Today</span></button><button data-tab="week">📅 <span>Week</span></button><button data-tab="month">🗓️ <span>Month</span></button><button data-tab="arc">❄️ <span>Arc</span></button><button data-tab="download">📱 <span>Get App</span></button><button data-open-share-center>↗ <span>Share & invite</span></button><div class="v14-drawer-label">TOOLS</div><button data-more="manage">✅ <span>Manage habits</span></button><button data-more="goals">🎯 <span>Goals</span></button><button data-more="routine">🔁 <span>Routines</span></button><button data-more="planner">🗓️ <span>Day planner</span></button><button data-more="checkin">🌤️ <span>Mood & energy</span></button><button data-more="sleep">😴 <span>Sleep</span></button><button data-more="journal">✍️ <span>Journal</span></button><button data-more="reminders">⏰ <span>Reminders</span></button><button data-more="security">🔐 <span>Privacy</span></button><button data-more="settings">⚙️ <span>Settings</span></button><button data-more="credits">❤️ <span>Credits</span></button></div><div class="v14-drawer-foot"><span>Made for small wins.</span><b>V14.2</b></div></aside>`;
}


/* ========================= V14.1 CLOUD + FRIEND COMPARE ========================= */
const CLOUD_CFG=window.WINTER_ARC_CLOUD||{url:'',anonKey:''};
function cloudReady(){return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(CLOUD_CFG.url||'')&&String(CLOUD_CFG.anonKey||'').length>20;}
function cloudHeaders(token){return {'apikey':CLOUD_CFG.anonKey,'Authorization':'Bearer '+(token||CLOUD_CFG.anonKey),'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'};}
function cloudSnapshot(){const s=stats(),day=v13ArcDay(),L=v13ArcLength(),best=Math.max(0,...data.habits.map(h=>habitStats(h).longest));return {display_name:data.name||'Anonymous Hustler',instagram_handle:data.profileInstagram||'',arc_day:day,total_arc_days:L,arc_progress:v13ArcProgress(),today_completed:s.todayDone,total_habits:data.habits.length,total_wins:v13TotalWins(),best_streak:best,last_seen:new Date().toISOString(),public_profile:!!data.publicProfile};}
async function cloudSync(){
 if(!data.cloudOptIn){showToast('Turn on community sync first');return;}
 if(!cloudReady()){data.cloudStatus='Backend not configured';save();render();showToast('Add Supabase config first');return;}
 try{
   data.cloudStatus='Syncing…';render();
   const id=data.cloudUserId||crypto.randomUUID();data.cloudUserId=id;
   const snap=cloudSnapshot();snap.id=id;
   const r=await fetch(CLOUD_CFG.url+'/rest/v1/arc_users',{method:'POST',headers:cloudHeaders(),body:JSON.stringify(snap)});
   if(!r.ok)throw new Error('sync '+r.status);
   data.cloudLastSync=new Date().toISOString();data.cloudStatus='Synced ✓';save();render();showToast('Progress synced ☁️');
 }catch(e){data.cloudStatus='Sync failed — local data is safe';save();render();showToast('Cloud sync failed');}
}
function compareSnapshot(){const s=stats(),day=v13ArcDay(),L=v13ArcLength(),best=Math.max(0,...data.habits.map(h=>habitStats(h).longest));return {name:data.name||'You',day:day||0,totalDays:L,progress:v13ArcProgress(),today:s.todayDone,total:data.habits.length,wins:v13TotalWins(),best};}
function encodeCompare(obj){try{return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}catch(e){return ''}}
function decodeCompare(x){try{return JSON.parse(decodeURIComponent(escape(atob(x.replace(/-/g,'+').replace(/_/g,'/')))))}catch(e){return null}}
function compareUrl(){try{const u=new URL(location.href);u.hash='';u.searchParams.set('compare',encodeCompare(compareSnapshot()));return u.href}catch(e){return location.href}}
function compareFromHash(){try{const h=location.hash||'';if(h.startsWith('#compare='))return decodeCompare(h.slice(9));const q=new URLSearchParams(location.search).get('compare');return q?decodeCompare(q):null}catch(e){return null}}
function compareCard(their){const me=compareSnapshot();if(!their)return '<div class="v14-compare-empty">No comparison data found. Ask your friend to use <b>Compare with a friend</b>.</div>';return `<div class="v14-compare-grid"><div class="v14-compare-person"><span>YOU</span><b>${escapeHtml(me.name)}</b><strong>${me.progress}%</strong><small>Arc progress · ${me.wins} wins · 🔥 ${me.best} best streak</small></div><div class="v14-compare-vs">VS</div><div class="v14-compare-person friend"><span>FRIEND</span><b>${escapeHtml(their.name||'Friend')}</b><strong>${Number(their.progress)||0}%</strong><small>Arc progress · ${Number(their.wins)||0} wins · 🔥 ${Number(their.best)||0} best streak</small></div></div><div class="v14-compare-note">This comparison uses the shared snapshot from your friend. It does not change either person’s local tracker data.</div>`}
function v14CompareModal(){const their=compareFromHash()||decodeCompare(data.compareSnapshot||'');return `<div class="v14-share-overlay" data-close-compare><div class="v14-share-modal"><div class="v14-share-head"><div><span class="v14-kicker">FRIEND COMPARE</span><h2>Your Arc vs your friend.</h2></div><button class="v14-close" data-close-compare>×</button></div>${compareCard(their)}<div class="v14-share-buttons"><button class="v14-pill-btn primary" data-share-compare>Share my compare link ↗</button><button class="v14-pill-btn" data-open-share-center>Back to Share Center</button></div></div></div>`}
function openCompare(){window.__v14ShareCenter=false;window.__v14Compare=true;render()}
function v14CloudModal(){return `<div class="v14-share-overlay" data-close-cloud><div class="v14-share-modal">${cloudSettingsHtml()}<button class="v14-pill-btn" data-close-cloud>Close</button></div></div>`}
async function shareCompare(){const u=compareUrl(),text=`Compare our Winter Arc progress ❄️\n${data.name||'Me'} is on Day ${v13ArcDay()||0}/${v13ArcLength()} with ${v13TotalWins()} wins.\n\nOpen this link to compare: ${u}`;try{if(navigator.share){await navigator.share({title:'Winter Arc Friend Compare',text});return;}await navigator.clipboard?.writeText(u);showToast('Compare link copied 🤝')}catch(e){try{await navigator.clipboard.writeText(u);showToast('Compare link copied 🤝')}catch(_){alert(u)}}}
function cloudSettingsHtml(){return `<section class="v14-card"><div class="v14-section-head"><div><span class="v14-kicker">COMMUNITY SYNC</span><h2>Share progress with the creator</h2></div><span class="v14-counter">${data.cloudStatus?escapeHtml(data.cloudStatus):'Optional'}</span></div><label class="v14-toggle-row"><input id="cloudOptIn" type="checkbox" ${data.cloudOptIn?'checked':''}><span><b>Join the community dashboard</b><small>Only if you opt in: name, Arc progress, wins, best streak and last-seen time are shared. Private habit names and journal/sleep data stay local.</small></span></label><label class="v14-toggle-row"><input id="publicProfile" type="checkbox" ${data.publicProfile?'checked':''}><span><b>Allow my shared profile to be visible</b><small>Lets your name/progress appear in community views when the backend is configured.</small></span></label><div class="v14-cloud-actions"><button class="v14-pill-btn primary" data-save-cloud>Save choice</button><button class="v14-pill-btn" data-cloud-sync>Sync now</button></div><small class="v14-cloud-note">Cloud sync is off by default. The app still works fully offline. A Supabase backend must be configured by the creator.</small></section>`}


/* ========================= V16 GET APP / INSTALL CENTER ========================= */
const V16_WEBSITE_URL='https://vikas915577.github.io/Tracker/';
const V16_APK_RELEASES_URL='https://github.com/Vikas915577/Tracker/releases';

function v16Standalone(){
  try{return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone===true;}catch(e){return false;}
}
function v16InstallState(){
  if(v16Standalone())return {title:'Installed',sub:'Winter Arc Tracker is already running like an app.'};
  if(installPrompt)return {title:'Ready to install',sub:'Your browser has an install option available.'};
  return {title:'Browser install',sub:'Use your browser menu → Install app / Add to Home screen.'};
}
function v16Install(){
  if(v16Standalone()){showToast('Already installed 📱');return;}
  if(installPrompt){
    installPrompt.prompt();
    installPrompt.userChoice.then(choice=>{
      installPrompt=null;
      window.__v11InstallPrompt=null;
      showToast(choice?.outcome==='accepted'?'App install accepted ✅':'Install cancelled');
      render();
    }).catch(()=>showToast('Install prompt could not open'));
    return;
  }
  showToast('Browser menu → Install app / Add to Home screen 📱');
}
function v16GetAppPage(){
  const st=v16InstallState();
  return `<div class="v14-page v16-get-app">
    <section class="v16-app-hero">
      <div class="v14-kicker">GET THE APP · V17.0</div>
      <div class="v16-app-top">
        <div>
          <h1>Winter Arc on your phone. 📱</h1>
          <p>Website pe app completely chalega. Jab browser support kare, isi website ko install karke home screen par app ki tarah use karo.</p>
        </div>
        <div class="v16-app-icon"><img src="icon-512.png" alt="Winter Arc Tracker"></div>
      </div>
      <div class="v16-install-status"><span class="v16-status-dot ${v16Standalone()?'on':''}"></span><div><b>${escapeHtml(st.title)}</b><small>${escapeHtml(st.sub)}</small></div></div>
      <div class="v14-share-buttons v16-app-actions">
        <button class="v14-pill-btn primary" data-v16-install>${v16Standalone()?'App Installed ✅':installPrompt?'Install App 📱':'How to Install 📱'}</button>
        <a class="v14-pill-btn v16-link-btn" href="${V16_WEBSITE_URL}" target="_blank" rel="noopener">Open Website ↗</a>
        <a class="v14-pill-btn v16-link-btn" href="${V16_APK_RELEASES_URL}" target="_blank" rel="noopener">APK Releases ↗</a>
      </div>
    </section>

    <section class="v14-card">
      <div class="v14-section-head"><div><span class="v14-kicker">ANDROID / CHROME</span><h2>Install as an app</h2></div><span class="v14-counter">PWA</span></div>
      <ol class="v16-steps">
        <li><b>Install App</b> button available ho to tap karo.</li>
        <li>Button na aaye to browser ke <b>⋮ menu</b> me <b>Install app</b> ya <b>Add to Home screen</b> choose karo.</li>
        <li>Home screen icon se Winter Arc direct open karo.</li>
      </ol>
    </section>

    <section class="v14-card">
      <div class="v14-section-head"><div><span class="v14-kicker">IPHONE / SAFARI</span><h2>Home Screen</h2></div><span class="v14-counter">iOS</span></div>
      <p class="muted">Safari → Share → <b>Add to Home Screen</b>. iPhone par browser ke hisaab se install UI different ho sakta hai.</p>
    </section>

    <section class="v14-card">
      <div class="v14-section-head"><div><span class="v14-kicker">APK</span><h2>Android download</h2></div><span class="v14-counter">GitHub</span></div>
      <p class="muted">APK Releases button official repository ke Releases page par le jaata hai. Wahan real APK release asset available ho to download kar sakte ho. Website version ko APK ke bina bhi normally use kiya ja sakta hai.</p>
      <a class="v14-pill-btn primary v16-wide-link" href="${V16_APK_RELEASES_URL}" target="_blank" rel="noopener">Open APK Releases ↗</a>
    </section>

    <section class="v16-app-note"><span>🔒</span><div><b>Website is primary.</b><small>Core tracker, habits, goals, routines, journal, sleep, mood, reminders, share and community features website par hi available rahenge.</small></div></section>
  </div>`;
}

function v14Shell(){
  const body=tab==='today'?v14TodayPage():tab==='week'?v14WeekPage():tab==='month'?v14MonthPage():tab==='more'?v14MorePage():tab==='download'?v16GetAppPage():v14ArcPage();
  const s=stats(), labels={today:'Today',week:'Week',month:'Month',arc:'Arc',download:'Get App'};
  return `<div class="v14-app"><header class="v14-topbar"><button class="v14-menu" data-open-drawer aria-label="Open menu">☰</button><div class="v14-brand"><strong>Winter Arc</strong> <span>Tracker</span></div><div class="v14-top-actions"><button class="v14-top-icon" data-open-share-center aria-label="Share">↗</button><button class="v14-top-icon" data-dark aria-label="Theme">${data.dark?'☀️':'◔'}</button><button class="v14-frost" data-tab="arc" aria-label="Arc">❄️</button></div></header><nav class="v14-tabs">${Object.entries(labels).map(([n,l])=>`<button data-tab="${n}" class="${tab===n?'active':''}">${l}</button>`).join('')}</nav><div class="v14-meta-line"><span>${data.name?`Hi, ${escapeHtml(data.name)} 👋`:'Your progress'}</span><span>${s.todayDone}/${data.habits.length} today</span></div><main class="v14-main">${body}</main><button class="v14-fab" data-fab aria-label="Add habit">${quickOpen?'×':'+'}</button>${quickOpen?`<div class="v14-fab-menu"><button data-quick="habit">✅ Add habit</button><button data-quick="goals">🎯 Goal</button><button data-quick="routine">🔁 Routine</button></div>`:''}${selectedHabit?habitOverlay():''}${!data.onboardingDone&&!data.pinHash?onboarding():''}${window.__v11QuickModal?quickModal():''}${newHabitOpen?newHabitModal():''}${window.__v14ShareCenter?v14ShareModal():''}${window.__v14Compare?v14CompareModal():''}${window.__v14Cloud?v14CloudModal():''}</div>`;
}

/* Make advanced tools use the new clean surface. */
v12TodayPage=v14TodayPage;
v12WeekPage=v14WeekPage;
v12MonthPage=v14MonthPage;
v12ArcPage=v14ArcPage;
v12Topbar=function(){return '';};
morePage=v14MorePage;
settingsHtml=v14SettingsHtml;
creatorCard=v14CreatorCard;
v12Drawer=v14Drawer;

/* Real share card: 4:5 PNG with creator identity. */
async function v133MakeShareBlob(){
  const c=document.createElement('canvas'); c.width=1080;c.height=1350; const ctx=c.getContext('2d');
  const s=stats(),day=v13ArcDay(),L=v13ArcLength(),pct=day?Math.min(100,Math.round(day/L*100)):0,best=Math.max(0,...data.habits.map(h=>habitStats(h).longest)),wins=v13TotalWins();
  ctx.fillStyle='#f5f3ed';ctx.fillRect(0,0,c.width,c.height);
  const g=ctx.createLinearGradient(0,0,0,780);g.addColorStop(0,'#173f47');g.addColorStop(1,'#153c2e');ctx.fillStyle=g;v133RoundRect(ctx,46,46,988,760,48);ctx.fill();
  v133Text(ctx,'❄  WINTER ARC 2026',92,132,31,'800','left','#a8e1bf');
  v133Text(ctx,day?`DAY ${day} / ${L}`:'STARTS TOMORROW',92,235,76,'900','left','#ffffff');
  v133Text(ctx,day?`${pct}% of the Arc completed`:'Setup day · Day 1 starts tomorrow',92,290,28,'700','left','#d9eee5');
  v133RoundRect(ctx,92,344,896,24,12);ctx.fillStyle='rgba(255,255,255,.16)';ctx.fill();v133RoundRect(ctx,92,344,Math.max(12,896*pct/100),24,12);ctx.fillStyle='#75cf94';ctx.fill();
  v133Text(ctx,`${s.todayDone}/${data.habits.length} habits today`,92,470,48,'800','left','#ffffff');
  v133Text(ctx,`🔥 Best streak ${best} days`,92,532,34,'700','left','#d9eee5');
  v133Text(ctx,`🏁 ${wins} Arc wins`,92,588,34,'700','left','#d9eee5');
  const img=await v133LoadCreatorPhoto();if(img){ctx.save();v133RoundRect(ctx,810,610,140,140,32);ctx.clip();ctx.drawImage(img,810,610,140,140);ctx.restore();}
  v133Text(ctx,'SMALL WINS. REAL PROGRESS.',92,876,34,'900','left','#3da35d');
  v133Text(ctx,'Keep your Arc moving.',92,944,52,'900','left','#202020');
  v133Text(ctx,'Share your day. Invite a friend to start.',92,992,27,'600','left','#686868');
  v133Text(ctx,creatorName(),92,1060,32,'800','left','#202020');
  const h=creatorHandle();if(h)v133Text(ctx,h,92,1102,29,'800','left','#3da35d');
  v133Text(ctx,'Winter Arc Tracker',988,1102,24,'800','right','#767676');
  v133Text(ctx,'1 OCT → 31 DEC 2026',92,1176,23,'800','left','#8b8b8b');
  v133Text(ctx,'Start your own Arc ❄️',988,1176,23,'800','right','#3da35d');
  return new Promise(r=>c.toBlob(r,'image/png',.95));
}

async function v133ShareProgress(){
  try{
    const blob=await v133MakeShareBlob(); if(!blob)throw new Error('image');
    const file=new File([blob],'winter-arc-progress-v14.png',{type:'image/png'});
    const text=v133ShareText();
    if(navigator.share){
      if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({title:'Winter Arc Tracker',text,files:[file]});showToast('4:5 progress card shared ❄️');return;}catch(e){}}
      try{await navigator.share({title:'Winter Arc Tracker',text});showToast('Progress shared ↗');return;}catch(e){}
    }
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='winter-arc-progress-v14.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
    try{if(navigator.clipboard)await navigator.clipboard.writeText(text)}catch(e){}
    showToast('4:5 card saved 📤');
  }catch(e){
    const text=v133ShareText();try{if(navigator.clipboard){await navigator.clipboard.writeText(text);showToast('Share text copied ↗');return;}}catch(err){}alert(text);
  }
}

async function v133InviteFriends(){
  const text=`Join me for Winter Arc 2026 ❄️\nStart your own daily habit Arc from 1 Oct to 31 Dec.\n\n${v133ShareUrl()}`;
  try{if(navigator.share){await navigator.share({title:'Join Winter Arc 2026',text});showToast('Invite ready 🤝');return;}}catch(e){}
  try{await navigator.clipboard.writeText(text);showToast('Invite link copied 🤝');}catch(e){alert(text)}
}

/* V14 event bridge for the share center. */
document.addEventListener('click',async e=>{
  const b=e.target.closest('button');
  if(!b)return;
  if(b.dataset.openShareCenter!==undefined){e.preventDefault();e.stopImmediatePropagation();window.__v14ShareCenter=true;render();return;}
  if(b.dataset.closeShareCenter!==undefined || (e.target.closest('.v14-share-overlay') && e.target===e.target.closest('.v14-share-overlay'))){e.preventDefault();e.stopImmediatePropagation();window.__v14ShareCenter=false;render();return;}
  if(b.dataset.downloadCard!==undefined){e.preventDefault();e.stopImmediatePropagation();try{const blob=await v133MakeShareBlob();const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='winter-arc-progress-v14.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);showToast('4:5 card saved ↓')}catch(err){showToast('Could not save card')}}
  if(b.dataset.openInstagram!==undefined){e.preventDefault();e.stopImmediatePropagation();const u=safeHttpsUrl(data.creatorLink);if(u)window.open(u,'_blank','noopener');else showToast('Add your Instagram link in Settings');}
},{capture:true});

/* V14 share buttons get first chance, so only one share flow fires. */
document.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.shareProgress!==undefined){e.preventDefault();e.stopImmediatePropagation();await v133ShareProgress();return;}
  if(b.dataset.shareInvite!==undefined){e.preventDefault();e.stopImmediatePropagation();await v133InviteFriends();return;}
},{capture:true});



/* V16 install center action. */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-v16-install]');
  if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();
  v16Install();
},{capture:true});

/* V14.1 compare + cloud actions. */
document.addEventListener('click',async e=>{
 const b=e.target.closest('button'); if(!b)return;
 if(b.dataset.openCompare!==undefined){e.preventDefault();e.stopImmediatePropagation();openCompare();return;}
 if(b.dataset.shareCompare!==undefined){e.preventDefault();e.stopImmediatePropagation();await shareCompare();return;}
 if(b.dataset.closeCompare!==undefined){e.preventDefault();e.stopImmediatePropagation();window.__v14Compare=false;render();return;}
 if(b.dataset.openCloud!==undefined){e.preventDefault();e.stopImmediatePropagation();window.__v14Cloud=true;render();return;}
 if(b.dataset.closeCloud!==undefined){e.preventDefault();e.stopImmediatePropagation();window.__v14Cloud=false;render();return;}
 if(b.dataset.saveCloud!==undefined){e.preventDefault();e.stopImmediatePropagation();data.cloudOptIn=!!$('#cloudOptIn')?.checked;data.publicProfile=!!$('#publicProfile')?.checked;save();window.__v14Cloud=false;render();showToast(data.cloudOptIn?'Community sync enabled ☁️':'Community sync off');return;}
 if(b.dataset.cloudSync!==undefined){e.preventDefault();e.stopImmediatePropagation();data.cloudOptIn=!!$('#cloudOptIn')?.checked || data.cloudOptIn;data.publicProfile=!!$('#publicProfile')?.checked || data.publicProfile;save();await cloudSync();return;}
},{capture:true});
window.addEventListener('hashchange',()=>{if(compareFromHash()){window.__v14Compare=true;render();}});
window.addEventListener('popstate',()=>{if(compareFromHash()){window.__v14Compare=true;render();}});
if(compareFromHash())window.__v14Compare=true;

/* Reuse existing shell helpers but return the V14 surface. */
function v12Shell(){return v14Shell();}




/* ========================= V17 UX PATCH =========================
   A cleaner entry flow: Welcome → Profile → Goal → Habits → Ready.
   Existing V16 data is migrated through OLD_KEYS into V17 storage.
*/
let v17Step = 0;
let v17GoalChoice = '';
if(data.onboardingDone && data.name && !data.profileCreated){data.profileCreated=true;save();}
let v17Habits = [];
let v17CustomHabit = '';

function v17ResetWizard(){
  v17Step=0;
  v17GoalChoice=data.goal||'';
  const existing=(data.habits||[]).map(h=>h.name);
  v17Habits=existing.length?existing.slice(0,6):PRESETS.filter(p=>!p.private).slice(0,3).map(p=>p.name);
  v17CustomHabit='';
}
function v17HasGoal(){return !!String(v17GoalChoice||'').trim()}
function v17Selected(name){return v17Habits.some(x=>x.toLowerCase()===name.toLowerCase())}
function v17ToggleHabit(name){
  if(v17Selected(name))v17Habits=v17Habits.filter(x=>x.toLowerCase()!==name.toLowerCase());
  else if(v17Habits.length<6)v17Habits.push(name);
  else showToast('Pick up to 6 habits.');
}
function v17HabitAction(name){
  const p=preset(name);
  return p?.action || 'Do the smallest useful version';
}
function v17GoalLabel(g){
  return ({discipline:'Build discipline',study:'Study / work',fitness:'Get fitter',mind:'Improve my mind',custom:'My own goal'})[g]||g||'My goal';
}
function v17Styles(){
  if(document.getElementById('v17-style'))return;
  const style=document.createElement('style');
  style.id='v17-style';
  style.textContent=`
    .v17-screen{min-height:100dvh;display:grid;place-items:center;padding:22px 14px;background:radial-gradient(circle at 50% -10%,rgba(61,163,93,.13),transparent 38%),var(--bg,#f5f3ed);color:var(--ink,#202522)}
    .v17-card{width:min(100%,520px);background:var(--card,#fff);border:1px solid var(--line,#e7e7e1);border-radius:28px;padding:26px;box-shadow:0 18px 60px rgba(20,30,24,.10)}
    .v17-welcome-card{text-align:center;padding:34px 25px}.v17-logo{width:68px;height:68px;margin:0 auto 14px;border-radius:22px;display:grid;place-items:center;background:#3da35d;color:white;font-size:32px;box-shadow:0 12px 30px rgba(61,163,93,.25)}
    .v17-kicker{font-size:11px;letter-spacing:.15em;font-weight:850;color:#3a7f50}.v17-card h1{font-size:32px;line-height:1.05;margin:9px 0 9px;letter-spacing:-.03em}.v17-sub{font-size:15px;line-height:1.55;color:var(--muted,#70766f);margin:0 0 20px}
    .v17-feature-row{display:grid;gap:8px;margin:20px 0;text-align:left}.v17-feature-row span{padding:11px 13px;border:1px solid var(--line,#e7e7e1);border-radius:14px;background:#fafbf9;font-size:13px;font-weight:700}
    .v17-primary,.v17-secondary,.v17-add{width:100%;min-height:52px;border-radius:15px;padding:13px 16px;font:inherit;font-weight:850;cursor:pointer;border:1px solid var(--line,#e7e7e1);transition:transform .12s ease,opacity .12s ease,background .12s ease}.v17-primary{background:#3da35d;color:#fff;border-color:#3da35d;box-shadow:0 10px 24px rgba(61,163,93,.20)}.v17-secondary{background:transparent;color:var(--ink,#202522);margin-top:9px}.v17-primary:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}.v17-primary:not(:disabled):active,.v17-secondary:active,.v17-add:active{transform:scale(.98)}
    .v17-footnote,.v17-hint{font-size:11px;line-height:1.45;color:var(--muted,#70766f);margin-top:14px}.v17-hint{padding:11px 12px;background:#f7f8f5;border-radius:13px;text-align:left}.v17-invite{margin-top:14px;font-size:12px;padding:10px;border-radius:13px;background:#eef7ef;color:#287644}
    .v17-stephead{display:flex;align-items:center;justify-content:space-between;color:var(--muted,#70766f);font-size:12px;font-weight:800;margin-bottom:10px}.v17-back{border:0;background:transparent;font:inherit;font-size:22px;cursor:pointer;padding:2px 6px}.v17-progress{height:7px;background:#edf0eb;border-radius:99px;overflow:hidden;margin-bottom:25px}.v17-progress i{display:block;height:100%;background:#3da35d;border-radius:99px}
    .v17-input{width:100%;min-height:52px;border:1px solid var(--line,#ddd);border-radius:15px;padding:13px 14px;background:var(--card,#fff);color:inherit;font:inherit;outline:none}.v17-input:focus{border-color:#3da35d;box-shadow:0 0 0 3px rgba(61,163,93,.12)}
    .v17-choice-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:17px 0}.v17-choice{position:relative;display:flex;align-items:center;gap:10px;min-height:72px;padding:12px;border:1px solid var(--line,#e7e7e1);border-radius:16px;background:#fff;color:inherit;text-align:left;cursor:pointer;font:inherit}.v17-choice span{font-size:22px}.v17-choice em{position:absolute;right:10px;top:9px;font-style:normal;color:#3da35d;font-weight:900}.v17-choice.selected{border-color:#3da35d;background:#f1f8f2;box-shadow:0 0 0 2px rgba(61,163,93,.08)}
    .v17-choice-list{display:grid;gap:9px;margin:17px 0}.v17-habit-choice{display:flex;align-items:center;gap:12px;width:100%;padding:12px;border:1px solid var(--line,#e7e7e1);border-radius:16px;background:#fff;color:inherit;text-align:left;cursor:pointer;font:inherit}.v17-habit-choice.selected{border-color:#3da35d;background:#f1f8f2}.v17-choice-icon{width:39px;height:39px;display:grid;place-items:center;border-radius:12px;background:#f4f6f2;font-size:20px;flex:none}.v17-habit-choice span:nth-child(2){flex:1;min-width:0}.v17-habit-choice small{display:block;color:var(--muted,#70766f);font-size:11px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v17-habit-choice strong{font-size:21px;color:#3da35d}.v17-custom-row{display:grid;grid-template-columns:1fr auto;gap:8px;margin:14px 0 7px}.v17-add{width:auto;min-width:88px;background:#f6f7f4}.v17-chip{display:inline-flex;align-items:center;gap:5px;margin:4px 4px 10px 0;padding:7px 9px;border-radius:999px;background:#eef7ef;color:#287644;font-size:12px;font-weight:750}.v17-chip button{border:0;background:transparent;color:inherit;font-size:16px;cursor:pointer;padding:0 2px}
    .v17-ready{text-align:center}.v17-success{width:62px;height:62px;border-radius:50%;display:grid;place-items:center;margin:0 auto 13px;background:#3da35d;color:#fff;font-size:32px;font-weight:900}.v17-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0}.v17-summary>div{padding:13px 8px;border-radius:15px;background:#f7f8f5}.v17-summary b{display:block;font-size:23px}.v17-summary span{font-size:11px;color:var(--muted,#70766f)}.v17-first-win{display:flex;gap:12px;align-items:flex-start;text-align:left;padding:15px;border:1px solid #dfe8df;background:#f7faf7;border-radius:17px;margin-bottom:15px}.v17-first-win>span{font-size:23px}.v17-first-win small{display:block;color:#3a7f50;font-size:10px;font-weight:900;letter-spacing:.12em}.v17-first-win b{display:block;margin-top:2px;font-size:16px}.v17-first-win p{margin:3px 0 0;font-size:12px;color:var(--muted,#70766f)}
    .v17-login-card{text-align:center}.v17-avatar{width:74px;height:74px;margin:18px auto 8px;border-radius:50%;display:grid;place-items:center;background:#eef7ef;color:#287644;font-size:29px;font-weight:900}.v17-login-name{font-weight:850;font-size:15px;margin-bottom:15px}.v17-pin{text-align:center;letter-spacing:.35em;font-size:20px}.v17-login-card .v17-hint{text-align:center}
    @media(max-width:480px){.v17-card{padding:22px 17px;border-radius:24px}.v17-card h1{font-size:29px}.v17-choice-grid{grid-template-columns:1fr}.v17-feature-row{margin-top:16px}.v17-screen{padding:12px}.v17-summary{gap:6px}}
    body.dark .v17-screen{background:#101411}body.dark .v17-card{background:#151a16;border-color:#293129;box-shadow:0 18px 60px rgba(0,0,0,.30)}body.dark .v17-feature-row span,body.dark .v17-choice,body.dark .v17-habit-choice{background:#151a16;border-color:#293129}body.dark .v17-choice.selected,body.dark .v17-habit-choice.selected{background:#18261c}body.dark .v17-input{background:#111612;border-color:#293129}body.dark .v17-hint,body.dark .v17-summary>div,body.dark .v17-first-win{background:#121814;border-color:#293129}
  `;
  document.head.appendChild(style);
}

function v17Welcome(){
  const invite=data.invitedBy?`<div class="v17-invite">🤝 Invited by <b>@${escapeHtml(data.invitedBy)}</b></div>`:'';
  return `<div class="v17-screen"><div class="v17-card v17-welcome-card"><div class="v17-logo">❄️</div><div class="v17-kicker">WINTER ARC · 2026</div><h1>Build your next 92 days.</h1><p class="v17-sub">One simple system for habits, progress and your next small win.</p><div class="v17-feature-row"><span>✅ Daily actions</span><span>📈 Real progress</span><span>🔒 Local first</span></div><button class="v17-primary" data-v17-next>Start my Arc <span>→</span></button><button class="v17-secondary" data-v17-existing>Already started? Continue <span>→</span></button>${invite}<div class="v17-footnote">No complicated setup. You can change everything later.</div></div></div>`;
}
function v17Profile(){
  return `<div class="v17-screen"><div class="v17-card"><div class="v17-stephead"><button class="v17-back" data-v17-back>←</button><span>1 of 3</span></div><div class="v17-progress"><i style="width:33%"></i></div><div class="v17-kicker">YOUR PROFILE</div><h1>What should we call you?</h1><p class="v17-sub">Just your first name is enough.</p><input id="v17Name" class="v17-input" autocomplete="name" placeholder="Your name" value="${escapeHtml(data.name||'')}"><div class="v17-hint">🔒 Your profile stays on this device unless you choose community sync later.</div><button class="v17-primary" data-v17-next>Continue <span>→</span></button></div></div>`;
}
function v17Goal(){
  const choices=[['discipline','🎯','Build discipline'],['study','📚','Study / work'],['fitness','💪','Get fitter'],['mind','🧠','Improve my mind'],['custom','✨','My own goal']];
  return `<div class="v17-screen"><div class="v17-card"><div class="v17-stephead"><button class="v17-back" data-v17-back>←</button><span>2 of 3</span></div><div class="v17-progress"><i style="width:66%"></i></div><div class="v17-kicker">YOUR DIRECTION</div><h1>What do you want this Arc to improve?</h1><p class="v17-sub">Pick one. You can add more later.</p><div class="v17-choice-grid">${choices.map(([id,icon,label])=>`<button class="v17-choice ${v17GoalChoice===id?'selected':''}" data-v17-goal="${id}"><span>${icon}</span><b>${label}</b>${v17Goal===id?'<em>✓</em>':''}</button>`).join('')}</div>${v17GoalChoice==='custom' ? `<input id="v17CustomGoal" class="v17-input" placeholder="e.g. Become more consistent" value="${v17GoalChoice==='custom'?escapeHtml(data.goal||''):''}">`:''}<button class="v17-primary" data-v17-next ${!v17HasGoal()?'disabled':''}>Continue <span>→</span></button></div></div>`;
}
function v17HabitsStep(){
  const picks=PRESETS.filter(p=>!p.private).slice(0,6);
  return `<div class="v17-screen"><div class="v17-card"><div class="v17-stephead"><button class="v17-back" data-v17-back>←</button><span>3 of 3</span></div><div class="v17-progress"><i style="width:100%"></i></div><div class="v17-kicker">FIRST WINS</div><h1>Choose a few habits to start.</h1><p class="v17-sub">Keep it light. <b>${v17Habits.length}/6</b> selected.</p><div class="v17-choice-list">${picks.map(p=>`<button class="v17-habit-choice ${v17Selected(p.name)?'selected':''}" data-v17-habit="${escapeHtml(p.name)}"><span class="v17-choice-icon">${p.icon}</span><span><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.action)}</small></span><strong>${v17Selected(p.name)?'✓':'+'}</strong></button>`).join('')}</div><div class="v17-custom-row"><input id="v17CustomHabit" class="v17-input" placeholder="Add your own habit" value="${escapeHtml(v17CustomHabit)}"><button class="v17-add" data-v17-add-habit>＋ Add</button></div>${v17Habits.filter(n=>!picks.some(p=>p.name.toLowerCase()===n.toLowerCase())).map(n=>`<span class="v17-chip">${escapeHtml(n)} <button data-v17-remove-habit="${escapeHtml(n)}">×</button></span>`).join('')}<button class="v17-primary" data-v17-finish ${!v17Habits.length?'disabled':''}>Create my Arc <span>🚀</span></button><div class="v17-footnote">You can edit, remove or add habits anytime.</div></div></div>`;
}
function v17Ready(){
  const n=data.habits.length;
  return `<div class="v17-screen"><div class="v17-card v17-ready"><div class="v17-success">✓</div><div class="v17-kicker">YOUR ARC IS READY</div><h1>Nice, ${escapeHtml(data.name||'there')}.</h1><p class="v17-sub">Your system is set up. Your first job is simple: get one small win today.</p><div class="v17-summary"><div><b>92</b><span>days</span></div><div><b>${n}</b><span>habits</span></div><div><b>1</b><span>goal</span></div></div><div class="v17-first-win"><span>🎯</span><div><small>FIRST WIN</small><b>${escapeHtml(data.habits[0]?.name||'Start your first habit')}</b><p>${escapeHtml(data.habits[0]?.action||'Do the smallest useful version')}</p></div></div><button class="v17-primary" data-v17-enter>Start Day 1 <span>→</span></button><button class="v17-secondary" data-v17-community>Join the community <span>🤝</span></button><div class="v17-footnote">Community is optional. Your private tracker still works without it.</div></div></div>`;
}
function v17Entry(){
  if(v17Step===0)return v17Welcome();
  if(v17Step===1)return v17Profile();
  if(v17Step===2)return v17Goal();
  if(v17Step===3)return v17HabitsStep();
  return v17Ready();
}
function v17Locked(){
  return `<div class="v17-screen"><div class="v17-card v17-login-card"><div class="v17-logo">❄️</div><div class="v17-kicker">WELCOME BACK</div><h1>Continue your Arc.</h1><p class="v17-sub">Your progress is ready on this device.</p><div class="v17-avatar">${escapeHtml((data.name||'A').slice(0,1).toUpperCase())}</div><div class="v17-login-name">${escapeHtml(data.name||'Your profile')}</div><input id="loginPin" class="v17-input v17-pin" type="password" inputmode="numeric" maxlength="6" autocomplete="current-password" placeholder="4–6 digit PIN"><button class="v17-primary" data-login>Unlock <span>🔓</span></button><button class="v17-secondary" data-forgot-pin>Reset this profile</button><div class="v17-hint">🔒 This is a local device profile, not an online password.</div></div></div>`;
}
function v17MainShell(){
  const base=v14Shell();
  return base;
}

function v17ApplyWizardProfile(){
  const name=$('#v17Name')?.value.trim()||data.name||'';
  if(!name){alert('Please enter your name.');return false;}
  data.name=name;
  return true;
}
function v17Advance(){
  if(v17Step===0){v17Step=1;render();return}
  if(v17Step===1){if(!v17ApplyWizardProfile())return;v17Step=2;render();return}
  if(v17Step===2){
    if(v17GoalChoice==='custom'){const c=$('#v17CustomGoal')?.value.trim()||'';if(!c){alert('Enter your goal.');return}v17Goal=c;}
    data.goal=v17GoalChoice;v17Step=3;render();return;
  }
}
function v17Finish(){
  if(!v17Habits.length){alert('Choose at least one habit.');return}
  const selected=v17Habits.slice(0,6).map(name=>{
    const p=preset(name);
    return {name,icon:p?.icon||'✅',private:!!p?.private,difficulty:p?.difficulty||'Medium',action:p?.action||'Do the smallest useful version'};
  });
  data.habits=selected.map(x=>Object.assign({id:uid(),created:today(),time:'',smallWin:x.action,why:''},x));
  data.onboardingDone=true;
  data.profileCreated=true;
  data.journeyStart=today();
  data.lastLogin=today();
  data.goalLinks=[];
  save();
  v17Step=4;
  render();
}

/* V17 overrides the entry renderer only; the existing tracker shell remains intact after setup. */
const v17OriginalRender=render;
render=function(){
  v17Styles();
  document.body.classList.toggle('dark',!!data.dark);
  if(isLocked()){
    document.body.innerHTML=v17Locked();
  }else if(!data.profileCreated || !data.onboardingDone){
    document.body.innerHTML=v17Entry();
  }else{
    document.body.innerHTML=v17MainShell();
  }
  bindDomState();
};

/* V17 action handlers run first so they never compete with older onboarding handlers. */
document.addEventListener('click',async e=>{
  const b=e.target.closest('button');
  if(!b)return;
  if(b.dataset.v17Existing!==undefined){e.preventDefault();e.stopImmediatePropagation();
    if(data.profileCreated||data.pinHash){sessionUnlocked=data.pinHash?false:true;v17Step=0;render();}
    else{showToast('Create your Arc first 🚀');}
    return;
  }
  if(b.dataset.v17Next!==undefined){e.preventDefault();e.stopImmediatePropagation();v17Advance();return;}
  if(b.dataset.v17Back!==undefined){e.preventDefault();e.stopImmediatePropagation();v17Step=Math.max(0,v17Step-1);render();return;}
  if(b.dataset.v17Goal!==undefined){e.preventDefault();e.stopImmediatePropagation();v17GoalChoice=b.dataset.v17Goal;render();return;}
  if(b.dataset.v17Habit!==undefined){e.preventDefault();e.stopImmediatePropagation();v17ToggleHabit(b.dataset.v17Habit);render();return;}
  if(b.dataset.v17AddHabit!==undefined){e.preventDefault();e.stopImmediatePropagation();const v=$('#v17CustomHabit')?.value.trim()||'';if(!v){return}v17CustomHabit=v;if(!v17Selected(v))v17ToggleHabit(v);v17CustomHabit='';render();return;}
  if(b.dataset.v17RemoveHabit!==undefined){e.preventDefault();e.stopImmediatePropagation();v17Habits=v17Habits.filter(x=>x!==b.dataset.v17RemoveHabit);render();return;}
  if(b.dataset.v17Finish!==undefined){e.preventDefault();e.stopImmediatePropagation();v17Finish();return;}
  if(b.dataset.v17Enter!==undefined){e.preventDefault();e.stopImmediatePropagation();tab='today';morePanel='';selectedHabit=null;focusMode=false;quickOpen=false;render();showToast('Your Arc is live 🚀');return;}
  if(b.dataset.v17Community!==undefined){e.preventDefault();e.stopImmediatePropagation();window.__v14Cloud=true;render();return;}
},{capture:true});

document.addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;
  if(document.activeElement?.id==='v17Name' || document.activeElement?.id==='v17CustomGoal'){
    const btn=document.querySelector('[data-v17-next]'); if(btn&&!btn.disabled){e.preventDefault();btn.click();}
  }
  if(document.activeElement?.id==='loginPin'){const btn=document.querySelector('[data-login]');if(btn){e.preventDefault();btn.click();}}
});

/* Keep migrated data explicitly tagged as V17. */
data.schema=17;
if(data.profileCreated||data.onboardingDone)save();


/* ========================= V18 MOBILE-FIRST UX PATCH =========================
   Rebuilds only the user-facing shell. Existing data + deeper features remain available.
   Goals: mobile-first layout, fewer cards, faster taps, clickable creator profile card,
   and one useful new feature: Focus Sprint.
*/
(function(){
  let v171CreatorOpen=false;
  let v171ProfilePhoto='creator-profile.jpg';
  let v171Menu=false;
  let v171SprintOpen=false;
  let v171SprintRunning=false;
  let v171SprintEndsAt=0;
  let v171SprintMinutes=10;
  let v171SprintTimer=null;

  function v171EnsureViewport(){
    let m=document.querySelector('meta[name="viewport"]');
    if(!m){m=document.createElement('meta');m.name='viewport';document.head.appendChild(m);}
    m.setAttribute('content','width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1');
  }

  function v171Styles(){
    if(document.getElementById('v171-style'))return;
    const style=document.createElement('style');
    style.id='v171-style';
    style.textContent=`
      html,body{width:100%;max-width:100%;margin:0;overflow-x:hidden;-webkit-text-size-adjust:100%;}
      body{min-width:0!important;touch-action:manipulation;}
      *,*::before,*::after{box-sizing:border-box;}
      button,a,input,textarea,select{touch-action:manipulation;-webkit-tap-highlight-color:transparent;}
      button{font-family:inherit;}
      .v171-shell{min-height:100dvh;background:var(--bg,#f5f3ed);color:var(--ink,#202522);padding-bottom:88px;}
      .v171-inner{width:min(100%,760px);margin:0 auto;padding:0 14px;}
      .v171-top{position:sticky;top:0;z-index:20;padding:12px 14px 10px;background:color-mix(in srgb,var(--bg,#f5f3ed) 88%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid color-mix(in srgb,var(--line,#e7e7e1) 70%,transparent);}
      .v171-toprow{width:min(100%,760px);margin:0 auto;display:flex;align-items:center;gap:10px;}
      .v171-menu,.v171-topbtn{width:42px;height:42px;border:1px solid var(--line,#e7e7e1);background:var(--card,#fff);border-radius:14px;display:grid;place-items:center;font-size:18px;cursor:pointer;flex:none;}
      .v171-brand{flex:1;min-width:0;text-align:left;}
      .v171-brand b{display:block;font-size:17px;line-height:1.1;letter-spacing:-.02em;}
      .v171-brand span{display:block;color:var(--muted,#70766f);font-size:10px;margin-top:3px;letter-spacing:.04em;}
      .v171-topbtn.primary{background:#3da35d;border-color:#3da35d;color:#fff;}
      .v171-content{padding-top:14px;}
      .v171-hero{border-radius:24px;padding:20px;background:linear-gradient(145deg,#153f3a,#173c2d);color:#fff;box-shadow:0 18px 38px rgba(20,55,42,.16);}
      .v171-kicker{font-size:10px;letter-spacing:.14em;font-weight:900;opacity:.82;}
      .v171-dayrow{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-top:8px;}
      .v171-day{font-size:31px;line-height:.95;font-weight:950;letter-spacing:-.04em;}
      .v171-day span{font-size:15px;opacity:.68;font-weight:800;letter-spacing:0;}
      .v171-pct{text-align:right;font-size:27px;font-weight:950;line-height:1;}
      .v171-pct small{display:block;font-size:9px;letter-spacing:.12em;opacity:.72;margin-top:4px;}
      .v171-progress{height:9px;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden;margin:17px 0 11px;}
      .v171-progress i{display:block;height:100%;border-radius:inherit;background:#7bd29a;}
      .v171-meta{display:flex;gap:8px;flex-wrap:wrap;font-size:11px;color:#d9eee5;font-weight:750;}
      .v171-meta span{padding:7px 9px;border-radius:999px;background:rgba(255,255,255,.08);}
      .v171-card{margin-top:12px;background:var(--card,#fff);border:1px solid var(--line,#e7e7e1);border-radius:20px;padding:15px;box-shadow:0 8px 24px rgba(23,35,28,.05);}
      .v171-cardhead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:11px;}
      .v171-cardhead h2{margin:0;font-size:17px;letter-spacing:-.02em;}
      .v171-sub{font-size:11px;color:var(--muted,#70766f);}
      .v171-focus{display:flex;align-items:center;gap:12px;}
      .v171-focus-icon{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;background:#f1f7f1;font-size:23px;flex:none;}
      .v171-focus-copy{flex:1;min-width:0;}
      .v171-focus-copy b{display:block;font-size:15px;}
      .v171-focus-copy span{display:block;margin-top:3px;font-size:11px;color:var(--muted,#70766f);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .v171-check{width:50px;height:50px;border-radius:16px;border:1px solid #d8e5d9;background:#f6faf6;color:#287644;font-size:21px;font-weight:900;cursor:pointer;flex:none;}
      .v171-check.done{background:#3da35d;border-color:#3da35d;color:#fff;}
      .v171-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;}
      .v171-action{min-height:44px;border-radius:14px;border:1px solid var(--line,#e7e7e1);background:var(--card,#fff);font-weight:850;font-size:12px;cursor:pointer;padding:10px;}
      .v171-action.primary{background:#3da35d;color:#fff;border-color:#3da35d;}
      .v171-habits{display:grid;gap:8px;}
      .v171-habit{display:flex;align-items:center;gap:10px;padding:11px 10px;border:1px solid var(--line,#e7e7e1);border-radius:16px;background:var(--card,#fff);min-width:0;}
      .v171-hicon{width:39px;height:39px;border-radius:12px;background:#f4f6f2;display:grid;place-items:center;font-size:18px;flex:none;}
      .v171-hmain{flex:1;min-width:0;}
      .v171-hname{font-weight:850;font-size:13px;display:flex;align-items:center;gap:5px;}
      .v171-hline{margin-top:2px;color:var(--muted,#70766f);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .v171-hstats{margin-top:4px;display:flex;gap:7px;flex-wrap:wrap;color:var(--muted,#70766f);font-size:9px;font-weight:750;}
      .v171-mini-btn{min-width:42px;height:42px;border-radius:13px;border:1px solid #dce6dc;background:#fafcfa;color:#287644;font-weight:900;font-size:18px;cursor:pointer;flex:none;}
      .v171-mini-btn.done{background:#3da35d;border-color:#3da35d;color:#fff;}
      .v171-empty{text-align:center;padding:18px;border:1px dashed var(--line,#dfe3de);border-radius:16px;color:var(--muted,#70766f);font-size:12px;}
      .v171-nav{position:fixed;z-index:30;left:0;right:0;bottom:0;padding:8px 10px calc(8px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--card,#fff) 92%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid var(--line,#e7e7e1);}
      .v171-nav-inner{width:min(100%,760px);margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:5px;}
      .v171-nav button{min-height:54px;border:0;background:transparent;border-radius:14px;color:var(--muted,#70766f);font-size:10px;font-weight:850;cursor:pointer;display:grid;place-items:center;gap:2px;padding:5px;}
      .v171-nav button b{font-size:18px;line-height:1;}
      .v171-nav button.active{background:#edf7ee;color:#287644;}
      .v171-menu-overlay,.v171-profile-overlay,.v171-sprint-overlay{position:fixed;inset:0;z-index:60;background:rgba(14,19,16,.46);display:flex;align-items:flex-end;justify-content:center;padding:12px;}
      .v171-sheet{width:min(100%,760px);max-height:min(82dvh,720px);overflow:auto;background:var(--card,#fff);border:1px solid var(--line,#e7e7e1);border-radius:25px 25px 18px 18px;padding:16px;box-shadow:0 25px 70px rgba(0,0,0,.18);}
      .v171-sheet-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;}
      .v171-sheet-head h2{margin:0;font-size:18px;}
      .v171-close{width:40px;height:40px;border-radius:13px;border:1px solid var(--line,#e7e7e1);background:var(--card,#fff);font-size:20px;cursor:pointer;}
      .v171-menu-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
      .v171-menu-grid button{min-height:64px;text-align:left;border:1px solid var(--line,#e7e7e1);background:var(--card,#fff);border-radius:16px;padding:11px;cursor:pointer;}
      .v171-menu-grid b{display:block;font-size:12px;}.v171-menu-grid small{display:block;color:var(--muted,#70766f);font-size:9px;margin-top:3px;}
      .v171-profile-card{width:min(100%,520px);background:var(--card,#fff);border-radius:26px;padding:15px;border:1px solid var(--line,#e7e7e1);box-shadow:0 24px 70px rgba(0,0,0,.22);}
      .v171-profile-main{width:100%;aspect-ratio:1/1;border-radius:21px;overflow:hidden;background:#eef2ed;}
      .v171-profile-main img{width:100%;height:100%;object-fit:cover;display:block;}
      .v171-profile-info{text-align:center;padding:14px 8px 4px;}.v171-profile-info h2{margin:0;font-size:22px;}.v171-profile-info p{margin:6px 0 0;color:var(--muted,#70766f);font-size:12px;line-height:1.5;}
      .v171-profile-handle{display:inline-block;margin-top:7px;font-size:12px;font-weight:900;color:#287644;}
      .v171-thumbs{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px;}.v171-thumbs button{padding:0;aspect-ratio:1;border:2px solid transparent;border-radius:13px;overflow:hidden;background:#eef2ed;cursor:pointer;}.v171-thumbs button.active{border-color:#3da35d;}.v171-thumbs img{width:100%;height:100%;object-fit:cover;display:block;}
      .v171-profile-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px;}.v171-profile-actions a,.v171-profile-actions button{min-height:46px;border-radius:14px;border:1px solid var(--line,#e7e7e1);display:grid;place-items:center;text-decoration:none;font-weight:850;font-size:12px;background:var(--card,#fff);color:inherit;cursor:pointer;}.v171-profile-actions .primary{background:#3da35d;border-color:#3da35d;color:#fff;}
      .v171-creator-card{display:flex;align-items:center;gap:10px;padding:11px;border:1px solid var(--line,#e7e7e1);border-radius:17px;background:var(--card,#fff);margin-top:12px;}
      .v171-creator-open{display:flex;align-items:center;gap:10px;flex:1;min-width:0;background:transparent;border:0;padding:0;text-align:left;cursor:pointer;}
      .v171-creator-open img{width:48px;height:48px;border-radius:15px;object-fit:cover;display:block;flex:none;}
      .v171-creator-copy{min-width:0;}.v171-creator-copy small{display:block;color:var(--muted,#70766f);font-size:9px;}.v171-creator-copy b{display:block;font-size:12px;margin-top:2px;}.v171-creator-copy span{display:block;color:#287644;font-size:9px;margin-top:2px;font-weight:850;}
      .v171-chevron{font-size:20px;color:var(--muted,#70766f);padding:0 2px;}
      .v171-sprint{text-align:center;padding:18px;}.v171-timer{font-size:54px;line-height:1;font-weight:950;letter-spacing:-.04em;margin:12px 0 16px;}.v171-sprint-row{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;}.v171-sprint-row button{min-height:44px;border:1px solid var(--line,#e7e7e1);background:var(--card,#fff);border-radius:13px;font-weight:850;cursor:pointer;}.v171-sprint-row button.active{background:#edf7ee;border-color:#3da35d;color:#287644;}
      .v171-note{font-size:10px;color:var(--muted,#70766f);line-height:1.45;margin-top:9px;}
      body.dark .v171-shell{background:#101411;} body.dark .v171-top{background:rgba(16,20,17,.88);border-color:#293129;} body.dark .v171-card,body.dark .v171-habit,body.dark .v171-creator-card,body.dark .v171-sheet,body.dark .v171-profile-card,body.dark .v171-menu-grid button,body.dark .v171-menu,body.dark .v171-topbtn,body.dark .v171-close,body.dark .v171-action,body.dark .v171-mini-btn,body.dark .v171-sprint-row button{background:#151a16;border-color:#293129;color:#f2f4f1;} body.dark .v171-focus-icon,body.dark .v171-hicon,body.dark .v171-summary{background:#182019;} body.dark .v171-nav{background:rgba(21,26,22,.94);border-color:#293129;} body.dark .v171-nav button.active{background:#1a2a1f;color:#8ddaa5;}
      @media(min-width:761px){.v171-inner{padding-left:18px;padding-right:18px}.v171-content{padding-top:18px}.v171-top{padding-left:18px;padding-right:18px}.v171-nav{padding-left:18px;padding-right:18px;}}
      .v171-inner .v14-page,.v171-inner .v13-page,.v171-inner .v14-card,.v171-inner .v14-simple-hero,.v171-inner .v14-share-modal{width:100%;max-width:100%;}
      .v171-inner .matrix-wrap,.v171-inner .table-wrap{max-width:100%;overflow-x:auto;}
      .v171-inner input,.v171-inner textarea,.v171-inner select{max-width:100%;}

      @media(max-width:460px){.v171-inner{padding:0 10px}.v171-hero{border-radius:21px;padding:17px}.v171-day{font-size:28px}.v171-card{border-radius:18px;padding:13px}.v171-menu-grid{grid-template-columns:1fr}.v171-profile-card{padding:11px}.v171-profile-main{border-radius:18px}.v171-actions{grid-template-columns:1fr 1fr;}.v171-brand b{font-size:15px;}}
    `;
    document.head.appendChild(style);
  }

  function v171NavButton(id,icon,label){
    return `<button class="${tab===id?'active':''}" data-v171-nav="${id}"><b>${icon}</b><span>${label}</span></button>`;
  }

  function v171Today(){
    const s=stats(),f=focusHabit(),day=v13ArcDay(),L=v13ArcLength(),pct=v13ArcProgress();
    const habits=data.habits||[];
    return `<div class="v171-inner v171-content">
      <section class="v171-hero">
        <div class="v171-kicker">WINTER ARC · ${day?`DAY ${day}`:'SETUP DAY'}</div>
        <div class="v171-dayrow"><div class="v171-day">Day ${day}<span> / ${L}</span></div><div class="v171-pct">${pct}%<small>ARC</small></div></div>
        <div class="v171-progress"><i style="width:${Math.max(0,pct)}%"></i></div>
        <div class="v171-meta"><span>✅ ${s.todayDone}/${habits.length} today</span><span>🔥 ${Math.max(0,...habits.map(h=>habitStats(h).run))} streak</span><span>🏆 ${v13TotalWins()} wins</span></div>
      </section>
      <section class="v171-card">
        <div class="v171-cardhead"><div><h2>🎯 Next up</h2><div class="v171-sub">One action. Then you're done.</div></div><span class="v171-sub">${s.todayDone===habits.length&&habits.length?'Complete':'Today'}</span></div>
        ${f?`<div class="v171-focus"><div class="v171-focus-icon">${escapeHtml(f.icon)}</div><div class="v171-focus-copy"><b>${escapeHtml(f.name)}</b><span>${escapeHtml(f.smallWin||f.action||'Smallest useful version')}</span></div><button class="v171-check ${done(f,today())?'done':''}" data-toggle="${f.id}|${today()}" aria-label="Complete ${escapeHtml(f.name)}">${done(f,today())?'✓':'→'}</button></div>`:`<div class="v171-empty">Start by adding your first habit.</div>`}
        <div class="v171-actions"><button class="v171-action primary" data-v171-sprint-open>⏱️ Focus Sprint</button><button class="v171-action" data-v171-open-more="manage">＋ Add habit</button></div>
      </section>
      <section class="v171-card"><div class="v171-cardhead"><div><h2>✅ Today</h2><div class="v171-sub">Tap the check. No extra screens.</div></div><span class="v171-sub">${s.todayDone}/${habits.length}</span></div>
        <div class="v171-habits">${habits.length?habits.map(v171Habit).join(''):`<div class="v171-empty">Your first habit takes less than a minute to add.</div>`}</div>
      </section>
      ${s.todayDone===habits.length&&habits.length?`<section class="v171-card"><div class="v171-cardhead"><div><h2>🔥 Day complete</h2><div class="v171-sub">Nice. Stop here or open your Arc.</div></div></div><div class="v171-actions"><button class="v171-action primary" data-v171-nav="arc">View Arc</button><button class="v171-action" data-open-share-center>Share win ↗</button></div></section>`:''}
    </div>`;
  }

  function v171Habit(h){
    const d=today(),hs=habitStats(h),is=done(h,d);
    return `<article class="v171-habit"><div class="v171-hicon">${escapeHtml(h.icon||'✅')}</div><div class="v171-hmain"><div class="v171-hname">${escapeHtml(h.name)} ${h.private?'<span>🔒</span>':''}</div><div class="v171-hline">${escapeHtml(h.smallWin||h.action||'Smallest useful version')}</div><div class="v171-hstats"><span>🔥 ${hs.run} days</span><span>${hs.weekPct}% week</span><span>${hs.total} wins</span></div></div><button class="v171-mini-btn ${is?'done':''}" data-toggle="${h.id}|${d}" aria-label="${is?'Undo':'Complete'} ${escapeHtml(h.name)}">${is?'✓':'+'}</button></article>`;
  }

  function v171More(){
    if(morePanel){
      return `<div class="v171-inner v171-content"><section class="v171-card"><div class="v171-cardhead"><div><div class="v171-kicker" style="color:#3a7f50">TOOLS</div><h2 style="margin-top:3px">${escapeHtml(morePanel[0].toUpperCase()+morePanel.slice(1))}</h2></div><button class="v171-close" data-v171-more-close>×</button></div>${morePanel==='credits'?v171CreatorPage():panelHtml()}</section></div>`;
    }
    return `<div class="v171-inner v171-content">
      <section class="v171-card"><div class="v171-cardhead"><div><div class="v171-kicker" style="color:#3a7f50">MORE</div><h2 style="margin-top:3px">Everything else, without the clutter.</h2></div></div><div class="v171-actions"><button class="v171-action primary" data-v171-sprint-open>⏱️ Focus Sprint</button><button class="v171-action" data-open-share-center>↗ Share & invite</button></div></section>
      <section class="v171-card"><div class="v171-menu-grid">
        <button data-v171-open-more="manage">✅ <b>Manage habits</b><small>Add, edit or remove habits.</small></button>
        <button data-v171-open-more="goals">🎯 <b>Goals</b><small>Link habits to one goal.</small></button>
        <button data-v171-open-more="routine">🔁 <b>Routines</b><small>Run a sequence step by step.</small></button>
        <button data-v171-open-more="planner">🗓️ <b>Day planner</b><small>Set useful times.</small></button>
        <button data-v171-open-more="checkin">🌤️ <b>Mood & energy</b><small>Quick check-in.</small></button>
        <button data-v171-open-more="sleep">😴 <b>Sleep</b><small>Keep a simple log.</small></button>
        <button data-v171-open-more="journal">✍️ <b>Journal</b><small>One-line reflection.</small></button>
        <button data-v171-open-more="reminders">⏰ <b>Reminders</b><small>Time your next action.</small></button>
        <button data-v171-open-more="security">🔐 <b>Privacy</b><small>PIN & session lock.</small></button>
        <button data-v171-open-more="settings">⚙️ <b>Settings</b><small>Theme, backup, install.</small></button>
        <button data-v171-open-more="credits">❤️ <b>Credits</b><small>Meet the creator.</small></button>
        <button data-open-cloud>☁️ <b>Community</b><small>Optional sync.</small></button>
      </div></section>
      ${v171CreatorMini()}
    </div>`;
  }

  function v171CreatorMini(){
    const n=creatorName(),h=creatorHandle(),photo=data.creatorPhoto||'creator-profile.jpg';
    return `<section class="v171-creator-card"><button class="v171-creator-open" data-v171-profile-open><img src="${escapeHtml(photo)}" alt="${escapeHtml(n)}" loading="lazy"><span class="v171-creator-copy"><small>MADE WITH ❤️ BY</small><b>${escapeHtml(n)}</b>${h?`<span>${escapeHtml(h)}</span>`:''}</span></button><span class="v171-chevron">›</span></section>`;
  }

  function v171CreatorPage(){
    const n=creatorName(),h=creatorHandle(),link=safeHttpsUrl(data.creatorLink),bio=data.creatorBio||'Creator of Winter Arc Tracker';
    return `<div class="v171-profile-card" style="width:100%;box-shadow:none;border-radius:20px;padding:0;border:0"><button class="v171-creator-open" data-v171-profile-open style="width:100%;padding:0 0 10px"><img src="${escapeHtml(v171ProfilePhoto)}" alt="${escapeHtml(n)}" style="width:68px;height:68px;border-radius:18px;object-fit:cover"><span class="v171-creator-copy"><small>CREDITS</small><b>${escapeHtml(n)}</b>${h?`<span>${escapeHtml(h)}</span>`:''}</span></button><div class="v171-profile-info" style="padding-left:0;padding-right:0"><p>${escapeHtml(bio)}</p></div><div class="v171-profile-actions" style="margin-top:12px">${link?`<a href="${escapeHtml(link)}" target="_blank" rel="noopener" class="primary">Instagram ↗</a>`:''}<button data-open-share-center>Share Tracker ↗</button></div></div>`;
  }

  function v171ProfileModal(){
    const n=creatorName(),h=creatorHandle(),link=safeHttpsUrl(data.creatorLink),bio=data.creatorBio||'Hi, I’m the creator of Winter Arc Tracker.';
    const photos=['creator-profile.jpg','creator-photo-1.jpg','creator-photo-2.jpg','creator-photo-3.jpg'];
    return `<div class="v171-profile-overlay" data-v171-profile-close><div class="v171-profile-card" role="dialog" aria-modal="true" aria-label="Creator profile"><div class="v171-sheet-head"><div><div class="v171-kicker" style="color:#3a7f50">CREATOR PROFILE</div><h2 style="margin-top:3px">Meet ${escapeHtml(n)}</h2></div><button class="v171-close" data-v171-profile-close>×</button></div><div class="v171-profile-main"><img src="${escapeHtml(v171ProfilePhoto)}" alt="${escapeHtml(n)}"></div><div class="v171-profile-info"><h2>${escapeHtml(n)}</h2>${h?`<span class="v171-profile-handle">${escapeHtml(h)}</span>`:''}<p>${escapeHtml(bio)}</p></div><div class="v171-thumbs">${photos.map(p=>`<button class="${v171ProfilePhoto===p?'active':''}" data-v171-profile-photo="${escapeHtml(p)}"><img src="${escapeHtml(p)}" alt="Creator photo"></button>`).join('')}</div><div class="v171-profile-actions">${link?`<a class="primary" href="${escapeHtml(link)}" target="_blank" rel="noopener">Visit Instagram ↗</a>`:''}<button class="primary" data-open-share-center>Share Tracker ↗</button></div><div class="v171-note">Profile photos are part of the creator credit section. Tap any photo above to view it.</div></div></div>`;
  }

  function v171SprintModal(){
    let remaining=v171SprintRunning?Math.max(0,v171SprintEndsAt-Date.now()):v171SprintMinutes*60*1000;
    const sec=Math.ceil(remaining/1000),mm=String(Math.floor(sec/60)).padStart(2,'0'),ss=String(sec%60).padStart(2,'0');
    return `<div class="v171-sprint-overlay" data-v171-sprint-close><div class="v171-sheet v171-sprint" role="dialog" aria-modal="true"><div class="v171-sheet-head"><div><div class="v171-kicker" style="color:#3a7f50">FOCUS SPRINT</div><h2 style="margin-top:3px">One focused block.</h2></div><button class="v171-close" data-v171-sprint-close>×</button></div><div class="v171-timer" id="v171Timer">${mm}:${ss}</div><div class="v171-sprint-row">${[5,10,25].map(m=>`<button class="${v171SprintMinutes===m?'active':''}" data-v171-sprint-min="${m}" ${v171SprintRunning?'disabled':''}>${m} min</button>`).join('')}</div><div class="v171-actions" style="margin-top:12px">${v171SprintRunning?`<button class="v171-action primary" data-v171-sprint-stop>Finish sprint ✓</button>`:`<button class="v171-action primary" data-v171-sprint-start>Start ${v171SprintMinutes}-min sprint →</button>`}<button class="v171-action" data-v171-sprint-close>Not now</button></div><div class="v171-note">Use this for study, work, reading, walking or any single task. The timer is temporary and does not change your tracker history.</div></div></div>`;
  }

  function v171MenuSheet(){
    return `<div class="v171-menu-overlay" data-v171-menu-close><div class="v171-sheet" role="dialog" aria-modal="true"><div class="v171-sheet-head"><div><div class="v171-kicker" style="color:#3a7f50">WINTER ARC</div><h2>Go somewhere</h2></div><button class="v171-close" data-v171-menu-close>×</button></div><div class="v171-menu-grid"><button data-v171-nav="today">🏠 <b>Today</b><small>Your next action.</small></button><button data-v171-nav="week">📅 <b>Week</b><small>See this week's pattern.</small></button><button data-v171-nav="month">🗓️ <b>Month</b><small>Calendar history.</small></button><button data-v171-nav="arc">❄️ <b>Arc</b><small>See the full journey.</small></button><button data-v171-nav="more">••• <b>More</b><small>Tools & settings.</small></button></div></div></div>`;
  }

  function v171MainShell(){
    let body='';
    if(tab==='today')body=v171Today();
    else if(tab==='week')body=`<div class="v171-inner v171-content">${v14WeekPage()}</div>`;
    else if(tab==='month')body=`<div class="v171-inner v171-content">${v14MonthPage()}</div>`;
    else if(tab==='arc')body=`<div class="v171-inner v171-content">${v14ArcPage()}</div>`;
    else if(tab==='download')body=`<div class="v171-inner v171-content">${v16GetAppPage()}</div>`;
    else body=v171More();
    const s=stats(),day=v13ArcDay(),L=v13ArcLength(),pct=v13ArcProgress();
    return `<div class="v171-shell"><header class="v171-top"><div class="v171-toprow"><button class="v171-menu" data-v171-menu aria-label="Menu">☰</button><div class="v171-brand"><b>Winter Arc</b><span>DAY ${day} · ${pct}% complete · V18</span></div><button class="v171-topbtn" data-dark aria-label="Theme">${data.dark?'☀️':'◔'}</button><button class="v171-topbtn primary" data-open-share-center aria-label="Share">↗</button></div></header>${body}<nav class="v171-nav"><div class="v171-nav-inner">${v171NavButton('today','🏠','Today')}${v171NavButton('week','📅','Week')}${v171NavButton('arc','❄️','Arc')}${v171NavButton('more','•••','More')}</div></nav>${v171Menu?v171MenuSheet():''}${v171CreatorOpen?v171ProfileModal():''}${v171SprintOpen?v171SprintModal():''}</div>`;
  }

  function v171ClearSprint(){
    if(v171SprintTimer){clearInterval(v171SprintTimer);v171SprintTimer=null;}
  }
  function v171StartSprint(){
    v171SprintRunning=true;v171SprintEndsAt=Date.now()+v171SprintMinutes*60*1000;v171SprintOpen=true;
    v171ClearSprint();
    v171SprintTimer=setInterval(()=>{
      if(!v171SprintRunning){v171ClearSprint();return;}
      const left=Math.max(0,v171SprintEndsAt-Date.now());
      const el=document.getElementById('v171Timer');
      if(el){const sec=Math.ceil(left/1000);el.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
      if(left<=0){v171SprintRunning=false;v171ClearSprint();showToast('Focus sprint complete 🎯');render();}
    },250);
    render();
  }

  function v171StopSprint(){v171SprintRunning=false;v171ClearSprint();v171SprintOpen=false;render();showToast('Sprint finished 🎯');}

  v171EnsureViewport();
  v171Styles();

  const v14Shell=function(){return v171MainShell();};

  const v171OldRender=render;
  render=function(){
    v171EnsureViewport();
    v171Styles();
    document.body.classList.toggle('dark',!!data.dark);
    document.body.innerHTML=isLocked()?v17Locked():((!data.profileCreated||!data.onboardingDone)?v17Entry():v17MainShell());
    bindDomState();
  };

  document.addEventListener('pointerdown',e=>{
    const b=e.target.closest('button');if(!b)return;
    b.classList.add('v171-pressed');
  },{passive:true});
  document.addEventListener('pointerup',e=>{const b=e.target.closest('button');if(b)setTimeout(()=>b.classList.remove('v171-pressed'),70);},{passive:true});
  const press=document.createElement('style');press.textContent='.v171-pressed{transform:scale(.97)!important;transition:transform .06s ease!important;}';document.head.appendChild(press);

  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.v171Menu!==undefined){e.preventDefault();e.stopImmediatePropagation();v171Menu=true;render();return;}
    if(b.dataset.v171MenuClose!==undefined || (e.target.closest('.v171-menu-overlay')&&e.target===e.target.closest('.v171-menu-overlay'))){e.preventDefault();e.stopImmediatePropagation();v171Menu=false;render();return;}
    if(b.dataset.v171Nav!==undefined){e.preventDefault();e.stopImmediatePropagation();tab=b.dataset.v171Nav;morePanel='';v171Menu=false;render();return;}
    if(b.dataset.v171OpenMore!==undefined){e.preventDefault();e.stopImmediatePropagation();tab='more';morePanel=b.dataset.v171OpenMore;v171Menu=false;render();return;}
    if(b.dataset.v171MoreClose!==undefined){e.preventDefault();e.stopImmediatePropagation();morePanel='';render();return;}
    if(b.dataset.v171ProfileOpen!==undefined){e.preventDefault();e.stopImmediatePropagation();v171ProfilePhoto=data.creatorPhoto||'creator-profile.jpg';v171CreatorOpen=true;render();return;}
    if(b.dataset.v171ProfileClose!==undefined || (e.target.closest('.v171-profile-overlay')&&e.target===e.target.closest('.v171-profile-overlay'))){e.preventDefault();e.stopImmediatePropagation();v171CreatorOpen=false;render();return;}
    if(b.dataset.v171ProfilePhoto!==undefined){e.preventDefault();e.stopImmediatePropagation();v171ProfilePhoto=b.dataset.v171ProfilePhoto;render();return;}
    if(b.dataset.v171SprintOpen!==undefined){e.preventDefault();e.stopImmediatePropagation();v171SprintOpen=true;render();return;}
    if(b.dataset.v171SprintClose!==undefined || (e.target.closest('.v171-sprint-overlay')&&e.target===e.target.closest('.v171-sprint-overlay'))){e.preventDefault();e.stopImmediatePropagation();v171SprintOpen=false;v171ClearSprint();v171SprintRunning=false;render();return;}
    if(b.dataset.v171SprintMin!==undefined){e.preventDefault();e.stopImmediatePropagation();if(!v171SprintRunning){v171SprintMinutes=Number(b.dataset.v171SprintMin)||10;render();}return;}
    if(b.dataset.v171SprintStart!==undefined){e.preventDefault();e.stopImmediatePropagation();v171StartSprint();return;}
    if(b.dataset.v171SprintStop!==undefined){e.preventDefault();e.stopImmediatePropagation();v171StopSprint();return;}
  },{capture:true});

  /* Keep desktop-oriented legacy panes inside the mobile shell without width overflow. */
  document.addEventListener('click',e=>{
    const b=e.target.closest('a');
    if(!b)return;
  },{passive:true});
})();


/* ========================= V18 MAJOR UX =========================
   Mobile-first entry, unified completion action, My Profile, creator credit on first screen,
   simple sharing, and a calmer information hierarchy.
*/
(function(){
  const V18='V18.0';
  let v18Step=0;
  let v18Focus='discipline';
  let v18Habits=[];
  let v18CustomHabit='';
  let v18CreatorOpen=false;
  let v18CreatorPhoto='creator-profile.jpg';
  let v18SprintOpen=false;
  let v18SprintRunning=false;
  let v18SprintMinutes=10;
  let v18SprintEndsAt=0;
  let v18SprintTimer=null;

  const v18GoalMap={
    discipline:{icon:'🎯',label:'Build discipline'},
    study:{icon:'📚',label:'Study / work'},
    fitness:{icon:'💪',label:'Get fitter'},
    mind:{icon:'🧠',label:'Improve my mind'},
    personal:{icon:'✨',label:'Personal growth'}
  };

  function v18Style(){
    if(document.getElementById('v18-style'))return;
    const s=document.createElement('style');s.id='v18-style';
    s.textContent=`
      :root{--v18-green:#3da35d;--v18-green2:#2e7d49;--v18-soft:#eef7ef;--v18-bg:var(--bg,#f5f3ed);--v18-card:var(--card,#fff);--v18-line:var(--line,#e5e6df);--v18-muted:var(--muted,#727972);}
      html,body{margin:0;min-height:100%;width:100%;overflow-x:hidden;-webkit-text-size-adjust:100%;}
      body{background:var(--v18-bg);color:var(--ink,#202522);touch-action:manipulation;}
      button,a,input{font:inherit;-webkit-tap-highlight-color:transparent;touch-action:manipulation;}
      .v18-app{min-height:100dvh;padding-bottom:92px;background:var(--v18-bg)}
      .v18-wrap{width:min(100%,760px);margin:0 auto;padding:0 14px}
      .v18-top{position:sticky;top:0;z-index:25;background:color-mix(in srgb,var(--v18-bg) 90%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid color-mix(in srgb,var(--v18-line) 75%,transparent);padding:10px 12px}
      .v18-toprow{width:min(100%,760px);margin:auto;display:flex;align-items:center;gap:8px}.v18-brand{flex:1;min-width:0}.v18-brand b{display:block;font-size:17px;line-height:1.1;letter-spacing:-.02em}.v18-brand span{display:block;color:var(--v18-muted);font-size:9px;margin-top:3px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
      .v18-iconbtn{width:42px;height:42px;border:1px solid var(--v18-line);background:var(--v18-card);color:inherit;border-radius:14px;display:grid;place-items:center;font-size:18px}
      .v18-avatarbtn{width:42px;height:42px;border:1px solid var(--v18-line);background:var(--v18-card);color:#2d7d47;border-radius:14px;display:grid;place-items:center;font-size:15px;font-weight:950;overflow:hidden;padding:0}
      .v18-main{padding-top:12px}.v18-card{background:var(--v18-card);border:1px solid var(--v18-line);border-radius:21px;padding:15px;margin:10px 0;box-shadow:0 8px 24px rgba(30,44,34,.045)}
      .v18-hero{background:linear-gradient(145deg,#153f3a,#183b2c);color:#fff;border:0;padding:19px;box-shadow:0 18px 38px rgba(24,64,45,.16)}
      .v18-kicker{font-size:9px;letter-spacing:.14em;text-transform:uppercase;font-weight:950;color:#3b7e50}.v18-hero .v18-kicker{color:#b9e7c6}.v18-title{font-size:30px;line-height:1.02;letter-spacing:-.045em;margin:7px 0}.v18-sub{font-size:12px;line-height:1.5;color:var(--v18-muted);margin:0}.v18-hero .v18-sub{color:#d9ece1}
      .v18-bigday{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-top:16px}.v18-day{font-weight:950;font-size:34px;letter-spacing:-.05em;line-height:.95}.v18-day span{font-size:14px;opacity:.7;letter-spacing:0}.v18-pct{font-size:27px;font-weight:950}.v18-pct small{display:block;font-size:9px;opacity:.7;text-transform:uppercase;letter-spacing:.1em;text-align:right}
      .v18-progress{height:9px;background:rgba(255,255,255,.14);border-radius:999px;overflow:hidden;margin:15px 0 10px}.v18-progress i{display:block;height:100%;border-radius:inherit;background:#7bd29a}
      .v18-pillrow{display:flex;gap:6px;flex-wrap:wrap}.v18-pill{padding:7px 9px;border-radius:999px;background:rgba(255,255,255,.08);font-size:10px;font-weight:800;color:#d8eee4}
      .v18-sectionhead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.v18-sectionhead h2{margin:0;font-size:17px;letter-spacing:-.02em}.v18-muted{color:var(--v18-muted);font-size:10px}
      .v18-next{display:grid;grid-template-columns:46px 1fr 52px;gap:10px;align-items:center;background:var(--v18-soft);border:1px solid #d6e5d8;border-radius:18px;padding:12px}.v18-nexticon{width:46px;height:46px;border-radius:14px;background:#fff;display:grid;place-items:center;font-size:22px}.v18-nextcopy b{display:block;font-size:15px}.v18-nextcopy span{display:block;margin-top:3px;color:var(--v18-muted);font-size:10px;line-height:1.35}.v18-complete{width:52px;height:52px;border-radius:16px;border:1px solid #cfe1d2;background:#fff;color:#2f7f49;font-weight:950;font-size:21px}.v18-complete.done{background:var(--v18-green);border-color:var(--v18-green);color:#fff}
      .v18-habits{display:grid;gap:8px}.v18-habit{display:grid;grid-template-columns:40px 1fr 44px;gap:9px;align-items:center;padding:10px;border:1px solid var(--v18-line);border-radius:16px;background:var(--v18-card)}.v18-hicon{width:40px;height:40px;border-radius:12px;background:#f3f6f2;display:grid;place-items:center;font-size:19px}.v18-hmain{min-width:0}.v18-hmain b{display:block;font-size:13px}.v18-hmain small{display:block;margin-top:3px;color:var(--v18-muted);font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v18-hstats{display:flex;gap:7px;flex-wrap:wrap;margin-top:4px;color:var(--v18-muted);font-size:8px;font-weight:800}.v18-tick{width:44px;height:44px;border-radius:13px;border:1px solid #d9e4db;background:#fbfdfb;color:#2e7d49;font-size:19px;font-weight:950}.v18-tick.done{background:var(--v18-green);border-color:var(--v18-green);color:#fff}
      .v18-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v18-btn{min-height:44px;border-radius:14px;border:1px solid var(--v18-line);background:var(--v18-card);color:inherit;font-size:11px;font-weight:900;padding:10px}.v18-btn.primary{background:var(--v18-green);border-color:var(--v18-green);color:#fff}.v18-btn:active,.v18-tick:active,.v18-complete:active{transform:scale(.97)}
      .v18-nav{position:fixed;left:0;right:0;bottom:0;z-index:35;padding:7px 10px calc(7px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--v18-card) 94%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid var(--v18-line)}.v18-navinner{width:min(100%,760px);margin:auto;display:grid;grid-template-columns:repeat(4,1fr);gap:5px}.v18-nav button{min-height:56px;border:0;background:transparent;border-radius:15px;color:var(--v18-muted);font-size:9px;font-weight:900;display:grid;place-items:center;gap:2px}.v18-nav button b{font-size:18px}.v18-nav button.active{background:var(--v18-soft);color:#2d7d47}
      .v18-statgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.v18-stat{background:#f6f8f5;border:1px solid var(--v18-line);border-radius:16px;padding:12px}.v18-stat b{display:block;font-size:21px}.v18-stat span{display:block;color:var(--v18-muted);font-size:9px;margin-top:3px}.v18-profilehero{display:grid;grid-template-columns:70px 1fr;gap:12px;align-items:center}.v18-profilephoto{width:70px;height:70px;border-radius:20px;background:#eef5ef;color:#2d7d47;display:grid;place-items:center;font-size:25px;font-weight:950}.v18-profilehero h1{margin:0;font-size:23px;letter-spacing:-.04em}.v18-profilehero p{margin:4px 0 0;color:var(--v18-muted);font-size:10px}
      .v18-sharecard{background:linear-gradient(145deg,#234f57,#183a2a);color:#fff;border-radius:22px;padding:17px;min-height:205px;display:flex;flex-direction:column;justify-content:space-between}.v18-sharecard small{letter-spacing:.12em;color:#bfe8ca;font-weight:900;font-size:8px}.v18-sharecard strong{display:block;font-size:38px;letter-spacing:-.05em;line-height:1}.v18-sharecard span{font-size:10px;color:#d5e9dd}.v18-sharestats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.v18-sharestats div{background:rgba(255,255,255,.08);border-radius:12px;padding:8px}.v18-sharestats b{display:block;font-size:15px}.v18-sharestats small{display:block;color:#cfe4d6;letter-spacing:0;margin-top:2px;font-size:8px}
      .v18-achievements{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v18-ach{padding:11px;border:1px solid var(--v18-line);border-radius:15px;background:var(--v18-card)}.v18-ach b{display:block;font-size:11px}.v18-ach span{display:block;color:var(--v18-muted);font-size:9px;margin-top:3px}
      .v18-creator{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid var(--v18-line);background:var(--v18-card);border-radius:17px;width:100%;text-align:left}.v18-creator img{width:49px;height:49px;border-radius:15px;object-fit:cover;flex:none}.v18-creatorcopy{flex:1;min-width:0}.v18-creatorcopy small{display:block;color:var(--v18-muted);font-size:8px;font-weight:900;letter-spacing:.08em}.v18-creatorcopy b{display:block;font-size:12px;margin-top:2px}.v18-creatorcopy span{display:block;color:#2d7d47;font-size:9px;font-weight:850;margin-top:2px}.v18-arrow{font-size:20px;color:var(--v18-muted)}
      .v18-overlay{position:fixed;inset:0;z-index:80;background:rgba(8,14,10,.5);display:flex;align-items:flex-end;justify-content:center;padding:10px}.v18-sheet{width:min(100%,700px);max-height:92dvh;overflow:auto;background:var(--v18-card);color:var(--ink,#202522);border-radius:25px 25px 16px 16px;padding:15px;box-shadow:0 24px 80px rgba(0,0,0,.25)}.v18-sheethead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.v18-close{width:40px;height:40px;border:1px solid var(--v18-line);background:var(--v18-card);border-radius:13px;font-size:20px}.v18-mainphoto{width:100%;aspect-ratio:1/1;border-radius:20px;object-fit:cover;background:#eef2ed}.v18-thumbs{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:8px}.v18-thumb{padding:0;aspect-ratio:1;border:2px solid transparent;border-radius:13px;overflow:hidden;background:#eef2ed}.v18-thumb.active{border-color:var(--v18-green)}.v18-thumb img{width:100%;height:100%;object-fit:cover}.v18-formgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v18-label{font-size:10px;color:var(--v18-muted);font-weight:850}.v18-input{width:100%;height:46px;margin-top:5px;border:1px solid var(--v18-line);border-radius:13px;background:var(--v18-card);color:inherit;padding:10px;outline:none}.v18-goals{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:12px 0}.v18-choice{min-height:74px;text-align:left;border:1px solid var(--v18-line);background:var(--v18-card);border-radius:16px;padding:12px}.v18-choice.selected{background:var(--v18-soft);border-color:#9fc7a8}.v18-choice span{display:block;font-size:21px}.v18-choice b{display:block;margin-top:5px;font-size:11px}.v18-choice small{display:block;color:var(--v18-muted);font-size:8px;margin-top:2px}
      .v18-entry{min-height:100dvh;display:grid;place-items:center;padding:14px;background:radial-gradient(circle at 50% -10%,rgba(61,163,93,.14),transparent 38%),var(--v18-bg)}.v18-entrycard{width:min(100%,520px);background:var(--v18-card);border:1px solid var(--v18-line);border-radius:27px;padding:21px;box-shadow:0 18px 60px rgba(20,30,24,.10)}.v18-entryhero{text-align:center;padding:9px 6px 14px}.v18-logo{width:64px;height:64px;border-radius:20px;background:var(--v18-green);color:#fff;display:grid;place-items:center;font-size:30px;margin:0 auto 13px;box-shadow:0 12px 30px rgba(61,163,93,.25)}.v18-entryhero h1{font-size:31px;line-height:1.02;letter-spacing:-.05em;margin:8px 0}.v18-entryhero p{margin:0;color:var(--v18-muted);font-size:12px;line-height:1.5}.v18-entrycredit{margin:15px 0 12px}.v18-entrycredit label{display:block;color:var(--v18-muted);font-size:8px;letter-spacing:.1em;font-weight:900;margin-bottom:6px}.v18-entrycredit button{width:100%;border:1px solid var(--v18-line);background:#f8faf7;border-radius:16px;padding:9px;display:flex;align-items:center;gap:9px;text-align:left}.v18-entrycredit img{width:43px;height:43px;border-radius:14px;object-fit:cover}.v18-entrycredit b{display:block;font-size:11px}.v18-entrycredit span{display:block;color:var(--v18-muted);font-size:9px;margin-top:2px}.v18-entrycredit strong{margin-left:auto;color:#2d7d47;font-size:18px}.v18-steps{display:flex;justify-content:center;gap:5px;margin:5px 0 13px}.v18-dot{width:7px;height:7px;border-radius:50%;background:#dfe5df}.v18-dot.on{background:var(--v18-green);transform:scale(1.15)}.v18-setuphead h1{margin:0;font-size:27px;letter-spacing:-.045em}.v18-setuphead p{margin:5px 0;color:var(--v18-muted);font-size:11px;line-height:1.45}.v18-habitpicks{display:grid;gap:7px;margin:12px 0}.v18-pick{display:flex;align-items:center;gap:9px;border:1px solid var(--v18-line);background:var(--v18-card);border-radius:15px;padding:10px;text-align:left}.v18-pick.selected{background:var(--v18-soft);border-color:#9fc7a8}.v18-pickicon{width:38px;height:38px;border-radius:11px;background:#f3f6f2;display:grid;place-items:center;font-size:18px;flex:none}.v18-pickcopy{flex:1;min-width:0}.v18-pickcopy b{display:block;font-size:11px}.v18-pickcopy small{display:block;color:var(--v18-muted);font-size:8px;margin-top:2px}.v18-pickmark{font-size:19px;color:#2d7d47;font-weight:950}
      @media(max-width:540px){.v18-wrap{padding:0 9px}.v18-top{padding-left:8px;padding-right:8px}.v18-title{font-size:28px}.v18-entrycard{padding:18px 15px}.v18-goals{grid-template-columns:1fr 1fr}.v18-formgrid{grid-template-columns:1fr}}
      @media(min-width:900px){.v18-wrap{width:min(100%,900px)}.v18-main{display:grid;grid-template-columns:1.15fr .85fr;gap:10px;align-items:start}.v18-main>.v18-card{margin:0}.v18-wide{grid-column:1/-1}.v18-navinner{width:min(100%,900px)}.v18-toprow{width:min(100%,900px)}}
      body.dark .v18-choice,body.dark .v18-pick,body.dark .v18-entrycredit button,body.dark .v18-stat,body.dark .v18-habit{background:#151a16}body.dark .v18-pickicon,body.dark .v18-nexticon{background:#202a22}
    `;
    document.head.appendChild(s);
  }

  function v18CreatorCard(){
    const n=creatorName(),h=creatorHandle(),photo=data.creatorPhoto||'creator-profile.jpg';
    return `<div class="v18-entrycredit"><label>BUILT BY</label><button type="button" data-v18-creator-open aria-label="Open creator profile"><span class="v25-credit-photo"><img src="./${escapeHtml(photo.replace(/^\.\//,''))}" alt="${escapeHtml(n)}" onerror="this.hidden=true;this.parentElement.classList.add('fallback')"><b>${escapeHtml((n||'V').slice(0,2).toUpperCase())}</b></span><span><b>${escapeHtml(n)}</b>${h?`<span>${escapeHtml(h)}</span>`:''}<span>Creator of Winter Arc Tracker</span></span><strong>›</strong></button></div>`;
  }

  function v18Welcome(){
    return `<div class="v18-entry"><div class="v18-entrycard"><div class="v18-entryhero"><div class="v18-logo">❄️</div>${v18CreatorCard()}<div class="v18-kicker">WINTER ARC · 2026</div><h1>Your next 92 days.</h1><p>One simple place for your habits, streaks and small wins.</p></div><div class="v18-steps"><i class="v18-dot on"></i><i class="v18-dot"></i><i class="v18-dot"></i></div><button class="v18-btn primary" style="width:100%;min-height:50px" data-v18-next>🚀 Start my Arc</button><button class="v18-btn" style="width:100%;margin-top:7px" data-v18-existing>↪ I already have an Arc</button><p class="v18-muted" style="text-align:center;margin:11px 0 0">Start simple. Change anything later.</p></div></div>`;
  }

  function v18Setup(){
    const goals=Object.entries(v18GoalMap);
    return `<div class="v18-entry"><div class="v18-entrycard"><div class="v18-steps"><i class="v18-dot on"></i><i class="v18-dot on"></i><i class="v18-dot"></i></div><div class="v18-setuphead"><div class="v18-kicker">QUICK SETUP</div><h1>Let’s make this your Arc.</h1><p>Just two things. You can customize the rest after you start.</p></div><div style="margin-top:13px"><label class="v18-label">YOUR NAME<input id="v18Name" class="v18-input" autocomplete="name" placeholder="Your name" value="${escapeHtml(data.name||'')}"></label></div><div style="margin-top:13px"><label class="v18-label">WHAT DO YOU WANT TO IMPROVE?</label><div class="v18-goals">${goals.map(([id,g])=>`<button type="button" class="v18-choice ${v18Focus===id?'selected':''}" data-v18-goal="${id}"><span>${g.icon}</span><b>${escapeHtml(g.label)}</b><small>${id==='discipline'?'Build a consistent routine':id==='study'?'Study or work better':id==='fitness'?'Move more and feel stronger':id==='mind'?'Calmer, clearer days':'Choose your own direction'}</small></button>`).join('')}</div></div><div class="v18-actions" style="margin-top:13px"><button class="v18-btn" data-v18-back>Back</button><button class="v18-btn primary" data-v18-next>Choose habits →</button></div></div></div>`;
  }

  function v18HabitList(){
    const map={
      discipline:['Study / Work','Exercise','Less Phone'],
      study:['Study / Work','Read','Less Phone'],
      fitness:['Exercise','Walk','Healthy Food'],
      mind:['Meditation','Read','Less Phone'],
      personal:['Read','Exercise','Meditation']
    };
    const names=[...(map[v18Focus]||map.discipline),...PRESETS.filter(x=>!x.private).map(x=>x.name)].filter((x,i,a)=>a.indexOf(x)===i).slice(0,7);
    if(!v18Habits.length)v18Habits=map[v18Focus]||map.discipline;
    return names.map(name=>{const p=preset(name);const sel=v18Habits.includes(name);return `<button type="button" class="v18-pick ${sel?'selected':''}" data-v18-habit="${escapeHtml(name)}"><span class="v18-pickicon">${escapeHtml(p?.icon||'✅')}</span><span class="v18-pickcopy"><b>${escapeHtml(name)}</b><small>${escapeHtml(p?.action||'Do the smallest useful version')}</small></span><strong class="v18-pickmark">${sel?'✓':'+'}</strong></button>`}).join('');
  }

  function v18HabitsStep(){
    return `<div class="v18-entry"><div class="v18-entrycard"><div class="v18-steps"><i class="v18-dot on"></i><i class="v18-dot on"></i><i class="v18-dot on"></i></div><div class="v18-setuphead"><div class="v18-kicker">FIRST WINS</div><h1>We picked a simple start.</h1><p>Start with <b>3 habits</b>. You can add more anytime.</p></div><div class="v18-habitpicks">${v18HabitList()}</div><div class="v18-actions"><button class="v18-btn" data-v18-back>Back</button><button class="v18-btn primary" data-v18-finish ${v18Habits.length?'':'disabled'}>Start my Arc 🚀</button></div></div></div>`;
  }

  function v18Ready(){
    const h=data.habits[0];
    return `<div class="v18-entry"><div class="v18-entrycard"><div class="v18-entryhero"><div class="v18-logo" style="font-size:28px">✓</div><div class="v18-kicker">YOUR ARC IS READY</div><h1>Let’s make today count.</h1><p>${escapeHtml(data.name||'You')}, your first action is ready. No perfect plan needed.</p></div><div class="v18-statgrid"><div class="v18-stat"><b>92</b><span>days</span></div><div class="v18-stat"><b>${data.habits.length}</b><span>habits</span></div><div class="v18-stat"><b>1</b><span>focus</span></div></div><div class="v18-next" style="margin-top:12px"><div class="v18-nexticon">${escapeHtml(h?.icon||'🎯')}</div><div class="v18-nextcopy"><b>${escapeHtml(h?.name||'First win')}</b><span>${escapeHtml(h?.action||'Do the smallest useful version')}</span></div><span style="font-size:24px">→</span></div><button class="v18-btn primary" style="width:100%;margin-top:13px;min-height:50px" data-v18-enter>Start Today →</button><button class="v18-btn" style="width:100%;margin-top:7px" data-v18-community>🌍 Join the community</button><p class="v18-muted" style="text-align:center;margin:10px 0 0">Community is optional. Your tracker works without it.</p></div></div>`;
  }

  function v18Entry(){if(v18Step===0)return v18Welcome();if(v18Step===1)return v18Setup();if(v18Step===2)return v18HabitsStep();return v18Ready();}

  function v18ProfilePage(){
    const s=stats(),day=v13ArcDay(),L=v13ArcLength(),pct=v13ArcProgress(),best=Math.max(0,...data.habits.map(h=>habitStats(h).longest)),wins=v13TotalWins();
    const goal=v18GoalMap[data.goal]?.label||data.goal||'Your focus'; const initial=escapeHtml((data.name||'A').slice(0,1).toUpperCase());
    const ach=achievements().filter(x=>x[1]).slice(0,6);
    return `<div class="v18-wrap v18-main"><section class="v18-card v18-wide"><div class="v18-profilehero"><div class="v18-profilephoto" aria-hidden="true">${initial}</div><div><div class="v18-kicker">MY PROFILE</div><h1>${escapeHtml(data.name||'Your Arc')}</h1><p>${escapeHtml(goal)} · Winter Arc 2026</p></div></div><div class="v18-bigday" style="margin-top:15px;color:var(--ink,#202522)"><div class="v18-day" style="font-size:28px">DAY ${day||0} <span>/ ${L}</span></div><div class="v18-pct" style="font-size:25px">${pct}%<small>Arc</small></div></div><div class="v18-progress" style="background:#e4ebe5"><i style="width:${Math.min(100,pct)}%"></i></div><div class="v18-actions" style="margin-top:12px"><button class="v18-btn primary" data-v18-share-profile>↗ Share My Arc</button><button class="v18-btn" data-v18-nav="today">Today →</button></div></section><section class="v18-card"><div class="v18-sectionhead"><h2>Your numbers</h2><span class="v18-muted">All time</span></div><div class="v18-statgrid"><div class="v18-stat"><b>${s.todayDone}/${data.habits.length}</b><span>Today</span></div><div class="v18-stat"><b>${best}🔥</b><span>Best streak</span></div><div class="v18-stat"><b>${wins}</b><span>Arc wins</span></div></div></section><section class="v18-card"><div class="v18-sectionhead"><h2>🏆 Achievements</h2><span class="v18-muted">${ach.length} unlocked</span></div><div class="v18-achievements">${(ach.length?ach:[['First win',s.completed>0],['3-day streak',best>=3]]).map(([name,on])=>`<div class="v18-ach"><b>🏆 ${escapeHtml(name)}</b><span>Unlocked on your journey</span></div>`).join('')}</div></section><section class="v18-card"><div class="v18-sectionhead"><h2>❄️ My Journey</h2><span class="v18-muted">Day ${journeyDay()}</span></div><div class="v18-sharecard"><small>WINTER ARC 2026 · ${escapeHtml((data.name||'MY ARC').toUpperCase())}</small><strong>DAY ${day||0}/${L}</strong><span>Keep your next small win moving.</span><div class="v18-sharestats"><div><b>${pct}%</b><small>Arc</small></div><div><b>${best}</b><small>Best streak</small></div><div><b>${wins}</b><small>Wins</small></div></div></div><button class="v18-btn primary" style="width:100%;margin-top:9px" data-v18-share-profile>Share this card ↗</button></section></div>`;
  }

  function v18Today(){
    const s=stats(),day=v13ArcDay(),L=v13ArcLength(),pct=s.todayDone&&data.habits.length?Math.round(s.todayDone/data.habits.length*100):0,f=focusHabit();
    return `<div class="v18-wrap v18-main"><section class="v18-card v18-hero v18-wide"><div class="v18-kicker">${day?`WINTER ARC · DAY ${day}`:'WINTER ARC · STARTING SOON'}</div><div class="v18-bigday"><div class="v18-day">DAY ${day||0} <span>/ ${L}</span></div><div class="v18-pct">${pct}%<small>today</small></div></div><div class="v18-progress"><i style="width:${pct}%"></i></div><div class="v18-pillrow"><span class="v18-pill">${s.todayDone}/${data.habits.length} complete</span><span class="v18-pill">🔥 ${Math.max(0,...data.habits.map(h=>habitStats(h).run))} best</span></div></section><section class="v18-card"><div class="v18-sectionhead"><div><h2>🎯 Next up</h2><span class="v18-muted">One action. Then the next.</span></div></div>${f?`<div class="v18-next"><div class="v18-nexticon">${escapeHtml(f.icon)}</div><div class="v18-nextcopy"><b>${escapeHtml(f.name)}</b><span>${escapeHtml(f.smallWin||f.action||'Smallest useful version')}</span></div><button class="v18-complete ${done(f,today())?'done':''}" data-v18-complete="${escapeHtml(f.id)}">${done(f,today())?'✓':'→'}</button></div>`:'<div class="v18-sub">Add a habit to get your first action.</div>'}<div class="v18-actions" style="margin-top:10px"><button class="v18-btn primary" data-v18-sprint>⏱️ Focus Sprint</button><button class="v18-btn" data-v18-nav="profile">👤 My Profile</button></div></section><section class="v18-card"><div class="v18-sectionhead"><h2>✅ Today</h2><span class="v18-muted">Tap once</span></div><div class="v18-habits">${data.habits.length?data.habits.map(h=>{const d=today(),is=done(h,d),hs=habitStats(h);return `<article class="v18-habit"><div class="v18-hicon">${escapeHtml(h.icon||'✅')}</div><div class="v18-hmain"><b>${escapeHtml(h.name)}</b><small>${escapeHtml(h.action||'Smallest useful version')}</small><div class="v18-hstats"><span>🔥 ${hs.run}</span><span>${hs.weekPct}% week</span></div></div><button class="v18-tick ${is?'done':''}" data-v18-complete="${escapeHtml(h.id)}" aria-label="${is?'Undo':'Complete'} ${escapeHtml(h.name)}">${is?'✓':'+'}</button></article>`}).join(''):'<div class="v18-sub">Your first habit can be added in one tap.</div>'}</div></section>${s.todayDone===data.habits.length&&data.habits.length?`<section class="v18-card"><div class="v18-sectionhead"><div><h2>🔥 Day complete</h2><span class="v18-muted">Nice work. Save the moment.</span></div></div><div class="v18-actions"><button class="v18-btn primary" data-v18-share-profile>Share win ↗</button><button class="v18-btn" data-v18-sprint>Focus again</button></div></section>`:''}</div>`;
  }

  function v18More(){
    if(morePanel){
      return `<div class="v18-wrap v18-main"><section class="v18-card v18-wide"><div class="v18-sectionhead"><div><div class="v18-kicker">TOOLS</div><h2>${escapeHtml(morePanel[0].toUpperCase()+morePanel.slice(1))}</h2></div><button class="v18-iconbtn" data-v18-more-close>×</button></div>${morePanel==='credits'?v18CreatorPanel():panelHtml()}</section></div>`;
    }
    return `<div class="v18-wrap v18-main"><section class="v18-card v18-wide"><div class="v18-sectionhead"><div><div class="v18-kicker">MORE</div><h2>Everything else, kept simple.</h2></div></div><div class="v18-actions"><button class="v18-btn primary" data-v18-sprint>⏱️ Focus Sprint</button><button class="v18-btn" data-v18-share-profile>↗ Share My Arc</button></div></section><section class="v18-card"><div class="v18-sectionhead"><h2>Tools</h2><span class="v18-muted">Open when needed</span></div><div class="v18-goals"><button class="v18-choice" data-v18-more="manage"><span>✅</span><b>Habits</b><small>Add or edit habits</small></button><button class="v18-choice" data-v18-more="goals"><span>🎯</span><b>Goals</b><small>Set your direction</small></button><button class="v18-choice" data-v18-more="routine"><span>🔁</span><b>Routines</b><small>Run steps in order</small></button><button class="v18-choice" data-v18-more="checkin"><span>🌤️</span><b>Check-in</b><small>Mood & energy</small></button><button class="v18-choice" data-v18-more="journal"><span>✍️</span><b>Journal</b><small>One-line reflection</small></button><button class="v18-choice" data-v18-more="settings"><span>⚙️</span><b>Settings</b><small>Data, theme & install</small></button></div></section><section class="v18-card"><div class="v18-sectionhead"><h2>🌍 Community</h2><span class="v18-muted">Optional</span></div><p class="v18-sub">Share only what you choose. Core tracking remains local.</p><button class="v18-btn primary" style="width:100%;margin-top:9px" data-open-cloud>Join / manage community ↗</button></section>${v18CreatorCard()}</div>`;
  }

  function v18CreatorPanel(){
    const n=creatorName(),h=creatorHandle(),link=safeHttpsUrl(data.creatorLink),bio=data.creatorBio||'Creator of Winter Arc Tracker';
    return `<div><img class="v18-mainphoto" style="aspect-ratio:1.25/1;object-position:center" src="${escapeHtml(v18CreatorPhoto)}" alt="${escapeHtml(n)}"><div style="padding:12px 2px 5px"><div class="v18-kicker">CREDITS</div><h2 style="margin:4px 0;font-size:23px">${escapeHtml(n)}</h2>${h?`<div class="v18-muted" style="color:#2d7d47;font-weight:900">${escapeHtml(h)}</div>`:''}<p class="v18-sub" style="margin-top:6px">${escapeHtml(bio)}</p></div><div class="v18-thumbs">${['creator-profile.jpg','creator-photo-1.jpg','creator-photo-2.jpg','creator-photo-3.jpg'].map(x=>`<button type="button" class="v18-thumb ${v18CreatorPhoto===x?'active':''}" data-v18-creator-photo="${escapeHtml(x)}"><img src="${escapeHtml(x)}" alt="Creator photo"></button>`).join('')}</div><div class="v18-actions" style="margin-top:10px">${link?`<a class="v18-btn primary" href="${escapeHtml(link)}" target="_blank" rel="noopener" style="display:grid;place-items:center;text-decoration:none">Instagram ↗</a>`:''}<button class="v18-btn ${link?'':'primary'}" data-v18-share-profile>Share Tracker ↗</button></div></div>`;
  }

  function v18CreatorModal(){
    const n=creatorName(),h=creatorHandle(),link=safeHttpsUrl(data.creatorLink),bio=data.creatorBio||'Creator of Winter Arc Tracker';
    return `<div class="v18-overlay" data-v18-creator-close><div class="v18-sheet" role="dialog" aria-modal="true"><div class="v18-sheethead"><div><div class="v18-kicker">CREATOR PROFILE</div><h2 style="margin:3px 0">Meet ${escapeHtml(n)}</h2></div><button class="v18-close" data-v18-creator-close>×</button></div><img class="v18-mainphoto" src="${escapeHtml(v18CreatorPhoto)}" alt="${escapeHtml(n)}"><div style="padding:11px 2px 3px"><h2 style="margin:0;font-size:21px">${escapeHtml(n)}</h2>${h?`<div style="margin-top:4px;color:#2d7d47;font-size:11px;font-weight:900">${escapeHtml(h)}</div>`:''}<p class="v18-sub" style="margin-top:6px">${escapeHtml(bio)}</p></div><div class="v18-thumbs">${['creator-profile.jpg','creator-photo-1.jpg','creator-photo-2.jpg','creator-photo-3.jpg'].map(x=>`<button type="button" class="v18-thumb ${v18CreatorPhoto===x?'active':''}" data-v18-creator-photo="${escapeHtml(x)}"><img src="${escapeHtml(x)}" alt="Creator photo"></button>`).join('')}</div><div class="v18-actions" style="margin-top:10px">${link?`<a class="v18-btn primary" href="${escapeHtml(link)}" target="_blank" rel="noopener" style="display:grid;place-items:center;text-decoration:none">Instagram ↗</a>`:''}<button class="v18-btn ${link?'':'primary'}" data-v18-share-profile>Share Winter Arc ↗</button></div></div></div>`;
  }

  function v18SprintModal(){ const left=v18SprintRunning?Math.max(0,v18SprintEndsAt-Date.now()):v18SprintMinutes*60000; const sec=Math.ceil(left/1000),mm=String(Math.floor(sec/60)).padStart(2,'0'),ss=String(sec%60).padStart(2,'0'); return `<div class="v18-overlay" data-v18-sprint-close><div class="v18-sheet" style="text-align:center"><div class="v18-sheethead"><div><div class="v18-kicker">FOCUS SPRINT</div><h2 style="margin:3px 0">One focused block.</h2></div><button class="v18-close" data-v18-sprint-close>×</button></div><div id="v18SprintTimer" style="font-size:52px;font-weight:950;letter-spacing:-.05em;margin:12px 0">${mm}:${ss}</div>${v18SprintRunning?'':`<div class="v18-actions"><button class="v18-btn primary" data-v18-sprint-start>Start ${v18SprintMinutes}-min sprint →</button><button class="v18-btn" data-v18-sprint-close>Not now</button></div>`}<div style="margin-top:8px">${v18SprintRunning?`<button class="v18-btn primary" style="width:100%" data-v18-sprint-stop>Finish sprint ✓</button>`:''}</div><p class="v18-sub" style="margin-top:10px">A temporary timer for one task. It does not change tracker history.</p></div></div>`;}
  function v18SprintStop(){v18SprintRunning=false;if(v18SprintTimer)clearInterval(v18SprintTimer);v18SprintTimer=null;v18SprintOpen=false;render();showToast('Sprint finished 🎯');}
  function v18SprintStart(){v18SprintRunning=true;v18SprintEndsAt=Date.now()+v18SprintMinutes*60000;v18SprintOpen=true;if(v18SprintTimer)clearInterval(v18SprintTimer);v18SprintTimer=setInterval(()=>{const left=Math.max(0,v18SprintEndsAt-Date.now());const el=document.getElementById('v18SprintTimer');if(el){const sec=Math.ceil(left/1000);el.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}if(left<=0){v18SprintRunning=false;clearInterval(v18SprintTimer);v18SprintTimer=null;v18SprintOpen=false;render();showToast('Focus sprint complete 🎯');}},250);render();}

  async function v18ShareProfile(){
    try{
      const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');
      const s=stats(),day=v13ArcDay(),L=v13ArcLength(),pct=v13ArcProgress(),best=Math.max(0,...data.habits.map(h=>habitStats(h).longest)),wins=v13TotalWins();
      ctx.fillStyle='#f5f3ed';ctx.fillRect(0,0,1080,1350);
      const g=ctx.createLinearGradient(0,0,0,700);g.addColorStop(0,'#234f57');g.addColorStop(1,'#183a2a');ctx.fillStyle=g;ctx.fillRect(48,48,984,700);
      const text=(t,x,y,size,weight='700',fill='#fff')=>{ctx.fillStyle=fill;ctx.font=`${weight} ${size}px Arial,sans-serif`;ctx.fillText(t,x,y)};
      text('WINTER ARC 2026',92,125,30,'800','#bfe8ca');text((data.name||'MY ARC').toUpperCase(),92,245,46,'900','#fff');text(`DAY ${day||0} / ${L}`,92,325,74,'900','#fff');text(`${pct}% OF THE ARC`,92,370,28,'700','#d7e9df');
      ctx.fillStyle='rgba(255,255,255,.16)';ctx.fillRect(92,425,896,24);ctx.fillStyle='#79d29b';ctx.fillRect(92,425,896*Math.min(1,pct/100),24);
      text('YOUR PROGRESS',92,560,22,'800','#bfe8ca');text(`${s.todayDone}/${data.habits.length} today`,92,615,44,'900','#fff');text(`🔥 ${best} day best streak`,92,660,28,'700','#d7e9df');
      ctx.fillStyle='#fff';ctx.roundRect?.(48,800,984,420,36);if(ctx.roundRect)ctx.fill();else{ctx.fillRect(48,800,984,420)}
      text('MY ARC',92,870,18,'900','#3a7f50');text('Small wins become your story.',92,930,42,'900','#1f2421');
      ctx.fillStyle='#f2f6f2';ctx.fillRect(92,1000,276,120);ctx.fillRect(402,1000,276,120);ctx.fillRect(712,1000,276,120);
      text(`${pct}%`,120,1065,34,'900','#202522');text('Arc',120,1095,16,'700','#70766f');text(`${best}`,430,1065,34,'900','#202522');text('Best streak',430,1095,16,'700','#70766f');text(`${wins}`,740,1065,34,'900','#202522');text('Wins',740,1095,16,'700','#70766f');
      text('Winter Arc Tracker',92,1175,22,'800','#3a7f50');text('Share your next small win.',988,1175,22,'700','#70766f');
      const blob=await new Promise(r=>canvas.toBlob(r,'image/png',.95));const file=new File([blob],'winter-arc-profile-v18.png',{type:'image/png'});
      const msg=`I’m on Winter Arc 2026 ❄️ Day ${day||0}/${L} · ${pct}% complete · 🔥 ${best} day best streak\n\nJoin my Arc: ${location.href}`;
      if(navigator.share){if(navigator.canShare?.({files:[file]})){try{await navigator.share({title:'My Winter Arc',text:msg,files:[file]});return;}catch(e){}}try{await navigator.share({title:'My Winter Arc',text:msg});return;}catch(e){}}
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='winter-arc-profile-v18.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);showToast('Profile card saved ↗');
    }catch(e){showToast('Could not create profile card');}
  }

  function v18Locked(){
    return `<div class="v18-entry"><div class="v18-entrycard"><div class="v18-entryhero"><div class="v18-logo">❄️</div><div class="v18-kicker">WELCOME BACK</div><h1>Continue your Arc.</h1><p>Your progress is ready on this device.</p></div><div style="width:62px;height:62px;border-radius:18px;background:var(--v18-soft);color:#2d7d47;display:grid;place-items:center;font-weight:950;font-size:25px;margin:0 auto 9px">${escapeHtml((data.name||'A').slice(0,1).toUpperCase())}</div><div style="text-align:center;font-weight:900;font-size:12px;margin-bottom:12px">${escapeHtml(data.name||'Your profile')}</div><input id="loginPin" class="v18-input" type="password" inputmode="numeric" maxlength="6" autocomplete="current-password" placeholder="4–6 digit PIN" style="text-align:center;letter-spacing:.3em"><button class="v18-btn primary" style="width:100%;margin-top:8px;min-height:50px" data-login>Unlock 🔓</button><button class="v18-btn" style="width:100%;margin-top:7px" data-forgot-pin>Reset this profile</button><p class="v18-muted" style="text-align:center;margin:10px 0 0">Your local profile stays on this device.</p></div></div>`;
  }

  function v18Render(){
    v18Style();document.body.classList.toggle('dark',!!data.dark);
    if(isLocked()){
      document.body.innerHTML=v18Locked();
      return;
    }
    if(!data.profileCreated||!data.onboardingDone){document.body.innerHTML=v18Entry();return;}
    let body=tab==='today'?v18Today():tab==='profile'?v18ProfilePage():tab==='week'?`<div class="v18-wrap v18-main"><div class="v18-card v18-wide">${v14WeekPage()}</div></div>`:tab==='arc'?`<div class="v18-wrap v18-main"><div class="v18-card v18-wide">${v14ArcPage()}</div></div>`:v18More();
    document.body.innerHTML=`<div class="v18-app"><header class="v18-top"><div class="v18-toprow"><button class="v18-iconbtn" data-v18-menu>☰</button><div class="v18-brand"><b>Winter Arc</b><span>V18 · ${data.name?escapeHtml(data.name):'Your Arc'}</span></div><button class="v18-iconbtn" data-v18-share aria-label="Share">↗</button><button class="v18-avatarbtn" data-v18-nav="profile" aria-label="My Profile">${escapeHtml((data.name||'A').slice(0,1).toUpperCase())}</button></div></header><main class="v18-main">${body}</main><nav class="v18-nav"><div class="v18-navinner"><button data-v18-nav="today" class="${tab==='today'?'active':''}"><b>🏠</b>Today</button><button data-v18-nav="week" class="${tab==='week'?'active':''}"><b>📅</b>Week</button><button data-v18-nav="profile" class="${tab==='profile'?'active':''}"><b>👤</b>Profile</button><button data-v18-nav="more" class="${tab==='more'?'active':''}"><b>•••</b>More</button></div></nav>${v18CreatorOpen?v18CreatorModal():''}${v18SprintOpen?v18SprintModal():''}</div>`;
    bindDomState();
  }

  /* V18 completion engine: window-level capture guarantees the check action is handled once. */
  window.addEventListener('click',e=>{
    const b=e.target.closest('[data-v18-complete]');if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();
    const h=data.habits.find(x=>x.id===b.dataset.v18Complete);if(h)toggleHabit(h,today());
  },{capture:true});

  window.addEventListener('click',async e=>{
    const b=e.target.closest('button,a');if(!b)return;
    if(b.dataset.v18Next!==undefined){e.preventDefault();e.stopImmediatePropagation();if(v18Step===0){v18Step=1;v18Habits=[];render();return}if(v18Step===1){const n=$('#v18Name')?.value.trim()||'';if(!n){alert('Please enter your name.');return}data.name=n;v18Step=2;render();return}}
    if(b.dataset.v18Back!==undefined){e.preventDefault();e.stopImmediatePropagation();v18Step=Math.max(0,v18Step-1);render();return}
    if(b.dataset.v18Goal!==undefined){e.preventDefault();e.stopImmediatePropagation();v18Focus=b.dataset.v18Goal;v18Habits=[];render();return}
    if(b.dataset.v18Habit!==undefined){e.preventDefault();e.stopImmediatePropagation();const n=b.dataset.v18Habit;const i=v18Habits.indexOf(n);if(i>=0)v18Habits.splice(i,1);else if(v18Habits.length<6)v18Habits.push(n);render();return}
    if(b.dataset.v18Finish!==undefined){e.preventDefault();e.stopImmediatePropagation();if(!v18Habits.length){alert('Pick at least one habit.');return}data.habits=v18Habits.slice(0,6).map(name=>{const p=preset(name);return {id:uid(),name,icon:p?.icon||'✅',private:!!p?.private,created:today(),difficulty:p?.difficulty||'Medium',action:p?.action||'Do the smallest useful version',smallWin:p?.action||'Do the smallest useful version',why:''}});data.goal=v18Focus;data.onboardingDone=true;data.profileCreated=true;data.journeyStart=today();data.lastLogin=today();save();v18Step=3;render();return}
    if(b.dataset.v18Enter!==undefined){e.preventDefault();e.stopImmediatePropagation();tab='today';morePanel='';render();showToast('Your Arc is live 🚀');return}
    if(b.dataset.v18Community!==undefined){e.preventDefault();e.stopImmediatePropagation();window.__v14Cloud=true;render();return}
    if(b.dataset.v18Existing!==undefined){e.preventDefault();e.stopImmediatePropagation();if(data.profileCreated){if(data.pinHash){sessionUnlocked=false;render()}else{tab='today';render()}}else showToast('Start your Arc first 🚀');return}
    if(b.dataset.v18CreatorOpen!==undefined){e.preventDefault();e.stopImmediatePropagation();v18CreatorPhoto=data.creatorPhoto||'creator-profile.jpg';v18CreatorOpen=true;render();return}
    if(b.dataset.v18CreatorClose!==undefined || (e.target.closest('.v18-overlay')&&e.target===e.target.closest('.v18-overlay'))){e.preventDefault();e.stopImmediatePropagation();v18CreatorOpen=false;render();return}
    if(b.dataset.v18CreatorPhoto!==undefined){e.preventDefault();e.stopImmediatePropagation();v18CreatorPhoto=b.dataset.v18CreatorPhoto;render();return}
    if(b.dataset.v18Nav!==undefined){e.preventDefault();e.stopImmediatePropagation();tab=b.dataset.v18Nav;morePanel='';render();return}
    if(b.dataset.v18More!==undefined){e.preventDefault();e.stopImmediatePropagation();tab='more';morePanel=b.dataset.v18More;render();return}
    if(b.dataset.v18MoreClose!==undefined){e.preventDefault();e.stopImmediatePropagation();morePanel='';render();return}
    if(b.dataset.v18Share!==undefined||b.dataset.v18ShareProfile!==undefined){e.preventDefault();e.stopImmediatePropagation();await v18ShareProfile();return}
    if(b.dataset.v18Sprint!==undefined){e.preventDefault();e.stopImmediatePropagation();v18SprintMinutes=10;v18SprintOpen=true;render();return}
    if(b.dataset.v18SprintStart!==undefined){e.preventDefault();e.stopImmediatePropagation();v18SprintStart();return}
    if(b.dataset.v18SprintStop!==undefined){e.preventDefault();e.stopImmediatePropagation();v18SprintStop();return}
    if(b.dataset.v18SprintClose!==undefined){e.preventDefault();e.stopImmediatePropagation();v18SprintOpen=false;if(v18SprintTimer)clearInterval(v18SprintTimer);v18SprintTimer=null;v18SprintRunning=false;render();return}
    if(b.dataset.v18Menu!==undefined){e.preventDefault();e.stopImmediatePropagation();tab='more';morePanel='';render();return}
  },{capture:true});

  render=function(){v18Render();};
  data.schema=18;
  save();
})();


/* ========================= V18.1 PATCH =========================
   Mobile week cleanup + interaction stability.
   Important: this patch lives beside the V18 IIFE, so it only uses outer-scope APIs.
*/
(function(){
  'use strict';

  function v181Style(){
    if(document.getElementById('v181-style')) return;
    const s=document.createElement('style'); s.id='v181-style';
    s.textContent=`
      html,body{width:100%;max-width:100%;overflow-x:hidden}
      .v181-week-hero{background:linear-gradient(145deg,#153f3a,#183b2d);color:#fff;border-radius:21px;padding:18px;margin:10px 0;box-shadow:0 16px 34px rgba(24,64,45,.14)}
      .v181-week-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-end}
      .v181-week-top h1{margin:4px 0 5px;font-size:30px;letter-spacing:-.05em;line-height:1}
      .v181-week-top p{margin:0;color:#d8ebe0;font-size:11px}
      .v181-week-score{text-align:right;font-weight:950;font-size:28px}.v181-week-score span{display:block;font-size:9px;color:#bfe2cb;letter-spacing:.08em;text-transform:uppercase}
      .v181-week-strip{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;margin:10px 0}
      .v181-week-day{min-width:0;border:1px solid var(--line,#e5e6df);background:var(--card,#fff);border-radius:14px;padding:8px 4px;text-align:center}
      .v181-week-day.today{border:2px solid #8fc19d;padding:7px 3px;background:var(--soft,#eef7ef)}
      .v181-week-day small{display:block;color:var(--muted,#70766f);font-size:8px;font-weight:900}
      .v181-week-day b{display:grid;place-items:center;width:34px;height:34px;margin:5px auto;border-radius:50%;font-size:10px;background:conic-gradient(var(--green,#3da35d) var(--p),#e7ece7 0);position:relative}
      .v181-week-day b::after{content:"";position:absolute;inset:4px;border-radius:50%;background:var(--card,#fff)}
      .v181-week-day b span{position:relative;z-index:1}.v181-week-day em{display:block;font-size:8px;color:var(--muted,#70766f);font-style:normal;font-weight:800}
      .v181-habit-card{background:var(--card,#fff);border:1px solid var(--line,#e5e6df);border-radius:19px;padding:13px;margin:9px 0;box-shadow:0 6px 18px rgba(30,44,34,.035)}
      .v181-habit-head{display:flex;align-items:center;gap:9px}.v181-habit-icon{width:40px;height:40px;border-radius:12px;background:var(--soft2,#f6faf6);display:grid;place-items:center;font-size:19px;border:1px solid var(--line,#e5e6df);flex:none}
      .v181-habit-copy{flex:1;min-width:0}.v181-habit-copy b{display:block;font-size:14px;line-height:1.15}.v181-habit-copy span{display:block;margin-top:3px;color:var(--muted,#70766f);font-size:9px}
      .v181-habit-total{font-size:11px;font-weight:950;color:#2d7d47}
      .v181-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;margin-top:11px}
      .v181-day-btn{width:100%;min-width:0;appearance:none;-webkit-appearance:none;border:1px solid var(--line,#e5e6df);background:var(--soft2,#f6faf6);color:var(--ink,#202522);border-radius:12px;padding:6px 2px;display:grid;gap:4px;place-items:center;font-size:8px;font-weight:900;outline:none;box-shadow:none}
      .v181-day-btn .dlabel{color:var(--muted,#70766f);font-size:8px}.v181-day-btn .check{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;border:2px solid #d8e2da;font-size:12px;line-height:1}
      .v181-day-btn.done{background:var(--soft,#eef7ef);border-color:#acd1b5}.v181-day-btn.done .check{background:var(--green,#3da35d);border-color:var(--green,#3da35d);color:#fff}
      .v181-day-btn.freeze{background:#f1f7f1}.v181-day-btn.freeze .check{border-color:#9fc6a8;color:#2d7d47}.v181-day-btn.future{opacity:.42;cursor:not-allowed}.v181-day-btn.today{outline:2px solid #a5cfaf;outline-offset:1px}
      .v181-note{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:9px;color:var(--muted,#70766f);font-size:9px}.v181-note b{color:#2d7d47}
      .v181-menu-overlay{position:fixed;inset:0;z-index:140;background:rgba(9,14,11,.5);display:flex;align-items:flex-end;justify-content:center;padding:10px}
      .v181-menu-sheet{width:min(760px,100%);background:var(--card,#fff);color:var(--ink,#202522);border-radius:24px 24px 0 0;padding:15px;box-shadow:0 22px 80px rgba(0,0,0,.28)}
      .v181-menu-head{display:flex;justify-content:space-between;align-items:center;gap:8px}.v181-menu-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}.v181-menu-grid button{appearance:none;border:1px solid var(--line,#e5e6df);background:var(--card,#fff);color:inherit;border-radius:16px;padding:13px;text-align:left;display:grid;gap:4px;min-height:76px}.v181-menu-grid b{font-size:13px}.v181-menu-grid small{font-size:9px;color:var(--muted,#70766f)}
      .v181-sprint-options{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:6px 0 10px}.v181-sprint-options button{min-height:40px}.v181-sprint-options button.selected{background:var(--green,#3da35d);border-color:var(--green,#3da35d);color:#fff}
      .v181-sprint-overlay{position:fixed;inset:0;z-index:145;background:rgba(9,14,11,.52);display:flex;align-items:flex-end;justify-content:center;padding:10px}.v181-sprint-sheet{width:min(760px,100%);background:var(--card,#fff);color:var(--ink,#202522);border-radius:24px 24px 0 0;padding:15px;box-shadow:0 22px 80px rgba(0,0,0,.28)}
      .v181-sprint-head{display:flex;justify-content:space-between;align-items:center;gap:8px}.v181-sprint-timer{text-align:center;font-size:54px;font-weight:950;letter-spacing:-.05em;padding:10px 0}.v181-sprint-mins{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.v181-sprint-mins button{min-height:42px}.v181-sprint-mins button.selected{background:var(--green,#3da35d);border-color:var(--green,#3da35d);color:#fff}
      @media(max-width:430px){.v181-week-strip{gap:4px}.v181-week-day{padding:7px 2px}.v181-week-day.today{padding:6px 1px}.v181-days{gap:4px}.v181-day-btn{padding:5px 1px}.v181-day-btn .check{width:25px;height:25px}.v181-week-top h1{font-size:27px}}
      @media(min-width:900px){.v181-habits-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.v181-habit-card{margin:0}}
      body.dark .v181-week-day b::after{background:var(--card,#171d18)}
      body.dark .v181-habit-icon,body.dark .v181-day-btn{background:#151a16}
    `;
    document.head.appendChild(s);
  }

  function v181WeeklyPct(h,ds){
    let eligible=0,doneN=0;
    ds.forEach(d=>{if(canUseHabitOn(h,d)){eligible++;if(active(h,d))doneN++;}});
    return eligible?Math.round(doneN/eligible*100):0;
  }

  function v181WeekHabit(h,ds){
    const hs=habitStats(h),p=v181WeeklyPct(h,ds);
    return `<article class="v181-habit-card"><div class="v181-habit-head"><div class="v181-habit-icon">${escapeHtml(h.icon||'✅')}</div><div class="v181-habit-copy"><b>${escapeHtml(h.name)}</b><span>🔥 ${hs.run} day${hs.run===1?'':'s'} · ${p}% this week</span></div><div class="v181-habit-total">${hs.total} wins</div></div><div class="v181-days">${ds.map(d=>{const future=d>today(),is=done(h,d),fr=frozen(h,d);return `<button type="button" class="v181-day-btn ${is?'done':''} ${fr?'freeze':''} ${future?'future':''} ${d===today()?'today':''}" data-v181-toggle="${escapeHtml(h.id)}|${d}" ${future?'disabled':''} aria-label="${escapeHtml(h.name)} ${formatDay(d)}"><span class="dlabel">${v12DayLabel(d)}</span><span class="check">${is?'✓':fr?'🛡':'○'}</span></button>`;}).join('')}</div><div class="v181-note"><span>${formatDay(ds[0])} → ${formatDay(ds[ds.length-1])}</span><b>${p}% complete</b></div></article>`;
  }

  v14WeekPage=function(){
    v181Style();
    const s=stats(),ds=v12MiniDays();
    return `<div class="v14-page"><section class="v181-week-hero"><div class="v181-week-top"><div><span class="v14-kicker" style="color:#bfe8ca">THIS WEEK</span><h1>${s.score}% complete</h1><p>Seven days. Small actions. One clear view.</p></div><div class="v181-week-score">${s.todayDone}<span>today</span></div></div></section><section class="v181-week-strip">${ds.map(d=>{const eligible=data.habits.filter(h=>canUseHabitOn(h,d)).length,n=data.habits.filter(h=>active(h,d)).length,p=eligible?Math.round(n/eligible*100):0;return `<div class="v181-week-day ${d===today()?'today':''}"><small>${v12DayLabel(d)}</small><b style="--p:${p}%"><span>${p}</span></b><em>${n}/${eligible}</em></div>`;}).join('')}</section><section class="v14-section"><div class="v14-section-head"><div><span class="v14-kicker">HABITS</span><h2>Your week</h2></div><button class="v14-pill-btn" data-share-progress>Share ↗</button></div><div class="v181-habits-grid">${data.habits.map(h=>v181WeekHabit(h,ds)).join('')||'<div class="v14-empty-card"><b>Add a habit to see your week.</b></div>'}</div></section><section class="v14-card v14-insight"><span>💡</span><div><b>Weekly insight</b><p>${v13BestWeek()?`Your best week so far reached ${v13BestWeek().score}%. Keep the next action easy.`:'Your first full week will create a useful baseline here.'}</p></div></section></div>`;
  };

  /* New-user setup date: 30 Sep is setup day, 1 Oct is Day 1. */
  if(today()<WINTER_ARC_START && (data.profileCreated||data.onboardingDone)){
    data.arcStart=WINTER_ARC_START;data.arcLength=WINTER_ARC_LENGTH;
    if(!data.journeyStart || data.journeyStart===today())data.journeyStart=WINTER_ARC_START;
    save();
  }

  /* PWA shortcuts / shared links. */
  try{const requested=new URL(location.href).searchParams.get('tab');if(['today','week','profile','arc','more'].includes(requested))tab=requested;}catch(e){}

  /* Outer-scope render is the stable integration point. Never access sibling-IIFE internals. */
  const baseRender=render;
  let v181MenuOpen=false;
  let v181SprintOpen=false,v181SprintRunning=false,v181SprintMinutes=10,v181SprintEndsAt=0,v181SprintTimer=null;

  const v181Menu=()=>`<div class="v181-menu-overlay" data-v181-menu-close><div class="v181-menu-sheet" role="dialog" aria-modal="true"><div class="v181-menu-head"><div><div class="v18-kicker">WINTER ARC</div><h2 style="margin:3px 0">Go somewhere</h2></div><button class="v18-iconbtn" data-v181-menu-close>×</button></div><div class="v181-menu-grid"><button data-v181-nav="today">🏠 <b>Today</b><small>Your next action.</small></button><button data-v181-nav="week">📅 <b>Week</b><small>This week's pattern.</small></button><button data-v181-nav="profile">👤 <b>Profile</b><small>Your Arc identity.</small></button><button data-v181-nav="arc">❄️ <b>Arc</b><small>The full 92-day journey.</small></button><button data-v181-nav="more">••• <b>More</b><small>Tools & settings.</small></button></div></div></div>`;

  function v181SprintModal(){
    const left=v181SprintRunning?Math.max(0,v181SprintEndsAt-Date.now()):v181SprintMinutes*60000;
    const sec=Math.ceil(left/1000),mm=String(Math.floor(sec/60)).padStart(2,'0'),ss=String(sec%60).padStart(2,'0');
    return `<div class="v181-sprint-overlay" data-v181-sprint-close><div class="v181-sprint-sheet" role="dialog" aria-modal="true"><div class="v181-sprint-head"><div><div class="v18-kicker">FOCUS SPRINT</div><h2 style="margin:3px 0">One focused block.</h2></div><button class="v18-iconbtn" data-v181-sprint-close>×</button></div><div class="v181-sprint-timer" id="v181SprintTimer">${mm}:${ss}</div>${v181SprintRunning?'':`<div class="v181-sprint-mins">${[5,10,25].map(m=>`<button class="v18-btn ${v181SprintMinutes===m?'selected':''}" data-v181-sprint-min="${m}">${m} min</button>`).join('')}</div>`}<div class="v18-actions" style="margin-top:10px">${v181SprintRunning?`<button class="v18-btn primary" data-v181-sprint-stop>Finish sprint ✓</button>`:`<button class="v18-btn primary" data-v181-sprint-start>Start ${v181SprintMinutes}-min sprint →</button>`}<button class="v18-btn" data-v181-sprint-close>Not now</button></div><p class="v18-sub" style="margin-top:10px">A temporary timer for one task. It does not change tracker history.</p></div></div>`;
  }

  function v181OpenSprint(){v181SprintRunning=false;if(v181SprintTimer)clearInterval(v181SprintTimer);v181SprintTimer=null;v181SprintOpen=true;render();}
  function v181StartSprint(){v181SprintRunning=true;v181SprintEndsAt=Date.now()+v181SprintMinutes*60000;v181SprintOpen=true;if(v181SprintTimer)clearInterval(v181SprintTimer);v181SprintTimer=setInterval(()=>{const left=Math.max(0,v181SprintEndsAt-Date.now());const el=document.getElementById('v181SprintTimer');if(el){const sec=Math.ceil(left/1000);el.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')}if(left<=0){clearInterval(v181SprintTimer);v181SprintTimer=null;v181SprintRunning=false;v181SprintOpen=false;render();showToast('Focus sprint complete 🎯');}},250);render();}
  function v181StopSprint(){if(v181SprintTimer)clearInterval(v181SprintTimer);v181SprintTimer=null;v181SprintRunning=false;v181SprintOpen=false;render();showToast('Sprint finished 🎯');}

  render=function(){
    baseRender();
    v181Style();
    const menuBtn=document.querySelector('[data-v18-menu]');
    if(menuBtn){menuBtn.removeAttribute('data-v18-menu');menuBtn.setAttribute('data-v181-menu','1');}
    const sprintBtns=document.querySelectorAll('[data-v18-sprint]');
    sprintBtns.forEach(b=>{b.removeAttribute('data-v18-sprint');b.setAttribute('data-v181-sprint','1');});
    if(window.__v14Cloud){const holder=document.createElement('div');holder.innerHTML=v14CloudModal();const el=holder.firstElementChild;if(el)document.body.appendChild(el);}
    if(v181MenuOpen){const holder=document.createElement('div');holder.innerHTML=v181Menu();const el=holder.firstElementChild;if(el)document.body.appendChild(el);}
    if(v181SprintOpen){const holder=document.createElement('div');holder.innerHTML=v181SprintModal();const el=holder.firstElementChild;if(el)document.body.appendChild(el);}
    bindDomState();
  };

  /* New controls use unique attributes, so the older V18 click handler will ignore them. */
  window.addEventListener('click',e=>{
    const b=e.target.closest('button,a');if(!b)return;
    if(b.dataset.v181Toggle!==undefined){e.preventDefault();e.stopImmediatePropagation();const [id,d]=String(b.dataset.v181Toggle).split('|');const h=data.habits.find(x=>x.id===id);if(h)toggleHabit(h,d);return;}
    if(b.dataset.v181Menu!==undefined){e.preventDefault();e.stopImmediatePropagation();v181MenuOpen=true;render();return;}
    if(b.dataset.v181MenuClose!==undefined || (v181MenuOpen&&e.target.closest('.v181-menu-overlay')===e.target)){e.preventDefault();e.stopImmediatePropagation();v181MenuOpen=false;render();return;}
    if(b.dataset.v181Nav!==undefined){e.preventDefault();e.stopImmediatePropagation();tab=b.dataset.v181Nav;morePanel='';v181MenuOpen=false;render();return;}
    if(b.dataset.v181Sprint!==undefined){e.preventDefault();e.stopImmediatePropagation();v181OpenSprint();return;}
    if(b.dataset.v181SprintMin!==undefined){e.preventDefault();e.stopImmediatePropagation();if(!v181SprintRunning){v181SprintMinutes=Number(b.dataset.v181SprintMin)||10;render();}return;}
    if(b.dataset.v181SprintStart!==undefined){e.preventDefault();e.stopImmediatePropagation();v181StartSprint();return;}
    if(b.dataset.v181SprintStop!==undefined){e.preventDefault();e.stopImmediatePropagation();v181StopSprint();return;}
    if(b.dataset.v181SprintClose!==undefined || (v181SprintOpen&&e.target.closest('.v181-sprint-overlay')===e.target)){e.preventDefault();e.stopImmediatePropagation();if(v181SprintTimer)clearInterval(v181SprintTimer);v181SprintTimer=null;v181SprintRunning=false;v181SprintOpen=false;render();return;}
  },{capture:true});

  v181Style();
  data.schema=181;
  save();
})();


/* ========================= V19 — ARC LEAGUE =========================
   Social progression layer: global rank, fair weekly score, leagues,
   rank history, shareable rank card, personal-best rank and challenge links.
   Community remains opt-in; local tracking works without it.
*/
(function(){
  'use strict';

  if(!Array.isArray(data.v19RankHistory))data.v19RankHistory=[];
  if(!Array.isArray(data.v19Challenges))data.v19Challenges=[];
  if(!data.v19LeaderboardTab)data.v19LeaderboardTab='global';

  let v19BoardState={status:'idle',rows:[],error:'',updatedAt:0};
  let v19MenuOpen=false;

  function v19Style(){
    if(document.getElementById('v19-style'))return;
    const s=document.createElement('style');s.id='v19-style';
    s.textContent=`
      .v19-rank-hero{background:linear-gradient(145deg,#153f3a,#183b2d);color:#fff;border-radius:22px;padding:18px;box-shadow:0 18px 38px rgba(24,64,45,.14);margin:10px 0}
      .v19-rank-kicker{font-size:9px;letter-spacing:.14em;font-weight:950;color:#bfe8ca}.v19-rank-hero h1{margin:5px 0;font-size:29px;letter-spacing:-.045em}.v19-rank-hero p{margin:0;color:#d8ece1;font-size:11px;line-height:1.45}
      .v19-my-rank{margin-top:13px;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:12px}.v19-my-rank strong{display:block;font-size:39px;line-height:.95}.v19-my-rank small{display:block;margin-top:4px;color:#c8e4d4;font-size:9px}.v19-rank-score{text-align:right}.v19-rank-score b{display:block;font-size:25px}.v19-rank-score span{font-size:9px;color:#c8e4d4;text-transform:uppercase;letter-spacing:.08em}
      .v19-filter{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0}.v19-filter button{min-height:38px;border:1px solid var(--line,#e5e6df);background:var(--card,#fff);color:inherit;border-radius:12px;font-size:9px;font-weight:900}.v19-filter button.active{background:var(--soft,#eef7ef);border-color:#a8cfb1;color:#2d7d47}
      .v19-top3{display:grid;grid-template-columns:1fr 1.1fr 1fr;gap:7px;align-items:end;margin:10px 0}.v19-top3 .place{background:var(--card,#fff);border:1px solid var(--line,#e5e6df);border-radius:16px;padding:11px 7px;text-align:center}.v19-top3 .place.first{padding-top:15px}.v19-crown{font-size:19px}.v19-avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--soft,#eef7ef);color:#2d7d47;font-weight:950;margin:5px auto}.v19-place{font-size:9px;color:var(--muted,#70766f);font-weight:900}.v19-place-name{font-size:10px;font-weight:950;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v19-place-score{font-size:15px;font-weight:950;margin-top:4px}.v19-place-meta{font-size:8px;color:var(--muted,#70766f);margin-top:3px}
      .v19-list{display:grid;gap:7px}.v19-row{display:grid;grid-template-columns:34px 38px 1fr auto;gap:8px;align-items:center;background:var(--card,#fff);border:1px solid var(--line,#e5e6df);border-radius:16px;padding:10px}.v19-row.me{background:var(--soft,#eef7ef);border-color:#9fc9aa}.v19-row-rank{font-size:11px;font-weight:950;color:var(--muted,#70766f);text-align:center}.v19-row-avatar{width:36px;height:36px;border-radius:12px;background:var(--soft2,#f6faf6);color:#2d7d47;display:grid;place-items:center;font-size:13px;font-weight:950}.v19-row-main{min-width:0}.v19-row-main b{display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v19-row-main span{display:block;font-size:8px;color:var(--muted,#70766f);margin-top:3px}.v19-row-score{text-align:right}.v19-row-score b{display:block;font-size:13px}.v19-row-score small{display:block;font-size:8px;color:#2d7d47;font-weight:900;margin-top:2px}
      .v19-league{display:inline-flex;align-items:center;gap:4px;padding:4px 7px;border-radius:999px;font-size:8px;font-weight:950;background:var(--soft,#eef7ef);color:#2d7d47;margin-top:4px}
      .v19-info{background:var(--soft2,#f6faf6);border:1px solid var(--line,#e5e6df);border-radius:17px;padding:12px;margin:9px 0}.v19-info b{font-size:11px}.v19-info p{margin:4px 0 0;font-size:9px;line-height:1.5;color:var(--muted,#70766f)}
      .v19-rank-history{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;align-items:end;height:100px}.v19-history-bar{display:grid;gap:4px;justify-items:center;align-items:end;height:100%;font-size:7px;color:var(--muted,#70766f)}.v19-history-bar i{display:block;width:100%;max-width:28px;background:#6fb483;border-radius:7px 7px 3px 3px;min-height:8px}.v19-history-bar b{font-size:8px;color:#2d7d47}.v19-history-bar span{font-size:7px}
      .v19-challenge{display:grid;gap:9px}.v19-challenge-card{background:var(--soft,#eef7ef);border:1px solid #cfe1d2;border-radius:17px;padding:12px}.v19-challenge-head{display:flex;justify-content:space-between;gap:8px}.v19-challenge-head b{font-size:13px}.v19-challenge-head span{font-size:9px;color:#2d7d47;font-weight:900}.v19-challenge-progress{height:8px;background:#dce8de;border-radius:999px;overflow:hidden;margin-top:8px}.v19-challenge-progress i{display:block;height:100%;background:#3da35d;border-radius:inherit}.v19-challenge-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}
      .v19-empty{padding:18px;text-align:center;background:var(--soft2,#f6faf6);border:1px dashed var(--line,#e5e6df);border-radius:17px;color:var(--muted,#70766f);font-size:10px}.v19-empty b{display:block;color:var(--ink,#202522);margin-bottom:4px}
      .v19-share-preview{background:linear-gradient(145deg,#153f3a,#183b2d);border-radius:20px;padding:15px;color:#fff;min-height:210px;display:flex;flex-direction:column;justify-content:space-between}.v19-share-preview small{color:#bfe8ca;font-size:9px;letter-spacing:.12em}.v19-share-preview strong{font-size:42px;letter-spacing:-.05em}.v19-share-preview span{font-size:11px;color:#d8ece1}.v19-share-preview b{font-size:16px}
      .v19-menu-overlay{position:fixed;inset:0;z-index:150;background:rgba(7,12,9,.5);display:flex;align-items:flex-end;justify-content:center;padding:10px}.v19-menu-sheet{width:min(760px,100%);background:var(--card,#fff);color:var(--ink,#202522);border-radius:24px 24px 0 0;padding:15px;box-shadow:0 22px 80px rgba(0,0,0,.28)}.v19-menu-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:11px}.v19-menu-grid button{min-height:70px;border:1px solid var(--line,#e5e6df);background:var(--card,#fff);color:inherit;border-radius:15px;padding:11px;text-align:left;display:grid;gap:3px}.v19-menu-grid b{font-size:12px}.v19-menu-grid small{font-size:8px;color:var(--muted,#70766f)}
      @media(max-width:430px){.v19-top3{gap:5px}.v19-top3 .place{padding:9px 5px}.v19-share-preview strong{font-size:36px}}
    `;
    document.head.appendChild(s);
  }

  function v19WeekInfo(){
    const ds=v12MiniDays();
    let eligible=0,doneN=0;
    ds.forEach(d=>data.habits.forEach(h=>{if(canUseHabitOn(h,d)){eligible++;if(active(h,d))doneN++;}}));
    const completion=eligible?Math.round(doneN/eligible*100):0;
    const best=Math.max(0,...data.habits.map(h=>habitStats(h).longest));
    const wins=ds.reduce((n,d)=>n+data.habits.filter(h=>canUseHabitOn(h,d)&&done(h,d)).length,0);
    const streakPts=Math.min(15,Math.round(Math.min(best,30)/30*15));
    const winPts=Math.min(10,Math.round(Math.min(wins,21)/21*10));
    const rank=Math.min(100,Math.round(completion*.75+streakPts+winPts));
    const league=rank>=90?'Diamond':rank>=75?'Gold':rank>=60?'Silver':rank>=40?'Bronze':'Starter';
    const wkStart=ds[0]||today();
    return {completion,best,wins,rank,league,weekKey:wkStart};
  }

  const v19BaseCloudSnapshot=cloudSnapshot;
  cloudSnapshot=function(){const s=v19BaseCloudSnapshot();const w=v19WeekInfo();return Object.assign({},s,{week_score:w.completion,rank_score:w.rank,league:w.league,week_key:w.weekKey});};

  async function v19LoadLeaderboard(){
    v19BoardState={status:'loading',rows:[],error:'',updatedAt:Date.now()};render();
    if(!cloudReady()){
      v19BoardState={status:'offline',rows:[],error:'Community is not connected yet.',updatedAt:Date.now()};render();return;
    }
    try{
      const q='select=id,display_name,instagram_handle,arc_day,total_arc_days,arc_progress,total_wins,best_streak,last_seen,public_profile,week_score,rank_score,league,week_key&public_profile=eq.true&order=rank_score.desc,best_streak.desc,total_wins.desc&limit=100';
      const r=await fetch(CLOUD_CFG.url+'/rest/v1/arc_users?'+q,{headers:cloudHeaders()});
      if(!r.ok)throw new Error('leaderboard '+r.status);
      const rows=(await r.json()).filter(x=>x&&x.public_profile).map(x=>Object.assign({},x,{rankScore:Number(x.rank_score??x.arc_progress??0)}));
      v19BoardState={status:'ready',rows,error:'',updatedAt:Date.now()};
      const meId=data.cloudUserId||'';
      const me=rows.find(x=>x.id===meId);
      if(me){const rank=rows.indexOf(me)+1;const entry={date:today(),rank};data.v19RankHistory=data.v19RankHistory.filter(x=>x.date!==today()).concat(entry).slice(-30);save();}
      render();
    }catch(e){v19BoardState={status:'error',rows:[],error:'Could not load the community leaderboard.',updatedAt:Date.now()};render();}
  }

  function v19LeagueBadge(league){const icon={Starter:'🌱',Bronze:'🥉',Silver:'🥈',Gold:'🥇',Diamond:'💎'}[league]||'🌱';return icon+' '+(league||'Starter');}
  function v19MyRow(rows){const id=data.cloudUserId||'';const idx=rows.findIndex(x=>x.id===id);if(idx<0)return {rank:null,row:null};return {rank:idx+1,row:rows[idx]};}
  function v19Top3(rows){
    const top=rows.slice(0,3),order=[top[1],top[0],top[2]],out=[];
    order.forEach((x,i)=>{
      if(!x){out.push('<div class="place"><div class="v19-avatar">—</div><div class="v19-place">—</div><div class="v19-place-name">Waiting</div></div>');return;}
      const name=escapeHtml(x.display_name||'Anonymous'),initial=escapeHtml(name.slice(0,1).toUpperCase()),rank=rows.indexOf(x)+1,score=Number(x.rankScore)||0,league=v19LeagueBadge(x.league);
      out.push('<div class="place '+(i===1?'first':'')+'">'+(i===1?'<div class="v19-crown">👑</div>':'')+'<div class="v19-avatar">'+initial+'</div><div class="v19-place">#'+rank+'</div><div class="v19-place-name">'+name+'</div><div class="v19-place-score">'+score+'</div><div class="v19-place-meta">'+league+'</div></div>');
    });
    return '<div class="v19-top3">'+out.join('')+'</div>';
  }

  function v19Rows(rows){
    const limit=rows.slice(0,50);return `<div class="v19-list">${limit.map((x,i)=>{const me=data.cloudUserId&&x.id===data.cloudUserId;return `<div class="v19-row ${me?'me':''}"><div class="v19-row-rank">#${i+1}</div><div class="v19-row-avatar">${escapeHtml((x.display_name||'?').slice(0,1).toUpperCase())}</div><div class="v19-row-main"><b>${escapeHtml(x.display_name||'Anonymous')}${me?' · You':''}</b><span>${v19LeagueBadge(x.league)} · 🔥 ${Number(x.best_streak)||0} streak · ${Number(x.week_score)||0}% week</span></div><div class="v19-row-score"><b>${Number(x.rankScore)||0}</b><small>score</small></div></div>`}).join('')||'<div class="v19-empty"><b>No public users yet.</b>Join the community to appear here.</div>'}</div>`;
  }
  function v19History(){
    const h=data.v19RankHistory.slice(-5);if(!h.length)return '<div class="v19-empty"><b>No rank history yet.</b>Sync your public profile and check back after your next leaderboard update.</div>';
    const best=Math.min(...h.map(x=>x.rank||999));return `<div class="v19-info"><b>📈 Rank history</b><p>Personal best: <strong>#${best}</strong>. Your history is stored locally.</p><div class="v19-rank-history">${h.map(x=>{const r=Math.max(1,x.rank||999),height=Math.max(12,100-Math.min(90,r));return `<div class="v19-history-bar"><i style="height:${height}%"></i><b>#${r}</b><span>${escapeHtml(x.date.slice(5))}</span></div>`}).join('')}</div></div>`;
  }
  function v19RankPage(){
    v19Style();const w=v19WeekInfo();const rows=v19BoardState.rows;const me=v19MyRow(rows);
    const statusLine=v19BoardState.status==='loading'?'Updating…':v19BoardState.status==='ready'?`Updated ${new Date(v19BoardState.updatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`:'Community leaderboard';
    return `<div class="v18-wrap v18-main"><section class="v19-rank-hero"><div class="v19-rank-kicker">🏆 ARC LEAGUE · THIS WEEK</div><h1>Consistency has a rank.</h1><p>Fair score. Weekly movement. No points for simply adding more habits.</p>${me.rank?`<div class="v19-my-rank"><div><strong>#${me.rank}</strong><small>${escapeHtml(me.row?.display_name||data.name||'You')} · ${v19LeagueBadge(me.row?.league||w.league)}</small></div><div class="v19-rank-score"><b>${Number(me.row?.rankScore)||0}</b><span>rank score</span></div></div>`:`<div class="v19-my-rank"><div><strong>—</strong><small>${escapeHtml(data.name||'You')} · ${data.cloudOptIn?'Sync to get your rank':'Join the community to rank'}</small></div><div class="v19-rank-score"><b>${w.rank}</b><span>local score</span></div></div>`}</section>
      <div class="v19-filter"><button class="${data.v19LeaderboardTab==='global'?'active':''}" data-v19-rank-tab="global">🌍 Global</button><button class="${data.v19LeaderboardTab==='friends'?'active':''}" data-v19-rank-tab="friends">👥 Friends</button><button class="${data.v19LeaderboardTab==='challenge'?'active':''}" data-v19-rank-tab="challenge">⚔️ Challenge</button></div>
      ${data.v19LeaderboardTab==='friends'?`<section class="v18-card"><div class="v18-sectionhead"><h2>👥 Friends</h2><span class="v18-muted">Private circle</span></div><div class="v19-empty"><b>Invite your people.</b>Share your Arc link and keep a small circle together.</div><button class="v18-btn primary" style="width:100%;margin-top:9px" data-v19-share-rank>Share my rank ↗</button></section>`:data.v19LeaderboardTab==='challenge'?v19ChallengePanel():`<section class="v18-card"><div class="v18-sectionhead"><div><h2>🌍 Global leaderboard</h2><span class="v18-muted">${statusLine}</span></div><button class="v18-btn" data-v19-refresh>↻</button></div>${rows.length?v19Top3(rows):`<div class="v19-info"><b>Connect your community profile.</b><p>Only people who opt into a public profile appear here. Your private habits and journal stay local.</p></div>`}${rows.length?v19Rows(rows):''}${v19BoardState.status==='offline'||v19BoardState.status==='error'?`<button class="v18-btn primary" style="width:100%;margin-top:9px" data-v19-community>Join / setup leaderboard</button>`:''}</section>}`}
      <section class="v18-card"><div class="v18-sectionhead"><h2>⚖️ How ranking works</h2><span class="v18-muted">100 max</span></div><div class="v19-info"><b>75% · Weekly consistency</b><p>Completion percentage is weighted equally, so adding extra habits does not automatically create a higher rank.</p></div><div class="v19-info"><b>15% · Streak</b><p>Longer streaks add a capped bonus. Maximum streak contribution: 15 points.</p></div><div class="v19-info"><b>10% · Weekly wins</b><p>Completed planned actions add a small capped contribution. Score stays between 0 and 100.</p></div><div class="v19-league">${v19LeagueBadge(w.league)} · ${w.rank}/100 local weekly score</div></section>
      ${v19History()}
      <section class="v18-card"><div class="v18-sectionhead"><div><h2>📸 Share your position</h2><span class="v18-muted">Instagram / WhatsApp ready</span></div></div><div class="v19-share-preview"><small>WINTER ARC · ARC LEAGUE</small><strong>${me.rank?`#${me.rank}`:'YOUR SCORE'}</strong><span>${me.rank?`${Number(me.row?.rankScore)||0} rank score · ${v19LeagueBadge(me.row?.league)}`:`Local score ${w.rank} · ${v19LeagueBadge(w.league)}`}</span><b>${escapeHtml(data.name||'My Arc')}</b></div><div class="v18-actions" style="margin-top:9px"><button class="v18-btn primary" data-v19-share-rank>Share rank card ↗</button><button class="v18-btn" data-v19-refresh>Refresh rank</button></div></section>
    </div>`;
  }

  function v19ChallengeProgress(ch){
    const start=ch.start||today(), days=Math.max(1,Number(ch.days)||7), end=addDays(start,days-1), upto=localDate(new Date())<start?0:Math.min(days,dateDiff(start,today())+1);
    let completed=0;for(let i=0;i<upto;i++){const d=addDays(start,i);if(data.habits.some(h=>done(h,d)))completed++;}
    return {completed,upto,days,end,pct:days?Math.round(completed/days*100):0};
  }
  let v19ChallengeState={status:'idle',members:[]};
  async function v19ChallengeBackendUpsert(ch){
    if(!cloudReady()||!data.cloudOptIn||!ch)return false;
    try{
      const id=data.cloudUserId||crypto.randomUUID();data.cloudUserId=id;
      const p=v19ChallengeProgress(ch);
      const h={...cloudHeaders(),Prefer:'resolution=merge-duplicates'};
      const cr=await fetch(CLOUD_CFG.url+'/rest/v1/arc_challenges?on_conflict=code',{method:'POST',headers:h,body:JSON.stringify({code:ch.code,title:ch.title,description:ch.description||'',days:Number(ch.days)||7,start_date:ch.start,creator_id:id,creator_name:data.name||'Anonymous',active:true})});
      if(!cr.ok)throw new Error('challenge create '+cr.status);
      const mr=await fetch(CLOUD_CFG.url+'/rest/v1/arc_challenge_members?on_conflict=challenge_code,user_id',{method:'POST',headers:h,body:JSON.stringify({challenge_code:ch.code,user_id:id,display_name:data.name||'Anonymous',progress:p.completed,progress_pct:p.pct,last_seen:new Date().toISOString()})});
      if(!mr.ok)throw new Error('challenge member '+mr.status);
      return true;
    }catch(e){return false;}
  }
  async function v19LoadChallengeMembers(ch){
    if(!cloudReady()||!ch){v19ChallengeState={status:'offline',members:[]};render();return;}
    v19ChallengeState={status:'loading',members:[]};render();
    try{
      const q='select=user_id,display_name,progress,progress_pct,last_seen&challenge_code=eq.'+encodeURIComponent(ch.code)+'&order=progress_pct.desc,last_seen.desc&limit=25';
      const r=await fetch(CLOUD_CFG.url+'/rest/v1/arc_challenge_members?'+q,{headers:cloudHeaders()});if(!r.ok)throw new Error('members '+r.status);
      v19ChallengeState={status:'ready',members:await r.json()};render();
    }catch(e){v19ChallengeState={status:'error',members:[]};render();}
  }
  async function v19SyncActiveChallenge(){const ch=data.v19Challenges[0];if(ch&&data.cloudOptIn)await v19ChallengeBackendUpsert(ch);}

  function v19ChallengePanel(){
    const activeCh=data.v19Challenges[0],members=v19ChallengeState.members||[];
    return `<section class="v18-card"><div class="v18-sectionhead"><div><h2>⚔️ Arc Challenges</h2><span class="v18-muted">Small shared targets</span></div></div>${activeCh?`<div class="v19-challenge"><div class="v19-challenge-card"><div class="v19-challenge-head"><b>${escapeHtml(activeCh.title)}</b><span>${Number(activeCh.days)||7} days</span></div><p class="v18-sub" style="margin-top:4px">${escapeHtml(activeCh.description||'Show up once a day and keep the streak alive.')}</p>${(()=>{const p=v19ChallengeProgress(activeCh);return `<div class="v19-challenge-progress"><i style="width:${p.pct}%"></i></div><div class="v19-note"><span>Day ${p.upto}/${p.days}</span><b>${p.pct}%</b></div>`})()}</div>${members.length?`<div class="v19-list">${members.map((m,i)=>`<div class="v19-row"><div class="v19-row-rank">#${i+1}</div><div class="v19-row-avatar">${escapeHtml((m.display_name||'?').slice(0,1).toUpperCase())}</div><div class="v19-row-main"><b>${escapeHtml(m.display_name||'Anonymous')}</b><span>${Number(m.progress_pct)||0}% challenge progress · ${Number(m.progress)||0} wins</span></div><div class="v19-row-score"><b>${Number(m.progress_pct)||0}%</b></div></div>`).join('')}</div>`:(v19ChallengeState.status==='offline'?'<div class="v19-empty"><b>Local challenge mode</b>Connect Community Sync to show shared participant progress.</div>':'<div class="v19-empty"><b>No participants loaded yet.</b>Tap refresh to load challenge members.</div>')}<div class="v19-challenge-actions"><button class="v18-btn primary" data-v19-challenge-share>Share challenge ↗</button><button class="v18-btn" data-v19-challenge-refresh>↻ Refresh</button></div></div>`:'<div class="v19-empty"><b>No active challenge.</b>Create a simple 7/14/30-day challenge and share the link.</div>'}<button class="v18-btn primary" style="width:100%;margin-top:9px" data-v19-challenge-create>＋ Create challenge</button></section>`;
  }

  function v19ChallengeUrl(ch){try{const u=new URL(location.href);u.searchParams.set('challenge',btoa(unescape(encodeURIComponent(JSON.stringify(ch)))));return u.href;}catch(e){return location.href}}
  function v19ChallengeDecode(){try{const x=new URL(location.href).searchParams.get('challenge');if(!x)return null;return JSON.parse(decodeURIComponent(escape(atob(x))))}catch(e){return null}}
  const invitedChallenge=v19ChallengeDecode();
  if(invitedChallenge&&!data.v19Challenges.some(x=>x.code===invitedChallenge.code)){data.v19Challenges.unshift(Object.assign({},invitedChallenge,{joined:today()}));data.v19Challenges=data.v19Challenges.slice(0,3);save();showToast('Challenge joined ⚔️');}

  function v19MenuSheet(){return `<div class="v19-menu-overlay" data-v19-menu-close><div class="v19-menu-sheet"><div class="v18-sectionhead"><div><div class="v18-kicker">WINTER ARC</div><h2>Quick navigation</h2></div><button class="v18-iconbtn" data-v19-menu-close>×</button></div><div class="v19-menu-grid"><button data-v19-nav="today">🏠 <b>Today</b><small>Your next action.</small></button><button data-v19-nav="week">📅 <b>Week</b><small>This week's pattern.</small></button><button data-v19-nav="rank">🏆 <b>Arc League</b><small>Your global rank.</small></button><button data-v19-nav="profile">👤 <b>Profile</b><small>Your Arc identity.</small></button><button data-v19-nav="arc">❄️ <b>Arc</b><small>The full journey.</small></button><button data-v19-nav="more">••• <b>More</b><small>Tools & settings.</small></button></div></div></div>`;}

  async function v19ShareRank(){
    try{
      const w=v19WeekInfo(),me=v19MyRow(v19BoardState.rows),rank=me.rank,score=Number(me.row?.rankScore)||w.rank,league=me.row?.league||w.league;
      const c=document.createElement('canvas');c.width=1080;c.height=1350;const ctx=c.getContext('2d');
      ctx.fillStyle='#f5f3ed';ctx.fillRect(0,0,1080,1350);const g=ctx.createLinearGradient(0,0,0,720);g.addColorStop(0,'#153f3a');g.addColorStop(1,'#183b2d');ctx.fillStyle=g;ctx.fillRect(48,48,984,700);
      const t=(x,y,z,w,f)=>{ctx.fillStyle=f||'#fff';ctx.font=`${w||'700'} ${z}px Arial,sans-serif`;ctx.fillText(x,y)};
      t('WINTER ARC · ARC LEAGUE',92,125,29,'800','#bfe8ca');t((rank?`#${rank}`:'LOCAL SCORE'),92,265,84,'900','#fff');t(`${score} RANK SCORE`,92,325,30,'800','#d7e9df');t(v19LeagueBadge(league).toUpperCase(),92,380,34,'900','#bfe8ca');ctx.fillStyle='rgba(255,255,255,.15)';ctx.fillRect(92,430,896,22);ctx.fillStyle='#79d29b';ctx.fillRect(92,430,896*Math.min(1,score/100),22);t('THIS WEEK',92,545,20,'900','#bfe8ca');t(`${w.completion}% consistency`,92,595,40,'900','#fff');t(`🔥 ${w.best} day best streak`,92,645,27,'700','#d7e9df');t(`${escapeHtml(data.name||'My Arc')}`,92,885,30,'900','#2d7d47');t('My Arc · Small wins become your story.',92,940,38,'900','#202522');t('Weekly rank resets with your new week.',92,1010,22,'700','#70766f');t('Winter Arc Tracker',92,1170,23,'800','#2d7d47');
      const blob=await new Promise(r=>c.toBlob(r,'image/png',.95));const file=new File([blob],'winter-arc-rank-v19.png',{type:'image/png'});const msg=`My Winter Arc rank: ${rank?'#'+rank:'local'} · ${score}/100 · ${v19LeagueBadge(league)}\nJoin me: ${location.href}`;
      if(navigator.share){if(navigator.canShare?.({files:[file]})){try{await navigator.share({title:'My Arc League rank',text:msg,files:[file]});return}catch(e){}}try{await navigator.share({title:'My Arc League rank',text:msg});return}catch(e){}}
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='winter-arc-rank-v19.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200);showToast('Rank card saved ↗');
    }catch(e){showToast('Could not create rank card');}
  }

  /* Keep the original V18.1 renderer as a stable base. */
  const baseRenderV19=render;
  // Use the wrapper below; V19 does not replace the working V18.1 core.
  render=function(){
    if(tab==='rank'&&!isLocked()){
      baseRenderV19();
      const main=document.querySelector('.v18-main');
      if(main)main.outerHTML=v19RankPage();
      v18Style?.();
    }else{
      baseRenderV19();
    }
    v19Style();
    const nav=document.querySelector('.v18-nav .v18-navinner');
    if(nav&&!isLocked())nav.innerHTML='<button data-v19-nav="today" class="'+(tab==='today'?'active':'')+'"><b>🏠</b>Today</button><button data-v19-nav="week" class="'+(tab==='week'?'active':'')+'"><b>📅</b>Week</button><button data-v19-nav="rank" class="'+(tab==='rank'?'active':'')+'"><b>🏆</b>Rank</button><button data-v19-nav="profile" class="'+(tab==='profile'?'active':'')+'"><b>👤</b>Profile</button><button data-v19-nav="more" class="'+(tab==='more'?'active':'')+'"><b>•••</b>More</button>';
    if(!isLocked()){
      const menuBtn=document.querySelector('[data-v181-menu],[data-v18-menu]');if(menuBtn){menuBtn.removeAttribute('data-v181-menu');menuBtn.removeAttribute('data-v18-menu');menuBtn.setAttribute('data-v19-menu','1');}
    }
    if(v19MenuOpen&&!document.querySelector('.v19-menu-overlay')){const holder=document.createElement('div');holder.innerHTML=v19MenuSheet();document.body.appendChild(holder.firstElementChild);}
    bindDomState();
  };

  window.addEventListener('click',async e=>{
    const b=e.target.closest('button,a');if(!b)return;
    if(b.dataset.v19Nav!==undefined){e.preventDefault();e.stopImmediatePropagation();tab=b.dataset.v19Nav;morePanel='';v19MenuOpen=false;render();if(tab==='rank')v19LoadLeaderboard();return;}
    if(b.dataset.v19Menu!==undefined){e.preventDefault();e.stopImmediatePropagation();v19MenuOpen=true;render();return;}
    if(b.dataset.v19MenuClose!==undefined || (v19MenuOpen&&e.target.closest('.v19-menu-overlay')===e.target)){e.preventDefault();e.stopImmediatePropagation();v19MenuOpen=false;render();return;}
    if(b.dataset.v19RankTab!==undefined){e.preventDefault();e.stopImmediatePropagation();data.v19LeaderboardTab=b.dataset.v19RankTab;save();render();if(data.v19LeaderboardTab==='global')v19LoadLeaderboard();return;}
    if(b.dataset.v19Refresh!==undefined){e.preventDefault();e.stopImmediatePropagation();v19LoadLeaderboard();return;}
    if(b.dataset.v19Community!==undefined){e.preventDefault();e.stopImmediatePropagation();window.__v14Cloud=true;render();return;}
    if(b.dataset.v19ShareRank!==undefined){e.preventDefault();e.stopImmediatePropagation();await v19ShareRank();return;}
    if(b.dataset.v19ChallengeCreate!==undefined){e.preventDefault();e.stopImmediatePropagation();const title=prompt('Challenge name','7-Day Small Wins');if(!title)return;const d=Number(prompt('How many days?','7'))||7;const ch={code:uid().toUpperCase(),title:title.trim().slice(0,60),days:Math.max(2,Math.min(90,d)),start:today(),description:'Show up once a day and keep the streak alive.',creator:data.name||'My Arc'};data.v19Challenges.unshift(ch);data.v19Challenges=data.v19Challenges.slice(0,3);save();render();if(data.cloudOptIn){const ok=await v19ChallengeBackendUpsert(ch);showToast(ok?'Challenge synced ⚔️':'Challenge saved locally ⚔️');}else showToast('Challenge created ⚔️');return;}
    if(b.dataset.v19ChallengeShare!==undefined){e.preventDefault();e.stopImmediatePropagation();const ch=data.v19Challenges[0];if(!ch)return;const url=v19ChallengeUrl(ch);try{if(navigator.share){await navigator.share({title:ch.title,text:'Join my Winter Arc challenge ⚔️',url});return;}if(navigator.clipboard){await navigator.clipboard.writeText(url);showToast('Challenge link copied ↗');return;}}catch(err){}showToast('Challenge link ready');return;}
    if(b.dataset.v19ChallengeRefresh!==undefined){e.preventDefault();e.stopImmediatePropagation();await v19LoadChallengeMembers(data.v19Challenges[0]);return;}
    if(b.dataset.v19ChallengeClear!==undefined){e.preventDefault();e.stopImmediatePropagation();data.v19Challenges.shift();save();render();return;}
  },{capture:true});

  /* Auto-save a rankable snapshot only when the user has opted into community sync. */
  const baseToggleHabitV19=toggleHabit;
  let v19SyncTimer=null;
  toggleHabit=function(h,d){const before=done(h,d);baseToggleHabitV19(h,d);if(!before&&data.cloudOptIn){clearTimeout(v19SyncTimer);v19SyncTimer=setTimeout(()=>{try{cloudSync()}catch(e){}},1200);}};

  const baseCloudSyncV19=cloudSync;
  cloudSync=async function(){await baseCloudSyncV19();await v19SyncActiveChallenge();};

  data.schema=19;save();v19Style();
})();

communityCheckin();
render();


/* ========================= V20 — CLEAN MOBILE SHELL =========================
   V20 keeps the existing data/logic but replaces the primary shell with a
   focused mobile-first UI. Home is intentionally compact; Rank shows Top 20.
*/
(function(){
  'use strict';

  let v20MenuOpen=false;
  let v20RankRows=[];
  let v20RankStatus='idle';
  let v20RankError='';
  let v20RankQuery='';
  let v20RankUpdated=0;

  function v20Style(){
    if(document.getElementById('v20-style'))return;
    const s=document.createElement('style');s.id='v20-style';
    s.textContent=`
      body{background:var(--bg)}
      .v20-app{width:100%;max-width:720px;margin:auto;min-height:100vh;padding-bottom:82px;color:var(--ink)}
      .v20-top{position:sticky;top:0;z-index:60;background:rgba(245,243,237,.94);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
      body.dark .v20-top{background:rgba(17,22,18,.94)}
      .v20-toprow{display:grid;grid-template-columns:42px minmax(0,1fr) 42px 42px;align-items:center;gap:7px;padding:10px 12px}
      .v20-iconbtn{width:42px;height:42px;border:1px solid var(--line);border-radius:13px;background:var(--card);color:var(--ink);font-weight:950;display:grid;place-items:center}
      .v20-brand{min-width:0}.v20-brand b{display:block;font-size:18px;line-height:1.05;letter-spacing:-.03em}.v20-brand span{display:block;margin-top:3px;color:var(--muted);font-size:9px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .v20-main{padding:10px 11px 0}.v20-page{width:100%;min-width:0}
      .v20-hero{background:linear-gradient(145deg,#eaf5ed,#fff);border:1px solid #cde2d1;border-radius:24px;padding:16px;margin-bottom:10px}
      body.dark .v20-hero{background:linear-gradient(145deg,#1a281f,#171d18);border-color:#314739}
      .v20-kicker{font-size:9px;letter-spacing:.13em;text-transform:uppercase;font-weight:950;color:#2d7d47}.v20-hero h1{font-size:28px;line-height:1.03;letter-spacing:-.045em;margin:5px 0 5px}.v20-hero p{margin:0;color:var(--muted);font-size:11px;line-height:1.45}
      .v20-hero-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center}.v20-ring{width:76px;height:76px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#3da35d var(--p),#dfe8df 0);position:relative}.v20-ring:after{content:"";position:absolute;inset:6px;border-radius:50%;background:var(--card)}.v20-ring>div{position:relative;z-index:1;text-align:center}.v20-ring b{display:block;font-size:19px}.v20-ring span{font-size:8px;color:var(--muted);font-weight:900}
      .v20-next{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px;margin-bottom:10px;box-shadow:var(--shadow)}.v20-next-head{display:flex;justify-content:space-between;gap:9px;align-items:flex-start}.v20-next-label{font-size:9px;letter-spacing:.12em;font-weight:950;color:#2d7d47}.v20-next h2{font-size:21px;margin:4px 0 2px;letter-spacing:-.035em}.v20-next p{margin:0;color:var(--muted);font-size:11px;line-height:1.4}.v20-next-row{display:grid;grid-template-columns:46px minmax(0,1fr) 48px;gap:9px;align-items:center;margin-top:11px}.v20-hicon{width:46px;height:46px;border-radius:14px;background:var(--soft2);border:1px solid var(--line);display:grid;place-items:center;font-size:22px}.v20-check{width:48px;height:48px;border-radius:15px;border:1px solid var(--green);background:var(--green);color:#fff;font-size:20px;font-weight:950;display:grid;place-items:center}.v20-check.done{background:#256e3e}.v20-next-name{font-size:13px;font-weight:950}.v20-next-action{font-size:10px;color:var(--muted);margin-top:3px;line-height:1.35}
      .v20-section{margin:13px 0}.v20-head{display:flex;justify-content:space-between;align-items:end;gap:8px;margin-bottom:7px}.v20-head h2{font-size:17px;margin:0;letter-spacing:-.025em}.v20-head span{font-size:9px;color:var(--muted);font-weight:850}.v20-list{display:grid;gap:7px}.v20-habit{display:grid;grid-template-columns:38px minmax(0,1fr) 44px;gap:9px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:9px}.v20-habit.completed{background:var(--soft)}.v20-habit .v20-hicon{width:38px;height:38px;border-radius:12px;font-size:19px}.v20-habit-name{font-size:12px;font-weight:950;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v20-habit-meta{font-size:9px;color:var(--muted);margin-top:3px;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v20-smallcheck{width:44px;height:40px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--muted);font-weight:950;font-size:17px}.v20-smallcheck.done{background:var(--green);border-color:var(--green);color:#fff}
      .v20-statbar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.v20-stat{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:10px}.v20-stat b{display:block;font-size:18px;line-height:1}.v20-stat span{display:block;font-size:8px;color:var(--muted);margin-top:4px;font-weight:850}
      .v20-bottom{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(720px,100%);z-index:70;background:rgba(255,255,255,.95);border-top:1px solid var(--line);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}body.dark .v20-bottom{background:rgba(23,29,24,.96)}.v20-bottom-inner{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;padding:6px 8px 7px}.v20-bottom button{border:0;background:transparent;color:var(--muted);min-height:50px;border-radius:13px;font-size:9px;font-weight:900;display:grid;place-items:center;gap:1px}.v20-bottom button b{font-size:17px;line-height:1}.v20-bottom button.active{background:var(--soft);color:var(--green2)}
      .v20-week-summary{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px;margin-bottom:9px}.v20-week-summary h1{margin:3px 0;font-size:25px;letter-spacing:-.04em}.v20-week-summary p{margin:0;color:var(--muted);font-size:10px}.v20-week-score{font-size:28px;font-weight:950;text-align:right}.v20-week-score small{display:block;font-size:8px;color:var(--muted);text-transform:uppercase}
      .v20-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;margin-bottom:10px}.v20-day{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:8px 3px;text-align:center}.v20-day.today{outline:2px solid #9fc7aa}.v20-day small{display:block;color:var(--muted);font-size:8px;font-weight:900}.v20-day b{display:block;font-size:12px;margin-top:4px}.v20-day .bar{height:4px;background:#e5ebe5;border-radius:999px;margin-top:5px;overflow:hidden}.v20-day .bar i{display:block;height:100%;background:var(--green);border-radius:inherit}
      .v20-rank-hero{background:linear-gradient(145deg,#173f3a,#183b2d);color:#fff;border-radius:22px;padding:16px;margin-bottom:10px}.v20-rank-top{display:flex;justify-content:space-between;gap:10px;align-items:end}.v20-rank-top h1{margin:4px 0;font-size:30px;letter-spacing:-.045em}.v20-rank-top p{margin:0;color:#d8ece1;font-size:10px;line-height:1.4}.v20-score{text-align:right}.v20-score b{display:block;font-size:27px}.v20-score span{font-size:8px;color:#c8e4d4;text-transform:uppercase}.v20-rank-track{height:8px;background:rgba(255,255,255,.14);border-radius:999px;overflow:hidden;margin-top:12px}.v20-rank-track i{display:block;height:100%;background:#7bd29b;border-radius:inherit}.v20-rank-pills{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}.v20-pill{padding:5px 7px;border-radius:999px;background:rgba(255,255,255,.09);color:#d8eee2;font-size:8px;font-weight:900}
      .v20-rankbar{display:flex;justify-content:space-between;gap:8px;align-items:center;margin:10px 0 7px}.v20-rankbar h2{font-size:17px;margin:0}.v20-refresh{border:1px solid var(--line);background:var(--card);color:var(--ink);width:38px;height:38px;border-radius:12px;font-weight:950}.v20-search{width:100%;height:40px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink);padding:9px;font-size:10px;outline:none;margin-bottom:7px}
      .v20-ranklist{display:grid;gap:6px}.v20-rankrow{display:grid;grid-template-columns:29px 38px minmax(0,1fr) auto;gap:8px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:15px;padding:8px}.v20-rankrow.me{background:var(--soft);border-color:#9fc9aa}.v20-ranknum{text-align:center;font-size:10px;font-weight:950;color:var(--muted)}.v20-rankavatar{width:36px;height:36px;border-radius:12px;background:var(--soft2);color:var(--green2);display:grid;place-items:center;font-size:12px;font-weight:950}.v20-rankname{font-size:11px;font-weight:950;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v20-ranksub{font-size:8px;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v20-rankside{text-align:right}.v20-rankside b{display:block;font-size:13px}.v20-rankside span{display:block;color:var(--green2);font-size:7px;font-weight:900;margin-top:2px}.v20-note{padding:10px 11px;border:1px dashed var(--line);border-radius:14px;background:var(--soft2);color:var(--muted);font-size:9px;line-height:1.45}.v20-note b{color:var(--ink);display:block;margin-bottom:2px}
      .v20-profile-hero{background:var(--card);border:1px solid var(--line);border-radius:21px;padding:14px;margin-bottom:9px}.v20-profile-top{display:flex;gap:10px;align-items:center}.v20-profile-avatar{width:54px;height:54px;border-radius:17px;background:var(--soft);display:grid;place-items:center;font-size:22px;font-weight:950;color:var(--green2)}.v20-profile-top h1{font-size:20px;margin:1px 0}.v20-profile-top p{margin:0;color:var(--muted);font-size:10px}.v20-progress{height:8px;background:#e3ebe4;border-radius:999px;overflow:hidden;margin-top:12px}.v20-progress i{display:block;height:100%;background:var(--green);border-radius:inherit}
      .v20-tools{display:grid;grid-template-columns:1fr 1fr;gap:7px}.v20-tool{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:15px;padding:11px;text-align:left;min-height:78px}.v20-tool b{display:block;font-size:11px}.v20-tool small{display:block;color:var(--muted);font-size:8px;line-height:1.35;margin-top:3px}
      .v20-menu-bg{position:fixed;inset:0;z-index:120;background:rgba(8,14,10,.5);display:flex;align-items:flex-start;padding:8px}.v20-menu{width:min(330px,92vw);background:var(--card);border-radius:22px;padding:12px;box-shadow:0 22px 80px rgba(0,0,0,.3)}.v20-menu-head{display:flex;justify-content:space-between;align-items:center;gap:8px}.v20-menu-head h2{margin:0;font-size:19px}.v20-menu-links{display:grid;gap:5px;margin-top:9px}.v20-menu-links button{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:13px;padding:10px;text-align:left;font-size:10px;font-weight:900}
      @media(max-width:430px){.v20-main{padding-left:8px;padding-right:8px}.v20-toprow{padding:8px 8px}.v20-hero{padding:14px}.v20-ring{width:68px;height:68px}.v20-bottom-inner{padding-left:5px;padding-right:5px}.v20-bottom button{min-height:48px}.v20-rankrow{grid-template-columns:25px 34px minmax(0,1fr) auto}.v20-rankavatar{width:34px;height:34px}.v20-tools{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function v20Day(){return typeof v13ArcDay==='function'?v13ArcDay():0}
  function v20ArcLen(){return typeof v13ArcLength==='function'?v13ArcLength():92}
  function v20ArcPct(){return typeof v13ArcProgress==='function'?v13ArcProgress():0}
  function v20LocalRank(){
    try{
      if(typeof cloudSnapshot==='function'){
        const x=cloudSnapshot();
        return {score:Number(x.rank_score)||0,league:String(x.league||'Starter'),week:Number(x.week_score)||0};
      }
    }catch(e){}
    const ds=typeof v12MiniDays==='function'?v12MiniDays():[];let elig=0,n=0;ds.forEach(d=>data.habits.forEach(h=>{if(canUseHabitOn(h,d)){elig++;if(active(h,d))n++}}));const week=elig?Math.round(n/elig*100):0;const best=Math.max(0,...data.habits.map(h=>habitStats(h).longest));const wins=ds.reduce((z,d)=>z+data.habits.filter(h=>canUseHabitOn(h,d)&&done(h,d)).length,0);const score=Math.min(100,Math.round(week*.75+Math.min(15,Math.round(Math.min(best,30)/30*15))+Math.min(10,Math.round(Math.min(wins,21)/21*10))));const league=score>=90?'Diamond':score>=75?'Gold':score>=60?'Silver':score>=40?'Bronze':'Starter';return {score,league,week};
  }
  function v20League(league){return String(league||'Starter')}
  function v20Top20(){return v20RankRows.slice(0,20)}
  function v20Filtered(){const q=v20RankQuery.trim().toLowerCase();if(!q)return v20Top20();return v20Top20().filter(x=>String(x.display_name||'').toLowerCase().includes(q)||String(x.instagram_handle||'').toLowerCase().includes(q))}
  function v20RankMy(){const id=data.cloudUserId||'';const i=v20RankRows.findIndex(x=>x.id===id);return i>=0?{rank:i+1,row:v20RankRows[i]}:{rank:null,row:null}}
  async function v20LoadRank(){
    if(v20RankStatus==='loading')return;
    v20RankStatus='loading';v20RankError='';renderV20();
    if(!(typeof cloudReady==='function'&&cloudReady())){v20RankStatus='offline';v20RankError='Community sync is not configured yet. Your local score is still available.';renderV20();return;}
    try{
      if(data.cloudOptIn&&typeof cloudSync==='function')await cloudSync();
      const q='select=id,display_name,arc_day,total_arc_days,arc_progress,total_wins,best_streak,week_score,rank_score,league,week_key,last_seen,public_profile&public_profile=eq.true&order=rank_score.desc,best_streak.desc,total_wins.desc&limit=100';
      const r=await fetch(CLOUD_CFG.url+'/rest/v1/arc_users?'+q,{headers:typeof cloudHeaders==='function'?cloudHeaders():{}});
      if(!r.ok)throw new Error('rank '+r.status);
      v20RankRows=(await r.json()).filter(x=>x&&x.public_profile).map(x=>Object.assign({},x,{rankScore:Number(x.rank_score??0)}));
      v20RankStatus='ready';v20RankUpdated=Date.now();
      const me=v20RankMy();
      if(me.rank){data.v19RankHistory=(Array.isArray(data.v19RankHistory)?data.v19RankHistory:[]).filter(x=>x.date!==today()).concat({date:today(),rank:me.rank}).slice(-30);save();}
      renderV20();
    }catch(e){v20RankStatus='error';v20RankError='Could not load the public Top 20 right now. Check Community Sync and try again.';renderV20();}
  }
  function v20HabitRow(h){const d=today(),is=done(h,d),hs=habitStats(h);return `<article class="v20-habit ${is?'completed':''}"><div class="v20-hicon">${escapeHtml(h.icon||'✅')}</div><div><div class="v20-habit-name">${escapeHtml(h.name)}${h.private?' 🔒':''}</div><div class="v20-habit-meta">🔥 ${hs.run} day streak · ${hs.weekPct}% this week · ${escapeHtml(h.smallWin||h.action||'Smallest useful version')}</div></div><button class="v20-smallcheck ${is?'done':''}" data-v20-complete="${escapeHtml(h.id)}" aria-label="${is?'Undo':'Complete'} ${escapeHtml(h.name)}">${is?'✓':'○'}</button></article>`}
  
  function v25ArcHabitBestStreak(h){const ds=v13ArcDates().filter(d=>canUseHabitOn(h,d));let cur=0,best=0;for(const d of ds){if(active(h,d)){cur++;best=Math.max(best,cur)}else cur=0}return best;}
  function v25ArcBestStreak(){return Math.max(0,...data.habits.map(v25ArcHabitBestStreak));}
  function v25ArcCurrentStreak(){const ds=v13ArcDates();if(!data.habits.length)return 0;let run=0;for(let i=ds.length-1;i>=0;i--){const d=ds[i];if(d===today()&&!data.habits.every(h=>active(h,d)))continue;if(data.habits.every(h=>active(h,d)))run++;else break;}return run;}
  function v25ArcWeeklyScore(){const ds=v13ArcDates().slice(-7);let e=0,n=0;for(const d of ds)for(const h of data.habits)if(canUseHabitOn(h,d)){e++;if(active(h,d))n++;}return e?Math.round(n/e*100):0;}
function v20Today(){
    const s=stats(),day=v20Day(),pct=data.habits.length?Math.round(s.todayDone/data.habits.length*100):0,f=focusHabit(),rank=v20LocalRank();
    return `<div class="v20-page"><section class="v20-hero"><div class="v20-hero-row"><div><div class="v20-kicker">WINTER ARC · ${day?'DAY '+day:'SETUP DAY'}</div><h1>${data.name?'Hi, '+escapeHtml(data.name)+' 👋':'Your next win starts here'}</h1><p>${day?`${s.todayDone}/${data.habits.length} habits done today.`:'Today is setup day. Tomorrow is Day 1.'}</p></div><div class="v20-ring" style="--p:${pct}%"><div><b>${pct}%</b><span>today</span></div></div></div></section>${f?`<section class="v20-next"><div class="v20-next-head"><div><div class="v20-next-label">NEXT WIN</div><h2>${escapeHtml(f.name)}</h2><p>${escapeHtml(f.smallWin||f.action||'Smallest useful version')}</p></div></div><div class="v20-next-row"><div class="v20-hicon">${escapeHtml(f.icon||'✅')}</div><div><div class="v20-next-name">${done(f,today())?'Completed ✓':'Ready when you are'}</div><div class="v20-next-action">🔥 ${habitStats(f).run} day streak · one useful action</div></div><button class="v20-check ${done(f,today())?'done':''}" data-v20-complete="${escapeHtml(f.id)}">${done(f,today())?'✓':'→'}</button></div></section>`:''}<section class="v20-section"><div class="v20-head"><h2>Today</h2><span>${s.todayDone}/${data.habits.length} complete</span></div><div class="v20-list">${data.habits.length?data.habits.map(v20HabitRow).join(''):`<div class="v20-note"><b>No habits yet.</b>Add your first habit to start today.</div>`}</div></section><section class="v20-section"><div class="v20-head"><h2>Your numbers</h2><span>Keep it simple</span></div><div class="v20-statbar"><div class="v20-stat"><b>🔥 ${Math.max(0,...data.habits.map(h=>habitStats(h).longest))}</b><span>Best streak</span></div><div class="v20-stat"><b>${s.completed}</b><span>Total wins</span></div><div class="v20-stat"><b>${rank.score}</b><span>Arc score</span></div></div></section></div>`;
  }
  function v20Week(){
    const s=stats(),ds=typeof v12MiniDays==='function'?v12MiniDays():[],eligible=(d)=>data.habits.filter(h=>canUseHabitOn(h,d)).length,n=(d)=>data.habits.filter(h=>active(h,d)).length;
    return `<div class="v20-page"><section class="v20-week-summary"><div><div class="v20-kicker">THIS WEEK</div><h1>${s.score}% complete</h1><p>Seven days. One small action at a time.</p></div><div class="v20-week-score">${s.todayDone}<small>today</small></div></section><section class="v20-days">${ds.map(d=>{const e=eligible(d),nn=n(d),p=e?Math.round(nn/e*100):0;return `<div class="v20-day ${d===today()?'today':''}"><small>${dateObj(d).toLocaleDateString(undefined,{weekday:'short'}).slice(0,2)}</small><b>${nn}/${e}</b><div class="bar"><i style="width:${p}%"></i></div></div>`}).join('')}</section><section class="v20-section"><div class="v20-head"><h2>Habit streaks</h2><span>Tap to complete today</span></div><div class="v20-list">${data.habits.length?data.habits.map(v20HabitRow).join(''):`<div class="v20-note"><b>Add a habit first.</b>Your weekly pattern will appear here.</div>`}</div></section></div>`;
  }
  function v20Rank(){
    const local=v20LocalRank(),me=v20RankMy(),rows=v20Filtered();
    const rankText=me.rank?'#'+me.rank:'Top 20';
    return `<div class="v20-page"><section class="v20-rank-hero"><div class="v20-rank-top"><div><div class="v20-kicker" style="color:#bfe8ca">ARC LEAGUE</div><h1>${rankText}</h1><p>${v20RankStatus==='ready'?'Public leaderboard synced.':'Your local Arc score is ready.'}</p></div><div class="v20-score"><b>${local.score}</b><span>rank score</span></div></div><div class="v20-rank-track"><i style="width:${local.score}%"></i></div><div class="v20-rank-pills"><span class="v20-pill">${v20League(local.league)}</span><span class="v20-pill">${local.week}% week</span><span class="v20-pill">🔥 ${Math.max(0,...data.habits.map(h=>habitStats(h).longest))}</span></div></section><section class="v20-section"><div class="v20-rankbar"><h2>🏆 Top 20</h2><button class="v20-refresh" data-v20-rank-refresh>↻</button></div><input class="v20-search" id="v20RankSearch" placeholder="Search Top 20 by name" value="${escapeHtml(v20RankQuery)}">${v20RankStatus==='offline'||v20RankStatus==='error'?`<div class="v20-note"><b>${escapeHtml(v20RankError)}</b>Turn on Community Sync to publish and load the global leaderboard.</div>`:''}<div class="v20-ranklist" style="margin-top:7px">${rows.length?rows.map((x)=>{const r=v20RankRows.indexOf(x)+1,name=escapeHtml(x.display_name||'Anonymous'),initial=escapeHtml((x.display_name||'?').slice(0,1).toUpperCase()),score=Number(x.rankScore)||0,league=escapeHtml(x.league||'Starter');return `<div class="v20-rankrow ${data.cloudUserId&&x.id===data.cloudUserId?'me':''}"><div class="v20-ranknum">#${r}</div><div class="v20-rankavatar">${initial}</div><div><div class="v20-rankname">${name}</div><div class="v20-ranksub">${Number(x.total_wins)||0} wins · 🔥 ${Number(x.best_streak)||0} streak</div></div><div class="v20-rankside"><b>${score}</b><span>${league}</span></div></div>`}).join(''):`<div class="v20-note"><b>Top 20 is waiting.</b>${v20RankStatus==='loading'?'Loading public profiles…':'Make your Arc public and the leaderboard will appear here.'}</div>`}</div>${v20RankRows.length>20?`<div class="v20-note" style="margin-top:8px"><b>Your global position</b>${me.rank&&me.rank>20?`You are #${me.rank}. The public screen keeps the Top 20 visible above.`:'You are currently inside the Top 20.'}</div>`:''}</section><section class="v20-note" style="margin-top:9px"><b>How score works</b>75% weekly consistency + 15% best streak + 10% weekly wins. Private habits and personal notes stay out of the public profile.</section></div>`;
  }
  function v20Profile(){
    const s=stats(),day=v20Day(),pct=v20ArcPct(),rank=v20LocalRank();
    return `<div class="v20-page"><section class="v20-profile-hero"><div class="v20-profile-top"><div class="v20-profile-avatar">${escapeHtml((data.name||'A').slice(0,1).toUpperCase())}</div><div style="min-width:0"><h1>${escapeHtml(data.name||'Your Arc')}</h1><p>${escapeHtml(String(data.goal||'Personal growth'))} · Winter Arc 2026</p></div></div><div class="v20-progress"><i style="width:${pct}%"></i></div><div class="v20-head" style="margin-top:7px"><span>Day ${day}/${v20ArcLen()}</span><span>${pct}% Arc progress</span></div></section><section class="v20-section"><div class="v20-head"><h2>Progress</h2><span>All time</span></div><div class="v20-statbar"><div class="v20-stat"><b>${s.completed}</b><span>Total wins</span></div><div class="v20-stat"><b>🔥 ${Math.max(0,...data.habits.map(h=>habitStats(h).longest))}</b><span>Best streak</span></div><div class="v20-stat"><b>${rank.score}</b><span>Arc score</span></div></div></section><section class="v20-section"><div class="v20-head"><h2>Share</h2><span>Optional</span></div><div class="v20-tools"><button class="v20-tool" data-v20-share><b>↗ Share my Arc</b><small>Create the existing clean 4:5 progress card.</small></button><button class="v20-tool" data-v20-nav="rank"><b>🏆 View Top 20</b><small>Open Arc League and your public rank.</small></button></div></section></div>`;
  }
  
  // V25.3 audience counter: one anonymous user registration per browser/device.
  // This is an approximate visitor count, not an Instagram/GitHub follower count.
  let v25Audience={totalUsers:null,publicCount:null,publicNames:[],loading:false,error:''};
  function v25CounterUrl(name){return 'https://counterapi.com/api/'+encodeURIComponent(COMMUNITY_NS)+'/view/'+encodeURIComponent(name);}
  function v25RecordOpen(){
    try{
      if(!data.v25UserRegistered && !localStorage.getItem('v25_user_registered')){
        fetch(v25CounterUrl('total-users')+'?unique=true',{cache:'no-store',keepalive:true}).then(r=>{
          if(r.ok){localStorage.setItem('v25_user_registered','1');data.v25UserRegistered=true;save();}
        }).catch(()=>{});
      }
    }catch(_){ }
  }
  async function v25LoadAudience(){
    if(v25Audience.loading)return;
    v25Audience.loading=true;v25Audience.error='';
    try{
      const r=await fetch(v25CounterUrl('total-users')+'?unique=true',{cache:'no-store'});
      if(!r.ok)throw new Error('counter');
      const j=await r.json();
      v25Audience.totalUsers=Math.max(0,Number(j?.value)||0);
    }catch(e){v25Audience.error='Total users is unavailable right now.';}
    if(cloudReady()){
      try{
        const rows=await rankFetch('get_public_leaderboard',{p_limit:6});
        v25Audience.publicNames=(Array.isArray(rows)?rows:[]).map(x=>({name:String(x.display_name||'Arc member'),score:Number(x.rank_score)||Number(x.rankScore)||0,wins:Number(x.total_wins)||0}));
      }catch(_){ }
    }
    v25Audience.loading=false;
    if(morePanel==='audience')renderV20();
  }
  function audiencePage(){
    if(!v25Audience.loading&&v25Audience.totalUsers===null&&!v25Audience.error)setTimeout(v25LoadAudience,0);
    return `<section class="v25-audience-page"><section class="v24-simple-card v25-audience-hero"><div><span class="kicker">AUDIENCE</span><h2>Total users</h2><p>One anonymous visitor count per browser/device is recorded when the tracker is first opened.</p></div><button class="btn" data-v25-audience-refresh aria-label="Refresh total users">↻</button></section><section class="v25-audience-total"><span>TOTAL USERS</span><b>${v25Audience.totalUsers===null?'—':v25Audience.totalUsers.toLocaleString()}</b><small>Approximate unique visitors · not a verified Instagram/GitHub follower count.</small></section><section class="v24-simple-card"><div class="v24-section-head"><div><span class="kicker">PUBLIC NAMES</span><h2>Members who chose to be visible</h2></div></div>${v25Audience.publicNames.length?`<div class="v25-name-list">${v25Audience.publicNames.map((x,i)=>`<div><span>#${i+1}</span><b>${escapeHtml(x.name)}</b><small>${x.score} score · ${x.wins} wins</small></div>`).join('')}</div>`:`<div class="v24-empty"><b>No public names loaded.</b><span>Community Sync + Public Profile are opt-in. Names are never collected silently.</span></div>`}</section>${v25Audience.error?`<div class="v24-empty"><b>${escapeHtml(v25Audience.error)}</b><span>Local tracker remains available.</span></div>`:''}</section>`;
  }
  function creatorPage(){
    if(!v25Audience.loading&&v25Audience.totalUsers===null&&!v25Audience.error)setTimeout(v25LoadAudience,0);
    const n=creatorName(),h=creatorHandle(),bio=data.creatorBio||'I created Winter Arc Tracker for people who want to make daily progress simple, visible and personal.',link=safeHttpsUrl(data.creatorLink),photos=['creator-profile.jpg','creator-photo-1.jpg','creator-photo-2.jpg','creator-photo-3.jpg'];
    return `<section class="v25-creator-page"><section class="v25-creator-hero"><div class="v25-creator-main"><img src="${escapeHtml(photos[0])}" alt="${escapeHtml(n)}" onerror="this.hidden=true"><div><span class="kicker">CREDIT BY</span><h2>${escapeHtml(n)}</h2><b>Data Engineer · ${escapeHtml(h||'@pandatvikas1')}</b><p>${escapeHtml(bio)}</p></div></div><div class="v25-photo-grid">${photos.slice(1).map((p,i)=>`<img src="${escapeHtml(p)}" alt="${escapeHtml(n)} photo ${i+2}" loading="lazy" onerror="this.hidden=true">`).join('')}</div><div class="v25-creator-actions">${link?`<a class="btn primary" href="${escapeHtml(link)}" target="_blank" rel="noopener">Instagram ↗</a>`:''}<button class="btn" data-share-progress>Share my Arc ↗</button></div></section>${audiencePage()}<div class="v24-simple-card"><span class="kicker">ABOUT THE CREATOR</span><p class="v25-creator-note">I created Winter Arc Tracker for people who want to make daily progress simple, visible and personal.</p></div></section>`;
  }

function v20More(){
    if(morePanel){
      let body='';
      try{body=morePanel==='manage'?manageHabitsHtml():morePanel==='goals'?goalsHtml():morePanel==='routine'?routineHtml():morePanel==='checkin'?checkinHtml():morePanel==='journal'?journalHtml():morePanel==='sleep'?sleepHtml():morePanel==='planner'?plannerHtml():morePanel==='reminders'?remindersHtml():morePanel==='security'?securityHtml():morePanel==='settings'?settingsHtml():morePanel==='backup'?backupPage():morePanel==='creator'?creatorPage():morePanel==='about'?aboutPage():morePanel==='getapp'?getAppPage():morePanel==='achievements'?achievementsPage():morePanel==='insights'?insightsPage():morePanel==='credits'?creditsHtml():morePanel==='audience'?audiencePage():morePanel==='rank'?v20Rank():morePanel==='arc'?v24Arc():morePanel==='month'?v24Month():morePanel==='profile'?v20Profile():'<div class="v24-empty">Tool unavailable.</div>'}catch(e){body='<div class="v24-empty">Tool unavailable. Your tracker data is safe.</div>'}
      return `<div class="v24-page"><section class="v24-detail-head"><button class="btn" data-v20-close>← More</button><h1>${escapeHtml(morePanel.charAt(0).toUpperCase()+morePanel.slice(1))}</h1></section>${body}</div>`;
    }
    const tile=(icon,title,sub,id)=>`<button class="v24-tool-tile" data-v20-more="${id}" aria-label="${escapeHtml(title)}"><span>${icon}</span><div><b>${escapeHtml(title)}</b><small>${escapeHtml(sub)}</small></div><strong>→</strong></button>`;
    const special=(icon,title,sub,attr)=>`<button class="v24-tool-tile" ${attr}><span>${icon}</span><div><b>${escapeHtml(title)}</b><small>${escapeHtml(sub)}</small></div><strong>→</strong></button>`;
    return `<div class="v24-page"><section class="v24-page-head"><span class="kicker">MORE</span><h1>Everything advanced, kept simple.</h1><p>Today stays focused. Open deeper tools only when you need them.</p></section>
      <section class="v24-group"><h2>Your Journey</h2>${tile('📈','Insights','Spot patterns and trends.','insights')}${tile('🏆','Achievements','Milestones and progress.','achievements')}${tile('❄️','Arc','Your full 92-day journey.','arc')}${tile('🗓️','Month','Calendar and monthly breakdown.','month')}</section>
      <section class="v24-group"><h2>Daily Tools</h2>${tile('✅','Manage habits','Add, edit, private labels and history.','manage')}${tile('🎯','Goals','One focus and measurable target.','goals')}${tile('🔁','Routines','Build and run step-by-step routines.','routine')}${tile('🗓️','Day planner','Set preferred times.','planner')}${tile('🌤️','Mood & energy','Quick private check-in.','checkin')}${tile('✍️','Journal','One-line reflection.','journal')}${tile('😴','Sleep','Track sleep basics.','sleep')}${tile('⏰','Reminders','Optional local reminders.','reminders')}${tile('🔐','Privacy & security','PIN and profile security.','security')}</section>
      <section class="v24-group"><h2>Community & App</h2>${special('↗','Share & invite','4:5 progress card and invite link.','data-open-share-center')}${special('⚔️','Compare with a friend','Compare shared Arc snapshots.','data-open-compare')}${special('☁️','Community Sync','Optional cloud sharing and public profile.','data-open-cloud')}${tile('🏆','Top 20 Rank','Public leaderboard and exact rank.','rank')}${tile('📱','Get the App','Install as an app when supported.','getapp')}${tile('👤','Creator','Meet the creator.','creator')}${tile('❤️','Credits','Creator credit and photo showcase.','credits')}${tile('👥','Total users','Approximate unique tracker visitors.','audience')}${tile('💾','Backup','Export or restore local data.','backup')}${tile('⚙️','Settings','Theme, sync and local controls.','settings')}${tile('ℹ️','About Winter Arc','How Winter Arc works.','about')}</section></div>`;
  }
  function v20Menu(){return `<div class="v20-menu-bg" data-v20-menu-close><aside class="v20-menu" role="dialog" aria-modal="true"><div class="v20-menu-head"><div><div class="v20-kicker">WINTER ARC</div><h2>Quick navigation</h2></div><button class="v20-iconbtn" data-v20-menu-close>×</button></div><div class="v20-menu-links"><button data-v20-nav="today">🏠 Today</button><button data-v20-nav="week">📅 Week</button><button data-v20-nav="rank">🏆 Top 20 Rank</button><button data-v20-nav="profile">👤 Profile</button><button data-v20-nav="arc">❄️ Arc</button><button data-v20-nav="month">🗓️ Month</button><button data-v20-nav="more">••• More</button></div></aside></div>`}
  function v20Shell(){
    const initial=escapeHtml((data.name||'A').slice(0,1).toUpperCase());
    let body=tab==='today'?v20Today():tab==='week'?v20Week():tab==='rank'?v20Rank():tab==='profile'?v20Profile():tab==='arc'?`<div class=\"v20-page\"><div class=\"v20-legacy-wrap\">${v14ArcPage()}</div></div>`:tab==='month'?`<div class=\"v20-page\"><div class=\"v20-legacy-wrap\">${v14MonthPage()}</div></div>`:v20More();
    const labels=[['today','🏠','Today'],['week','📅','Week'],['rank','🏆','Rank'],['profile','👤','Profile'],['more','•••','More']];
    document.body.classList.toggle('dark',!!data.dark);
    document.body.innerHTML=`<div class="v20-app"><header class="v20-top"><div class="v20-toprow"><button class="v20-iconbtn" data-v20-menu aria-label="Menu">☰</button><div class="v20-brand"><b>Winter Arc</b><span>2026 · ${escapeHtml(data.name||'Your Arc')}</span></div><button class="v20-iconbtn" data-v20-share aria-label="Share">↗</button><button class="v20-iconbtn" data-v20-nav="profile" aria-label="Profile">${initial}</button></div></header><main class="v20-main">${body}</main><nav class="v20-bottom"><div class="v20-bottom-inner">${labels.map(([id,icon,label])=>`<button class="${tab===id?'active':''}" data-v20-nav="${id}"><b>${icon}</b>${label}</button>`).join('')}</div></nav>${v20MenuOpen?v20Menu():''}</div>`;
    if(tab==='rank'&&v20RankStatus==='idle')setTimeout(v20LoadRank,0);
  }
  const previousRenderV20=render;
  function renderV20(){
    v20Style();
    if(isLocked()||!data.profileCreated||!data.onboardingDone){previousRenderV20();return;}
    v20Shell();
  }
  render=renderV20;

  document.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.v20Nav!==undefined){e.preventDefault();e.stopImmediatePropagation();tab=b.dataset.v20Nav;morePanel='';selectedHabit=null;quickOpen=false;v20MenuOpen=false;renderV20();return;}
    if(b.dataset.v20Menu!==undefined){e.preventDefault();e.stopImmediatePropagation();v20MenuOpen=true;renderV20();return;}
    if(b.dataset.v20MenuClose!==undefined || (e.target.closest('.v20-menu-bg')&&e.target===e.target.closest('.v20-menu-bg'))){e.preventDefault();e.stopImmediatePropagation();v20MenuOpen=false;renderV20();return;}
    if(b.dataset.v20Complete!==undefined){e.preventDefault();e.stopImmediatePropagation();const h=data.habits.find(x=>x.id===b.dataset.v20Complete);if(h)toggleHabit(h,today());return;}
    if(b.dataset.v20Share!==undefined){e.preventDefault();e.stopImmediatePropagation();if(typeof v133ShareProgress==='function')await v133ShareProgress();return;}
    if(b.dataset.v20More!==undefined){e.preventDefault();e.stopImmediatePropagation();tab='more';morePanel=b.dataset.v20More;renderV20();return;}
    if(b.dataset.v20Close!==undefined){e.preventDefault();e.stopImmediatePropagation();morePanel='';renderV20();return;}
    if(b.dataset.v20RankRefresh!==undefined){e.preventDefault();e.stopImmediatePropagation();v20RankStatus='idle';await v20LoadRank();return;}
  },{capture:true});
  document.addEventListener('input',e=>{if(e.target?.id==='v20RankSearch'){v20RankQuery=e.target.value;renderV20();const el=document.getElementById('v20RankSearch');if(el){el.focus();el.setSelectionRange(v20RankQuery.length,v20RankQuery.length)}}},{passive:true});

  /* Start V20 shell after the legacy boot has initialized the existing store. */

  /* ========================= V24.1 STABILITY + UX PATCH ========================= */
  let v24DeleteHabitId=null;
  let v24LoginError='';
  let v24RankMyGlobal=null;
  let v20RankActive=[];
  let v24AccessToken='';

  // Fixed Winter Arc date source: historical data is preserved, but current Arc metrics
  // only count 1 Oct 2026 → 31 Dec 2026 and a habit only from its created date.
  data.arcStart=WINTER_ARC_START;
  data.arcLength=WINTER_ARC_LENGTH;
  if(!/^2026-(10|11|12)$/.test(data.month||''))data.month=currentMonth();
  if(data.month<'2026-10')data.month='2026-10';
  if(data.month>'2026-12')data.month='2026-12';
  save();

  canUseHabitOn=function(h,d){
    if(!h||typeof d!=='string')return false;
    if(d<WINTER_ARC_START||d>WINTER_ARC_END)return false;
    const created=/^\d{4}-\d{2}-\d{2}$/.test(String(h.created||''))?String(h.created):WINTER_ARC_START;
    return d>=created;
  };
  journeyDay=function(){
    if(today()<WINTER_ARC_START)return 0;
    return Math.min(WINTER_ARC_LENGTH,Math.max(0,dateDiff(WINTER_ARC_START,today())+1));
  };
  allDates=function(){
    if(today()<WINTER_ARC_START)return [];
    const stop=today()>WINTER_ARC_END?WINTER_ARC_END:today();
    const n=Math.max(0,dateDiff(WINTER_ARC_START,stop)+1);
    return Array.from({length:n},(_,i)=>addDays(WINTER_ARC_START,i));
  };
  habitStats=function(h){
    const dates=allDates().filter(d=>canUseHabitOn(h,d));
    let run=0,longest=0,cur=0;
    if(dates.length){
      let idx=dates.length-1;
      if(dates[idx]===today()&&!active(h,today()))idx--;
      for(;idx>=0;idx--){if(active(h,dates[idx]))run++;else break;}
      for(const d of dates){if(active(h,d)){cur++;longest=Math.max(longest,cur);}else cur=0;}
    }
    const total=dates.filter(d=>done(h,d)).length;
    const weekDates=dates.filter(d=>d>=addDays(today(),-6)&&d<=today());
    const weekDone=weekDates.filter(d=>active(h,d)).length;
    const monthDates=makeDays(data.month).filter(d=>d>=WINTER_ARC_START&&d<=WINTER_ARC_END&&d<=today()&&canUseHabitOn(h,d));
    const monthDone=monthDates.filter(d=>done(h,d)).length;
    const monthEligible=Math.max(1,monthDates.length);
    return {run,longest,total,weekDone,weekPct:Math.round(weekDone/7*100),monthDone,monthPct:Math.round(monthDone/monthEligible*100)};
  };
  weeklyScore=function(){
    const ds=allDates().filter(d=>d>=addDays(today(),-6));
    let eligible=0,n=0;
    for(const d of ds)for(const h of data.habits){if(!canUseHabitOn(h,d))continue;eligible++;if(active(h,d))n++;}
    return eligible?Math.min(100,Math.round(n/eligible*100)):0;
  };
  stats=function(){
    const ds=allDates(); let total=0,completed=0;
    for(const d of ds)for(const h of data.habits){if(canUseHabitOn(h,d)){total++;if(done(h,d))completed++;}}
    const todayDone=data.habits.filter(h=>done(h,today())).length;
    let full=0;
    for(let i=ds.length-1;i>=0;i--){const d=ds[i];if(d===today()&&!data.habits.every(h=>active(h,d)))continue;if(data.habits.length&&data.habits.every(h=>active(h,d)))full++;else break;}
    let longest=0,cur=0;
    for(const d of ds){if(data.habits.length&&data.habits.every(h=>active(h,d))){cur++;longest=Math.max(longest,cur);}else cur=0;}
    let bestH=null,best=0;
    for(const h of data.habits){const n=habitStats(h).total;if(n>best){best=n;bestH=h;}}
    const sleepVals=ds.map(d=>Number(data.sleep[d]?.hours)).filter(v=>v>0);
    const avg=sleepVals.length?sleepVals.reduce((a,b)=>a+b,0)/sleepVals.length:0;
    const firstWin=data.habits.some(h=>done(h,today()));
    return {total,completed,pct:total?Math.round(completed/total*100):0,todayDone,fullStreak:full,longest,bestH,best,avg,score:weeklyScore(),firstWin};
  };

  // Fixed Arc functions used by the preserved Arc renderer and share card.
  v13ArcStart=function(){return WINTER_ARC_START;};
  v13ArcLength=function(){return WINTER_ARC_LENGTH;};
  v13ArcEnd=function(){return WINTER_ARC_END;};
  v13ArcStarted=function(){return today()>=WINTER_ARC_START;};
  v13ArcDay=function(){return today()<WINTER_ARC_START?0:Math.min(WINTER_ARC_LENGTH,dateDiff(WINTER_ARC_START,today())+1);};
  v13ArcProgress=function(){const d=v13ArcDay();return Math.min(100,Math.round(d/WINTER_ARC_LENGTH*100));};
  v13ArcRemaining=function(){const d=v13ArcDay();return d?Math.max(0,WINTER_ARC_LENGTH-d):WINTER_ARC_LENGTH;};
  v13ArcDates=function(){if(today()<WINTER_ARC_START)return [];const stop=today()>WINTER_ARC_END?WINTER_ARC_END:today();const n=dateDiff(WINTER_ARC_START,stop)+1;return Array.from({length:Math.max(0,n)},(_,i)=>addDays(WINTER_ARC_START,i));};
  v13ArcWins=function(){const ds=v13ArcDates();return data.habits.reduce((n,h)=>n+ds.filter(d=>canUseHabitOn(h,d)&&done(h,d)).length,0);};
  v13TotalWins=function(){return v13ArcWins();};

  function v24RebuildXp(){
    const events={}; let xp=0;
    for(const [k,v] of Object.entries(data.checks||{})){
      if(!v)continue;
      const parts=String(k).split('|'); const hid=parts[0], d=parts[1];
      const h=data.habits.find(x=>x.id===hid);
      if(!h||!/^\d{4}-\d{2}-\d{2}$/.test(String(d||'')))continue;
      if(d<WINTER_ARC_START||d>WINTER_ARC_END||!canUseHabitOn(h,d))continue;
      events[k]=10; xp+=10;
    }
    const bonus={};
    const dates=new Set(Object.keys(events).map(k=>k.split('|')[1]));
    for(const d of dates){
      const hasAny=data.habits.some(h=>canUseHabitOn(h,d)&&done(h,d));
      const allDone=data.habits.length>0&&data.habits.every(h=>!canUseHabitOn(h,d)||done(h,d));
      bonus[d]={first:hasAny?15:0,full:allDone?25:0};
      xp+=bonus[d].first+bonus[d].full;
    }
    data.xpEvents=events;data.bonusEvents=bonus;data.xp=Math.max(0,Math.round(xp));
  }
  v24RebuildXp();
  recalcBonus=function(d){
    if(d<WINTER_ARC_START||d>WINTER_ARC_END)return;
    const hasAny=data.habits.some(h=>canUseHabitOn(h,d)&&done(h,d));
    const allDone=data.habits.length>0&&data.habits.every(h=>!canUseHabitOn(h,d)||done(h,d));
    const old=data.bonusEvents[d]||{first:0,full:0};
    const next={first:hasAny?15:0,full:allDone?25:0};
    data.xp+=next.first-old.first+next.full-old.full;
    data.bonusEvents[d]=next;
    data.xp=Math.max(0,Math.round(data.xp));
  };
  save();

  // Exact XP + routine state consistency for every completion/undo.
  toggleHabit=function(h,d){
    if(!h)return;
    if(!canEdit(d)){showToast('Future dates cannot be completed.');return;}
    if(d<WINTER_ARC_START||d>WINTER_ARC_END){showToast('Only Winter Arc dates can be edited.');return;}
    if(!canUseHabitOn(h,d)){showToast('This habit was added later.');return;}
    if(frozen(h,d)){showToast('This day is frozen. Undo Freeze first.');return;}
    const k=key(h,d),before=done(h,d);
    if(before){delete data.checks[k];removeXpEvent(k);}
    else{data.checks[k]=true;addXpEvent(k,10);}
    recalcBonus(d);
    if(data.activeRoutine){
      const r=data.routines.find(x=>x.id===data.activeRoutine);
      if(r){r.step=routineProgress(r).doneCount;save();}
    }
    save();
    if(!before){celebrate();showToast('Nice! +10 XP 🔥');}
    else showToast('Check removed');
    render();
    if(data.cloudOptIn)cloudSync({silent:true}).catch(()=>{});
  };

  toggleFreeze=function(h,d){
    if(!h)return;
    if(!canEdit(d)){showToast('Future dates cannot be frozen.');return;}
    if(d<WINTER_ARC_START||d>WINTER_ARC_END){showToast('Only Winter Arc dates can be frozen.');return;}
    if(d!==today()&&d!==addDays(today(),-1)){showToast('Freeze is only available for today or yesterday.');return;}
    const k=key(h,d);
    if(done(h,d)){showToast('Undo the completion first.');return;}
    const mk=d.slice(0,7);
    if(frozen(h,d)){
      delete data.freezes[k];
      data.freezeUsed[mk]=Object.keys(data.freezes).some(x=>String(x.split('|')[1]||'').slice(0,7)===mk);
      save();render();showToast('Freeze removed 🛡️');return;
    }
    if(data.freezeUsed[mk]){showToast('This month’s freeze is already used 🛡️');return;}
    data.freezes[k]=true;data.freezeUsed[mk]=true;save();render();showToast('Monthly freeze used 🛡️');
  };

  addHabit=function(name,icon='✅',privateFlag=false,difficulty='Medium',action='Do the smallest useful version'){
    const n=String(name||'').trim();if(!n)return false;
    if(data.habits.length>=15){showToast('Maximum 15 habits reached.');return false;}
    if(data.habits.some(h=>String(h.name||'').trim().toLowerCase()===n.toLowerCase())){showToast('That habit already exists.');return false;}
    data.habits.push({id:uid(),name:n,icon:icon||'✅',private:!!privateFlag,created:today(),difficulty:difficulty||'Medium',action:action||'Do the smallest useful version',time:'',smallWin:action||'Do the smallest useful version',why:''});
    save();return true;
  };

  removeHabit=function(h){
    if(!h)return;
    v24DeleteHabitId=h.id;renderV20();
  };
  function v24DeleteConfirm(){
    const h=data.habits.find(x=>x.id===v24DeleteHabitId);if(!h)return '';
    return `<div class="overlay v24-modal" role="dialog" aria-modal="true" aria-labelledby="v24DeleteTitle"><div class="modal v24-confirm-modal"><div class="section"><div><div class="kicker">DELETE HABIT</div><h2 id="v24DeleteTitle">Delete “${escapeHtml(h.name)}”?</h2></div><button class="btn small" data-v24-delete-cancel>Close</button></div><p class="muted">This removes the habit, its completion history, freeze records, goal links and routine references. This cannot be undone unless you have a backup.</p><div class="quick-actions"><button class="btn" data-v24-delete-cancel>Keep habit</button><button class="btn danger-btn" data-v24-delete-confirm>Delete permanently</button></div></div></div>`;
  }

  function habitOverlay(){
    const h=data.habits.find(x=>x.id===selectedHabit);if(!h)return '';
    const hs=habitStats(h),ds=makeDays(data.month);
    return `<div class="overlay v24-modal" role="dialog" aria-modal="true" aria-labelledby="v24HabitTitle"><div class="modal"><div class="section"><div><div class="kicker">HABIT DETAILS</div><h2 id="v24HabitTitle" style="margin:3px 0 0">${escapeHtml(h.icon)} ${escapeHtml(h.name)}</h2></div><button class="btn small" data-close-habit>Close</button></div><div class="grid three"><div class="stat"><small>Current</small><b>${hs.run} 🔥</b></div><div class="stat"><small>Best</small><b>${hs.longest}</b></div><div class="stat"><small>Total</small><b>${hs.total}</b></div></div><div class="form" style="margin-top:10px"><div class="field"><label>Habit name</label><input id="habitName" maxlength="40" value="${escapeHtml(h.name)}"></div><div class="field"><label>Icon</label><input id="habitIcon" maxlength="3" value="${escapeHtml(h.icon)}"></div><div class="field"><label>Difficulty</label><select id="habitDifficulty"><option ${h.difficulty==='Easy'?'selected':''}>Easy</option><option ${h.difficulty==='Medium'?'selected':''}>Medium</option><option ${h.difficulty==='Hard'?'selected':''}>Hard</option></select></div><div class="field"><label>Private habit</label><select id="habitPrivate"><option value="0" ${!h.private?'selected':''}>No</option><option value="1" ${h.private?'selected':''}>Yes</option></select></div><div class="field"><label>Best time</label><input id="habitTime" type="time" value="${escapeHtml(h.time||'')}"></div><div class="field"><label>Smallest useful action</label><input id="habitAction" maxlength="80" value="${escapeHtml(h.action||'')}"></div><div class="field"><label>Why</label><input id="habitWhy" maxlength="120" value="${escapeHtml(h.why||'')}"></div></div><label class="smalltext muted" style="display:block;margin-top:10px">Habit note</label><textarea id="habitNote">${escapeHtml(data.habitNotes[h.id]||'')}</textarea><button class="btn primary block" data-save-habit style="margin-top:10px">Save changes ✅</button><div class="section" style="margin-top:15px"><h2>📅 Monthly history</h2><span class="muted smalltext">${escapeHtml(data.month)}</span></div><div class="matrix-wrap"><table class="matrix"><thead><tr><th>Habit</th>${ds.map(d=>`<th>${Number(d.slice(-2))}</th>`).join('')}</tr></thead><tbody><tr><td class="habit-cell">${escapeHtml(h.name)}</td>${ds.map(d=>{const future=d>today(),eligible=canUseHabitOn(h,d),fr=frozen(h,d);return `<td><button class="daycheck ${done(h,d)?'done':''} ${fr?'freeze':''} ${future||!eligible?'future-day':''} ${d===today()?'today':''}" data-toggle="${h.id}|${d}" ${(future||!eligible)?'disabled':''}>${done(h,d)?'✓':fr?'🛡':future||!eligible?'·':''}</button></td>`}).join('')}</tr></tbody></table></div><div class="quick-actions"><button class="btn" data-v24-freeze>${frozen(h,today())?'Remove today' : 'Freeze today'} 🛡️</button><button class="btn danger-btn" data-delete-habit>Delete habit</button></div><div class="note" style="margin-top:9px">🛡 Monthly freeze: ${data.freezeUsed[data.month]?'used':'available'}. Freeze is allowed for today or yesterday only; future dates stay locked.</div></div></div>`;
  }

  function saveHabitSettings(){
    const h=data.habits.find(x=>x.id===selectedHabit);if(!h)return;
    const n=$('#habitName')?.value.trim()||'';
    if(!n){showToast('Enter a habit name.');return;}
    if(data.habits.some(x=>x.id!==h.id&&String(x.name||'').trim().toLowerCase()===n.toLowerCase())){showToast('That habit already exists.');return;}
    h.name=n;h.icon=$('#habitIcon')?.value.trim()||h.icon;h.difficulty=$('#habitDifficulty')?.value||h.difficulty;h.private=$('#habitPrivate')?.value==='1';h.time=$('#habitTime')?.value||'';h.action=$('#habitAction')?.value.trim()||h.action;h.why=$('#habitWhy')?.value.trim()||h.why;data.habitNotes[h.id]=$('#habitNote')?.value||'';save();selectedHabit=null;render();showToast('Habit settings saved ✅');
  }

  saveNewHabit=function(){
    const name=$('#newHabitName')?.value.trim()||'';
    if(!name){showToast('Enter a habit name.');return;}
    if(data.habits.length>=15){showToast('Maximum 15 habits reached.');return;}
    const icon=$('#newHabitIcon')?.value.trim()||'✅';
    const difficulty=$('#newHabitDifficulty')?.value||'Medium';
    const action=$('#newHabitAction')?.value.trim()||'Do the smallest useful version';
    const isPrivate=!!$('#newHabitPrivate')?.checked;
    if(addHabit(name,icon,isPrivate,difficulty,action)){newHabitOpen=false;morePanel='manage';save();render();showToast(`${name} added ✅`);}
  };

  downloadBackup=function(){
    const payload=Object.assign({},data,{schema:24,backupVersion:'V24.1',backupCreated:new Date().toISOString()});
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`winter-arc-v24.1-backup-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);showToast('Backup exported 💾');
  };
  restoreFile=function(input){
    const f=input?.files?.[0];if(!f)return;
    const reader=new FileReader();reader.onload=()=>{
      try{
        const raw=JSON.parse(reader.result);
        if(!raw||Array.isArray(raw)||typeof raw!=='object')throw new Error('invalid');
        const schema=Number(raw.schema||raw.schemaVersion||0);if(schema>24)throw new Error('future backup');
        if(!raw.name&&!Array.isArray(raw.habits)&&!raw.profileCreated)throw new Error('empty');
        if(!confirm('Restore this backup? Your current local profile will be replaced.'))return;
        const restored=normalize(raw);restored.arcStart=WINTER_ARC_START;restored.arcLength=WINTER_ARC_LENGTH;restored.schema=24;if(!Array.isArray(restored.habits))restored.habits=[];restored.habits=restored.habits.slice(0,15);data=restored;sessionUnlocked=!data.pinHash;selectedHabit=null;morePanel='';tab='today';v24RebuildXp();save();render();showToast(data.pinHash?'Backup restored — PIN lock is active 🔒':'Backup restored ✅');
      }catch(e){showToast(e.message==='future backup'?'This backup is from a newer app version.':'Invalid or incompatible backup.');}
    };reader.readAsText(f);input.value='';
  };

  profileLogin=function(){return `<div class="login-shell"><div class="login-card"><div class="brand-mark">❄️</div><div class="kicker">LOCAL PROFILE</div><h1>Welcome back${data.name?', '+escapeHtml(data.name):''}.</h1><p>Enter your local PIN to unlock this device profile.</p><div class="stack"><input id="loginPin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="current-password" placeholder="4–6 digit PIN" aria-label="Local PIN">${v24LoginError?`<div class="v24-login-error" role="alert">${escapeHtml(v24LoginError)}</div>`:''}<button class="btn primary block" data-login>Unlock 🔓</button><button class="btn block" data-forgot-pin>Reset local profile</button></div><div class="security-note" style="margin-top:12px">Local profile only. The PIN is hashed; browser storage and backups are not encrypted.</div></div></div>`;}

  function v24CreatorCompact(){
    const n=creatorName(),h=creatorHandle();
    return `<section class="v24-creator-compact"><span class="v25-credit-photo"><img src="./${escapeHtml((data.creatorPhoto||'creator-profile.jpg').replace(/^\.\//,''))}" alt="${escapeHtml(n)}" loading="eager" onerror="this.hidden=true;this.parentElement.classList.add('fallback')"><b>${escapeHtml((n||'V').slice(0,2).toUpperCase())}</b></span><div><span class="kicker">CREDIT BY</span><b>${escapeHtml(n)}</b><small>${escapeHtml(h||'@pandatvikas1')}</small></div><button class="btn" data-v20-nav="more" data-v20-more="creator">View →</button></section>`;
  }
  function v24RecoveryCard(){
    if(!data.habits.length)return '';
    let missed=0;for(let i=1;i<=2;i++){const d=addDays(today(),-i);const had=data.habits.some(h=>canUseHabitOn(h,d)&&active(h,d));if(had)break;missed++;}
    return missed?`<section class="v24-recovery"><div><span class="kicker">🛟 RECOVERY PASS</span><h3>${missed} missed day${missed>1?'s':''}. No reset needed.</h3><p>Start again with the smallest version today. Your Arc history stays intact.</p></div><button class="btn primary" data-v20-nav="more" data-v20-more="manage">Next small win →</button></section>`:'';
  }
  function v24RoutineCard(){
    const r=data.activeRoutine?data.routines.find(x=>x.id===data.activeRoutine):null;if(!r)return '';
    const p=routineProgress(r),cur=routineCurrent(r);
    return `<section class="v24-routine-card"><div class="v20-head"><div><div class="v20-kicker">ACTIVE ROUTINE</div><h2>${escapeHtml(r.name)}</h2></div><button class="btn small" data-finish-routine>Exit</button></div><div class="v24-routine-progress"><b>${p.doneCount}/${p.items.length}</b><span>completed</span></div><div class="progress"><i style="width:${p.pct}%"></i></div>${cur?`<div class="v24-routine-next"><span>${escapeHtml(cur.icon||'✅')}</span><div><b>Next: ${escapeHtml(cur.name)}</b><small>${escapeHtml(cur.action||'Smallest useful version')}</small></div><button class="btn primary" data-toggle="${cur.id}|${today()}">${done(cur,today())?'✓':'Complete'}</button></div>`:'<div class="note">Routine complete for today 🎉</div>'}</section>`;
  }
  function v24PriorityHabits(){
    const top=data.habits.slice(0,3);if(!top.length)return `<div class="v24-empty"><b>Your first win starts here.</b><span>Add a habit to build today’s Priority habits.</span><button class="btn primary" data-v20-more="manage">＋ Add habit</button></div>`;
    return top.map(h=>{const is=done(h,today()),fr=frozen(h,today());return `<article class="v24-priority ${is?'done':''}"><div class="v24-priority-icon">${escapeHtml(h.icon||'✅')}</div><div class="v24-priority-copy"><b>${escapeHtml(h.name)} ${h.private?'<span class="private-pill">🔒</span>':''}</b><span>${escapeHtml(h.action||'Smallest useful version')}</span><small>🔥 ${habitStats(h).run} day streak${h.time?` · ⏰ ${escapeHtml(h.time)}`:''}</small></div><button class="v24-check ${is?'done':''}" data-toggle="${h.id}|${today()}" ${fr?'disabled':''} aria-label="${is?'Undo':'Complete'} ${escapeHtml(h.name)}">${is?'✓':'○'}</button></article>`;}).join('')+(data.habits.length>3?`<button class="btn v24-viewall" data-v20-more="manage">View all ${data.habits.length} habits →</button>`:'');
  }
  function v20Today(){
    const s=stats(),day=v13ArcDay(),arcPct=v13ArcProgress(),f=focusHabit(),score=arcScore();
    return `<div class="v24-page">${v24CreatorCompact()}<section class="v24-greeting"><div><span class="kicker">TODAY · WINTER ARC 2026</span><h1>${data.name?'Good to see you, '+escapeHtml(data.name)+'.':'Your Arc starts here.'}</h1><p>Day ${day||0} / ${WINTER_ARC_LENGTH} · ${s.todayDone}/${data.habits.length} completed today</p></div><div class="v24-day-ring" style="--p:${arcPct}%"><b>${day||0}</b><span>DAY</span></div></section><section class="v24-arc-progress"><div><span class="kicker">ARC PROGRESS</span><b>${arcPct}%</b></div><div class="progress"><i style="width:${arcPct}%"></i></div><small>1 Oct → 31 Dec · 92 days</small></section>${v24RoutineCard()}${f?`<section class="v24-next"><div class="v20-next-label">NEXT WIN</div><div class="v24-next-row"><div class="v24-next-icon">${escapeHtml(f.icon||'✅')}</div><div><h2>${escapeHtml(f.name)}</h2><p>${escapeHtml(f.action||'Smallest useful version')}</p><small>🔥 ${habitStats(f).run} day streak</small></div><button class="v24-check main" data-toggle="${f.id}|${today()}" aria-label="${done(f,today())?'Undo':'Complete'} ${escapeHtml(f.name)}">${done(f,today())?'✓':'→'}</button></div></section>`:''}<section class="v24-section"><div class="v20-head"><h2>Priority habits</h2><span>${s.todayDone}/${data.habits.length}</span></div><div class="v24-priority-list">${v24PriorityHabits()}</div></section>${v24RecoveryCard()}<section class="v24-statbar"><div><b>${s.todayDone}</b><span>Today</span></div><div><b>${v13TotalWins()}</b><span>Arc wins</span></div><div><b>${score}</b><span>Score</span></div></section><section class="v24-checkpoint"><div><span class="kicker">NEXT CHECKPOINT</span><h3>Day ${nextMilestone(day||0)}</h3><p>Keep the next action small and repeatable.</p></div><span>🏁</span></section></div>`;
  }

  function v24Week(){
    const ds=Array.from({length:7},(_,i)=>addDays(today(),i-6));
    return `<div class="v24-page"><section class="v24-page-head"><span class="kicker">WEEK</span><h1>Your 7-day pattern.</h1><p>Tap a day to update completion. Future dates stay locked.</p></section><section class="v24-week-summary"><div><b>${weeklyScore()}%</b><span>weekly completion</span></div><div><b>${weeklyWins()}</b><span>wins this week</span></div><div><b>🔥 ${stats().best}</b><span>best streak</span></div></section><section class="v24-week-grid"><div class="v24-week-labels"><span>Habit</span>${ds.map(d=>`<span>${d<WINTER_ARC_START?'—':dateObj(d).toLocaleDateString(undefined,{weekday:'short'}).slice(0,2)}</span>`).join('')}</div>${data.habits.map(h=>`<div class="v24-week-row"><div class="v24-week-habit"><span>${escapeHtml(h.icon||'✅')}</span><b>${escapeHtml(h.name)}</b></div>${ds.map(d=>{const eligible=canUseHabitOn(h,d),future=d>today(),is=done(h,d),fr=frozen(h,d);return `<button class="v24-week-cell ${is?'done':''} ${fr?'freeze':''} ${d===today()?'today':''} ${future||!eligible?'disabled':''}" data-toggle="${h.id}|${d}" ${future||!eligible?'disabled':''} aria-label="${escapeHtml(h.name)} ${dateObj(d).toLocaleDateString()} ${is?'complete':fr?'frozen':future||!eligible?'unavailable':'open'}">${is?'✓':fr?'🛡':future||!eligible?'·':'○'}</button>`}).join('')}</div>`).join('')||'<div class="v24-empty"><b>No habits yet.</b><span>Add your first habit in More → Manage habits.</span></div>'}</section></div>`;
  }

  function v24Month(){
    const m=data.month||'2026-10',ds=makeDays(m),first=new Date(Number(m.slice(0,4)),Number(m.slice(5,7))-1,1).getDay();
    let eligible=0,doneN=0;for(const d of ds)for(const h of data.habits){if(canUseHabitOn(h,d)&&d<=today()){eligible++;if(done(h,d))doneN++;}}
    const pct=eligible?Math.round(doneN/eligible*100):0;const monthNames={"2026-10":'October 2026',"2026-11":'November 2026',"2026-12":'December 2026'};
    return `<div class="v24-page"><section class="v24-page-head"><span class="kicker">MONTH</span><div class="v24-head-actions"><div><h1>${monthNames[m]||m}</h1><p>Monthly pattern inside the Winter Arc.</p></div><div class="v24-month-nav"><button class="btn" data-month-shift="-1" ${m==='2026-10'?'disabled':''}>‹</button><button class="btn" data-month-shift="1" ${m==='2026-12'?'disabled':''}>›</button></div></div></section><section class="v24-month-summary"><div><b>${pct}%</b><span>completion</span></div><div><b>${doneN}</b><span>wins</span></div><div><b>${Math.max(0,Math.min(ds.length,dateDiff(WINTER_ARC_START,today())+1-(m==='2026-10'?0:m==='2026-11'?31:61)))}</b><span>elapsed days</span></div></section><section class="v24-calendar"><div class="v24-weekdays">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<span>${x}</span>`).join('')}</div><div class="v24-cal-grid">${Array.from({length:first},()=>'<i></i>').join('')}${ds.map(d=>{const future=d>today(),isToday=d===today();const dayDone=data.habits.length>0&&data.habits.every(h=>!canUseHabitOn(h,d)||done(h,d));const dayCount=data.habits.filter(h=>canUseHabitOn(h,d)&&done(h,d)).length;return `<button class="v24-cal-cell ${isToday?'today':''} ${future?'future':''} ${dayDone&&!future?'complete-day':''}" ${future?'disabled':''} title="${d}"><b>${Number(d.slice(-2))}</b><span>${future?'·':dayCount+'/'+data.habits.filter(h=>canUseHabitOn(h,d)).length}</span></button>`}).join('')}</div><div class="v24-legend"><span><i class="dot done"></i>Complete</span><span><i class="dot today"></i>Today</span><span><i class="dot future"></i>Future</span></div></section><section class="v24-section"><div class="v20-head"><h2>Monthly habit breakdown</h2><span>${data.habits.length} habits</span></div><div class="v24-breakdown">${data.habits.map(h=>{const el=ds.filter(d=>canUseHabitOn(h,d)&&d<=today()),dn=el.filter(d=>done(h,d)).length,p=el.length?Math.round(dn/el.length*100):0;return `<div class="v24-break-row"><div><b>${escapeHtml(h.icon||'✅')} ${escapeHtml(h.name)}</b><span>${dn}/${el.length} days · ${p}%</span></div><div class="progress"><i style="width:${p}%"></i></div></div>`}).join('')||'<div class="v24-empty"><span>Add habits to see monthly patterns.</span></div>'}</div></section></div>`;
  }

  function v24Arc(){
    const day=v13ArcDay(),pct=v13ArcProgress();
    const months=[['OCT','2026-10'],['NOV','2026-11'],['DEC','2026-12']];
    const milestones=[3,7,14,21,30,45,60,75,90,92];
    const best=v13BestHabit?v13BestHabit():null;
    return `<div class="v24-page"><section class="v24-arc-hero"><div><span class="kicker">WINTER ARC 2026</span><h1>Day ${day||0} / 92</h1><p>1 Oct → 31 Dec · ${v13ArcRemaining()} days remaining</p></div><div class="v24-arc-pct">${pct}%</div><div class="progress"><i style="width:${pct}%"></i></div></section><section class="v24-section"><div class="v20-head"><h2>Three-month journey</h2><span>Current day highlighted</span></div><div class="v24-month-line">${months.map((m,i)=>{const start=i===0?1:i===1?32:62;const end=i===0?31:i===1?61:92;const current=day>=start&&day<=end;const doneM=day>end;return `<div class="v24-month-block ${current?'current':''} ${doneM?'done':''}"><b>${m[0]}</b><span>Days ${start}–${end}</span><i></i></div>`}).join('')}</div></section><section class="v24-section"><div class="v20-head"><h2>Milestones</h2><span>Next checkpoint ${nextMilestone(day||0)}</span></div><div class="v24-milestones">${milestones.map(m=>`<div class="v24-milestone ${day>=m?'done':''} ${day===m?'current':''}"><b>Day ${m}</b><span>${day>m?'✓ Complete':day===m?'You are here':'Upcoming'}</span></div>`).join('')}</div></section><section class="v24-section"><div class="v20-head"><h2>Your Arc Story</h2><span>Keep it useful</span></div><div class="v24-story"><div><b>Arc wins</b><span>${v13TotalWins()}</span></div><div><b>Best streak</b><span>🔥 ${stats().best}</span></div><div><b>Strongest habit</b><span>${best?escapeHtml(best.name):'Build your first win'}</span></div></div><div class="note">Missed days remain part of your history. Recovery means restarting the next small action, not resetting the Arc.</div></section></div>`;
  }

  function v20Rank(){
    const local=v20LocalRank(),rows=v20Top20(),q=v20RankQuery.trim().toLowerCase();
    const filtered=rows.filter(x=>String(x.display_name||'').toLowerCase().includes(q));
    const my=v24RankMyGlobal;
    return `<div class="v24-page"><section class="v24-rank-hero"><div><span class="kicker">ARC LEAGUE</span><h1>${my?.rank?'#'+my.rank:'Top 20'}</h1><p>${my?.rank?'Your exact public rank':'Community Rank is optional and private by default.'}</p></div><div><b>${local.score}</b><span>/100 score</span></div><div class="progress"><i style="width:${local.score}%"></i></div></section><section class="v24-section"><div class="v20-head"><div><span class="kicker">GLOBAL</span><h2>Top 20</h2></div><button class="v20-refresh" data-v20-rank-refresh aria-label="Refresh leaderboard">↻</button></div><input class="v24-rank-search" id="v20RankSearch" value="${escapeHtml(v20RankQuery)}" placeholder="Search Top 20 by name" aria-label="Search Top 20 by name"><div class="v24-ranklist">${v20RankStatus==='loading'?'<div class="v24-empty"><b>Loading Top 20…</b></div>':v20RankStatus==='offline'||v20RankStatus==='error'?`<div class="v24-empty"><b>${escapeHtml(v20RankError)}</b><span>Local tracker remains fully usable.</span></div>`:filtered.length?filtered.map((x)=>{const rank=x.__rank||v20RankRows.indexOf(x)+1;const name=escapeHtml(x.display_name||'Arc member');const score=Number(x.rankScore??x.rank_score)||0;return `<div class="v24-rank-row ${data.cloudUserId&&x.id===data.cloudUserId?'me':''}"><span class="num">#${rank}</span><span class="avatar">${escapeHtml((x.display_name||'?').slice(0,1).toUpperCase())}</span><div><b>${name}</b><small>${Number(x.total_wins)||0} wins · 🔥 ${Number(x.best_streak)||0} streak</small></div><strong>${score}</strong></div>`}).join(''):'<div class="v24-empty"><b>No public profiles yet.</b><span>Turn on Community Sync + Public Profile to appear.</span></div>'}</div>${v20RankStatus==='ready'?`<div class="v24-rank-foot">${my?.rank?`Your exact public rank: <b>#${my.rank}</b>`:'Your profile is private.'}</div>`:''}</section><section class="note"><b>How scoring works</b><br>75% weekly consistency + 15% best streak + 10% weekly wins. Ties are deterministic.</section></div>`;
  }

  function v20More(){
    if(morePanel){
      let body='';
      try{body=morePanel==='manage'?manageHabitsHtml():morePanel==='goals'?goalsHtml():morePanel==='routine'?routineHtml():morePanel==='checkin'?checkinHtml():morePanel==='journal'?journalHtml():morePanel==='sleep'?sleepHtml():morePanel==='planner'?plannerHtml():morePanel==='reminders'?remindersHtml():morePanel==='security'?securityHtml():morePanel==='settings'?settingsHtml():morePanel==='backup'?backupPage():morePanel==='creator'?creatorPage():morePanel==='about'?aboutPage():morePanel==='getapp'?getAppPage():morePanel==='achievements'?achievementsPage():morePanel==='insights'?insightsPage():morePanel==='credits'?creditsHtml():morePanel==='audience'?audiencePage():morePanel==='rank'?v20Rank():morePanel==='arc'?v24Arc():morePanel==='month'?v24Month():morePanel==='profile'?v20Profile():'<div class="v24-empty">Tool unavailable.</div>'}catch(e){body='<div class="v24-empty">Tool unavailable. Your tracker data is safe.</div>'}
      return `<div class="v24-page"><section class="v24-detail-head"><button class="btn" data-v20-close>← More</button><h1>${escapeHtml(morePanel.charAt(0).toUpperCase()+morePanel.slice(1))}</h1></section>${body}</div>`;
    }
    const tile=(icon,title,sub,id)=>`<button class="v24-tool-tile" data-v20-more="${id}"><span>${icon}</span><div><b>${escapeHtml(title)}</b><small>${escapeHtml(sub)}</small></div><strong>→</strong></button>`;
    return `<div class="v24-page"><section class="v24-page-head"><span class="kicker">MORE</span><h1>Everything advanced, in one place.</h1><p>Today stays focused. Your deeper tools stay here.</p></section><section class="v24-group"><h2>Your Journey</h2>${tile('📈','Insights','Spot patterns and trends.','insights')}${tile('🏆','Achievements','Milestones and progress.','achievements')}${tile('❄️','Arc','Your 92-day journey.','arc')}${tile('🗓️','Month','Calendar and monthly breakdown.','month')}${tile('👤','Profile','Your identity and share card.','profile')}</section><section class="v24-group"><h2>Daily Tools</h2>${tile('✅','Manage habits','Add, edit and remove habits.','manage')}${tile('🎯','Goals','One focus and measurable target.','goals')}${tile('🔁','Routines','Build and run step-by-step routines.','routine')}${tile('🗓️','Day planner','Set preferred times.','planner')}${tile('🌤️','Mood & energy','Quick private check-in.','checkin')}${tile('✍️','Journal','One-line reflection.','journal')}${tile('😴','Sleep','Track sleep basics.','sleep')}${tile('⏰','Reminders','Optional local reminders.','reminders')}${tile('🔐','Privacy & security','PIN and profile security.','security')}</section><section class="v24-group"><h2>Community & App</h2><button class="v24-tool-tile" data-open-share-center><span>↗</span><div><b>Share & invite</b><small>4:5 card and friend invite.</small></div><strong>→</strong></button><button class="v24-tool-tile" data-open-compare><span>⚔️</span><div><b>Compare with a friend</b><small>Shared progress snapshot.</small></div><strong>→</strong></button><button class="v24-tool-tile" data-open-cloud><span>☁️</span><div><b>Community Sync</b><small>Optional cloud sharing.</small></div><strong>→</strong></button>${tile('🏆','Top 20 Rank','Public leaderboard and exact rank.','rank')}${tile('📱','Get the App','Install PWA when supported.','getapp')}${tile('👤','Creator','Meet the creator.','creator')}${tile('❤️','Credits','Creator credit and photos.','credits')}${tile('👥','Total users','Approximate unique tracker visitors.','audience')}${tile('💾','Backup','Export and restore.','backup')}${tile('⚙️','Settings','Theme, sync and data.','settings')}${tile('ℹ️','About Winter Arc','How the app works.','about')}</section></div>`;
  }

  function v20Shell(){
    const initial=escapeHtml((data.name||'A').slice(0,1).toUpperCase());
    const body=tab==='today'?v20Today():tab==='week'?v24Week():tab==='month'?v24Month():tab==='arc'?v24Arc():tab==='rank'?v20Rank():tab==='profile'?v20Profile():v20More();
    const labels=[['today','🏠','Today'],['week','▦','Week'],['month','🗓️','Month'],['arc','❄️','Arc'],['more','•••','More']];
    document.body.classList.toggle('dark',!!data.dark);
    document.body.innerHTML=`<div class="v24-app"><header class="v24-top"><button class="v24-iconbtn" data-v20-menu aria-label="Open menu">☰</button><div class="v24-brand"><b>Winter Arc</b><span>2026 · ${escapeHtml(data.name||'Your Arc')}</span></div><button class="v24-iconbtn" data-v20-share aria-label="Share your Arc">↗</button><button class="v24-profile-btn" data-v20-nav="profile" aria-label="Open Profile">${initial}</button></header><main class="v24-main">${body}</main><nav class="v24-bottom"><div>${labels.map(([id,icon,label])=>`<button class="${tab===id?'active':''}" data-v20-nav="${id}"><b>${icon}</b><span>${label}</span></button>`).join('')}</div></nav>${v20MenuOpen?v20Menu():''}${selectedHabit?habitOverlay():''}${newHabitOpen?newHabitModal():''}${v24DeleteHabitId?v24DeleteConfirm():''}${window.__v14ShareCenter?v14ShareModal():''}${window.__v14Compare?v14CompareModal():''}${window.__v14Cloud?v14CloudModal():''}</div>`;
    if(tab==='rank'&&v20RankStatus==='idle')setTimeout(v20LoadRank,0);
  }

  const __v24PrevRenderV20=renderV20;
  renderV20=function(){
    v20Style();
    if(isLocked()||!data.profileCreated||!data.onboardingDone){__v24PrevRenderV20();document.documentElement.classList.remove('v24-modal-open');return;}
    v20Shell();
    const hasModal=!!document.querySelector('.overlay')||v20MenuOpen||!!newHabitOpen||!!v24DeleteHabitId;
    document.documentElement.classList.toggle('v24-modal-open',hasModal);
  };
  render=renderV20;

  // Make add-habit action use the real modal instead of prompt().
  document.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.addCustom!==undefined){e.preventDefault();e.stopImmediatePropagation();openNewHabit();return;}
    if(b.dataset.v24Freeze!==undefined){
      e.preventDefault();e.stopImmediatePropagation();
      const h=data.habits.find(x=>x.id===selectedHabit);
      if(h)toggleFreeze(h,today());
      return;
    }
    if(b.dataset.v25AudienceRefresh!==undefined){e.preventDefault();e.stopImmediatePropagation();v25Audience={...v25Audience,loading:false,total:null,daily:null,publicCount:null,publicNames:[],error:''};await v25LoadAudience();return;}
    if(b.dataset.v24DeleteCancel!==undefined){v24DeleteHabitId=null;renderV20();return;}
    if(b.dataset.v24DeleteConfirm!==undefined){const h=data.habits.find(x=>x.id===v24DeleteHabitId);if(h){const monthKeys=new Set(Object.keys(data.bonusEvents||{}));data.habits=data.habits.filter(x=>x.id!==h.id);Object.keys(data.checks).forEach(k=>{if(k.startsWith(h.id+'|'))delete data.checks[k]});Object.keys(data.freezes).forEach(k=>{if(k.startsWith(h.id+'|'))delete data.freezes[k]});delete data.habitNotes[h.id];delete data.reminders[h.id];data.goalLinks=data.goalLinks.filter(id=>id!==h.id);data.routines.forEach(r=>{r.items=r.items.filter(id=>id!==h.id);if(r.step>r.items.length)r.step=r.items.length});if(data.activeRoutine&&!data.routines.some(r=>r.id===data.activeRoutine))data.activeRoutine=null;monthKeys.forEach(d=>recalcBonus(d));v24RebuildXp();save();}v24DeleteHabitId=null;selectedHabit=null;renderV20();showToast('Habit deleted');return;}
    if(b.dataset.closeHabit!==undefined){selectedHabit=null;renderV20();return;}
    if(b.dataset.saveHabit!==undefined){saveHabitSettings();return;}
    if(b.dataset.quickNewHabit!==undefined){openNewHabit();return;}
    if(b.dataset.v24Month===undefined && b.dataset.v24Arc===undefined){}
  });

  // Better login feedback without blocking alert popups.
  document.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b||b.dataset.login===undefined)return;
    const p=$('#loginPin')?.value.trim()||'';if(!/^\d{4,6}$/.test(p)){v24LoginError='Enter a 4–6 digit numeric PIN.';render();return;}
    const h=await hashPin(p);if(h!==data.pinHash){v24LoginError='Wrong PIN. Try again.';render();setTimeout(()=>$('#loginPin')?.focus(),0);return;}
    v24LoginError='';data.lastLogin=today();save();sessionUnlocked=true;render();showToast('Unlocked 🔓');
  },{capture:true});

  // Secure anonymous cloud session for RLS-owned writes. Public leaderboard reads remain possible.
  cloudHeaders=function(token){return {'apikey':CLOUD_CFG.anonKey,'Authorization':'Bearer '+(token||v24AccessToken||CLOUD_CFG.anonKey),'Content-Type':'application/json','Prefer':'resolution=merge-duplicates'}};
  let v24SupabaseClient=null;
  async function v24CloudSession(){
    if(!cloudReady())throw new Error('Backend not configured');
    if(!window.supabase)throw new Error('Supabase client not loaded');
    if(!v24SupabaseClient)v24SupabaseClient=window.supabase.createClient(CLOUD_CFG.url,CLOUD_CFG.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    let session=(await v24SupabaseClient.auth.getSession()).data.session;
    if(!session){const r=await v24SupabaseClient.auth.signInAnonymously();if(r.error)throw r.error;session=r.data.session;}
    if(!session)throw new Error('No cloud session');
    data.cloudUserId=session.user.id;v24AccessToken=session.access_token;save();return session;
  }

  cloudSync=async function(opts={}){
    if(!data.cloudOptIn){data.cloudStatus='Community Sync off';save();return false;}
    if(!cloudReady()){data.cloudStatus='Backend not configured';save();if(!opts.silent)showToast('Community backend is not configured');return false;}
    try{
      data.cloudStatus='Syncing…';save();if(!opts.silent)renderV20();
      const session=await v24CloudSession();
      const snap=cloudSnapshot();snap.id=session.user.id;snap.community_opt_in=true;snap.public_profile=!!data.publicProfile;
      const r=await fetch(CLOUD_CFG.url+'/rest/v1/arc_users',{method:'POST',headers:{apikey:CLOUD_CFG.anonKey,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates'},body:JSON.stringify(snap)});
      if(!r.ok)throw new Error('sync '+r.status);
      data.cloudLastSync=new Date().toISOString();data.cloudStatus='Synced ✓';save();if(typeof v19SyncActiveChallenge==='function'){try{await v19SyncActiveChallenge();}catch(_){}}if(!opts.silent)renderV20();if(!opts.silent)showToast('Progress synced ☁️');return true;
    }catch(e){data.cloudStatus='Sync failed — local data is safe';save();if(!opts.silent)showToast('Cloud sync failed — local tracker still works');return false;}
  };
  async function cloudDeactivate(){
    if(!data.cloudUserId||!cloudReady())return false;
    try{const session=await v24CloudSession();const r=await fetch(CLOUD_CFG.url+'/rest/v1/arc_users?id=eq.'+encodeURIComponent(session.user.id),{method:'DELETE',headers:{apikey:CLOUD_CFG.anonKey,Authorization:'Bearer '+session.access_token}});if(!r.ok)throw new Error(String(r.status));data.cloudUserId='';data.cloudLastSync='';data.cloudStatus='Community Sync off';save();return true;}catch(e){data.cloudStatus='Remote cleanup could not be verified';save();return false;}
  }

  // Exact Top 20 RPC + exact own rank. No Instagram is returned to the player UI.
  v20LoadRank=async function(){
    if(v20RankStatus==='loading')return;
    v20RankStatus='loading';v20RankError='';v24RankMyGlobal=null;renderV20();
    if(!cloudReady()){v20RankStatus='offline';v20RankError='Community backend is not configured.';v20RankRows=[];renderV20();return;}
    try{
      let rows=await rankFetch('get_public_leaderboard',{p_limit:20});
      v20RankRows=(Array.isArray(rows)?rows:[]).map((x,i)=>Object.assign({},x,{rankScore:Number(x.rank_score)||0,__rank:Number(x.rank)||i+1}));
      if(data.cloudOptIn&&data.publicProfile){try{const session=await v24CloudSession();const rr=await rankFetch('get_public_rank',{p_user_id:session.user.id});if(Array.isArray(rr)&&rr[0])v24RankMyGlobal=Object.assign({},rr[0],{rank:Number(rr[0].rank)||null});}catch(e){}}
      try{const ar=await rankFetch('get_public_active_members',{p_minutes:15,p_limit:6});v20RankActive=Array.isArray(ar)?ar:[]}catch(e){}
      v20RankStatus='ready';v20RankUpdated=Date.now();renderV20();
    }catch(e){v20RankStatus='error';v20RankError='Could not load the public leaderboard. Try Refresh.';v20RankRows=[];renderV20();}
  };

  // Keep the score helper aligned with fixed Arc metrics.
  v20LocalRank=function(){
    const x=typeof cloudSnapshot==='function'?cloudSnapshot():null;const score=x?Number(x.rank_score)||0:personalScore();const week=x?Number(x.week_score)||0:weeklyScore();const league=score>=90?'Diamond':score>=75?'Gold':score>=60?'Silver':score>=40?'Bronze':'Starter';return {score,league,week};
  };
  v20Filtered=function(){const q=v20RankQuery.trim().toLowerCase();return v20RankRows.slice(0,20).filter(x=>String(x.display_name||'').toLowerCase().includes(q));};

  // Community off / public off must remove or privatize remote state.
  const __v24OriginalCloudHandler=cloudSettingsHtml;
  cloudSettingsHtml=function(){
    return `<section class="v14-card"><div class="v14-section-head"><div><span class="v14-kicker">COMMUNITY SYNC</span><h2>Optional cloud sharing</h2></div><span class="v14-counter">${escapeHtml(data.cloudStatus||'Off by default')}</span></div><label class="v14-toggle-row"><input id="cloudOptIn" type="checkbox" ${data.cloudOptIn?'checked':''}><span><b>Community Sync</b><small>Syncs display name, Arc progress, wins, best streak and last-seen. Private habit names, journal, sleep, mood and PIN stay local.</small></span></label><label class="v14-toggle-row"><input id="publicProfile" type="checkbox" ${data.publicProfile?'checked':''}><span><b>Public Profile</b><small>Only a public profile appears in the Top 20.</small></span></label><div class="v14-cloud-actions"><button class="v14-pill-btn primary" data-save-cloud>Save choice</button><button class="v14-pill-btn" data-cloud-sync>Retry sync</button></div><small class="v14-cloud-note">Cloud sync requires a configured Supabase backend. The tracker remains usable offline.</small></section>`;
  };

  // Add safer cloud save/deactivate behavior by replacing the old bridge at source-level friendly hooks.
  document.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.openShareCenter!==undefined||b.dataset.openCompare!==undefined||b.dataset.openCloud!==undefined)return;
    if(b.dataset.saveCloud!==undefined){
      e.preventDefault();e.stopImmediatePropagation();
      const nextOpt=!!$('#cloudOptIn')?.checked,nextPublic=!!$('#publicProfile')?.checked;
      const wasOpt=data.cloudOptIn,wasPublic=data.publicProfile;
      data.cloudOptIn=nextOpt;data.publicProfile=nextPublic;save();
      let ok=true;
      if(!nextOpt&&wasOpt)ok=await cloudDeactivate();
      else if(nextOpt)ok=await cloudSync();
      renderV20();showToast(nextOpt?(ok?'Community settings saved ☁️':'Saved locally; cloud sync needs attention'): (wasPublic||wasOpt?'Community sharing removed/private':'Community Sync off'));return;
    }
  },{capture:true});

  // Smaller, readable, mobile-first UI layer + focus states + modal scroll lock.
  function v24PolishStyle(){
    if(document.getElementById('v24-polish-style'))return;
    const s=document.createElement('style');s.id='v24-polish-style';s.textContent=`
      :root{--v24-text:14px;--v24-muted:12px}
      html.v24-modal-open,html.v24-modal-open body{overflow:hidden}
      body{font-size:var(--v24-text);line-height:1.45}
      button,input,textarea,select{font-size:13px;line-height:1.25}
      button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid color-mix(in srgb,var(--green,#3da35d) 45%,white);outline-offset:2px}
      .v24-app{width:100%;max-width:760px;margin:auto;min-height:100dvh;padding-bottom:88px;color:var(--ink)}
      .v24-top{position:sticky;top:0;z-index:70;display:grid;grid-template-columns:44px minmax(0,1fr) 44px 44px;gap:8px;align-items:center;padding:10px 12px;background:color-mix(in srgb,var(--bg,#f5f3ed) 94%,transparent);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
      .v24-iconbtn,.v24-profile-btn{width:44px;height:44px;border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--ink);display:grid;place-items:center;font-weight:950}
      .v24-profile-btn{background:var(--soft);color:var(--green2)}.v24-brand{min-width:0}.v24-brand b{display:block;font-size:18px}.v24-brand span{display:block;font-size:11px;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .v24-main{padding:14px 12px 0}.v24-page{display:grid;gap:14px}.v24-page-head h1{margin:4px 0;font-size:28px;letter-spacing:-.045em}.v24-page-head p,.v24-greeting p{margin:0;color:var(--muted);font-size:12px}.kicker,.v20-kicker,.v20-next-label,.v24-rank-hero .kicker{font-size:11px;letter-spacing:.1em;font-weight:950;text-transform:uppercase;color:var(--green2)}
      .v24-greeting{display:grid;grid-template-columns:minmax(0,1fr) 82px;gap:14px;align-items:center}.v24-greeting h1{font-size:27px;line-height:1.05;letter-spacing:-.045em;margin:5px 0}.v24-day-ring{width:82px;height:82px;border-radius:50%;display:grid;place-items:center;align-content:center;background:conic-gradient(var(--green) var(--p),#dce5dd 0);position:relative}.v24-day-ring:after{content:"";position:absolute;inset:6px;border-radius:50%;background:var(--card)}.v24-day-ring b,.v24-day-ring span{position:relative;z-index:1}.v24-day-ring b{font-size:23px}.v24-day-ring span{font-size:10px;color:var(--muted);font-weight:900}
      .v24-arc-progress,.v24-next,.v24-checkpoint,.v24-routine-card,.v24-recovery,.v24-arc-hero,.v24-rank-hero{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px;box-shadow:0 8px 24px rgba(20,30,24,.05)}
      .v24-arc-progress>div:first-child{display:flex;justify-content:space-between;align-items:center}.v24-arc-progress b{font-size:23px}.v24-arc-progress small{display:block;color:var(--muted);font-size:11px;margin-top:7px}
      .progress{height:9px;background:#e5ebe5;border-radius:999px;overflow:hidden}.progress i{display:block;height:100%;background:var(--green);border-radius:inherit}
      .v24-next h2{font-size:22px;margin:5px 0}.v24-next p{margin:0;color:var(--muted);font-size:13px}.v24-next-row{display:grid;grid-template-columns:48px minmax(0,1fr) 50px;gap:10px;align-items:center;margin-top:10px}.v24-next-icon,.v24-priority-icon{display:grid;place-items:center;background:var(--soft2);border:1px solid var(--line);border-radius:14px}.v24-next-icon{width:48px;height:48px;font-size:22px}
      .v24-check{min-width:46px;min-height:46px;border:1px solid var(--green);background:var(--green);color:#fff;border-radius:14px;font-weight:950;font-size:17px}.v24-check.done{background:var(--green2)}.v24-check:disabled{opacity:.45}
      .v24-section{display:grid;gap:8px}.v24-priority-list{display:grid;gap:8px}.v24-priority{display:grid;grid-template-columns:42px minmax(0,1fr) 46px;gap:10px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:9px}.v24-priority.done{background:var(--soft)}.v24-priority-icon{width:42px;height:42px;font-size:19px}.v24-priority-copy{min-width:0}.v24-priority-copy b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v24-priority-copy span{display:block;font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}.v24-priority-copy small{display:block;font-size:11px;color:var(--muted);margin-top:3px}.private-pill{font-size:10px}
      .v24-viewall{width:100%;min-height:44px}.v24-recovery{display:flex;justify-content:space-between;gap:12px;align-items:center;background:linear-gradient(145deg,var(--soft),var(--card))}.v24-recovery h3{margin:3px 0;font-size:16px}.v24-recovery p{margin:0;color:var(--muted);font-size:12px}.v24-statbar,.v24-week-summary,.v24-month-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.v24-statbar>div,.v24-week-summary>div,.v24-month-summary>div{background:var(--card);border:1px solid var(--line);border-radius:15px;padding:11px}.v24-statbar b,.v24-week-summary b,.v24-month-summary b{display:block;font-size:19px}.v24-statbar span,.v24-week-summary span,.v24-month-summary span{display:block;font-size:11px;color:var(--muted);margin-top:3px}.v24-checkpoint{display:flex;justify-content:space-between;align-items:center}.v24-checkpoint h3{font-size:18px;margin:3px 0}.v24-checkpoint p{font-size:12px;color:var(--muted);margin:0}.v24-checkpoint>span{font-size:27px}
      .v24-creator-compact{display:grid;grid-template-columns:46px minmax(0,1fr) auto;gap:9px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:8px}.v24-creator-compact img{width:46px;height:46px;border-radius:13px;object-fit:cover}.v24-creator-compact b{display:block;font-size:13px}.v24-creator-compact small{display:block;font-size:11px;color:var(--muted)}.v24-creator-compact .btn{min-height:38px}
      .v24-week-grid{overflow:auto;display:grid;gap:7px}.v24-week-labels,.v24-week-row{display:grid;grid-template-columns:120px repeat(7,minmax(38px,1fr));gap:5px;align-items:center;min-width:470px}.v24-week-labels{position:sticky;top:66px;z-index:2}.v24-week-labels span{font-size:11px;color:var(--muted);text-align:center;font-weight:900}.v24-week-labels span:first-child{text-align:left}.v24-week-row{background:var(--card);border:1px solid var(--line);border-radius:15px;padding:7px}.v24-week-habit{min-width:0;display:flex;gap:7px;align-items:center}.v24-week-habit b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v24-week-cell{min-height:44px;border:1px solid var(--line);border-radius:11px;background:var(--soft2);font-weight:950}.v24-week-cell.done{background:var(--green);border-color:var(--green);color:#fff}.v24-week-cell.freeze{background:#edf2df}.v24-week-cell.today{outline:2px solid color-mix(in srgb,var(--green) 45%,transparent);outline-offset:1px}.v24-week-cell.disabled{opacity:.42}
      .v24-head-actions{display:flex;justify-content:space-between;gap:12px;align-items:end}.v24-month-nav{display:flex;gap:5px}.v24-month-nav .btn{min-width:44px;min-height:44px}.v24-calendar{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:10px}.v24-weekdays,.v24-cal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}.v24-weekdays span{text-align:center;color:var(--muted);font-weight:900;font-size:11px;padding:5px 0}.v24-cal-cell{min-height:45px;border:1px solid var(--line);border-radius:11px;background:var(--soft2);display:grid;place-items:center;align-content:center;gap:2px;color:var(--ink)}.v24-cal-cell b{font-size:13px}.v24-cal-cell span{font-size:10px;color:var(--muted)}.v24-cal-cell.today{outline:3px solid color-mix(in srgb,var(--green) 45%,transparent);outline-offset:1px;background:var(--card)}.v24-cal-cell.complete-day{background:var(--green);border-color:var(--green);color:#fff}.v24-cal-cell.complete-day span{color:#fff}.v24-cal-cell.future{opacity:.35}.v24-legend{display:flex;gap:12px;flex-wrap:wrap;margin-top:9px;color:var(--muted);font-size:11px}.v24-legend .dot{width:9px;height:9px;border-radius:50%;display:inline-block;margin-right:4px;background:var(--line)}.v24-legend .dot.done{background:var(--green)}.v24-legend .dot.today{outline:2px solid var(--green)}
      .v24-breakdown{display:grid;gap:8px}.v24-break-row{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px}.v24-break-row>div:first-child{display:flex;justify-content:space-between;gap:9px}.v24-break-row b{font-size:12px}.v24-break-row span{font-size:11px;color:var(--muted)}.v24-break-row .progress{margin-top:7px}
      .v24-arc-hero{background:linear-gradient(145deg,#173f3a,#193a2d);color:#fff;display:grid;gap:7px}.v24-arc-hero .kicker{color:#c5ead2}.v24-arc-hero h1{font-size:33px;margin:2px 0}.v24-arc-hero p{margin:0;color:#d8ece1;font-size:12px}.v24-arc-pct{text-align:right;font-weight:950;font-size:27px}.v24-month-line{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.v24-month-block{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:11px}.v24-month-block b{display:block;font-size:16px}.v24-month-block span{font-size:11px;color:var(--muted)}.v24-month-block i{display:block;height:7px;border-radius:99px;background:var(--line);margin-top:9px}.v24-month-block.current{background:var(--soft);border-color:#9fc9aa}.v24-month-block.current i,.v24-month-block.done i{background:var(--green)}.v24-milestones{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.v24-milestone{padding:10px;background:var(--card);border:1px solid var(--line);border-radius:13px}.v24-milestone b{display:block;font-size:13px}.v24-milestone span{display:block;color:var(--muted);font-size:11px;margin-top:2px}.v24-milestone.current{border-color:var(--green);background:var(--soft)}.v24-story{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.v24-story>div{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px}.v24-story b{display:block;font-size:11px}.v24-story span{display:block;font-size:12px;margin-top:4px}
      .v24-rank-hero{background:linear-gradient(145deg,#173f3a,#183b2d);color:#fff}.v24-rank-hero{display:grid;grid-template-columns:1fr auto;gap:5px;align-items:end}.v24-rank-hero h1{font-size:33px;margin:3px 0}.v24-rank-hero p{margin:0;color:#d8ece1;font-size:12px}.v24-rank-hero>div:nth-child(2){text-align:right}.v24-rank-hero>div:nth-child(2)>b{display:block;font-size:25px}.v24-rank-hero>div:nth-child(2)>span{font-size:10px;color:#c8e4d4}.v24-rank-hero .progress{grid-column:1/-1;background:rgba(255,255,255,.15)}.v24-rank-search{width:100%;min-height:46px;border:1px solid var(--line);border-radius:13px;background:var(--card);color:var(--ink);padding:11px 12px;font-size:13px}.v24-ranklist{display:grid;gap:7px}.v24-rank-row{display:grid;grid-template-columns:30px 38px minmax(0,1fr) auto;gap:8px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:15px;padding:9px}.v24-rank-row.me{background:var(--soft);border-color:#9fc9aa}.v24-rank-row .num{font-size:11px;color:var(--muted);font-weight:950;text-align:center}.v24-rank-row .avatar{width:36px;height:36px;border-radius:12px;background:var(--soft);color:var(--green2);display:grid;place-items:center;font-weight:950}.v24-rank-row b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v24-rank-row small{display:block;font-size:11px;color:var(--muted);margin-top:2px}.v24-rank-row strong{font-size:15px}.v24-rank-foot{padding:11px;border-radius:13px;background:var(--soft);font-size:12px}
      .v24-group{display:grid;gap:7px}.v24-group h2{font-size:14px;margin:2px 1px;color:var(--muted)}.v24-tool-tile{width:100%;min-height:64px;display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:10px;align-items:center;text-align:left;border:1px solid var(--line);border-radius:15px;background:var(--card);color:var(--ink);padding:10px}.v24-tool-tile>span{width:38px;height:38px;border-radius:11px;background:var(--soft);display:grid;place-items:center;font-size:18px}.v24-tool-tile b{display:block;font-size:13px}.v24-tool-tile small{display:block;font-size:11px;color:var(--muted);margin-top:2px}.v24-tool-tile strong{font-size:18px;color:var(--green2)}
      .v24-detail-head{display:flex;gap:10px;align-items:center}.v24-detail-head h1{margin:0;font-size:26px}.v24-empty{display:grid;gap:4px;background:var(--card);border:1px dashed var(--line);border-radius:15px;padding:14px}.v24-empty b{font-size:13px}.v24-empty span{font-size:12px;color:var(--muted)}
      .v24-routine-progress{display:flex;align-items:baseline;gap:6px;margin:8px 0}.v24-routine-progress b{font-size:20px}.v24-routine-progress span{font-size:11px;color:var(--muted)}.v24-routine-next{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:8px;align-items:center;margin-top:10px}.v24-routine-next>span{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:var(--soft)}.v24-routine-next b{display:block;font-size:12px}.v24-routine-next small{display:block;font-size:11px;color:var(--muted);margin-top:2px}.v24-login-error{padding:9px 10px;border-radius:11px;background:#fff0f0;color:#a33;font-size:12px}
      .v24-confirm-modal{max-width:520px}.danger-btn{color:var(--danger,#b44040)!important}.overlay{touch-action:manipulation}
      .file-btn{display:flex;align-items:center;justify-content:center;min-height:46px;border:1px solid var(--line);border-radius:13px;background:var(--card);font-size:13px;font-weight:900;cursor:pointer}.file-btn input{position:absolute;opacity:0;width:1px;height:1px}
      @media(max-width:520px){.v24-main{padding-left:9px;padding-right:9px}.v24-week-grid{margin-inline:-9px;padding-inline:9px}.v24-story{grid-template-columns:1fr}.v24-month-line{gap:6px}.v24-milestones{grid-template-columns:1fr 1fr}.v24-recovery{display:grid}.v24-greeting h1{font-size:25px}.v24-tool-tile{min-height:68px}}
      @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
      body.dark .v24-login-error{background:#3a2020;color:#ffc0c0}
      /* Keep legacy preserved screens readable under the V24.1 shell. */
      .v24-app small,.v24-app .smalltext,.v24-app .muted,.v24-app .note{font-size:11px!important;line-height:1.4}
      .v24-app .v20-kicker,.v24-app .v13-kicker,.v24-app .v14-kicker,.v24-app .v18-kicker{font-size:11px!important}
      .v24-app input,.v24-app textarea,.v24-app select{min-height:44px}
      .v24-app .v20-smallcheck,.v24-app .v18-btn,.v24-app .v14-pill-btn,.v24-app .v13-share-btn{min-height:44px}
      .v24-app .v20-habit-meta,.v24-app .v20-next-action,.v24-app .v24-story span{font-size:11px!important}
    `;document.head.appendChild(s);
  }
  v24PolishStyle();

  // Overlay/backdrop + Android/back-button behavior.
  document.addEventListener('click',e=>{const ov=e.target.closest('.overlay');if(ov&&e.target===ov){if(ov.querySelector('.v24-confirm-modal')){v24DeleteHabitId=null;}else if(ov.classList.contains('v24-modal')&&selectedHabit){selectedHabit=null;}else{window.__v14ShareCenter=false;window.__v14Compare=false;window.__v14Cloud=false;v20MenuOpen=false;newHabitOpen=false;}renderV20();}},false);
  window.addEventListener('popstate',()=>{if(v20MenuOpen||selectedHabit||newHabitOpen||v24DeleteHabitId||window.__v14ShareCenter||window.__v14Compare||window.__v14Cloud){v20MenuOpen=false;selectedHabit=null;newHabitOpen=false;v24DeleteHabitId=null;window.__v14ShareCenter=false;window.__v14Compare=false;window.__v14Cloud=false;renderV20();}});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&(v20MenuOpen||selectedHabit||newHabitOpen||v24DeleteHabitId||window.__v14ShareCenter||window.__v14Compare||window.__v14Cloud)){e.preventDefault();v20MenuOpen=false;selectedHabit=null;newHabitOpen=false;v24DeleteHabitId=null;window.__v14ShareCenter=false;window.__v14Compare=false;window.__v14Cloud=false;renderV20();}});

  // Rank search updates only the list; no whole-page render on every keystroke.
  const v24RankSearchListener=e=>{
    if(e.target?.id!=='v20RankSearch')return;
    v20RankQuery=e.target.value;
    const box=document.querySelector('.v24-ranklist');if(!box)return;
    const q=v20RankQuery.trim().toLowerCase();const rows=v20RankRows.slice(0,20).filter(x=>String(x.display_name||'').toLowerCase().includes(q));
    box.innerHTML=rows.length?rows.map(x=>{const rank=x.__rank||v20RankRows.indexOf(x)+1;const name=escapeHtml(x.display_name||'Arc member');const score=Number(x.rankScore??x.rank_score)||0;return `<div class="v24-rank-row ${data.cloudUserId&&x.id===data.cloudUserId?'me':''}"><span class="num">#${rank}</span><span class="avatar">${escapeHtml((x.display_name||'?').slice(0,1).toUpperCase())}</span><div><b>${name}</b><small>${Number(x.total_wins)||0} wins · 🔥 ${Number(x.best_streak)||0} streak</small></div><strong>${score}</strong></div>`}).join(''):'<div class="v24-empty"><b>No matching names.</b><span>Try another display name.</span></div>';
  };
  document.addEventListener('input',v24RankSearchListener,{passive:true});

  // Primary navigation keeps query-tab URLs stable for refresh/deep links.
  const __v24NavPush=history.pushState.bind(history);
  document.addEventListener('click',e=>{const b=e.target.closest('[data-v20-nav]');if(!b)return;const n=b.dataset.v20Nav;if(['today','week','month','arc','profile','more','rank'].includes(n)){try{const u=new URL(location.href);u.searchParams.set('tab',n);__v24NavPush({v24Tab:n},'',u.href);}catch(_){} }},{capture:false});

  v25RecordOpen();
  renderV20();

})();

})();
