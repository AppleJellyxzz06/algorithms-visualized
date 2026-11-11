const fs=require('fs'),vm=require('vm');
const ctx={console};vm.createContext(ctx);
vm.runInContext(['algos','algos2','lessons','lessons2'].map(f=>fs.readFileSync('src/'+f+'.js','utf8').replace(/if \(typeof module[^\n]*\n/,'')).join('\n')+'\nthis.A={makeGraph,ALL_LESSONS,SUBJECTS,MEDIA,OVERVIEW2,OVERVIEW_ROWS,LINKS_X};',ctx);
const A=ctx.A;let bad=0;const ids=new Set();
const runP=(L,P,inp)=>{let def=P.def,opt={...(P.opt||{})},input=P.input;if(inp){if(P.adapt){const a=P.adapt(inp);def=a.def;opt={...opt,...a.opt}}else input={...(P.input||{}),...inp}}
 return def?[A.makeGraph(def),P.run(A.makeGraph(def),opt)]:[null,P.run(input,opt)]};
for(const L of A.ALL_LESSONS){if(ids.has(L.id)){bad++;console.log('dup',L.id)}ids.add(L.id);
 if(!L.sub){bad++;console.log('nosub',L.id)}
 L.quiz.forEach((q,i)=>{if(q.a>=q.o.length){bad++;console.log('quiz',L.id,i)}});
 L.links.forEach(k=>{if(!A.MEDIA[k]){bad++;console.log('link',L.id,k)}});
 L.presets.forEach((P,pi)=>{let G,out;try{[G,out]=runP(L,P)}catch(e){bad++;console.log('RUN',L.id,P.name,e.stack);return}
  const procs=P.procs||L.procs;const valid=new Set([0]);procs.forEach((pr,x)=>pr.lines.forEach((_,ln)=>valid.add(x*100+ln+1)));
  if(!out.steps.length){bad++;console.log('nosteps',L.id)}
  out.steps.forEach((s,i)=>{[].concat(s.line).forEach(x=>{if(!valid.has(x)){bad++;console.log('LINE',L.id,P.name,i,x)}});
   if(/undefined|NaN/.test(s.msg)){bad++;console.log('MSG',L.id,s.msg)}
   if(!G&&s.view===undefined){bad++;console.log('noview',L.id,i)}
   if(typeof s.view==='function'||typeof s.panels==='function'){bad++;console.log('unresolved',L.id,i)}
   if(G)for(const k in s.e){const[a,b]=k.split('>');if(!G.E.some(e=>(e.u===a&&e.v===b)||(!G.directed&&e.u===b&&e.v===a))){bad++;console.log('EDGE',L.id,P.name,k)}}
  });console.log(' ',L.id,'/',P.name,out.steps.length)});
 if(L.custom&&L.custom.parse){const inp=L.custom.parse(L.custom.sample);const P=L.presets[L.custom.only??0];const r=runP(L,P,inp);console.log('  custom',L.id,r[1].steps.length)}
}
Object.values(A.OVERVIEW2).flat().concat(A.OVERVIEW_ROWS).forEach(r=>{if(!ids.has(r[1])){bad++;console.log('ov',r[1])}});
A.LINKS_X.forEach(x=>{[x[1],...x[3].map(y=>y[0])].forEach(i=>{if(!ids.has(i)){bad++;console.log('lx',i)}})});
console.log(A.ALL_LESSONS.length,'lessons',bad?'FAILED '+bad:'ALL PASS');
