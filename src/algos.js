/* ===== อัลกอริทึมทั้งหมด: รันจริงแล้วบันทึกทีละขั้น ไม่แตะ DOM ===== */
const INF = Infinity;
const fmt = x => x === INF ? '∞' : x === -INF ? '−∞' : x < 0 ? '−' + (-x) : '' + x;
const V = s => `<i class="vx">${s}</i>`;
const thC = c => c === 'white' ? 'ขาว' : c === 'gray' ? 'เทา' : 'ดำ';
const cmpId = (a, b) => (+a === +a && +b === +b) ? (+a - +b) : (a < b ? -1 : a > b ? 1 : 0);

function makeGraph(d) {
  const G = {
    ids: d.nodes.map(n => n[0]), pos: {}, la: {}, E: [], adj: {},
    directed: !!d.directed, weighted: !!d.weighted, W: d.W || 600, H: d.H || 360,
    nameIn: !!d.nameIn, labels: d.labels || {},
  };
  d.nodes.forEach(n => { G.pos[n[0]] = [n[1], n[2]]; G.la[n[0]] = n[3] || ''; });
  G.ids.forEach(v => G.adj[v] = []);
  d.edges.forEach(e => {
    const o = { u: e[0], v: e[1], w: G.weighted ? e[2] : 1, opt: (G.weighted ? e[3] : e[2]) || {} };
    G.E.push(o);
    G.adj[o.u].push({ v: o.v, w: o.w });
    if (!G.directed && o.u !== o.v) G.adj[o.v].push({ v: o.u, w: o.w });
  });
  if (d.adj) for (const u in d.adj) G.adj[u] = d.adj[u].map(v => {
    const a = G.adj[u].find(x => x.v === v);
    if (!a) throw new Error('adj order mentions a non-edge ' + u + '-' + v);
    return a;
  });
  G.order = d.order || G.ids.slice();
  G.edgeOrder = d.edgeOrder ? d.edgeOrder.map(p => G.E.find(e => e.u === p[0] && e.v === p[1])) : G.E.slice();
  return G;
}
const ek = (G, u, v) => G.directed ? u + '>' + v : (u < v ? u + '>' + v : v + '>' + u);

class Rec {
  constructor(G) {
    this.G = G; this.steps = []; this.n = {}; this.e = {}; this.el = {};
    this.hiN = {}; this.tmpE = {}; this.flip = false; this.result = {};
    G.ids.forEach(v => this.n[v] = { c: 'white', t: '' });
  }
  hi(id, cls = 'cur') { this.hiN[id] = cls; return this; }
  act(key, cls = 'act') { this.tmpE[key] = cls; return this; }
  snap(line, msg, panels = [], extra = {}) {
    const n = {};
    this.G.ids.forEach(v => n[v] = { ...this.n[v], h: this.hiN[v] || '' });
    this.steps.push({ line, msg, n, e: { ...this.e, ...this.tmpE }, el: { ...this.el }, panels, flip: this.flip, ...extra });
    this.hiN = {}; this.tmpE = {};
  }
  out() { return { steps: this.steps, result: this.result }; }
}

const tbl = (title, head, rows, hi = -1) => ({ type: 'table', title, head, rows, hi });
const chips = (title, items, note) => ({ type: 'chips', title, items, note });
const queue = (title, items, empty) => ({ type: 'queue', title, items, empty });
const mat = (title, ids, M, cells = {}, opt = {}) => ({ type: 'matrix', title, ids, M, cells, ...opt });

function setPiEdges(R, G, pi) {
  for (const k in R.e) if (R.e[k] === 'tree') delete R.e[k];
  G.ids.forEach(v => { if (pi[v]) R.e[ek(G, pi[v], v)] = 'tree'; });
}

/* ---------- การแทนกราฟ ---------- */
function runRep(G) {
  const R = new Rec(G);
  const n = G.ids.length;
  const has = (i, j) => G.adj[G.ids[i]].some(a => a.v === G.ids[j]);
  const M = G.ids.map((_, i) => G.ids.map((_, j) => has(i, j) ? '1' : '0'));
  const total = G.ids.reduce((s, v) => s + G.adj[v].length, 0);
  const P = u => {
    const rows = G.ids.map(v => ({ v, list: G.adj[v].map(a => a.v), hi: v === u }));
    const cells = {};
    if (u) { const i = G.ids.indexOf(u); G.ids.forEach((_, j) => cells[i + ',' + j] = M[i][j] === '1' ? 'tgt' : 'band'); }
    return [{ type: 'adjlist', title: 'Adjacency list', rows }, mat('Adjacency matrix', G.ids, M, cells)];
  };
  const m = G.E.length;
  R.snap(0, `กราฟนี้มี |V| = ${n}, |E| = ${m} ทั้งสองแบบเก็บข้อมูลชุดเดียวกัน ความต่างอยู่ที่พื้นที่และความเร็วในการถาม`, P(null));
  G.ids.forEach(u => {
    const nb = G.adj[u].map(a => a.v);
    nb.forEach(v => R.act(ek(G, u, v)));
    R.hi(u);
    R.snap(0, nb.length ? `Adj[${V(u)}] = ${nb.map(V).join(', ')} ในเมทริกซ์คือแถว ${V(u)} ช่องที่เป็น 1` : `${V(u)} ไม่มี edge ออก list จึงว่าง และแถวใน matrix เป็น 0 ทั้งหมด`, P(u));
  });
  R.snap(0, `รวมความยาวทุก list = ${total} ${G.directed ? `เท่ากับ |E| พอดี (กราฟมีทิศ)` : `เท่ากับ 2|E| เพราะ edge แบบไม่มีทิศถูกเก็บสองครั้ง`} ส่วน matrix ใช้ ${n}×${n} = ${n * n} ช่องเสมอ`, P(null));
  R.result = { total };
  return R.out();
}

