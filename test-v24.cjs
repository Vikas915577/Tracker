const fs=require('fs'),vm=require('vm');
const APP=fs.readFileSync(__dirname+'/app.js','utf8');
function isoToday(){return '2026-10-01'}
async function makeContext({profile=false,rank=false,publicProfile=false}={}){
  const store={};
  if(profile){
    const habits=[{id:'h1',name:'Exercise',icon:'🏃',created:'2026-10-01',difficulty:'Medium',action:'5 minutes'},{id:'h2',name:'Read',icon:'📖',created:'2026-10-01',difficulty:'Easy',action:'2 pages'},{id:'h3',name:'Drink Water',icon:'💧',created:'2026-10-01',difficulty:'Easy',action:'1 glass'}];
    store.progress_tracker_v17=JSON.stringify({schema:21,name:'Test',goal:'Build discipline',profileCreated:true,onboardingDone:true,journeyStart:isoToday(),habits,checks:{},xp:0,xpEvents:{},bonusEvents:{},dark:false,publicProfile,cloudOptIn:publicProfile,cloudUserId:publicProfile?'me-47':''});
  }
  const body={innerHTML:'',classList:{toggle(){}}};
  const handlers=[];const timers=[];
  const doc={body,addEventListener:(type,fn)=>handlers.push({type,fn}),querySelector:()=>null,querySelectorAll:()=>[],createElement:(tag)=>({className:'',textContent:'',style:{setProperty(){}},click(){},getContext(){return null}})};
  const loc={href:'http://127.0.0.1:8765/'+(rank?'?tab=rank':''),pathname:'/',search:rank?'?tab=rank':'',hash:''};
  const leaderboard=Array.from({length:50},(_,i)=>({id:'u'+(i+1),display_name:'User '+(i+1),instagram_handle:'@u'+(i+1),rank_score:200-i,best_streak:50-i,total_wins:500-i,league:'Diamond',week_score:99,last_seen:new Date(Date.now()-i*60000).toISOString()}));
  leaderboard[46]={id:'me-47',display_name:'Vashu',instagram_handle:'@vashu',rank_score:154,best_streak:47,total_wins:453,league:'Diamond',week_score:99,last_seen:new Date().toISOString()};
  leaderboard.sort((a,b)=>b.rank_score-a.rank_score||b.best_streak-a.best_streak||b.total_wins-a.total_wins||String(a.id).localeCompare(String(b.id)));
  const exactRank=leaderboard.findIndex(x=>x.id==='me-47')+1;
  const fetch=async(url,opts={})=>{
    if(url.includes('/rpc/get_public_leaderboard'))return {ok:true,json:async()=>leaderboard.slice(0,20).map((x,i)=>({...x,rank:i+1}))};
    if(url.includes('/rpc/get_public_rank'))return {ok:true,json:async()=>[{rank:exactRank,id:'me-47',display_name:'Vashu',rank_score:154,best_streak:47,total_wins:453,league:'Diamond'}]};
    if(url.includes('/rpc/get_active_public_members'))return {ok:true,json:async()=>[{rank:14,id:'u14',display_name:'User 14',rank_score:187,best_streak:36,total_wins:486,last_seen:new Date().toISOString()},{rank:exactRank,id:'me-47',display_name:'Vashu',rank_score:154,best_streak:47,total_wins:453,last_seen:new Date().toISOString()}]};
    return {ok:true,json:async()=>leaderboard.slice(0,20)};
  };
  const context={console,setTimeout:(fn)=>{timers.push(fn);return timers.length},setInterval:()=>1,clearInterval(){},Date:class extends Date{constructor(...a){super(a.length?a[0]:'2026-10-01T12:00:00Z')}static now(){return Date.parse('2026-10-01T12:00:00Z')}},Math,JSON,Promise,URL,URLSearchParams,TextEncoder,Uint8Array,Blob:class{},File:class{},confirm:()=>true,prompt:()=>null,alert:()=>{},location:loc,fetch,
    localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]},document:doc,window:null,navigator:{serviceWorker:null,standalone:false,share:null},crypto:{subtle:{digest:async()=>new Uint8Array(32)},randomUUID:()=> 'uuid'},CLOUD_CFG:rank?{url:'https://example.supabase.co',anonKey:'public-key'}:{}};
  context.window=context;context.window.addEventListener=()=>{};context.window.matchMedia=()=>({matches:false});
  vm.createContext(context);vm.runInContext(APP,context,{filename:'app.js'});
  for(const fn of timers){try{fn()}catch(e){console.error('timer error',e);throw e}}
  await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r));
  return {html:body.innerHTML,handlers,store};
}
function assert(ok,msg){if(!ok)throw new Error(msg)}
(async()=>{
 let r=await makeContext();
 assert(r.html.includes('Start My Arc'),'new-user welcome missing');
 assert(r.html.includes('CREDIT BY')&&r.html.includes('Vashu Sharmaa'),'creator credit missing for new user');
 assert((r.html.match(/creator-photo-[123]\.jpg/g)||[]).length===3,'three creator photos missing on welcome');
 r=await makeContext({profile:true});
 assert(r.html.includes('Good ')&&r.html.includes('NEXT WIN')&&r.html.includes('Your 3 actions'),'clean home missing');
 assert(r.html.includes('CREDIT BY')&&r.html.includes('creator-photo-1.jpg')&&r.html.includes('creator-photo-2.jpg')&&r.html.includes('creator-photo-3.jpg'),'creator showcase missing on app home');
 r=await makeContext({profile:true,rank:true,publicProfile:true});
 assert((r.html.match(/class="rank-row/g)||[]).length===20,'Top 20 did not render 20 rows');
 assert(r.html.includes('#47'),'exact global rank #47 missing');
 assert(r.html.includes('Vashu')&&r.html.includes('User 14'),'active named users missing');
 assert(r.html.includes('#14 rank')&&r.html.includes('#47 rank'),'active exact ranks missing');
 assert(r.html.includes('Top 20'),'Top 20 heading missing');
 assert(r.html.includes('Credit by Vashu Sharmaa')||r.html.includes('CREDIT BY'),'creator credit not present on rank shell');
 const clickHandlers=r.handlers.filter(x=>x.type==='click').length;assert(clickHandlers===2,'click handler architecture changed: expected 2');
 console.log('V24 VM TESTS PASS');
})().catch(e=>{console.error(e);process.exit(1)});
