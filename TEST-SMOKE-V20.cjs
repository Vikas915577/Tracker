const fs=require('fs'), vm=require('vm'), assert=require('assert');
const code=fs.readFileSync(__dirname+'/app.js','utf8');
const store={progress_tracker_v17:JSON.stringify({schema:19,arcStart:'2026-10-01',arcLength:92,name:'Tester',profileCreated:true,onboardingDone:true,journeyStart:'2026-10-01',habits:[{id:'h1',name:'Exercise',icon:'🏃',private:false,created:'2026-10-01',difficulty:'Medium',action:'5 minutes of movement',smallWin:'5 minutes of movement',why:'',priority:'must'},{id:'h2',name:'Read',icon:'📖',private:false,created:'2026-10-01',difficulty:'Easy',action:'Read 2 pages',smallWin:'Read 2 pages',why:'',priority:'should'}],checks:{},freezes:{},freezeUsed:{},xpEvents:{},bonusEvents:{},sleep:{},notes:{},habitNotes:{},goal:'Fitness',target:7,achieved:0,win:'',barrier:'',ifThen:'',dark:false,xp:0,mood:{},energy:{},planner:{},routines:[],goalLinks:[],reminders:{},pinHash:'',lastLogin:'',cloudOptIn:false,cloudUserId:'',cloudLastSync:'',cloudStatus:'',publicProfile:false})};
function el(){return {innerHTML:'',textContent:'',value:'',checked:false,disabled:false,style:{},dataset:{},classList:{toggle(){},add(){},remove(){}},appendChild(){},remove(){},setAttribute(){},focus(){},setSelectionRange(){},click(){}}}
const body=el(), head=el();
const document={body,head,createElement:()=>el(),querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){},createTextNode:()=>el()};
const window={addEventListener(){},matchMedia:()=>({matches:false}),navigator:{}};
const navigator=window.navigator;
const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};
const context={document,window,navigator,localStorage,console,URL,Date,Math,JSON,Promise,setInterval:()=>0,clearInterval:()=>{},setTimeout:(fn)=>0,clearTimeout:()=>{},alert(){},confirm:()=>true,prompt:()=>'',fetch:async()=>({ok:false,json:async()=>({})}),crypto:{randomUUID:()=> 'uuid-test'},Notification:undefined,Blob:function(){},File:function(){},URLSearchParams,atob:s=>Buffer.from(s,'base64').toString(),btoa:s=>Buffer.from(s).toString('base64'),unescape,encodeURIComponent,decodeURIComponent};
vm.createContext(context);
let err=null; try{vm.runInContext(code,context,{timeout:15000});}catch(e){err=e;}
assert.ifError(err);
assert(body.innerHTML.includes('v20-app'),'V20 shell did not render');
assert(body.innerHTML.includes('NEXT WIN'),'Next Win missing');
assert(body.innerHTML.includes('Today'),'Today nav missing');
assert(!body.innerHTML.includes('TOTAL HUSTLERS TODAY'),'Community card should not be on Home');
console.log('V20 runtime smoke: PASS');
console.log('Rendered HTML length:', body.innerHTML.length);
console.log('Home compact markers present: PASS');
