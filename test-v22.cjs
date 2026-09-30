const fs=require('fs'),vm=require('vm');
const APP=fs.readFileSync(__dirname+'/app.js','utf8');
function assert(ok,msg){if(!ok)throw new Error(msg)}
function make({profile=false,rank=false,pin=false,allDone=false}={}){
 const store={};
 const td=new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0')+'-'+String(new Date().getDate()).padStart(2,'0');
 const habits=[{id:'h1',name:'Exercise',icon:'🏃',created:td,difficulty:'Medium',action:'5 minutes'},{id:'h2',name:'Read',icon:'📖',created:td,difficulty:'Easy',action:'2 pages'},{id:'h3',name:'Drink Water',icon:'💧',created:td,difficulty:'Easy',action:'1 glass'}];
 if(profile){const checks=allDone?Object.fromEntries(habits.map(h=>[h.id+'|'+td,true])):{};store.progress_tracker_v17=JSON.stringify({schema:21,name:'Test User',goal:'Build discipline',profileCreated:true,onboardingDone:true,journeyStart:td,habits,checks,xp:allDone?100:0,xpEvents:{},bonusEvents:{},pinHash:pin?'0'.repeat(64):''});}
 const body={innerHTML:'',classList:{toggle(){}},appendChild(){},};const handlers=[];const els={loginPin:{value:'1234'}};
 const doc={body,addEventListener:(t,f)=>handlers.push({t,f}),querySelector:s=>els[s.slice(1)]||null,querySelectorAll:()=>[],createElement:tag=>({className:'',textContent:'',style:{setProperty(){}},remove(){}})};
 const rankData=Array.from({length:20},(_,i)=>({id:'u'+i,display_name:'User '+(i+1),rank_score:100-i,week_score:95,league:'Diamond',total_wins:100-i,best_streak:10,last_seen:'2026-10-01T00:00:00.000Z'}));
 const fakeFetch=async(url,opts={})=>{
   if(opts.method==='HEAD') return {ok:true,headers:{get:k=>k.toLowerCase()==='content-range'?'0-9/25':null}};
   return {ok:true,json:async()=>rankData};
 };
 const timers=[];const location={href:'http://x/'+(rank?'?tab=rank':''),pathname:'/',search:rank?'?tab=rank':'',hash:''};
 const context={console,setTimeout:(fn)=>{timers.push(fn);return 1},setInterval:()=>1,clearInterval:()=>{},clearTimeout:()=>{},Date,Math,JSON,Promise,URL,URLSearchParams,TextEncoder,Uint8Array,Blob:class{},File:class{},confirm:()=>true,prompt:()=>null,location,fetch:fakeFetch,
   localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]},document:doc,window:null,navigator:{serviceWorker:null,standalone:false,share:null},crypto:{subtle:{digest:async()=>new Uint8Array(32)},randomUUID:()=> 'uuid'},CLOUD_CFG:{url:'https://example.supabase.co',anonKey:'key'},WINTER_ARC_CLOUD:{url:'https://example.supabase.co',anonKey:'key'}};
 context.window=context;context.window.addEventListener=()=>{};context.window.matchMedia=()=>({matches:false});vm.createContext(context);vm.runInContext(APP,context);for(const fn of timers){try{fn()}catch(e){throw e}}return {body,handlers,store,context};
}
(async()=>{
 let t=make();assert(t.body.innerHTML.includes('Start My Arc'),'new-user welcome missing');
 t=make({profile:true});assert(t.body.innerHTML.includes('NEXT WIN'),'home missing');
 const click=t.handlers.find(h=>h.t==='click');assert(click,'main click handler missing');
 await click.f({target:{closest:()=>({tagName:'BUTTON',dataset:{action:'account'}})}});assert(t.body.innerHTML.includes('MY ARC'),'account button did not open Profile');
 t=make({profile:true,pin:true});const loginClick=t.handlers.find(h=>h.t==='click');await loginClick.f({target:{closest:()=>({tagName:'BUTTON',dataset:{action:'login'}})}});assert(t.body.innerHTML.includes('NEXT WIN'),'PIN login did not unlock');
 t=make({profile:true,allDone:true});assert(t.body.innerHTML.includes('DAY COMPLETE'),'complete state missing');
 t=make({profile:true,rank:true});await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r));assert((t.body.innerHTML.match(/class="rank-row/g)||[]).length===20,'Top 20 is not exactly 20');assert(t.body.innerHTML.includes('User 20'),'20th name missing');assert(t.body.innerHTML.includes('ACTIVE NOW'),'active section missing');assert(t.body.innerHTML.includes('exact public rank'),'exact rank copy missing');
 const src=APP;assert(src.includes('rank_score=gt.'),'higher-score rank count missing');assert(src.includes('last_seen=lt.'),'same-score tie rank count missing');assert(src.includes("if(action==='login')"),'login action missing');assert(src.includes("if(action==='account')"),'account action missing');assert(src.includes("const CLOUD=()=>window.WINTER_ARC_CLOUD||window.CLOUD_CFG||{}"),'cloud alias missing');assert(src.includes('cloudCount'),'exact rank count helper missing');
 console.log('V22 SMOKE TEST PASS');
})().catch(e=>{console.error(e);process.exit(1)});