/* ---------- BFS ---------- */
function runBFS(G, o) {
  const s = o.source, R = new Rec(G), c = {}, d = {}, pi = {}, Q = [];
  G.ids.forEach(v => { c[v] = 'white'; d[v] = INF; pi[v] = null; });
  const sync = () => G.ids.forEach(v => { R.n[v].c = c[v]; R.n[v].t = fmt(d[v]); });
  const P = cur => [
    queue('คิว Q (ซ้ายคือหัวคิว) พร้อมค่า d', Q.map(v => ({ v, sub: fmt(d[v]) })), 'Q ว่าง'),
    tbl('สถานะ', ['v', 'สี', 'd', 'π'], G.ids.map(v => [v, thC(c[v]), fmt(d[v]), pi[v] || 'NIL']), G.ids.indexOf(cur)),
  ];
  sync();
  R.snap([1, 2, 3, 4], 'เริ่มต้น: ทุก vertex เป็นสีขาว ยังไม่ถูกค้นพบ และ d = ∞', P());
  c[s] = 'gray'; d[s] = 0; Q.push(s); sync(); R.hi(s);
  R.snap([5, 6, 7, 8, 9], `จุดเริ่ม ${V(s)} เป็นสีเทา d = 0 แล้วเข้าคิว`, P(s));
  while (Q.length) {
    const u = Q.shift(); R.hi(u);
    R.snap(11, `DEQUEUE ได้ ${V(u)} (d = ${fmt(d[u])}) จะไล่ดูเพื่อนบ้านของมัน`, P(u));
    for (const { v } of G.adj[u]) {
      const k = ek(G, u, v);
      if (c[v] === 'white') {
        c[v] = 'gray'; d[v] = d[u] + 1; pi[v] = u; Q.push(v); R.e[k] = 'tree'; sync(); R.act(k); R.hi(u); R.hi(v, 'k');
        R.snap([13, 14, 15, 16, 17], `${V(v)} ยังขาว: ทำเป็นเทา, d = ${d[u]} + 1 = ${d[v]}, π = ${V(u)} แล้วเข้าท้ายคิว`, P(v));
      } else {
        R.act(k, 'peek'); R.hi(u); R.hi(v, 'k');
        R.snap(13, `${V(v)} เป็นสี${thC(c[v])} เจอไปแล้ว ข้าม`, P(u));
      }
    }
    c[u] = 'black'; sync(); R.hi(u);
    R.snap(18, `ไล่ Adj[${V(u)}] ครบ ${V(u)} เป็นสีดำ`, P(u));
  }
  R.snap(10, 'Q ว่าง จบ เส้นหนาคือ breadth-first tree และ d คือจำนวน edge น้อยที่สุดจากจุดเริ่ม', P());
  R.result = { d: { ...d }, pi: { ...pi } };
  return R.out();
}

/* ---------- DFS ---------- */
function runDFS(G) {
  const R = new Rec(G), c = {}, pi = {}, d = {}, f = {}, stack = [], iv = [], par = [];
  let time = 0;
  G.ids.forEach(v => { c[v] = 'white'; pi[v] = null; d[v] = f[v] = null; });
  const sync = () => G.ids.forEach(v => { R.n[v].c = c[v]; R.n[v].t = d[v] == null ? '' : d[v] + '/' + (f[v] == null ? '' : f[v]); });
  const total = 2 * G.ids.length;
  const P = cur => [
    chips(`Call stack ของ DFS-VISIT · time = ${time}`, stack.map(v => ({ t: v })), 'ยังไม่มีการเรียก'),
    { type: 'paren', title: 'Parenthesis structure', iv: iv.map(x => ({ ...x })), total, text: par.join(' ') },
    tbl('Timestamp', ['v', 'สี', 'd', 'f', 'π'], G.ids.map(v => [v, thC(c[v]), d[v] ?? '', f[v] ?? '', pi[v] || 'NIL']), G.ids.indexOf(cur)),
  ];
  sync();
  R.snap([1, 2, 3, 4], 'เริ่มต้น: ทุก vertex ขาว และ time = 0', P());
  const visit = (u, depth) => {
    time++; d[u] = time; c[u] = 'gray'; stack.push(u); par.push('(' + u); iv.push({ v: u, d: time, f: null, depth }); sync(); R.hi(u);
    R.snap([101, 102, 103], `ค้นพบ ${V(u)}: time = ${time} ดังนั้น ${V(u)}.d = ${time} เปิดวงเล็บ (${u}`, P(u));
    for (const { v } of G.adj[u]) {
      const k = ek(G, u, v);
      if (c[v] === 'white') {
        pi[v] = u; R.e[k] = 'tree'; R.el[k] = 'T'; R.act(k); R.hi(u);
        R.snap([104, 105, 106], `สำรวจ (${V(u)}, ${V(v)}): ${V(v)} ขาว จึงเป็น tree edge แล้วลงลึกไปที่ ${V(v)}`, P(v));
        visit(v, depth + 1);
      } else if (c[v] === 'gray') {
        R.e[k] = 'back'; R.el[k] = 'B'; R.act(k, 'peek'); R.hi(u);
        R.snap([104, 105], `สำรวจ (${V(u)}, ${V(v)}): ${V(v)} เทา ยังอยู่ใน call stack จึงเป็น back edge`, P(u));
      } else {
        const cls = d[u] < d[v] ? 'F' : 'C';
        R.e[k] = 'nt'; R.el[k] = cls; R.act(k, 'peek'); R.hi(u);
        R.snap([104, 105], cls === 'F'
          ? `สำรวจ (${V(u)}, ${V(v)}): ${V(v)} ดำ และ ${V(u)}.d = ${d[u]} < ${V(v)}.d = ${d[v]} จึงเป็น forward edge`
          : `สำรวจ (${V(u)}, ${V(v)}): ${V(v)} ดำ และ ${V(u)}.d = ${d[u]} > ${V(v)}.d = ${d[v]} จึงเป็น cross edge`, P(u));
      }
    }
    time++; f[u] = time; c[u] = 'black'; stack.pop(); par.push(u + ')'); iv.find(x => x.v === u).f = time; sync(); R.hi(u);
    R.snap([108, 109, 110], `Adj[${V(u)}] หมดแล้ว ${V(u)} เป็นสีดำ และ ${V(u)}.f = ${time} ปิดวงเล็บ ${u})`, P(u));
  };
  for (const u of G.order) {
    if (c[u] === 'white') {
      R.hi(u);
      R.snap([5, 6, 7], `ลูปหลักเจอ ${V(u)} ที่ยังขาว เริ่ม depth-first tree ต้นใหม่`, P(u));
      visit(u, 0);
    }
  }
  R.snap(5, 'จบ DFS เส้นหนาคือ depth-first forest ตัวอักษรบน edge คือประเภท T, B, F, C', P());
  const cls = { ...R.el };
  R.result = { d: { ...d }, f: { ...f }, cls };
  return R.out();
}

/* ---------- Topological sort ---------- */
function runTopo(G) {
  const R = new Rec(G), c = {}, d = {}, f = {}, list = [];
  let time = 0, cycle = null;
  G.ids.forEach(v => { c[v] = 'white'; d[v] = f[v] = null; });
  const sync = () => G.ids.forEach(v => { R.n[v].c = c[v]; R.n[v].t = d[v] == null ? '' : d[v] + '/' + (f[v] == null ? '' : f[v]); });
  const P = () => [
    chips('Linked list (แทรกที่หัวเสมอ)', list.map(v => ({ t: v, sub: f[v] })), 'ยังว่าง'),
    tbl('Timestamp', ['v', 'd', 'f'], G.order.map(v => [v, d[v] ?? '', f[v] ?? ''])),
  ];
  sync(); R.snap(1, 'เรียก DFS(G) เพื่อหา finishing time ของทุก vertex', P());
  const visit = u => {
    time++; d[u] = time; c[u] = 'gray'; sync(); R.hi(u);
    R.snap(1, `DFS ค้นพบ ${V(u)} ที่ time = ${time}`, P());
    for (const { v } of G.adj[u]) {
      const k = ek(G, u, v);
      if (c[v] === 'white') { R.e[k] = 'tree'; visit(v); }
      else if (c[v] === 'gray' && !cycle) { cycle = [u, v]; R.e[k] = 'rej'; }
    }
    time++; f[u] = time; c[u] = 'black'; list.unshift(u); sync(); R.hi(u);
    R.snap(2, `${V(u)} เสร็จที่ time = ${time} แทรกที่หัว list ตัวที่เสร็จทีหลังจึงอยู่หน้า`, P());
  };
  G.order.forEach(u => { if (c[u] === 'white') visit(u); });
  const lin = { type: 'linear', title: 'เรียงตาม list: ทุก edge ชี้ไปทางขวา', order: list.slice(), edges: G.E.map(e => [e.u, e.v]) };
  R.snap(3, cycle
    ? `พบ back edge (${V(cycle[0])}, ${V(cycle[1])}) กราฟนี้มีวงจร จึงไม่มี topological order ลำดับใน list ใช้ไม่ได้`
    : `คืน list: ${list.map(V).join(' → ')}`, [...P(), lin]);
  R.result = { order: list.slice(), cycle, f: { ...f } };
  return R.out();
}

