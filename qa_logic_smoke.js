'use strict';

const START='2026-10-01';
const END='2026-12-31';
const LEN=92;
const TODAY='2026-10-02';
const dObj=d=>new Date(d+'T12:00:00');
const addDays=(d,n)=>{const x=dObj(d);x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
const diff=(a,b)=>Math.round((dObj(b)-dObj(a))/86400000);
const inArc=d=>d>=START&&d<=END;
const weekDates=()=>{const start=diff(START,TODAY)<6?START:addDays(TODAY,-6);return Array.from({length:7},(_,i)=>addDays(start,i));};
const habitEligible=(created,d)=>inArc(d)&&d>=created;

function assert(name,cond){if(!cond)throw new Error('FAIL: '+name);console.log('PASS: '+name)}

assert('Arc length is 92 days', diff(START,END)+1===LEN);
assert('Day 2 on 2026-10-02', diff(START,TODAY)+1===2);
assert('Week starts at Arc start during first Arc week', JSON.stringify(weekDates())===JSON.stringify(['2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05','2026-10-06','2026-10-07']));
assert('future dates remain in week but are not editable', weekDates().slice(2).every(d=>d>TODAY));
assert('new habit is ineligible before its real creation date', habitEligible('2026-10-02','2026-10-01')===false);
assert('new habit is eligible on creation date', habitEligible('2026-10-02','2026-10-02')===true);
assert('new habit history remains eligible later in Arc', habitEligible('2026-10-02','2026-12-31')===true);
assert('pre-Arc dates are always ineligible', habitEligible('2026-09-01','2026-09-30')===false);

// Deterministic rank: score, streak, wins, then id.
const rows=[
 {id:'b',rank_score:80,best_streak:5,total_wins:10},
 {id:'a',rank_score:80,best_streak:5,total_wins:10},
 {id:'c',rank_score:80,best_streak:5,total_wins:9}
].sort((x,y)=>y.rank_score-x.rank_score||y.best_streak-x.best_streak||y.total_wins-x.total_wins||x.id.localeCompare(y.id));
assert('rank tie-break is deterministic', rows.map(x=>x.id).join(',')==='a,b,c');
const fs=require('fs'); const app=fs.readFileSync(require('path').join(__dirname,'../assets/webcore/app.js'),'utf8'); assert('rank source contains no Instagram field', !app.includes('instagram_handle')); assert('rank UI says name-only search', app.includes('Search Top 20 by name'));


// Routine state: first incomplete step -> next -> finish.
const routine={items:['h1','h2','h3'],step:0};
const done=new Set();
const current=()=>routine.items.slice(routine.step).find(id=>!done.has(id))??null;
assert('routine starts at first step','h1'===current());
let step=current(); done.add(step); routine.step=routine.items.indexOf(step)+1; assert('routine advances to next step',current()==='h2');
step=current(); done.add(step); routine.step=routine.items.indexOf(step)+1; step=current(); done.add(step); routine.step=routine.items.length; assert('routine finishes cleanly',current()===null&&routine.step===3);

console.log('\nLOGIC SMOKE: ALL PASS');
