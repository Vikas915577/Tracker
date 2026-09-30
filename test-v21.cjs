const fs=require('fs'),vm=require('vm');
const APP=fs.readFileSync(__dirname+'/app.js','utf8');
async function makeContext({profile=false,rank=false,allDone=false}={}){
  const store={};
  if(profile){
    const habits=[{id:'h1',name:'Exercise',icon:'🏃',created:'2026-10-01',difficulty:'Medium',action:'5 minutes'},{id:'h2',name:'Read',icon:'📖',created:'2026-10-01',difficulty:'Easy',action:'2 pages'},{id:'h3',name:'Drink Water',icon:'💧',created:'2026-10-01',difficulty:'Easy',action:'1 glass'}];
    const current=new Date();const td=current.getUTCFullYear()+'-'+String(current.getUTCMonth()+1).padStart(2,'0')+'-'+String(current.getUTCDate()).padStart(2,'0'); const checks=allDone?Object.fromEntries(habits.map(h=>[h.id+'|'+td,true])):{};
    store.progress_tracker_v17=JSON.stringify({schema:20,name:'Test',goal:'Build discipline',profileCreated:true,onboardingDone:true,journeyStart:td,habits,checks,xp:allDone?85:0,xpEvents:{},bonusEvents:{},dark:false});
  }
  const body={innerHTML:'',classList:{toggle(){}}};
  const handlers=[];
  const doc={body,addEventListener:(type,fn)=>handlers.push({type,fn}),querySelector:()=>null,querySelectorAll:()=>[],createElement:(tag)=>({className:'',textContent:'',style:{setProperty(){}}})};
  const loc={href:'http://127.0.0.1:8765/'+(rank?'?tab=rank':''),pathname:'/',search:rank?'?tab=rank':'',hash:''};
  const fetch=async()=>({ok:true,json:async()=>Array.from({length:20},(_,i)=>({id:'u'+i,display_name:'User '+(i+1),instagram_handle:'@u'+(i+1),rank_score:100-i,week_score:95,league:'Diamond',total_wins:100-i,best_streak:10}))});
  const timers=[];
  const context={console,setTimeout:(fn)=>{timers.push(fn);return 1},setInterval:()=>1,clearInterval(){},Date,Math,JSON,Promise,URL,URLSearchParams,TextEncoder,Uint8Array,Blob:class{},File:class{},confirm:()=>true,prompt:()=>null,alert:()=>{},location:loc,fetch,
    localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]},document:doc,window:null,navigator:{serviceWorker:null,standalone:false,share:null},crypto:{subtle:{digest:async()=>new Uint8Array(32)},randomUUID:()=> 'uuid'},CLOUD_CFG:rank?{url:'https://example.supabase.co',anonKey:'abcdefghijklmnopqrstuvwxyz1234567890'}:{}};
  context.window=context;context.window.addEventListener=()=>{};context.window.matchMedia=()=>({matches:false});
  vm.createContext(context);vm.runInContext(APP,context,{filename:'app.js'});
  for(const fn of timers) {try{fn()}catch(e){console.error('timer error',e);throw e}}
  await new Promise(r=>setImmediate(r));
  await new Promise(r=>setImmediate(r));
  return {html:body.innerHTML,handlers};
}
function assert(ok,msg){if(!ok)throw new Error(msg)}
(async()=>{ let r=await makeContext();assert(r.html.includes('Start My Arc'),'new-user welcome missing');
r=await makeContext({profile:true});assert(r.html.includes('Good ')&&r.html.includes('NEXT WIN')&&r.html.includes('Your 3 actions'),'clean home missing');
r=await makeContext({profile:true,allDone:true});assert(r.html.includes('DAY COMPLETE')&&r.html.includes('All 3 wins are done'),'completed-day state missing');
r=await makeContext({profile:true,rank:true});assert((r.html.match(/class="rank-row/g)||[]).length===20,'Top 20 did not render 20 rows');assert(r.html.includes('Top 20'),'Top 20 heading missing');
const clickHandlers=r.handlers.filter(x=>x.type==='click').length;assert(clickHandlers===2,'click handler architecture changed: expected 2');
console.log('V21 VM TESTS PASS'); })().catch(e=>{console.error(e);process.exit(1)});