/* ---------- SCC ---------- */
function runSCC(G) {
  const R = new Rec(G), c = {}, d = {}, f = {};
  let time = 0;
  G.ids.forEach(v => { c[v] = 'white'; d[v] = f[v] = null; });
  const sync = () => G.ids.forEach(v => { R.n[v].c = c[v]; R.n[v].t = d[v] == null ? '' : d[v] + '/' + (f[v] == null ? '' : f[v]); });
  const P1 = () => [tbl('DFS รอบแรกบน G', ['v', 'd', 'f'], G.ids.map(v => [v, d[v] ?? '', f[v] ?? '']))];
  sync(); R.snap(1, 'ขั้นที่ 1: DFS บน G เพื่อเก็บ finishing time', P1());
  const visit = u => {
    time++; d[u] = time; c[u] = 'gray'; sync(); R.hi(u);
    R.snap(1, `ค้นพบ ${V(u)}.d = ${time}`, P1());
    for (const { v } of G.adj[u]) if (c[v] === 'white') { R.e[ek(G, u, v)] = 'tree'; visit(v); }
    time++; f[u] = time; c[u] = 'black'; sync(); R.hi(u);
    R.snap(1, `${V(u)} เสร็จ ${V(u)}.f = ${time}`, P1());
  };
  G.order.forEach(u => { if (c[u] === 'white') visit(u); });
  const order = G.ids.slice().sort((a, b) => f[b] - f[a]);
  R.e = {}; R.flip = true;
  G.ids.forEach(v => { R.n[v].c = 'white'; R.n[v].t = 'f=' + f[v]; });
  const adjT = {}; G.ids.forEach(v => adjT[v] = []);
  G.E.forEach(e => adjT[e.v].push(e.u));
  const comps = [], seen = {};
  const P2 = () => [
    chips('ลำดับ f จากมากไปน้อย (ลูปหลักของ DFS รอบสอง)', order.map(v => ({ t: v, sub: f[v], c: seen[v] ? 'done' : '' }))),
    chips('SCC ที่พบแล้ว', comps.map((C, i) => ({ t: '{' + C.join(', ') + '}', c: 'c' + (i % 6) })), 'ยังไม่พบ'),
  ];
  R.snap(2, `ขั้นที่ 2: สร้าง G<sup>T</sup> โดยกลับทิศทุก edge ลูกศรบนภาพกลับด้านแล้ว`, P2());
  order.forEach(r => {
    if (seen[r]) return;
    const idx = comps.length, C = []; comps.push(C);
    const go = u => {
      seen[u] = true; C.push(u); R.n[u].c = 'c' + (idx % 6); R.hi(u);
      R.snap(3, `จาก ${V(u)} เดินบน G<sup>T</sup> และได้ ${V(u)} เข้ากลุ่มที่ ${idx + 1}`, P2());
      for (const v of adjT[u]) if (!seen[v]) { R.e[ek(G, v, u)] = 'tree'; go(v); }
    };
    R.hi(r);
    R.snap(3, `ขั้นที่ 3: vertex ที่ f มากสุดและยังไม่ถูกเยี่ยมคือ ${V(r)} (f = ${f[r]}) เริ่ม tree ใหม่`, P2());
    go(r);
  });
  const compOf = {}; comps.forEach((C, i) => C.forEach(v => compOf[v] = i));
  const dag = new Set();
  G.E.forEach(e => { if (compOf[e.u] !== compOf[e.v]) dag.add(comps[compOf[e.u]].join('') + ' → ' + comps[compOf[e.v]].join('')); });
  R.snap(4, `ขั้นที่ 4: แต่ละ tree คือ 1 SCC ได้ทั้งหมด ${comps.length} กลุ่ม`, [...P2(), chips('Component graph (เป็น DAG เสมอ)', [...dag].map(t => ({ t })), 'ไม่มี edge ข้ามกลุ่ม')]);
  R.result = { comps: comps.map(C => C.slice().sort()), f: { ...f } };
  return R.out();
}

/* ---------- MST: cut และ safe edge ---------- */
function runCuts(G) {
  const R = new Rec(G);
  const eKey = e => ek(G, e.u, e.v);
  const scenes = [
    { S: ['a'], A: [], msg: 'A ยังว่าง เลือกกำหนด cut S = {a} edge ที่ข้าม cut คือ a–b และ a–h ตัวเบาสุดคือ a–b (4) จึงเป็น safe edge', add: ['a', 'b'], line: 3 },
    { S: ['a', 'b'], A: [['a', 'b']], msg: 'S = {a, b} edge ข้าม cut เบาสุดมีน้ำหนัก 8 สองเส้น (a–h และ b–c) เลือกเส้นไหนก็ safe นี่คือเหตุผลที่ MST ไม่จำเป็นต้องมีแบบเดียว', tie: [['a', 'h'], ['b', 'c']], line: 3 },
    { S: ['a', 'b', 'd', 'e'], A: [['a', 'b'], ['d', 'e']], msg: 'S ไม่จำเป็นต้องต่อเนื่องกัน S = {a, b, d, e} เคารพ A เพราะไม่มี edge ของ A ข้าม cut ตัวเบาสุดคือ c–d (7) จึงเพิ่มได้อย่างปลอดภัย', add: ['c', 'd'], line: 3 },
    { S: ['g', 'h'], A: [['g', 'h']], msg: 'S = {g, h} ตัวเบาสุดคือ f–g (2) ส่วนเส้นอื่นที่ข้าม เช่น h–i (7) ไม่ใช่ light edge ของ cut นี้ ทฤษฎีจึงไม่รับประกันว่าปลอดภัย', add: ['f', 'g'], line: 3 },
  ];
  const P = sc => {
    const inS = new Set(sc.S);
    const cross = G.E.filter(e => inS.has(e.u) !== inS.has(e.v)).sort((a, b) => a.w - b.w);
    return [
      chips('S (ด้านหนึ่งของ cut)', sc.S.map(t => ({ t, c: 'c0' }))),
      tbl('Edge ที่ข้าม cut เรียงตามน้ำหนัก', ['edge', 'w'], cross.map(e => [e.u + '–' + e.v, fmt(e.w)]), 0),
    ];
  };
  R.snap([1, 2], 'A = ∅ เราจะเพิ่มทีละ edge โดยรักษาความจริงข้อเดียวว่า A เป็นส่วนหนึ่งของ MST สักต้นเสมอ', []);
  scenes.forEach(sc => {
    G.ids.forEach(v => R.n[v].c = sc.S.includes(v) ? 'c0' : 'white');
    R.e = {};
    sc.A.forEach(p => R.e[ek(G, p[0], p[1])] = 'tree');
    const inS = new Set(sc.S);
    G.E.forEach(e => { if (inS.has(e.u) !== inS.has(e.v)) R.e[eKey(e)] = 'cand'; });
    if (sc.add) R.act(ek(G, sc.add[0], sc.add[1]));
    if (sc.tie) sc.tie.forEach(p => R.act(ek(G, p[0], p[1])));
    R.snap(sc.line, sc.msg, P(sc));
  });
  return R.out();
}

