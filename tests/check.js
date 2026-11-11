const fs=require('fs'),vm=require('vm');
const ctx={module:undefined,console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('src/algos.js','utf8')+'\n'+fs.readFileSync('src/algos2.js','utf8')+'\n'+fs.readFileSync('src/lessons.js','utf8')+'\n'+fs.readFileSync('src/lessons2.js','utf8')+'\nthis.A={makeGraph,runRep,runBFS,runDFS,runTopo,runSCC,runCuts,runKruskal,runPrim,runRelaxDemo,runNegDemo,runBF,runDAG,runDijkstra,runAPSP,runFW,parseCustom,pathOf,INF,fmt,GD,mstDef,LESSONS,MEDIA};',ctx);
const A=ctx.A;const I=Infinity,N=null;let bad=0;
const eq=(n,a,b)=>{const x=JSON.stringify(a,(k,v)=>v===I?'INF':v),y=JSON.stringify(b,(k,v)=>v===I?'INF':v);if(x!==y){bad++;console.log('FAIL',n,'\n  got ',x,'\n  want',y)}else console.log('ok  ',n)};
const G=A.makeGraph;
let r=A.runBFS(G(A.GD.bfs),{source:'s'}).result;
eq('BFS d',r.d,{r:1,s:0,t:2,u:3,v:2,w:1,x:2,y:3});
// BFS queue sequence on slide 8
let qs=A.runBFS(G(A.GD.bfs),{source:'s'}).steps.filter(s=>s.line===18||(Array.isArray(s.line)&&s.line[0]===5)).map(s=>s.panels[0].items.map(i=>i.v).join(''));
eq('BFS queues',qs,['s','wr','rtx','txv','xvu','vuy','uy','y','']);
r=A.runDFS(G(A.GD.dfs13)).result;
eq('DFS13 d/f',[r.d,r.f],[{u:1,v:2,w:9,x:4,y:3,z:10},{u:8,v:7,w:12,x:5,y:6,z:11}]);
eq('DFS13 cls',r.cls,{'u>v':'T','v>y':'T','y>x':'T','x>v':'B','u>x':'F','w>y':'C','w>z':'T','z>z':'B'});
r=A.runDFS(G(A.GD.dfs15)).result;
eq('DFS15 d/f',[r.d,r.f],[{s:1,z:2,y:3,x:4,w:7,t:11,v:12,u:14},{s:10,z:9,y:6,x:5,w:8,t:16,v:13,u:15}]);
eq('DFS15 cls',r.cls,{'s>z':'T','z>y':'T','y>x':'T','x>z':'B','z>w':'T','w>x':'C','s>w':'F','t>v':'T','v>s':'C','v>w':'C','t>u':'T','u>t':'B','u>v':'C'});
r=A.runTopo(G(A.GD.topo)).result;
eq('Topo',r.order,['socks','undershorts','pants','shoes','watch','shirt','belt','tie','jacket']);
eq('Topo f',r.f,{undershorts:16,pants:15,belt:7,shirt:8,tie:5,jacket:4,socks:18,shoes:14,watch:10});
r=A.runSCC(G(A.GD.scc)).result;
eq('SCC f',r.f,{a:14,b:16,c:10,d:9,e:15,f:4,g:7,h:6});
eq('SCC',r.comps.map(c=>c.join('')).sort(),['abe','cd','fg','h']);
r=A.runKruskal(G(A.mstDef(true))).result;
eq('Kruskal sum',r.sum,37);
eq('Kruskal chosen',r.A.map(p=>p.join('')),['gh','ci','fg','ab','cf','cd','ah','de']);
r=A.runPrim(G(A.mstDef(false)),{source:'a'}).result;
eq('Prim',[r.order.join(''),r.sum],['abcifghde',37]);
r=A.runBF(G(A.GD.bf),{source:'s'}).result;
eq('BF',[r.d,r.ok],[{s:0,t:2,x:4,y:7,z:-2},true]);
// BF pass snapshots slide 43 (b)-(e)
const bfRes=A.runBF(G(A.GD.bf),{source:'s'});
const passes=bfRes.steps.filter(s=>s.line===2).map(s=>Object.fromEntries(s.panels[1].rows.map(x=>[x[0],x[1]])));
eq('BF passes',passes,[{s:'0',t:'6',x:'∞',y:'7',z:'∞'},{s:'0',t:'6',x:'4',y:'7',z:'2'},{s:'0',t:'2',x:'4',y:'7',z:'2'},{s:'0',t:'2',x:'4',y:'7',z:'−2'}]);
r=A.runBF(G(A.GD.bfNeg),{source:'s'}).result; eq('BF neg',r.ok,false);
r=A.runDAG(G(A.GD.dag),{source:'s'}).result;
eq('DAG',[r.order.join(''),r.d],['rstxyz',{r:I,s:0,t:2,x:6,y:5,z:3}]);
r=A.runDijkstra(G(A.GD.dij),{source:'s'}).result;
eq('Dijkstra',[r.order.join(''),r.d],['syztx',{s:0,t:8,x:9,y:5,z:7}]);
r=A.runDijkstra(G(A.GD.dijNeg),{source:'s'}).result;
eq('Dij trap',[r.d.t,r.truth.t,r.wrong],[3,2,['t']]);
const L={1:[[0,3,8,I,-4],[I,0,I,1,7],[I,4,0,I,I],[2,I,-5,0,I],[I,I,I,6,0]],
2:[[0,3,8,2,-4],[3,0,-4,1,7],[I,4,0,5,11],[2,-1,-5,0,-2],[8,I,1,6,0]],
3:[[0,3,-3,2,-4],[3,0,-4,1,-1],[7,4,0,5,11],[2,-1,-5,0,-2],[8,5,1,6,0]],
4:[[0,1,-3,2,-4],[3,0,-4,1,-1],[7,4,0,5,3],[2,-1,-5,0,-2],[8,5,1,6,0]]};
r=A.runAPSP(G(A.GD.apsp),{mode:'slow'}).result.L;
for(const m of [1,2,3,4])eq('L'+m,r[m],L[m]);
r=A.runAPSP(G(A.GD.apsp),{mode:'faster'}).result.L;
eq('Faster keys',Object.keys(r),['1','2','4']);eq('Faster L4',r[4],L[4]);
const n=N;
const D={1:[[0,3,8,I,-4],[I,0,I,1,7],[I,4,0,I,I],[2,5,-5,0,-2],[I,I,I,6,0]],
2:[[0,3,8,4,-4],[I,0,I,1,7],[I,4,0,5,11],[2,5,-5,0,-2],[I,I,I,6,0]],
3:[[0,3,8,4,-4],[I,0,I,1,7],[I,4,0,5,11],[2,-1,-5,0,-2],[I,I,I,6,0]],
4:[[0,3,-1,4,-4],[3,0,-4,1,-1],[7,4,0,5,3],[2,-1,-5,0,-2],[8,5,1,6,0]],
5:[[0,1,-3,2,-4],[3,0,-4,1,-1],[7,4,0,5,3],[2,-1,-5,0,-2],[8,5,1,6,0]]};
const P={0:[[n,'1','1',n,'1'],[n,n,n,'2','2'],[n,'3',n,n,n],['4',n,'4',n,n],[n,n,n,'5',n]],
1:[[n,'1','1',n,'1'],[n,n,n,'2','2'],[n,'3',n,n,n],['4','1','4',n,'1'],[n,n,n,'5',n]],
2:[[n,'1','1','2','1'],[n,n,n,'2','2'],[n,'3',n,'2','2'],['4','1','4',n,'1'],[n,n,n,'5',n]],
3:[[n,'1','1','2','1'],[n,n,n,'2','2'],[n,'3',n,'2','2'],['4','3','4',n,'1'],[n,n,n,'5',n]],
4:[[n,'1','4','2','1'],['4',n,'4','2','1'],['4','3',n,'2','1'],['4','3','4',n,'1'],['4','3','4','5',n]],
5:[[n,'3','4','5','1'],['4',n,'4','2','1'],['4','3',n,'2','1'],['4','3','4',n,'1'],['4','3','4','5',n]]};
r=A.runFW(G(A.GD.apsp));
for(const k of [1,2,3,4,5])eq('D'+k,r.result.D[k],D[k]);
for(const k of [0,1,2,3,4,5])eq('Pi'+k,r.result.Pi[k],P[k]);
const ids=['1','2','3','4','5'];
eq('path 1->2',A.pathOf(r.result.Pi[5],ids,0,1).map(i=>ids[i]).join(''),'15432');
eq('rep total',A.runRep(G(A.GD.repU)).result.total,14);
// all lessons run w/out error, custom samples too; quiz answers valid; line ids exist
for(const L of A.LESSONS){
  L.quiz.forEach((q,i)=>{if(q.a>=q.o.length)throw new Error(L.id+' quiz '+i)});
  L.links.forEach(k=>{if(!A.MEDIA[k])throw new Error(L.id+' link '+k)});
  L.presets.forEach(p=>{
    const g=G(p.def);const out=p.run(g,p.opt||{});
    const procs=p.procs||L.procs;
    const valid=new Set([0]);procs.forEach((pr,pi)=>pr.lines.forEach((_,ln)=>valid.add(pi*100+ln+1)));
    out.steps.forEach((s,i)=>{[].concat(s.line).forEach(x=>{if(!valid.has(x)){bad++;console.log('BAD LINE',L.id,p.name,i,x)}});
      for(const k in s.e){const[a,b]=k.split('>');if(!g.E.some(e=>(e.u===a&&e.v===b)||(!g.directed&&e.u===b&&e.v===a))){bad++;console.log('BAD EDGE',L.id,k)}}
      if(/undefined|NaN/.test(s.msg)){bad++;console.log('BAD MSG',L.id,s.msg)}});
    console.log('   ',L.id,'/',p.name,'steps',out.steps.length);
  });
  if(L.custom){const d=A.parseCustom(L.custom.sample,L.custom);const g=G(d);const o=L.custom.source?{source:g.ids[0]}:{};const out=L.presets[0].run(g,o);console.log('    custom',L.id,out.steps.length)}
}
for(const [t,o] of [['',{directed:true,weighted:false}],['a b x',{directed:true,weighted:true}],['a a',{directed:false,weighted:false}],['a b\na b',{directed:true,weighted:false}]]){try{A.parseCustom(t,o);bad++;console.log('NO ERR',t)}catch(e){console.log('err ok:',e.message)}}
const cyc=A.parseCustom('a b 1\nb a 1',{directed:true,weighted:true});console.log(A.runDAG(G(cyc),{source:'a'}).steps[0].msg);
console.log(bad?('FAILED '+bad):'ALL PASS');