/* ---------- Kruskal ---------- */
function runKruskal(G) {
  const R = new Rec(G);
  const sets = {}; G.ids.forEach(v => sets[v] = [v]);
  const sorted = G.E.slice().sort((a, b) => a.w - b.w);
  const st = sorted.map(() => 'รอ');
  let sum = 0, A = [];
  const colorSets = () => {
    const seen = []; G.ids.forEach(v => { if (sets[v].length > 1 && !seen.includes(sets[v])) seen.push(sets[v]); });
    G.ids.forEach(v => R.n[v].c = sets[v].length > 1 ? 'c' + (seen.indexOf(sets[v]) % 6) : 'white');
  };
  const P = cur => {
    const uniq = []; G.ids.forEach(v => { if (!uniq.includes(sets[v])) uniq.push(sets[v]); });
    const seen = uniq.filter(s => s.length > 1);
    return [
      chips(`Disjoint sets · w(A) = ${sum}`, uniq.map(s => ({ t: '{' + s.join(',') + '}', c: s.length > 1 ? 'c' + (seen.indexOf(s) % 6) : '' }))),
      tbl('Edge เรียงตามน้ำหนัก', ['edge', 'w', 'ผล'], sorted.map((e, i) => [e.u + '–' + e.v, fmt(e.w), st[i]]), cur),
    ];
  };
  R.snap([1, 2, 3], 'A = ∅ และ MAKE-SET ให้ทุก vertex เป็น tree ของตัวเอง', P(-1));
  R.snap(4, 'เรียง edge จากน้ำหนักน้อยไปมาก', P(-1));
  sorted.forEach((e, i) => {
    const k = ek(G, e.u, e.v);
    R.act(k); R.hi(e.u); R.hi(e.v);
    if (sets[e.u] !== sets[e.v]) {
      R.snap(6, `พิจารณา ${V(e.u)}–${V(e.v)} (w = ${fmt(e.w)}): FIND-SET ได้คนละชุด ไม่เกิดวงจร`, P(i));
      const merged = sets[e.u].concat(sets[e.v]);
      merged.forEach(v => sets[v] = merged);
      st[i] = 'เลือก'; R.e[k] = 'tree'; sum += e.w; A.push([e.u, e.v]); colorSets();
      R.snap([7, 8], `เพิ่มเข้า A แล้ว UNION สอง tree น้ำหนักรวม = ${sum}`, P(i));
    } else {
      st[i] = 'ทิ้ง'; R.e[k] = 'rej';
      R.snap(6, `พิจารณา ${V(e.u)}–${V(e.v)} (w = ${fmt(e.w)}): อยู่ชุดเดียวกันแล้ว ถ้าเพิ่มจะเกิดวงจร จึงทิ้ง`, P(i));
    }
  });
  R.snap(9, `จบ ได้ MST ${A.length} เส้น น้ำหนักรวม ${sum}`, P(-1));
  R.result = { A, sum, sorted: sorted.map(e => e.u + e.v) };
  return R.out();
}

/* ---------- Prim ---------- */
function runPrim(G, o) {
  const r = o.source, R = new Rec(G), key = {}, pi = {}, inQ = {};
  G.ids.forEach(v => { key[v] = INF; pi[v] = null; inQ[v] = true; });
  key[r] = 0;
  const order = []; let sum = 0;
  const sync = () => {
    for (const k in R.e) if (R.e[k] === 'cand') delete R.e[k];
    G.ids.forEach(v => {
      R.n[v].c = inQ[v] ? 'white' : 'black'; R.n[v].t = fmt(key[v]);
      if (inQ[v] && pi[v]) R.e[ek(G, pi[v], v)] = 'cand';
      if (!inQ[v] && pi[v]) R.e[ek(G, pi[v], v)] = 'tree';
    });
  };
  const P = cur => [
    chips(`ลำดับที่เข้า tree · w(A) = ${sum}`, order.map(v => ({ t: v })), 'ยังว่าง'),
    tbl('Min-priority queue Q (เรียงตาม key)', ['v', 'key', 'π'],
      G.ids.filter(v => inQ[v]).sort((a, b) => key[a] - key[b]).map(v => [v, fmt(key[v]), pi[v] || 'NIL']),
      G.ids.filter(v => inQ[v]).sort((a, b) => key[a] - key[b]).indexOf(cur)),
  ];
  sync();
  R.snap([1, 2, 3, 4, 5], `ทุก vertex อยู่ใน Q ด้วย key = ∞ ยกเว้น root ${V(r)} ที่ key = 0`, P(r));
  while (G.ids.some(v => inQ[v])) {
    let u = null;
    G.ids.forEach(v => { if (inQ[v] && (u === null || key[v] < key[u])) u = v; });
    inQ[u] = false; order.push(u); if (key[u] !== INF) sum += key[u]; sync(); R.hi(u);
    R.snap(7, `EXTRACT-MIN ได้ ${V(u)} (key = ${fmt(key[u])}) ${pi[u] ? `เพิ่ม edge ${V(pi[u])}–${V(u)} เข้า tree` : 'เป็น root'}`, P(u));
    for (const { v, w } of G.adj[u]) {
      const k = ek(G, u, v);
      if (inQ[v] && w < key[v]) {
        const old = key[v]; pi[v] = u; key[v] = w; sync(); R.act(k); R.hi(u); R.hi(v, 'k');
        R.snap([9, 10, 11], `${V(v)} ยังอยู่ใน Q และ w(${V(u)}, ${V(v)}) = ${fmt(w)} < key เดิม ${fmt(old)} ปรับ key = ${fmt(w)}, π = ${V(u)}`, P(v));
      } else {
        R.act(k, 'peek'); R.hi(u); R.hi(v, 'k');
        R.snap(9, inQ[v] ? `${V(v)}: w = ${fmt(w)} ไม่น้อยกว่า key เดิม ${fmt(key[v])} ไม่เปลี่ยน` : `${V(v)} อยู่ใน tree แล้ว ข้าม`, P(u));
      }
    }
  }
  R.snap(6, `Q ว่าง จบ MST มีน้ำหนักรวม ${sum}`, P());
  R.result = { order, sum, key: { ...key }, pi: { ...pi } };
  return R.out();
}

/* ---------- พื้นฐาน shortest path ---------- */
function runRelaxDemo(G) {
  const R = new Rec(G);
  const set = (id, t) => R.n[id].t = t;
  ['u1', 'u2'].forEach(x => { set(x, '5'); R.n[x].c = 'gray'; });
  set('v1', '9'); set('v2', '6'); R.n.v1.c = R.n.v2.c = 'gray';
  const P = t => [tbl('เทียบค่า', ['กรณี', 'v.d เดิม', 'u.d + w', 'ผล'], t)];
  let rows = [['บน', '9', '5 + 2 = 7', 'รอตรวจ'], ['ล่าง', '6', '5 + 2 = 7', 'รอตรวจ']];
  R.snap(0, 'RELAX คือการถามว่า ถ้าไปถึง v โดยผ่าน u จะสั้นกว่าทางที่รู้จักอยู่ไหม ค่า d คือขอบบนของระยะจริง', P(rows));
  R.act('u1>v1'); R.hi('u1'); R.hi('v1', 'k');
  R.snap(1, 'กรณีบน: v.d = 9 > u.d + w = 7 เงื่อนไขจริง', P(rows));
  set('v1', '7'); R.e['u1>v1'] = 'tree'; rows = [['บน', '9', '5 + 2 = 7', 'ปรับเป็น 7, π = u'], rows[1]]; R.hi('v1', 'k');
  R.snap([2, 3], 'ปรับ v.d = 7 และจำว่ามาจาก u', P(rows));
  R.act('u2>v2', 'peek'); R.hi('u2'); R.hi('v2', 'k');
  rows = [rows[0], ['ล่าง', '6', '5 + 2 = 7', 'ไม่เปลี่ยน']];
  R.snap(1, 'กรณีล่าง: v.d = 6 ไม่มากกว่า 7 ทางเดิมดีอยู่แล้ว ไม่มีอะไรเปลี่ยน', P(rows));
  R.snap(0, 'สรุป: RELAX ทำให้ d ลดลงได้อย่างเดียวและไม่มีวันต่ำกว่าระยะจริง อัลกอริทึมในบทนี้ต่างกันแค่ลำดับการเรียก RELAX', P(rows));
  return R.out();
}
function runNegDemo(G) {
  const R = new Rec(G);
  const scene = (ids, val, msg, edges = [], cls = 'tree') => {
    ids.forEach((v, i) => { R.n[v].t = val[i]; R.n[v].c = 'gray'; R.hi(v); });
    edges.forEach(p => R.act(ek(G, p[0], p[1]), cls));
    R.snap(0, msg, [tbl('ค่า δ(s, v)', ['v', 'δ'], G.ids.map(v => [v, R.n[v].t || '?']))]);
  };
  R.n.s.t = '0'; R.n.s.c = 'gray';
  R.snap(0, 'ระยะ δ(s, v) ของกราฟในสไลด์ 37 เราจะไล่ทีละส่วน', [tbl('ค่า δ(s, v)', ['v', 'δ'], G.ids.map(v => [v, R.n[v].t || '?']))]);
  scene(['a', 'b'], ['3', '−1'], 'เส้นทาง s→a→b ไม่ผ่านวงจรใด น้ำหนักลบอย่าง −4 ไม่เป็นปัญหา δ(s,b) = 3 − 4 = −1', [['s', 'a'], ['a', 'b']]);
  scene(['c', 'd'], ['5', '11'], 'วงจร c→d→c หนัก 6 − 3 = +3 วนแล้วแย่ลง ทางสั้นสุดจึงไม่วน แม้มี edge ลบ', [['s', 'c'], ['c', 'd']]);
  scene(['e', 'f'], ['−∞', '−∞'], 'วงจร e→f→e หนัก 3 − 6 = −3 วนกี่รอบก็ลดลงอีก จึงไม่มีทางสั้นสุด δ = −∞', [['e', 'f'], ['f', 'e']], 'act');
  scene(['g'], ['−∞'], 'g ไปถึงได้จากวงจรลบ δ(s,g) จึงเป็น −∞ ด้วย', [['f', 'g']], 'act');
  scene(['h', 'i', 'j'], ['∞', '∞', '∞'], 'h, i, j มีวงจรลบก็จริง แต่ s ไปไม่ถึง δ จึงเป็น ∞ วงจรลบมีผลเฉพาะเมื่อไปถึงได้จากจุดเริ่ม', [], 'act');
  return R.out();
}

/* ---------- ใช้ร่วมกันใน SSSP ---------- */
function ssspState(G, s) {
  const d = {}, pi = {}; G.ids.forEach(v => { d[v] = INF; pi[v] = null; }); d[s] = 0; return { d, pi };
}

/* ---------- Bellman-Ford ---------- */
function runBF(G, o) {
  const s = o.source, R = new Rec(G), { d, pi } = ssspState(G, s), n = G.ids.length;
  const sync = () => { G.ids.forEach(v => { R.n[v].t = fmt(d[v]); R.n[v].c = d[v] === INF ? 'white' : 'gray'; }); setPiEdges(R, G, pi); };
  const P = (pass, cur) => [
    chips(pass === 'c' ? 'รอบตรวจวงจรลบ' : `รอบที่ ${pass} จาก ${n - 1} · ลำดับ edge ต่อรอบ`, G.edgeOrder.map((e, i) => ({ t: e.u + e.v, c: i === cur ? 'now' : '' }))),
    tbl('ค่าปัจจุบัน', ['v', 'd', 'π'], G.ids.map(v => [v, fmt(d[v]), pi[v] || 'NIL'])),
  ];
  sync();
  R.snap(1, `INITIALIZE: ${V(s)}.d = 0 ตัวอื่น ∞ จะ relax ทุก edge จำนวน |V| − 1 = ${n - 1} รอบ`, P(1, -1));
  for (let i = 1; i <= n - 1; i++) {
    let ch = 0;
    G.edgeOrder.forEach((e, idx) => {
      const k = ek(G, e.u, e.v);
      R.hi(e.u); R.hi(e.v, 'k');
      if (d[e.u] !== INF && d[e.v] > d[e.u] + e.w) {
        const old = d[e.v]; d[e.v] = d[e.u] + e.w; pi[e.v] = e.u; ch++; sync(); R.act(k);
        R.snap([3, 4], `รอบ ${i}: RELAX(${V(e.u)}, ${V(e.v)}) ${fmt(old)} > ${fmt(d[e.u])} + ${fmt(e.w)} ปรับ ${V(e.v)}.d = ${fmt(d[e.v])}`, P(i, idx));
      } else {
        R.act(k, 'peek');
        R.snap([3, 4], d[e.u] === INF ? `รอบ ${i}: ${V(e.u)}.d = ∞ ยังใช้เดินต่อไม่ได้` : `รอบ ${i}: RELAX(${V(e.u)}, ${V(e.v)}) ไม่ดีขึ้น`, P(i, idx));
      }
    });
    R.snap(2, `จบรอบ ${i} มีการปรับค่า ${ch} ครั้ง`, P(i, -1));
  }
  let ok = true, bad = null;
  for (let idx = 0; idx < G.edgeOrder.length; idx++) {
    const e = G.edgeOrder[idx], k = ek(G, e.u, e.v);
    R.hi(e.u); R.hi(e.v, 'k'); R.act(k, 'peek');
    if (d[e.u] !== INF && d[e.v] > d[e.u] + e.w) {
      ok = false; bad = e; R.act(k, 'rej');
      R.snap([6, 7], `ตรวจ (${V(e.u)}, ${V(e.v)}): ${fmt(d[e.v])} > ${fmt(d[e.u])} + ${fmt(e.w)} ยังลดได้อีก แปลว่ามีวงจรลบที่ไปถึงจาก ${V(s)} คืน FALSE`, P('c', idx));
      break;
    }
    R.snap([5, 6], `ตรวจ (${V(e.u)}, ${V(e.v)}): ลดไม่ได้แล้ว`, P('c', idx));
  }
  if (ok) R.snap(8, `ไม่มี edge ใดลดได้อีก คืน TRUE ค่า d คือระยะสั้นสุด`, P('c', -1));
  R.result = { d: { ...d }, ok, pi: { ...pi } };
  return R.out();
}

/* ---------- DAG shortest paths ---------- */
function topoQuiet(G) {
  const seen = {}, onS = {}, list = []; let cycle = null;
  const go = u => { seen[u] = onS[u] = true; G.adj[u].forEach(({ v }) => { if (onS[v]) cycle = cycle || [u, v]; else if (!seen[v]) go(v); }); onS[u] = false; list.unshift(u); };
  G.order.forEach(u => { if (!seen[u]) go(u); });
  return { list, cycle };
}
function runDAG(G, o) {
  const s = o.source, R = new Rec(G), { d, pi } = ssspState(G, s), { list, cycle } = topoQuiet(G);
  if (cycle) {
    R.snap(1, `กราฟนี้มีวงจรผ่าน ${V(cycle[0])} → ${V(cycle[1])} จึงเรียงทอพอโลยีไม่ได้ และใช้อัลกอริทึมนี้ไม่ได้ ลอง Bellman-Ford แทน`, []);
    R.result = { cycle }; return R.out();
  }
  const done = {};
  const sync = () => { G.ids.forEach(v => { R.n[v].t = fmt(d[v]); R.n[v].c = done[v] ? 'black' : 'white'; }); setPiEdges(R, G, pi); };
  const P = cur => [
    chips('ลำดับทอพอโลยี', list.map(v => ({ t: v, c: v === cur ? 'now' : done[v] ? 'done' : '' }))),
    tbl('ค่าปัจจุบัน', ['v', 'd', 'π'], list.map(v => [v, fmt(d[v]), pi[v] || 'NIL']), list.indexOf(cur)),
  ];
  sync();
  R.snap(1, `เรียงทอพอโลยีได้ ${list.map(V).join(', ')}`, P());
  R.snap(2, `INITIALIZE: ${V(s)}.d = 0 ตัวอื่น ∞`, P());
  list.forEach(u => {
    R.n[u].c = 'gray'; R.hi(u);
    R.snap(3, `หยิบ ${V(u)} ตามลำดับ (d = ${fmt(d[u])}) ตอนนี้ค่า d ของมันเป็นค่าสุดท้ายแล้ว`, P(u));
    G.adj[u].forEach(({ v, w }) => {
      const k = ek(G, u, v); R.hi(u); R.hi(v, 'k');
      if (d[u] !== INF && d[v] > d[u] + w) {
        const old = d[v]; d[v] = d[u] + w; pi[v] = u; sync(); R.n[u].c = 'gray'; R.act(k);
        R.snap([4, 5], `RELAX(${V(u)}, ${V(v)}): ${fmt(old)} > ${fmt(d[u])} + ${fmt(w)} ปรับ ${V(v)}.d = ${fmt(d[v])}`, P(u));
      } else {
        R.act(k, 'peek');
        R.snap([4, 5], d[u] === INF ? `RELAX(${V(u)}, ${V(v)}): ${V(u)}.d = ∞ เพราะอยู่ก่อนจุดเริ่ม ไม่เปลี่ยนอะไร` : `RELAX(${V(u)}, ${V(v)}): ไม่ดีขึ้น`, P(u));
      }
    });
    done[u] = true; sync();
  });
  R.snap(3, 'ครบทุก vertex ใน edge แต่ละเส้นถูก relax แค่ครั้งเดียว', [...P(), { type: 'linear', title: 'เส้นตรงตามลำดับทอพอโลยี', order: list.slice(), edges: G.E.map(e => [e.u, e.v]) }]);
  R.result = { d: { ...d }, order: list, pi: { ...pi } };
  return R.out();
}

/* ---------- Dijkstra ---------- */
function runDijkstra(G, o) {
  const s = o.source, R = new Rec(G), { d, pi } = ssspState(G, s), inQ = {}, S = [];
  G.ids.forEach(v => inQ[v] = true);
  const sync = () => { G.ids.forEach(v => { R.n[v].t = fmt(d[v]); R.n[v].c = inQ[v] ? 'white' : 'black'; }); setPiEdges(R, G, pi); };
  const P = cur => {
    const q = G.ids.filter(v => inQ[v]).sort((a, b) => d[a] - d[b]);
    return [chips('S (ระยะสรุปแล้ว)', S.map(v => ({ t: v, sub: fmt(d[v]) })), 'S ว่าง'), tbl('Q เรียงตาม d', ['v', 'd', 'π'], q.map(v => [v, fmt(d[v]), pi[v] || 'NIL']), q.indexOf(cur))];
  };
  sync();
  R.snap([1, 2, 3], `INITIALIZE: ${V(s)}.d = 0 ตัวอื่น ∞ ทุกตัวอยู่ใน Q`, P(s));
  while (G.ids.some(v => inQ[v])) {
    let u = null;
    G.ids.forEach(v => { if (inQ[v] && (u === null || d[v] < d[u])) u = v; });
    inQ[u] = false; S.push(u); sync(); R.n[u].c = 'gray'; R.hi(u);
    R.snap([5, 6], d[u] === INF ? `เหลือ ${V(u)} ซึ่ง d = ∞ แปลว่าไปไม่ถึงจาก ${V(s)}` : `EXTRACT-MIN ได้ ${V(u)} (d = ${fmt(d[u])}) ใกล้ที่สุดใน Q จึงเข้า S`, P(u));
    for (const { v, w } of G.adj[u]) {
      const k = ek(G, u, v); R.hi(u); R.hi(v, 'k');
      if (d[u] !== INF && d[v] > d[u] + w) {
        const old = d[v]; const wasDone = !inQ[v]; d[v] = d[u] + w; pi[v] = u; sync(); R.n[u].c = 'gray'; R.act(k);
        R.snap([7, 8], `RELAX(${V(u)}, ${V(v)}): ${fmt(old)} > ${fmt(d[u])} + ${fmt(w)} ปรับ ${V(v)}.d = ${fmt(d[v])}${wasDone ? ' ทั้งที่ ' + V(v) + ' อยู่ใน S แล้ว นี่คือสัญญาณว่าสมมติฐาน w ≥ 0 ถูกละเมิด' : ''}`, P(v));
      } else {
        R.act(k, 'peek');
        R.snap([7, 8], d[u] === INF ? `${V(u)} ไปไม่ถึง ข้าม` : `RELAX(${V(u)}, ${V(v)}): ไม่ดีขึ้น`, P(u));
      }
    }
    sync();
  }
  const neg = G.E.some(e => e.w < 0);
  let note = 'Q ว่าง จบ d คือระยะสั้นสุด';
  if (neg) {
    const t = quietBF(G, s);
    const wrong = t ? G.ids.filter(v => t[v] !== d[v]) : [];
    note = wrong.length ? `Q ว่าง แต่คำตอบผิด: ${wrong.map(v => `${V(v)} ได้ ${fmt(d[v])} ค่าจริง ${fmt(t[v])}`).join(', ')} เพราะกราฟมี edge ลบ` : 'กราฟมี edge ลบ ครั้งนี้บังเอิญตอบถูก แต่ Dijkstra ไม่รับประกัน';
    R.result.wrong = wrong; R.result.truth = t;
  }
  R.snap(4, note, P());
  R.result.d = { ...d }; R.result.order = S.slice(); R.result.pi = { ...pi };
  return R.out();
}
function quietBF(G, s) {
  const { d } = ssspState(G, s);
  for (let i = 1; i < G.ids.length; i++) G.E.forEach(e => { if (d[e.u] !== INF && d[e.v] > d[e.u] + e.w) d[e.v] = d[e.u] + e.w; });
  return G.E.some(e => d[e.u] !== INF && d[e.v] > d[e.u] + e.w) ? null : d;
}

/* ---------- All-pairs: matrix ---------- */
function weightMatrix(G) {
  const ids = G.ids, n = ids.length;
  const W = ids.map((u, i) => ids.map((v, j) => { if (i === j) return 0; const e = G.E.find(x => x.u === u && x.v === v); return e ? e.w : INF; }));
  return { ids, n, W };
}
const sadd = (a, b) => (a === INF || b === INF) ? INF : a + b;
const mStr = M => M.map(r => r.map(fmt));
function runAPSP(G, o = {}) {
  const R = new Rec(G), { ids, n, W } = weightMatrix(G), mode = o.mode || 'slow', all = !!o.detail;
  G.ids.forEach(v => R.n[v].c = 'white');
  const hist = {};
  const extend = (L, B, nameA, nameB, nameC) => {
    const C = L.map(r => r.map(() => INF)), filled = L.map(r => r.slice());
    R.snap([101, 102], `EXTEND ทำเหมือนคูณเมทริกซ์ ${nameA} ⊗ ${nameB} แต่ใช้ min แทน + และใช้ + แทน ×`, [mat(nameA, ids, mStr(L)), mat(nameB, ids, mStr(B)), mat(nameC, ids, mStr(filled))]);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      let best = INF, bk = -1; const cand = [];
      for (let k = 0; k < n; k++) { const x = sadd(L[i][k], B[k][j]); cand.push(`${fmt(L[i][k])}+${fmt(B[k][j])}`); if (x < best) { best = x; bk = k; } }
      C[i][j] = best; filled[i][j] = best;
      const changed = best !== L[i][j];
      if (all || changed) {
        const ca = {}, cb = {}, cc = { [i + ',' + j]: 'tgt' };
        for (let k = 0; k < n; k++) { ca[i + ',' + k] = 'band'; cb[k + ',' + j] = 'band'; }
        if (bk >= 0) { ca[i + ',' + bk] = 'src'; cb[bk + ',' + j] = 'src'; }
        R.hi(ids[i]); R.hi(ids[j], 'k');
        if (bk >= 0 && bk !== j && B[bk][j] !== INF && mode === 'slow') R.act(ek(G, ids[bk], ids[j]));
        R.snap([105, 106, 107], `ช่อง (${ids[i]}, ${ids[j]}): แถว ${ids[i]} ของ ${nameA} จับคู่คอลัมน์ ${ids[j]} ของ ${nameB} ได้ min{${cand.join(', ')}} = ${fmt(best)}${changed ? ` ดีขึ้นจาก ${fmt(L[i][j])}` : ' ไม่เปลี่ยน'}`,
          [mat(nameA, ids, mStr(L), ca), mat(nameB, ids, mStr(B), cb), mat(nameC, ids, mStr(filled), cc)]);
      }
    }
    return C;
  };
  let L = W.map(r => r.slice()); hist[1] = L;
  R.snap([1, 2], `L(1) = W คือคำตอบเมื่ออนุญาตเดินไม่เกิน 1 edge`, [mat('L(1) = W', ids, mStr(L))]);
  if (mode === 'slow') {
    for (let m = 2; m <= n - 1; m++) {
      const C = extend(L, W, `L(${m - 1})`, 'W', `L(${m})`);
      hist[m] = C; L = C;
      R.snap(5, `ได้ L(${m}) คือคำตอบเมื่อเดินไม่เกิน ${m} edge`, [mat(`L(${m})`, ids, mStr(L))]);
    }
  } else {
    let m = 1;
    while (m < n - 1) {
      const C = extend(L, L, `L(${m})`, `L(${m})`, `L(${2 * m})`);
      m = 2 * m; hist[m] = C; L = C;
      R.snap([6, 7], `ได้ L(${m}) ยกกำลังสองทีเดียวกระโดดจาก ${m / 2} เป็น ${m} edge`, [mat(`L(${m})`, ids, mStr(L))]);
    }
  }
  R.snap(6, `คืนเมทริกซ์สุดท้าย ใช้ไป ${Object.keys(hist).length - 1} ครั้งของ EXTEND`, [mat('ระยะสั้นสุดทุกคู่', ids, mStr(L))]);
  R.result = { L: hist };
  return R.out();
}

/* ---------- Floyd-Warshall ---------- */
function pathOf(Pi, ids, i, j) {
  if (i === j) return [i];
  if (Pi[i][j] === null) return null;
  const pre = ids.indexOf(Pi[i][j]);
  const left = pathOf(Pi, ids, i, pre);
  return left ? [...left, j] : null;
}
function runFW(G, o = {}) {
  const R = new Rec(G), { ids, n, W } = weightMatrix(G), all = !!o.detail;
  const Pi0 = W.map((r, i) => r.map((w, j) => (i === j || w === INF) ? null : ids[i]));
  let D = W.map(r => r.slice()), Pi = Pi0.map(r => r.slice());
  const hist = { D: { 0: D }, Pi: { 0: Pi } };
  const piS = P => P.map(r => r.map(x => x === null ? 'NIL' : '' + x));
  R.snap([1, 2], 'D(0) = W อนุญาตให้ไปตรงเท่านั้น ยังไม่มี vertex กลางใดเลย', [mat('D(0)', ids, mStr(D)), mat('Π(0)', ids, piS(Pi), {}, { small: true })], { Pi: Pi0, ids });
  for (let k = 0; k < n; k++) {
    const old = D, oldPi = Pi;
    const N = D.map(r => r.slice()), NP = Pi.map(r => r.slice());
    const band = {}; for (let x = 0; x < n; x++) { band[k + ',' + x] = 'band'; band[x + ',' + k] = 'band'; }
    R.hi(ids[k], 'via');
    R.snap([3, 4], `รอบ k = ${ids[k]}: อนุญาตให้ผ่าน {${ids.slice(0, k + 1).join(',')}} แถวและคอลัมน์ ${ids[k]} คือข้อมูลที่จะใช้`, [mat(`D(${k})`, ids, mStr(old), band), mat(`D(${k + 1}) กำลังเติม`, ids, mStr(N)), mat(`Π(${k + 1})`, ids, piS(NP), {}, { small: true })], { Pi: oldPi, ids });
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const via = sadd(old[i][k], old[k][j]);
      const better = old[i][j] > via;
      if (better) { N[i][j] = via; NP[i][j] = oldPi[k][j]; }
      if (better || all) {
        const ca = { ...band, [i + ',' + k]: 'src', [k + ',' + j]: 'src', [i + ',' + j]: 'tgt' };
        const pa = pathOf(oldPi, ids, i, k), pb = pathOf(oldPi, ids, k, j);
        if (pa && i !== k) for (let t = 0; t + 1 < pa.length; t++) R.act(ek(G, ids[pa[t]], ids[pa[t + 1]]), 'pa');
        if (pb && j !== k) for (let t = 0; t + 1 < pb.length; t++) R.act(ek(G, ids[pb[t]], ids[pb[t + 1]]), 'pb');
        R.hi(ids[i]); R.hi(ids[j]); R.hi(ids[k], 'via');
        R.snap(7, better
          ? `(${ids[i]}, ${ids[j]}) ผ่าน ${ids[k]}: ${fmt(old[i][k])} + ${fmt(old[k][j])} = ${fmt(via)} ดีกว่าเดิม ${fmt(old[i][j])} อัปเดต และ π = ${NP[i][j]}`
          : `(${ids[i]}, ${ids[j]}) ผ่าน ${ids[k]}: ${fmt(old[i][k])} + ${fmt(old[k][j])} = ${fmt(via)} ไม่ดีกว่า ${fmt(old[i][j])} คงค่าเดิม`,
          [mat(`D(${k})`, ids, mStr(old), ca), mat(`D(${k + 1}) กำลังเติม`, ids, mStr(N), { [i + ',' + j]: 'tgt' }), mat(`Π(${k + 1})`, ids, piS(NP), { [i + ',' + j]: 'tgt' }, { small: true })], { Pi: oldPi, ids });
      }
    }
    D = N; Pi = NP; hist.D[k + 1] = D; hist.Pi[k + 1] = Pi;
    R.hi(ids[k], 'via');
    R.snap(3, `จบรอบ k = ${ids[k]} ได้ D(${k + 1}) และ Π(${k + 1}) เทียบกับสไลด์ 67–68 ได้เลย`, [mat(`D(${k + 1})`, ids, mStr(D), {}, { click: true }), mat(`Π(${k + 1})`, ids, piS(Pi), {}, { small: true })], { Pi, ids, query: true, D });
  }
  const neg = ids.map((_, i) => i).filter(i => D[i][i] < 0);
  R.snap(8, neg.length ? `พบ d(i,i) ติดลบที่ ${neg.map(i => ids[i]).join(', ')} แปลว่ามีวงจรลบ` : 'คืน D(n) คลิกช่องใดก็ได้ใน D เพื่อดูเส้นทางจริงที่ Π เก็บไว้', [mat(`D(${n})`, ids, mStr(D), {}, { click: true }), mat(`Π(${n})`, ids, piS(Pi), {}, { small: true })], { Pi, ids, query: true, D });
  R.result = hist;
  return R.out();
}

/* ---------- กราฟจากผู้ใช้ ---------- */
function parseCustom(text, { directed, weighted }) {
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
  if (!lines.length) throw new Error('ใส่ edge อย่างน้อยหนึ่งบรรทัด');
  const seen = new Set(), edges = [], ids = [];
  const add = v => { if (!ids.includes(v)) ids.push(v); };
  lines.forEach((ln, i) => {
    const p = ln.split(/[\s,]+/);
    if (p.length === 1) { if (!/^[\w\u0E00-\u0E7F-]{1,12}$/.test(p[0])) throw new Error(`บรรทัด ${i + 1}: ชื่อ vertex ใช้ได้เฉพาะตัวอักษรหรือตัวเลข`); add(p[0]); return; }
    if (weighted ? p.length !== 3 : p.length !== 2) throw new Error(`บรรทัด ${i + 1}: ต้องเป็น ${weighted ? '"u v น้ำหนัก"' : '"u v"'} เช่น ${weighted ? 'a b 4' : 'a b'}`);
    const [u, v] = p; const w = weighted ? Number(p[2]) : 1;
    [u, v].forEach(x => { if (!/^[\w\u0E00-\u0E7F-]{1,12}$/.test(x)) throw new Error(`บรรทัด ${i + 1}: ชื่อ vertex "${x}" ใช้ได้เฉพาะตัวอักษรหรือตัวเลข ยาวไม่เกิน 12`); });
    if (Number.isNaN(w)) throw new Error(`บรรทัด ${i + 1}: น้ำหนัก "${p[2]}" ไม่ใช่ตัวเลข`);
    if (!directed && u === v) throw new Error(`บรรทัด ${i + 1}: กราฟไม่มีทิศในบทนี้ไม่รับ self-loop`);
    const key = directed ? u + '>' + v : [u, v].sort().join('>');
    if (seen.has(key)) throw new Error(`บรรทัด ${i + 1}: edge ${u}-${v} ซ้ำ`);
    seen.add(key); add(u); add(v);
    edges.push(weighted ? [u, v, w] : [u, v]);
  });
  if (ids.length > 12) throw new Error(`มี ${ids.length} vertex ภาพจะอ่านยาก จำกัดไว้ไม่เกิน 12`);
  ids.sort(cmpId);
  const W = 560, H = 400, n = ids.length;
  const nodes = ids.map((id, i) => {
    const a = -Math.PI / 2 + 2 * Math.PI * i / n;
    return [id, Math.round(W / 2 + 200 * Math.cos(a)), Math.round(H / 2 + 150 * Math.sin(a))];
  });
  return { nodes, edges, directed, weighted, W, H, nameIn: false };
}

if (typeof module !== 'undefined') module.exports = { makeGraph, runRep, runBFS, runDFS, runTopo, runSCC, runCuts, runKruskal, runPrim, runRelaxDemo, runNegDemo, runBF, runDAG, runDijkstra, runAPSP, runFW, parseCustom, pathOf, INF, fmt };
