/* ===== อัลกอริทึมของบท DP, Heap, Divide & Conquer, Backtracking/B&B/Approximation ===== */
const esc2 = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* บันทึกขั้นสำหรับบทที่ไม่ใช้ภาพกราฟ view เป็นสตริง HTML หรือฟังก์ชันที่รับ layout */
class VRec {
  constructor() { this.steps = []; this.result = {}; }
  snap(line, msg, view, panels = [], extra = {}) { this.steps.push({ line, msg, view, panels, n: {}, e: {}, el: {}, flip: false, ...extra }); }
  out(layout) { resolveFns(this.steps, layout); return { steps: this.steps, result: this.result }; }
}
function resolveFns(steps, layout) {
  steps.forEach(s => {
    if (typeof s.view === 'function') s.view = s.view(layout);
    if (typeof s.panels === 'function') s.panels = s.panels(layout);
  });
}
const htmlP = (title, html, wide) => ({ type: 'html', title, html, wide });

function arrHTML(A, { base = 0, cls = {}, mark = {} } = {}) {
  return `<div class="arr">${A.map((v, i) => {
    const k = i + base;
    return `<div class="ac ${cls[k] || ''}"><small>${k}</small><b>${v === INF ? '∞' : esc2(v)}</b><em>${mark[k] || '&nbsp;'}</em></div>`;
  }).join('')}</div>`;
}
function lanesHTML(n, rows) {
  return `<div class="lanes" style="--n:${n}">${rows.map(r => `<div class="lane">${r.map(s =>
    `<div class="seg ${s.cls || ''}" style="grid-column:${s.s + 1}/${s.e + 2}">${s.vals.map((v, i) => `<b class="${(s.mark && s.mark[i]) || ''}">${esc2(v)}</b>`).join('')}</div>`).join('')}</div>`).join('')}</div>`;
}

/* ---------- ต้นไม้สถานะ: จัดตำแหน่งจากต้นไม้เต็ม ภาพจึงไม่ขยับระหว่างขั้น ---------- */
function layoutTree(all) {
  const kids = {}, W = {}, X = {}, Y = {}; let root = null;
  const size = n => [Math.max(...n.lines.map(l => [...l].length * 6.9), n.tag !== undefined ? 8 : 0) + 12, n.lines.length * 15 + 8];
  all.forEach(n => { kids[n.id] = []; });
  all.forEach(n => { if (n.p === null || n.p === undefined) root = n; else kids[n.p].push(n); });
  const GAP = 10, byId = {}; all.forEach(n => byId[n.id] = n);
  const widthOf = n => { const c = kids[n.id]; const cw = c.reduce((s, k) => s + widthOf(k), 0) + GAP * Math.max(0, c.length - 1); return W[n.id] = Math.max(size(n)[0], n.slot || 0, cw); };
  widthOf(root);
  const maxH = Math.max(...all.map(n => size(n)[1]));
  const rowH = maxH + 34;
  let maxD = 0;
  const place = (n, left, d) => {
    X[n.id] = left + W[n.id] / 2; Y[n.id] = 16 + d * rowH; maxD = Math.max(maxD, d);
    let x = left + (W[n.id] - (kids[n.id].reduce((s, k) => s + W[k.id], 0) + GAP * Math.max(0, kids[n.id].length - 1))) / 2;
    kids[n.id].forEach(k => { place(k, x, d + 1); x += W[k.id] + GAP; });
  };
  place(root, 0, 0);
  return { X, Y, W: W[root.id], H: 16 + maxD * rowH + maxH + 26, byId, size };
}
const withSlots = (all, state) => { all.forEach(n => { const nt = state[n.id] && state[n.id].note; n.slot = nt ? [...nt].length * 7 + 8 : 0; }); return all; };
function treeSVG(T, state) {
  const shown = Object.keys(state);
  let e = '', b = '';
  shown.forEach(id => {
    const n = T.byId[id], st = state[id], x = T.X[id], y = T.Y[id], [w, h] = T.size(n);
    if (n.p !== null && n.p !== undefined && state[n.p] !== undefined) e += `<line x1="${T.X[n.p]}" y1="${T.Y[n.p] + T.size(T.byId[n.p])[1]}" x2="${x}" y2="${y}"/>`;
    const lines = n.lines.map((l, i) => `<text x="${x}" y="${y + 12 + i * 15}">${esc2(l)}</text>`).join('');
    b += `<g class="tn ${st.c || ''}">${n.tag !== undefined ? `<text class="tg" x="${x}" y="${y - 4}">${n.tag}</text>` : ''}<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="3"/>${lines}${st.note ? `<text class="nt" x="${x}" y="${y + h + 13}">${esc2(st.note)}</text>` : ''}</g>`;
  });
  return `<div class="tw"><svg class="tree" viewBox="-6 -4 ${T.W + 12} ${T.H + 8}" style="min-width:${Math.min(T.W, 640)}px;width:min(100%, ${Math.round(T.W * 1.2)}px);height:auto;display:block;margin:0 auto" role="img" aria-label="ต้นไม้สถานะ"><g class="tl">${e}</g>${b}</svg></div>`;
}

/* ---------- DP: c(n, k) ---------- */
function binomTable(n, k, val, cls) {
  const ids = [...Array(k + 1).keys()];
  const M = [...Array(n + 1).keys()].map(i => ids.map(j => (val[i + ',' + j] !== undefined ? '' + val[i + ',' + j] : '')));
  return mat('c[n, k]', ids, M, cls, { rowIds: [...Array(n + 1).keys()] });
}
function runBinomRec(inp) {
  const { n, k } = inp, R = new VRec(), cnt = {}, stack = [];
  let calls = 0;
  const view = cur => {
    const cls = {}; for (const key in cnt) cls[key] = 'h' + Math.min(cnt[key], 5);
    if (cur) cls[cur] = 'tgt';
    return [binomTable(n, k, cnt, cls)];
  };
  const P = () => [chips(`Call stack · เรียกไปแล้ว ${calls} ครั้ง`, stack.map(t => ({ t })), 'ว่าง')];
  const go = (a, b) => {
    calls++; const key = a + ',' + b; cnt[key] = (cnt[key] || 0) + 1; stack.push(`c(${a},${b})`);
    if (b === 0 || b === a) {
      R.snap([1, 2], `c(${a}, ${b}) เป็นกรณีฐาน คืน 1 ตารางแสดงว่าช่องนี้ถูกเรียกมาแล้ว ${cnt[key]} ครั้ง`, view(key), P());
      stack.pop(); return 1;
    }
    R.snap(5, `เรียก c(${a}, ${b}) ครั้งที่ ${cnt[key]} ของช่องนี้ แตกเป็น c(${a - 1}, ${b - 1}) + c(${a - 1}, ${b})`, view(key), P());
    const v = go(a - 1, b - 1) + go(a - 1, b); stack.pop(); return v;
  };
  const v = go(n, k);
  R.snap(5, `ได้คำตอบ ${v} แต่เรียกฟังก์ชันไป ${calls} ครั้ง ตัวเลขในตารางคือจำนวนครั้งที่คำนวณซ้ำ`, view(null), P());
  R.result = { v, calls, cnt: { ...cnt } };
  return R.out();
}
function runBinomMemo(inp) {
  const { n, k } = inp, R = new VRec(), val = {}, stack = [];
  let calls = 0, hits = 0;
  const P = () => [chips(`Call stack · เรียก ${calls} ครั้ง · อ่านจากตาราง ${hits} ครั้ง`, stack.map(t => ({ t })), 'ว่าง')];
  const V2 = (cur, c2) => [binomTable(n, k, val, cur ? { [cur]: c2 } : {})];
  const go = (a, b) => {
    calls++; const key = a + ',' + b; stack.push(`c(${a},${b})`);
    if (b === 0 || b === a) {
      val[key] = 1;
      R.snap([1, 2], `c(${a}, ${b}) เป็นกรณีฐาน คืน 1`, V2(key, 'tgt'), P());
      stack.pop(); return 1;
    }
    if (val[key] !== undefined) {
      hits++;
      R.snap(6, `c(${a}, ${b}) มีในตารางแล้ว = ${val[key]} อ่านค่าเลย ไม่ต้องแตกต่อ`, V2(key, 'src'), P());
      stack.pop(); return val[key];
    }
    R.snap(5, `c(${a}, ${b}) ยังไม่เคยคำนวณ จึงเรียกลงไป`, V2(key, 'band'), P());
    const v = go(a - 1, b - 1) + go(a - 1, b);
    val[key] = v;
    R.snap(6, `เก็บ c(${a}, ${b}) = ${v} ลงตาราง`, V2(key, 'tgt'), P());
    stack.pop(); return v;
  };
  const v = go(n, k);
  R.snap(6, `ได้คำตอบ ${v} ด้วยการเรียก ${calls} ครั้ง ช่องว่างในตารางคือปัญหาย่อยที่ไม่จำเป็นต้องแก้`, V2(null), P());
  R.result = { v, calls, hits, val: { ...val } };
  return R.out();
}
function runBinomBU(inp) {
  const { n, k } = inp, R = new VRec(), val = {};
  const V2 = c => [binomTable(n, k, val, c)];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= Math.min(i, k); j++) {
    const key = i + ',' + j;
    if (j === 0 || j === i) {
      val[key] = 1;
      R.snap(2, `c(${i}, ${j}) = 1 ตามกรณีฐาน`, V2({ [key]: 'tgt' }));
    } else {
      val[key] = val[(i - 1) + ',' + (j - 1)] + (val[(i - 1) + ',' + j] || 0);
      R.snap(4, `c(${i}, ${j}) = ${val[(i - 1) + ',' + (j - 1)]} + ${val[(i - 1) + ',' + j] || 0} = ${val[key]} จากสองช่องในแถวก่อนหน้า`, V2({ [key]: 'tgt', [(i - 1) + ',' + (j - 1)]: 'src', [(i - 1) + ',' + j]: 'src' }));
    }
  }
  R.snap(5, `ถึงช่อง c(${n}, ${k}) = ${val[n + ',' + k]} หยุดเติมตาราง`, V2({ [n + ',' + k]: 'tgt' }));
  R.result = { val: { ...val } };
  return R.out();
}

/* ---------- DP: Matrix chain ---------- */
function runMCM(inp) {
  const d = inp.d, n = d.length - 1, R = new VRec(), names = inp.names || [...Array(n).keys()].map(i => 'A' + i);
  const N = [...Array(n)].map(() => Array(n).fill(null)), Sx = [...Array(n)].map(() => Array(n).fill(null));
  const ids = [...Array(n).keys()];
  const str = M => M.map(r => r.map(x => x === null ? '' : x === INF ? '∞' : '' + x));
  const V2 = (c, c2) => [mat('N[i, j] จำนวนการคูณน้อยสุด', ids, str(N), c || {}), mat('S[i, j] จุดแบ่งสุดท้าย', ids, str(Sx), c2 || {}, { small: true })];
  const dimsP = () => [chips('มิติ', names.map((nm, i) => ({ t: `${nm}: ${d[i]}×${d[i + 1]}` })))];
  for (let i = 0; i < n; i++) N[i][i] = 0;
  R.snap([1, 2], 'เมทริกซ์เดี่ยวไม่ต้องคูณ เส้นทแยงมุมจึงเป็น 0', V2(), dimsP());
  for (let b = 1; b < n; b++) for (let i = 0; i < n - b; i++) {
    const j = i + b; N[i][j] = INF;
    for (let k = i; k < j; k++) {
      const q = N[i][k] + N[k + 1][j] + d[i] * d[k + 1] * d[j + 1];
      const better = q < N[i][j];
      if (better) { N[i][j] = q; Sx[i][j] = k; }
      R.snap([7, 8], `(${i}, ${j}) แบ่งหลัง k = ${k}: ${N[i][k]} + ${N[k + 1][j]} + ${d[i]}·${d[k + 1]}·${d[j + 1]} = ${q}${better ? ' ดีที่สุดเท่าที่เจอ' : ' ไม่ดีกว่า'}`,
        V2({ [i + ',' + j]: 'tgt', [i + ',' + k]: 'src', [(k + 1) + ',' + j]: 'src' }, { [i + ',' + j]: 'tgt' }), dimsP());
    }
  }
  const paren = (i, j) => i === j ? names[i] : '(' + paren(i, Sx[i][j]) + '·' + paren(Sx[i][j] + 1, j) + ')';
  const p = paren(0, n - 1);
  R.snap(3, `คำตอบอยู่มุมขวาบน N[0, ${n - 1}] = ${N[0][n - 1]} วงเล็บที่ดีที่สุดคือ ${p}`, V2({ [`0,${n - 1}`]: 'tgt' }), [...dimsP(), chips('วิธีใส่วงเล็บ', [{ t: p, c: 'now' }])]);
  R.result = { best: N[0][n - 1], p, N };
  return R.out();
}

/* ---------- DP: 0/1 Knapsack ---------- */
function runKnap(inp) {
  const { items, W } = inp, n = items.length, R = new VRec();
  const ids = [...Array(W + 1).keys()];
  const T = [ids.map(() => 0)];
  const rows = () => T.map((r, i) => r.map(x => x === null ? '' : '' + x));
  const V2 = c => [mat('B[k, w] แต่ละแถวคือสถานะอาร์เรย์หลังจบไอเท็ม k', ids, rows(), c || {}, { rowIds: T.map((_, i) => i), rowHead: 'k' })];
  const P = k => [tbl('ไอเท็ม', ['k', 'w', 'b'], items.map((it, i) => [i + 1, it.w, it.b]), k - 1)];
  R.snap([1, 2], `เริ่มด้วย B[w] = 0 ทุกช่อง ความจุ W = ${W}`, V2(), P(0));
  for (let k = 1; k <= n; k++) {
    const { w: wk, b: bk } = items[k - 1], prev = T[k - 1], cur = ids.map(() => null); T.push(cur);
    for (let w = W; w >= wk; w--) {
      const take = prev[w - wk] + bk, better = take > prev[w];
      cur[w] = better ? take : prev[w];
      R.snap(better ? [5, 6] : 5, `ไอเท็ม ${k} (w=${wk}, b=${bk}) ที่ w=${w}: B[${w - wk}] + ${bk} = ${take} ${better ? `> ${prev[w]} ถือไอเท็มนี้` : `ไม่มากกว่า ${prev[w]} ไม่ถือ`}`,
        V2({ [k + ',' + w]: 'tgt', [(k - 1) + ',' + w]: 'band', [(k - 1) + ',' + (w - wk)]: 'src' }), P(k));
    }
    for (let w = 0; w < wk; w++) cur[w] = prev[w];
    R.snap(3, `จบไอเท็ม ${k} ช่องที่ w < ${wk} ใส่ไอเท็มนี้ไม่ได้ จึงคงค่าเดิม`, V2(), P(k));
  }
  const chosen = []; let w = W; const c = {};
  for (let k = n; k >= 1; k--) {
    c[k + ',' + w] = 'src';
    if (T[k][w] !== T[k - 1][w]) { chosen.unshift(k); w -= items[k - 1].w; }
  }
  const tw = chosen.reduce((s, k) => s + items[k - 1].w, 0);
  R.snap(0, `ย้อนตารางจาก B[${n}, ${W}] = ${T[n][W]}: ค่าที่เปลี่ยนจากแถวบนแปลว่าเลือกไอเท็มนั้น ได้ {${chosen.join(', ')}} น้ำหนักรวม ${tw}`, V2(c), P(0));
  R.result = { best: T[n][W], chosen, T };
  return R.out();
}

/* ---------- DP: LCS ---------- */
function runLCS(inp) {
  const X = inp.X, Y = inp.Y, m = X.length, n = Y.length, R = new VRec();
  const c = [...Array(m + 1)].map(() => Array(n + 1).fill(null)), b = [...Array(m + 1)].map(() => Array(n + 1).fill(''));
  const ARW = { UL: '↖', U: '↑', L: '←' };
  for (let i = 0; i <= m; i++) c[i][0] = 0;
  for (let j = 0; j <= n; j++) c[0][j] = 0;
  const colIds = ['', ...Y], rowIds = ['', ...X];
  const V2 = cl => [mat('c[i, j] พร้อมทิศจาก b[i, j]', colIds, c.map((r, i) => r.map((x, j) => x === null ? '' : (b[i][j] ? ARW[b[i][j]] + ' ' : '') + x)), cl || {}, { rowIds })];
  R.snap([3, 4], 'แถว 0 และคอลัมน์ 0 เป็น 0 เพราะลำดับว่างไม่มีตัวร่วม', V2());
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const cl = { [i + ',' + j]: 'tgt' }; let msg, line;
    if (X[i - 1] === Y[j - 1]) {
      c[i][j] = c[i - 1][j - 1] + 1; b[i][j] = 'UL'; cl[(i - 1) + ',' + (j - 1)] = 'src'; line = [7, 8];
      msg = `x${i} = y${j} = ${X[i - 1]} ตรงกัน: c[${i},${j}] = c[${i - 1},${j - 1}] + 1 = ${c[i][j]}`;
    } else if (c[i - 1][j] >= c[i][j - 1]) {
      c[i][j] = c[i - 1][j]; b[i][j] = 'U'; cl[(i - 1) + ',' + j] = 'src'; line = [9, 10];
      msg = `${X[i - 1]} ≠ ${Y[j - 1]}: บน ${c[i - 1][j]} ≥ ซ้าย ${c[i][j - 1]} ใช้ค่าด้านบน`;
    } else {
      c[i][j] = c[i][j - 1]; b[i][j] = 'L'; cl[i + ',' + (j - 1)] = 'src'; line = [11, 12];
      msg = `${X[i - 1]} ≠ ${Y[j - 1]}: บน ${c[i - 1][j]} < ซ้าย ${c[i][j - 1]} ใช้ค่าด้านซ้าย`;
    }
    R.snap(line, msg, V2(cl));
  }
  let i = m, j = n; const lcs = [], path = {};
  while (i > 0 && j > 0) {
    path[i + ',' + j] = b[i][j] === 'UL' ? 'tgt' : 'src';
    if (b[i][j] === 'UL') {
      lcs.unshift(X[i - 1]);
      R.snap(0, `(${i}, ${j}) เป็น ↖ จึงเก็บ ${X[i - 1]} ได้ ${lcs.join('')} แล้วเดินทแยงขึ้น`, V2({ ...path }));
      i--; j--;
    } else if (b[i][j] === 'U') { R.snap(0, `(${i}, ${j}) เป็น ↑ เดินขึ้น`, V2({ ...path })); i--; }
    else { R.snap(0, `(${i}, ${j}) เป็น ← เดินซ้าย`, V2({ ...path })); j--; }
  }
  R.snap(13, `LCS ยาว ${c[m][n]} คือ ${lcs.join('') || '(ว่าง)'} ตัวอักษรถูกเก็บจากท้ายมาหน้า`, V2({ ...path }));
  R.result = { len: c[m][n], lcs: lcs.join(''), c };
  return R.out();
}

/* ---------- DP: Assembly line ---------- */
const ALS_DATA = { e: [2, 4], a: [[7, 9, 3, 4, 8, 4], [8, 5, 6, 4, 5, 7]], t: [[2, 3, 1, 3, 4], [2, 1, 2, 2, 1]], x: [3, 2] };
function alsDef(D) {
  const n = D.a[0].length, W = 760, dx = (W - 150) / (n - 1), nodes = [['in', 20, 130, 'b'], ['out', W - 20, 130, 'b']], edges = [], labels = { in: 'เข้า', out: 'ออก' };
  for (let j = 0; j < n; j++) {
    nodes.push(['a' + (j + 1), 75 + j * dx, 55, 'a'], ['b' + (j + 1), 75 + j * dx, 205, 'b']);
    labels['a' + (j + 1)] = 'a=' + D.a[0][j]; labels['b' + (j + 1)] = 'a=' + D.a[1][j];
  }
  edges.push(['in', 'a1', D.e[0]], ['in', 'b1', D.e[1]]);
  for (let j = 1; j < n; j++) {
    edges.push(['a' + j, 'a' + (j + 1), 0, { nl: true }], ['b' + j, 'b' + (j + 1), 0, { nl: true }]);
    edges.push(['a' + j, 'b' + (j + 1), D.t[0][j - 1], { t: .24 }], ['b' + j, 'a' + (j + 1), D.t[1][j - 1], { t: .24 }]);
  }
  edges.push(['a' + n, 'out', D.x[0]], ['b' + n, 'out', D.x[1]]);
  return { directed: true, weighted: true, W, H: 260, nodes, edges, labels };
}
function runALS(G, opt) {
  const D = opt.data, n = D.a[0].length, R = new Rec(G), f = [[], []], l = [[], []];
  const nm = (i, j) => (i === 0 ? 'a' : 'b') + j, row = (x, j) => j === undefined || x === undefined ? '' : x;
  const P = () => [tbl('f[j] เวลาเร็วสุดถึงสถานีนี้', ['j', ...[...Array(n).keys()].map(j => j + 1)], [['f₁', ...[...Array(n).keys()].map(j => f[0][j] ?? '')], ['f₂', ...[...Array(n).keys()].map(j => f[1][j] ?? '')]]),
    tbl('l[j] มาจากสายไหน', ['j', ...[...Array(n - 1).keys()].map(j => j + 2)], [['l₁', ...[...Array(n - 1).keys()].map(j => l[0][j + 1] ?? '')], ['l₂', ...[...Array(n - 1).keys()].map(j => l[1][j + 1] ?? '')]])];
  f[0][0] = D.e[0] + D.a[0][0]; f[1][0] = D.e[1] + D.a[1][0];
  R.n.a1.t = '' + f[0][0]; R.n.b1.t = '' + f[1][0]; R.n.a1.c = R.n.b1.c = 'gray'; R.hi('a1'); R.hi('b1'); R.act(ek(G, 'in', 'a1')); R.act(ek(G, 'in', 'b1'));
  R.snap([1, 2], `สถานีแรกมีทางมาทางเดียว f₁[1] = ${D.e[0]} + ${D.a[0][0]} = ${f[0][0]}, f₂[1] = ${D.e[1]} + ${D.a[1][0]} = ${f[1][0]}`, P());
  for (let j = 1; j < n; j++) for (const i of [0, 1]) {
    const o = 1 - i, stay = f[i][j - 1] + D.a[i][j], cross = f[o][j - 1] + D.t[o][j - 1] + D.a[i][j];
    const s = stay <= cross;
    f[i][j] = s ? stay : cross; l[i][j] = s ? i + 1 : o + 1;
    const me = nm(i, j + 1); R.n[me].t = '' + f[i][j]; R.n[me].c = 'gray';
    R.act(ek(G, nm(i, j), me), s ? 'act' : 'peek'); R.act(ek(G, nm(o, j), me), s ? 'peek' : 'act'); R.hi(me);
    R.snap(i === 0 ? [4, 5, 6, 7, 8] : [9, 10, 11, 12, 13], `สถานี S${i + 1},${j + 1}: อยู่สายเดิม ${f[i][j - 1]} + ${D.a[i][j]} = ${stay} หรือย้ายสาย ${f[o][j - 1]} + ${D.t[o][j - 1]} + ${D.a[i][j]} = ${cross} เลือก ${f[i][j]} จากสาย ${l[i][j]}`, P());
  }
  const e1 = f[0][n - 1] + D.x[0], e2 = f[1][n - 1] + D.x[1], best = e1 <= e2 ? 0 : 1, star = Math.min(e1, e2);
  R.n.out.t = '' + star; R.n.out.c = 'gray'; R.act(ek(G, nm(0, n), 'out'), best === 0 ? 'act' : 'peek'); R.act(ek(G, nm(1, n), 'out'), best === 1 ? 'act' : 'peek');
  R.snap([14, 15, 16, 17, 18], `ทางออก: ${f[0][n - 1]} + ${D.x[0]} = ${e1} และ ${f[1][n - 1]} + ${D.x[1]} = ${e2} ดังนั้น f* = ${star}, l* = ${best + 1}`, P());
  let i = best; R.e[ek(G, nm(i, n), 'out')] = 'tree'; const route = [i + 1];
  for (let j = n - 1; j >= 1; j--) {
    const p = l[i][j] - 1; R.e[ek(G, nm(p, j), nm(i, j + 1))] = 'tree'; i = p; route.unshift(i + 1);
    G.ids.forEach(v => { if (v !== 'in' && v !== 'out') R.n[v].c = 'gray'; });
    R.snap(0, `ย้อนด้วย l: สถานี ${j + 1} มาจากสาย ${p + 1}`, P());
  }
  R.e[ek(G, 'in', nm(i, 1))] = 'tree';
  R.snap(0, `เส้นทางเร็วสุด: สาย ${route.join(' → ')} ใช้เวลา ${star}`, P());
  R.result = { f, l, star, lstar: best + 1, route };
  return R.out();
}

/* ---------- Heap ---------- */
function heapDef(n) {
  const levels = Math.floor(Math.log2(n)) + 1, W = 580, nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    const lv = Math.floor(Math.log2(i)), pos = i - 2 ** lv;
    nodes.push(['' + i, Math.round((pos + .5) / 2 ** lv * W), 34 + lv * 76, 'tl']);
    if (i > 1) edges.push(['' + Math.floor(i / 2), '' + i]);
  }
  return { W, H: 34 + (levels - 1) * 76 + 34, nodes, edges };
}
function heapPanels(A, hs, cls = {}, mark = {}) {
  const c = { ...cls }; for (let i = hs + 1; i < A.length; i++) if (!c[i]) c[i] = 'out';
  return [htmlP(`อาร์เรย์ A · heap-size = ${hs}`, arrHTML(A.slice(1), { base: 1, cls: c, mark }), true)];
}
function syncHeap(R, G, A, hs, ghost) {
  for (let i = 1; i < A.length; i++) {
    const id = '' + i, inH = i <= hs;
    R.n[id].t = A[i] === -INF ? '−∞' : (A[i] === undefined || (!inH && ghost)) ? '' : '' + A[i];
    R.n[id].c = inH ? 'white' : (ghost ? 'ghost' : 'black');
    if (i > 1) { const k = ek(G, '' + Math.floor(i / 2), id); if (inH) delete R.e[k]; else R.e[k] = 'dim'; }
  }
}
function heapifyStep(R, G, A, ctx, i) {
  const n = ctx.hs, l = 2 * i, r = 2 * i + 1; let lg = i;
  if (l <= n && A[l] > A[lg]) lg = l;
  if (r <= n && A[r] > A[lg]) lg = r;
  const off = ctx.off, L = x => off + x;
  syncHeap(R, G, A, n, ctx.ghost); R.hi('' + i); if (l <= n) R.hi('' + l, 'k'); if (r <= n) R.hi('' + r, 'k');
  const part = [`A[${i}] = ${A[i]}`]; if (l <= n) part.push(`ซ้าย A[${l}] = ${A[l]}`); if (r <= n) part.push(`ขวา A[${r}] = ${A[r]}`);
  const mk = { [i]: 'i' }; if (l <= n) mk[l] = 'l'; if (r <= n) mk[r] = 'r';
  R.snap([1, 2, 3, 4, 5, 6, 7].map(L), `${part.join(', ')} ตัวใหญ่สุดคือ A[${lg}] = ${A[lg]}${lg === i ? ' อยู่ถูกที่แล้ว หยุด' : ''}`, heapPanels(A, n, { [lg]: 'tgt' }, mk));
  if (lg !== i) {
    [A[i], A[lg]] = [A[lg], A[i]]; syncHeap(R, G, A, n, ctx.ghost);
    R.act(ek(G, '' + i, '' + lg)); R.hi('' + lg);
    R.snap([8, 9, 10].map(L), `สลับ A[${i}] กับ A[${lg}] แล้วเรียก MAX-HEAPIFY ต่อที่ตำแหน่ง ${lg}`, heapPanels(A, n, { [i]: 'src', [lg]: 'tgt' }));
    heapifyStep(R, G, A, ctx, lg);
  }
}
function heapRec(G, arr, hs, ghost) { const A = [null, ...arr], R = new Rec(G); return { A, R, ctx: { hs, off: 0, ghost } }; }
function runHeapify(G, o) {
  const { A, R, ctx } = heapRec(G, o.A, o.A.length);
  syncHeap(R, G, A, ctx.hs);
  R.snap(0, `ตำแหน่ง ${o.i} ละเมิด max-heap ส่วน subtree ซ้ายและขวาของมันเป็น heap ถูกต้องแล้ว`, heapPanels(A, ctx.hs));
  heapifyStep(R, G, A, ctx, o.i);
  syncHeap(R, G, A, ctx.hs);
  R.snap(0, 'จบ ค่าที่ผิดที่ถูกดันลงจนถูกตำแหน่ง', heapPanels(A, ctx.hs));
  R.result = { A: A.slice(1) };
  return R.out();
}
function runBuild(G, o) {
  const { A, R, ctx } = heapRec(G, o.A, o.A.length); ctx.off = 100;
  const n = o.A.length, half = Math.floor(n / 2);
  syncHeap(R, G, A, n);
  R.snap(1, `ใบไม้เป็น heap ขนาด 1 อยู่แล้ว จึงเริ่มจากตำแหน่ง ⌊${n}/2⌋ = ${half} ไล่ขึ้นมาถึงราก`, heapPanels(A, n));
  for (let i = half; i >= 1; i--) {
    syncHeap(R, G, A, n); R.hi('' + i);
    R.snap(2, `i = ${i}: เรียก MAX-HEAPIFY(A, ${i})`, heapPanels(A, n, {}, { [i]: 'i' }));
    heapifyStep(R, G, A, ctx, i);
  }
  syncHeap(R, G, A, n);
  R.snap(0, `ได้ max-heap: ${A.slice(1).join(' ')}`, heapPanels(A, n));
  R.result = { A: A.slice(1) };
  return R.out();
}
function runHeapsort(G, o) {
  const { A, R, ctx } = heapRec(G, o.A, o.A.length); ctx.off = 100;
  const n = o.A.length;
  syncHeap(R, G, A, n);
  R.snap(1, 'สร้าง max-heap ก่อน รายละเอียดดูบท Build-Max-Heap', heapPanels(A, n));
  { const c2 = { ...ctx }; const save = R.snap; R.snap = () => { }; for (let i = Math.floor(n / 2); i >= 1; i--) heapifyStep(R, G, A, c2, i); R.snap = save; }
  syncHeap(R, G, A, n);
  R.snap(1, `หลัง BUILD-MAX-HEAP: ${A.slice(1).join(' ')}`, heapPanels(A, n));
  for (let i = n; i >= 2; i--) {
    syncHeap(R, G, A, ctx.hs); R.hi('1'); R.hi('' + i, 'k');
    R.snap(3, `รากคือค่าใหญ่สุด ${A[1]} สลับไปไว้ตำแหน่ง ${i}`, heapPanels(A, ctx.hs, { 1: 'tgt', [i]: 'src' }));
    [A[1], A[i]] = [A[i], A[1]]; ctx.hs--;
    syncHeap(R, G, A, ctx.hs);
    R.snap(4, `ลด heap-size เป็น ${ctx.hs} ตำแหน่ง ${i} สรุปแล้ว`, heapPanels(A, ctx.hs));
    heapifyStep(R, G, A, ctx, 1);
  }
  syncHeap(R, G, A, ctx.hs);
  R.n['1'].c = 'black';
  R.snap(2, `เรียงเสร็จ: ${A.slice(1).join(' ')}`, heapPanels(A, 0));
  R.result = { A: A.slice(1) };
  return R.out();
}
function runIncrease(R, G, A, ctx, i, key, off) {
  const L = x => off + x;
  A[i] = key; syncHeap(R, G, A, ctx.hs, ctx.ghost); R.hi('' + i);
  R.snap([1, 2, 3].map(L), `ตั้ง A[${i}] = ${key}`, heapPanels(A, ctx.hs, { [i]: 'tgt' }, { [i]: 'i' }));
  while (i > 1 && A[Math.floor(i / 2)] < A[i]) {
    const p = Math.floor(i / 2);
    syncHeap(R, G, A, ctx.hs, ctx.ghost); R.hi('' + i); R.hi('' + p, 'k'); R.act(ek(G, '' + p, '' + i));
    R.snap(L(4), `พ่อ A[${p}] = ${A[p]} < A[${i}] = ${A[i]} ยังละเมิด`, heapPanels(A, ctx.hs, { [i]: 'tgt', [p]: 'src' }));
    [A[i], A[p]] = [A[p], A[i]]; i = p;
    syncHeap(R, G, A, ctx.hs, ctx.ghost); R.hi('' + i);
    R.snap([5, 6].map(L), `สลับกับพ่อ ค่าขยับขึ้นมาที่ตำแหน่ง ${i}`, heapPanels(A, ctx.hs, { [i]: 'tgt' }, { [i]: 'i' }));
  }
  syncHeap(R, G, A, ctx.hs, ctx.ghost); R.hi('' + i);
  R.snap(L(4), i === 1 ? 'ถึงรากแล้ว หยุด' : `พ่อไม่น้อยกว่าลูกแล้ว หยุด`, heapPanels(A, ctx.hs, { [i]: 'tgt' }));
}
function runPQIncrease(G, o) {
  const { A, R, ctx } = heapRec(G, o.A, o.A.length);
  syncHeap(R, G, A, ctx.hs); R.hi('' + o.i);
  R.snap(0, `เพิ่ม key ที่ตำแหน่ง ${o.i} จาก ${A[o.i]} เป็น ${o.key}`, heapPanels(A, ctx.hs, {}, { [o.i]: 'i' }));
  runIncrease(R, G, A, ctx, o.i, o.key, 0);
  R.result = { A: A.slice(1) };
  return R.out();
}
function runPQExtract(G, o) {
  const { A, R, ctx } = heapRec(G, o.A, o.A.length); ctx.off = 100;
  syncHeap(R, G, A, ctx.hs); R.hi('1');
  const mx = A[1];
  R.snap(3, `ค่าใหญ่สุดอยู่ที่ราก max = ${mx}`, heapPanels(A, ctx.hs, { 1: 'tgt' }));
  A[1] = A[ctx.hs]; ctx.hs--; syncHeap(R, G, A, ctx.hs);
  R.hi('1');
  R.snap([4, 5], `ย้ายตัวสุดท้ายมาที่ราก และลด heap-size เป็น ${ctx.hs}`, heapPanels(A, ctx.hs, { 1: 'tgt' }));
  heapifyStep(R, G, A, ctx, 1);
  syncHeap(R, G, A, ctx.hs);
  R.snap(7, `คืน ${mx}`, heapPanels(A, ctx.hs));
  R.result = { A: A.slice(1, ctx.hs + 1), mx };
  return R.out();
}
function runPQInsert(G, o) {
  const { A, R, ctx } = heapRec(G, [...o.A, -INF], o.A.length, true);
  syncHeap(R, G, A, ctx.hs, true);
  R.snap(0, `จะแทรก key = ${o.key} ลงใน heap ขนาด ${ctx.hs}`, heapPanels(A, ctx.hs));
  ctx.hs++; syncHeap(R, G, A, ctx.hs, true); R.hi('' + ctx.hs);
  R.snap([1, 2], `ขยาย heap ใส่ใบใหม่เป็น −∞ ซึ่งไม่ละเมิด heap แน่นอน`, heapPanels(A, ctx.hs, { [ctx.hs]: 'tgt' }));
  runIncrease(R, G, A, ctx, ctx.hs, o.key, 100);
  R.result = { A: A.slice(1) };
  return R.out();
}

/* ---------- Disjoint sets ---------- */
const DSU_DEF = { nameIn: true, W: 620, H: 210, nodes: [['a', 50, 50], ['b', 170, 50], ['c', 50, 165], ['d', 170, 165], ['e', 280, 50], ['f', 400, 50], ['g', 280, 165], ['h', 500, 50], ['i', 500, 165], ['j', 590, 50]],
  edges: [['a', 'b'], ['a', 'c'], ['b', 'c'], ['b', 'd'], ['e', 'f'], ['e', 'g'], ['h', 'i']],
  edgeOrder: [['b', 'd'], ['e', 'g'], ['a', 'c'], ['h', 'i'], ['a', 'b'], ['e', 'f'], ['b', 'c']] };
function runDSU(G) {
  const R = new Rec(G), sets = {}; G.ids.forEach(v => sets[v] = [v]);
  const hist = [];
  const groups = () => { const u = []; G.ids.forEach(v => { if (!u.includes(sets[v])) u.push(sets[v]); }); return u; };
  const paint = () => { const big = groups().filter(s => s.length > 1); G.ids.forEach(v => R.n[v].c = sets[v].length > 1 ? 'c' + (big.indexOf(sets[v]) % 6) : 'white'); };
  const text = () => groups().map(s => '{' + s.slice().sort().join(',') + '}').join(' ');
  const P = () => [chips('Collection ปัจจุบัน', groups().map(s => ({ t: '{' + s.slice().sort().join(',') + '}' }))), tbl('Edge ที่ประมวลผลแล้ว', ['edge', 'ชุดหลังจากนั้น'], hist.slice())];
  hist.push(['เริ่มต้น', text()]);
  R.snap([1, 2], 'MAKE-SET ให้ทุก vertex เป็นชุดของตัวเอง', P());
  G.edgeOrder.forEach(e => {
    const k = ek(G, e.u, e.v); R.act(k); R.hi(e.u); R.hi(e.v);
    if (sets[e.u] !== sets[e.v]) {
      R.snap([3, 4], `(${e.u}, ${e.v}): FIND-SET ต่างกัน จึงต้อง UNION`, P());
      const m = sets[e.u].concat(sets[e.v]); m.forEach(v => sets[v] = m); R.e[k] = 'tree'; paint();
      hist.push([`(${e.u},${e.v})`, text()]);
      R.snap(5, `รวมเป็น {${m.slice().sort().join(',')}}`, P());
    } else {
      R.e[k] = 'rej'; hist.push([`(${e.u},${e.v})`, text()]);
      R.snap([3, 4], `(${e.u}, ${e.v}): อยู่ชุดเดียวกันแล้ว ไม่ต้องทำอะไร`, P());
    }
  });
  R.snap(3, `จบ มี ${groups().length} connected components SAME-COMPONENT(u, v) แค่เทียบ FIND-SET`, P());
  R.result = { hist };
  return R.out();
}

/* ---------- D&C: ผลรวม ---------- */
function runSum(inp) {
  const A = inp.A, n = A.length, R = new VRec(), rows = []; let adds = 0;
  const put = (d, s) => { (rows[d] = rows[d] || []); const i = rows[d].findIndex(x => x.s === s.s); if (i >= 0) rows[d][i] = s; else rows[d].push(s); };
  const V2 = () => lanesHTML(n, rows.map(r => r.slice().sort((a, b) => a.s - b.s)));
  const go = (l, r, d) => {
    put(d, { s: l, e: r, vals: A.slice(l, r + 1), cls: 'cur' });
    R.snap(1, l === r ? `เหลือตัวเดียว ${A[l]} เป็นคำตอบเลย` : `แบ่งช่วง [${l}..${r}] เป็นสองครึ่ง`, V2());
    put(d, { s: l, e: r, vals: A.slice(l, r + 1), cls: '' });
    if (l === r) { put(d, { s: l, e: r, vals: [A[l]], cls: 'done' }); return A[l]; }
    const m = l + Math.floor((r - l) / 2);
    const a = go(l, m, d + 1), b = go(m + 1, r, d + 1), v = a + b; adds++;
    put(d, { s: l, e: r, vals: [v], cls: 'done cur' });
    R.snap(3, `รวม ${a} + ${b} = ${v} (การบวกครั้งที่ ${adds})`, V2());
    put(d, { s: l, e: r, vals: [v], cls: 'done' });
    return v;
  };
  const v = go(0, n - 1, 0);
  R.snap(3, `ผลรวม ${v} ใช้การบวก ${adds} ครั้ง เท่ากับวิธีไล่บวกธรรมดา n − 1 = ${n - 1} ครั้งพอดี`, V2());
  R.result = { v, adds };
  return R.out();
}

/* ---------- Merge ---------- */
function runMerge(inp) {
  const A = inp.A.slice(), p = inp.p, q = inp.q, r = inp.r, base = inp.base, R = new VRec();
  const L = [...A.slice(p - base, q - base + 1), INF], Rt = [...A.slice(q - base + 1, r - base + 1), INF];
  let i = 0, j = 0;
  const V2 = (k, wr) => {
    const c = {}; for (let x = p; x < k; x++) c[x] = 'lo'; if (k <= r) c[k] = wr ? 'tgt' : 'band';
    const cl = {}, cr = {}; for (let x = 0; x < i; x++) cl[x + 1] = 'out'; for (let x = 0; x < j; x++) cr[x + 1] = 'out';
    if (i < L.length) cl[i + 1] = 'src'; if (j < Rt.length) cr[j + 1] = 'src';
    return `<div class="stack"><div class="pt">A</div>${arrHTML(A, { base, cls: c, mark: k <= r ? { [k]: 'k' } : {} })}<div class="two"><div><div class="pt">L</div>${arrHTML(L, { base: 1, cls: cl, mark: { [i + 1]: 'i' } })}</div><div><div class="pt">R</div>${arrHTML(Rt, { base: 1, cls: cr, mark: { [j + 1]: 'j' } })}</div></div></div>`;
  };
  R.snap([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 'คัดลอกสองครึ่งไป L และ R แล้วปิดท้ายด้วย ∞ เป็น sentinel จะได้ไม่ต้องตรวจว่าฝั่งไหนหมด', V2(p));
  for (let k = p; k <= r; k++) {
    if (L[i] <= Rt[j]) { A[k - base] = L[i]; R.snap([13, 14, 15], `k = ${k}: L[${i + 1}] = ${L[i] === INF ? '∞' : L[i]} ≤ R[${j + 1}] = ${Rt[j] === INF ? '∞' : Rt[j]} จึงเอาจาก L`, V2(k, true)); i++; }
    else { A[k - base] = Rt[j]; R.snap([16, 17], `k = ${k}: L[${i + 1}] = ${L[i] === INF ? '∞' : L[i]} > R[${j + 1}] = ${Rt[j]} จึงเอาจาก R`, V2(k, true)); j++; }
  }
  R.snap(12, `ได้ช่วงที่เรียงแล้ว ${A.slice(p - base, r - base + 1).join(' ')} ใช้เวลา Θ(n) เพราะแต่ละรอบวางค่าได้หนึ่งตำแหน่ง`, V2(r + 1));
  R.result = { A };
  return R.out();
}
function runMergeSort(inp) {
  const A = inp.A.slice(), n = A.length, R = new VRec(), rows = [];
  const put = (d, s) => { (rows[d] = rows[d] || []); const i = rows[d].findIndex(x => x.s === s.s); if (i >= 0) rows[d][i] = s; else rows[d].push(s); };
  const V2 = () => lanesHTML(n, rows.map(r => r.slice().sort((a, b) => a.s - b.s)));
  const levels = {};
  const go = (p, r, d) => {
    put(d, { s: p, e: r, vals: A.slice(p, r + 1), cls: 'cur' });
    if (p >= r) { R.snap(1, `ช่วงมีสมาชิกเดียว เรียงอยู่แล้ว`, V2()); put(d, { s: p, e: r, vals: A.slice(p, r + 1), cls: 'done' }); return; }
    const q = Math.floor((p + r) / 2);
    R.snap(2, `แบ่งช่วง ${p + 1}..${r + 1} ที่ q = ${q + 1}`, V2());
    put(d, { s: p, e: r, vals: A.slice(p, r + 1), cls: '' });
    go(p, q, d + 1); go(q + 1, r, d + 1);
    const m = A.slice(p, r + 1).sort((a, b) => a - b); m.forEach((v, i) => A[p + i] = v);
    put(d, { s: p, e: r, vals: A.slice(p, r + 1), cls: 'done cur' });
    (levels[d] = levels[d] || []).push(m.join(' '));
    R.snap(5, `MERGE สองครึ่งที่เรียงแล้ว ได้ ${A.slice(p, r + 1).join(' ')}`, V2());
    put(d, { s: p, e: r, vals: A.slice(p, r + 1), cls: 'done' });
  };
  go(0, n - 1, 0);
  R.snap(5, `เรียงเสร็จ แต่ละชั้นใช้งานรวม Θ(n) และมี ${Math.ceil(Math.log2(n)) + 1} ชั้น`, V2());
  R.result = { A, levels };
  return R.out();
}

/* ---------- Quicksort ---------- */
function partitionView(A, p, r, i, j, done) {
  const c = {}, mk = {};
  for (let x = p; x <= i; x++) c[x + 1] = 'lo';
  for (let x = i + 1; x < j; x++) c[x + 1] = 'hi';
  c[r + 1] = done ? 'tgt' : 'piv';
  if (i >= p) mk[i + 1] = 'i'; if (!done && j <= r) mk[j + 1] = (mk[j + 1] ? mk[j + 1] + ',' : '') + 'j';
  return arrHTML(A, { base: 1, cls: c, mark: mk });
}
function runPartition(inp) {
  const A = inp.A.slice(), p = 0, r = A.length - 1, x = A[r], R = new VRec(); let i = p - 1;
  R.snap([1, 2], `pivot x = A[r] = ${x} และ i อยู่ก่อนหัวอาร์เรย์`, partitionView(A, p, r, i, p));
  for (let j = p; j < r; j++) {
    if (A[j] <= x) {
      R.snap(4, `A[${j + 1}] = ${A[j]} ≤ ${x} ต้องย้ายมาอยู่ฝั่งซ้าย`, partitionView(A, p, r, i, j));
      i++; [A[i], A[j]] = [A[j], A[i]];
      R.snap([5, 6], `i = ${i + 1} แล้วสลับ A[${i + 1}] กับ A[${j + 1}]`, partitionView(A, p, r, i, j + 1));
    } else {
      R.snap(4, `A[${j + 1}] = ${A[j]} > ${x} อยู่ฝั่งขวาตามเดิม`, partitionView(A, p, r, i, j + 1));
    }
  }
  [A[i + 1], A[r]] = [A[r], A[i + 1]];
  const q = i + 1, c = {}; for (let t = p; t < q; t++) c[t + 1] = 'lo'; for (let t = q + 1; t <= r; t++) c[t + 1] = 'hi'; c[q + 1] = 'tgt';
  R.snap([7, 8], `สลับ pivot มาที่ตำแหน่ง ${q + 1} ซ้ายทุกตัว ≤ ${x} ขวาทุกตัว > ${x}`, arrHTML(A, { base: 1, cls: c, mark: { [q + 1]: 'q' } }));
  R.result = { A, q: q + 1 };
  return R.out();
}
function runQuick(inp, opt = {}) {
  const A = inp.A.slice(), n = A.length, R = new VRec(), rows = [[]]; let cmp = 0, depthMax = 0, calls = 0;
  let seed = 7; const rnd = (a, b) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return a + seed % (b - a + 1); };
  const put = (d, s) => { (rows[d] = rows[d] || []).push(s); };
  const V2 = () => lanesHTML(n, rows.filter(Boolean));
  const P = () => [chips('ตัวนับ', [{ t: `เปรียบเทียบ ${cmp} ครั้ง` }, { t: `ลึก ${depthMax + 1} ชั้น` }])];
  const go = (p, r, d) => {
    if (p > r) return;
    depthMax = Math.max(depthMax, d);
    if (p === r) { put(d, { s: p, e: r, vals: [A[p]], cls: 'done' }); R.snap(1, `ช่วงมีตัวเดียว ไม่ต้องทำอะไร`, V2(), P()); return; }
    calls++;
    if (opt.random) { const t = rnd(p, r); [A[t], A[r]] = [A[r], A[t]]; }
    const x = A[r]; let i = p - 1;
    for (let j = p; j < r; j++) { cmp++; if (A[j] <= x) { i++; [A[i], A[j]] = [A[j], A[i]]; } }
    [A[i + 1], A[r]] = [A[r], A[i + 1]];
    const q = i + 1, mark = {}; mark[q - p] = 'pv';
    put(d, { s: p, e: r, vals: A.slice(p, r + 1), cls: '', mark });
    R.snap(2, `${opt.random ? 'สุ่ม pivot แล้ว ' : ''}PARTITION ช่วง ${p + 1}..${r + 1} ด้วย pivot ${x} ได้ตำแหน่ง ${q + 1} ซ้าย ${q - p} ตัว ขวา ${r - q} ตัว`, V2(), P());
    go(p, q - 1, d + 1); go(q + 1, r, d + 1);
  };
  go(0, n - 1, 0);
  R.snap(4, `เรียงเสร็จ: ${A.join(' ')} เปรียบเทียบ ${cmp} ครั้ง ลึก ${depthMax + 1} ชั้น`, V2(), P());
  R.result = { A, cmp, depth: depthMax + 1 };
  return R.out();
}

/* ---------- Binary search ---------- */
function runBinSearch(inp) {
  const A = inp.A, K = inp.K, R = new VRec(); let lo = 0, hi = A.length - 1, cmp = 0, found = -1;
  const V2 = (m, hit) => {
    const c = {}, mk = {};
    A.forEach((_, i) => { if (i < lo || i > hi) c[i] = 'out'; });
    if (m !== undefined) c[m] = hit ? 'tgt' : 'piv';
    if (lo <= hi) { mk[lo] = 'lo'; mk[hi] = (mk[hi] ? mk[hi] + ',' : '') + 'hi'; }
    if (m !== undefined) mk[m] = (mk[m] ? mk[m] + ',' : '') + 'm';
    return arrHTML(A, { base: 0, cls: c, mark: mk });
  };
  R.snap(1, `หา K = ${K} ในอาร์เรย์ที่เรียงแล้ว ขนาด ${A.length}`, V2());
  while (lo <= hi) {
    const m = Math.floor((lo + hi) / 2); cmp++;
    if (A[m] === K) { found = m; R.snap(4, `A[${m}] = ${K} พบแล้ว ใช้การเทียบ ${cmp} ครั้ง`, V2(m, true)); break; }
    if (K < A[m]) {
      R.snap(5, `K = ${K} < A[${m}] = ${A[m]} ตัดครึ่งขวาทิ้ง`, V2(m));
      hi = m - 1;
    } else {
      R.snap(6, `K = ${K} > A[${m}] = ${A[m]} ตัดครึ่งซ้ายทิ้ง`, V2(m));
      lo = m + 1;
    }
  }
  if (found < 0) R.snap(7, `ช่วงว่าง ไม่พบ ${K} ใช้การเทียบ ${cmp} ครั้ง`, V2());
  R.result = { found, cmp };
  return R.out();
}

/* ---------- Recurrence ---------- */
function runRecTree() {
  const R = new VRec(), n = 8, all = [], levels = [];
  let id = 0;
  const build = (m, p) => { const me = id++; all.push({ id: '' + me, p: p === null ? null : '' + p, lines: [m === 1 ? 'c' : 'c·' + m], m }); if (m > 1) { build(m / 2, me); build(m / 2, me); } };
  build(n, null);
  const depth = {}; all.forEach(x => depth[x.id] = x.p === null ? 0 : depth[x.p] + 1);
  const T = layoutTree(all);
  const maxD = Math.max(...Object.values(depth));
  const vis = {};
  for (let d = 0; d <= maxD; d++) {
    all.filter(x => depth[x.id] === d).forEach(x => vis[x.id] = { c: 'done' });
    const cnt = 2 ** d, m = n / cnt;
    levels.push([d, `${cnt} ก้อน`, `n/${cnt}`, `${cnt} × c·${m} = ${cnt * m}c`]);
    const snapV = { ...vis }; const rowsCopy = levels.slice();
    R.snap(0, d === 0 ? 'รากคือ cn งานรวมสองลูกที่ชั้นบนสุด' : `ชั้นที่ ${d} มี ${cnt} ก้อน ก้อนละ c·n/${cnt} รวมยังเป็น cn เท่าเดิม`, L => treeSVG(L, snapV), [tbl('งานต่อชั้น (n = 8)', ['ชั้น', 'จำนวน', 'ขนาด', 'รวม'], rowsCopy)]);
  }
  R.snap(0, `มี lg n + 1 = ${maxD + 1} ชั้น ชั้นละ cn รวม cn lg n + cn จึงเป็น Θ(n lg n)`, L => treeSVG(L, { ...vis }), [tbl('งานต่อชั้น (n = 8)', ['ชั้น', 'จำนวน', 'ขนาด', 'รวม'], levels.slice())]);
  return R.out(T);
}
const num = x => { if (Number.isInteger(x)) return '' + x; return x.toFixed(3).replace(/0+$/, '').replace(/\.$/, ''); };
function powN(e) { return e === 0 ? '1' : e === 1 ? 'n' : `n<sup>${num(e)}</sup>`; }
function logPow(k) { return k === 0 ? '' : k === 1 ? ' log n' : ` log<sup>${k}</sup> n`; }
function master(a, b, d, k) {
  const c = Math.log(a) / Math.log(b), crit = Math.abs(c - Math.round(c)) < 1e-9 ? Math.round(c) : c;
  let cs, ans;
  if (Math.abs(d - crit) < 1e-9) {
    if (k < 0) return { crit, cs: 0, ans: 'ทฤษฎีบทรูปแบบในสไลด์ใช้ไม่ได้เมื่อ k < 0' };
    cs = 2; const body = powN(crit) + logPow(k + 1); ans = body === '1' ? '1' : body.replace(/^1 /, '');
  } else if (d < crit) { cs = 1; ans = powN(crit); }
  else { cs = 3; const body = powN(d) + logPow(k); ans = body; }
  return { crit, cs, ans: 'Θ(' + ans.trim() + ')' };
}
function masterView(a, b, d, k) {
  const L = Math.min(8, Math.floor(Math.log(1e6) / Math.log(Math.max(b, 1.5)))), n = b ** L;
  const f = m => m ** d * (Math.max(1, Math.log2(m)) ** k);
  const cost = [...Array(L + 1).keys()].map(i => a ** i * f(n / b ** i));
  const mx = Math.max(...cost), mn = Math.min(...cost);
  const shape = (mx - mn) / mx < .02 ? 'equal' : cost[0] === mx ? 'root' : cost[L] === mx ? 'leaf' : 'mid';
  const label = { equal: 'ทุกชั้นเท่ากัน', root: 'รากหนักสุด', leaf: 'ใบหนักสุด', mid: 'หนักกลางต้นไม้' }[shape];
  const compact = x => x >= 1e6 ? x.toExponential(1) : x >= 100 ? Math.round(x).toLocaleString('en-US') : num(+x.toFixed(1));
  return { html: `<div class="lv"><div class="pt">งานรวมต่อชั้นของต้นไม้ recursion · n = ${compact(n)} · ${label}</div>${cost.map((x, i) => `<div class="lr"><span>${i === L ? 'ใบ' : i}</span><div class="lb"><i style="width:${Math.max(.6, x / mx * 100).toFixed(1)}%"></i></div><b>${compact(x)}</b></div>`).join('')}</div>`, shape };
}
const MASTER_EX = [
  { t: '4T(n/2) + n', a: 4, b: 2, d: 1, k: 0 }, { t: '2T(n/2) + n log n', a: 2, b: 2, d: 1, k: 1 }, { t: 'T(n/3) + n log n', a: 1, b: 3, d: 1, k: 1 },
  { t: '8T(n/2) + n²', a: 8, b: 2, d: 2, k: 0 }, { t: '9T(n/3) + n', a: 9, b: 3, d: 1, k: 0 }, { t: 'T(n/2) + 1', a: 1, b: 2, d: 0, k: 0 },
  { t: '2T(n/2) + log n', a: 2, b: 2, d: 0, k: 1 }, { t: 'T(2n/3) + 1', a: 1, b: 1.5, d: 0, k: 0 }, { t: '3T(n/4) + n log n', a: 3, b: 4, d: 1, k: 1 },
];
function runMaster(inp) {
  const R = new VRec(), list = inp.list, done = [];
  const P = () => [{ ...tbl('ผลลัพธ์', ['โจทย์', 'กรณี', 'คำตอบ'], done.map(x => [x[0], x[1], x[2]])), raw: true }];
  list.forEach((ex, idx) => {
    const m = master(ex.a, ex.b, ex.d, ex.k), v = masterView(ex.a, ex.b, ex.d, ex.k);
    const fStr = (ex.d === 0 && ex.k === 0) ? '1' : (powN(ex.d) === '1' ? '' : powN(ex.d)) + (ex.d === 0 ? logPow(ex.k).trim() : logPow(ex.k));
    R.snap(0, `T(n) = ${ex.t}: a = ${ex.a}, b = ${num(ex.b)} คำนวณ n<sup>log<sub>b</sub> a</sup> = ${powN(m.crit)} แล้วเทียบกับ f(n) = ${fStr}`, v.html, P());
    const why = m.cs === 1 ? 'f(n) เล็กกว่าเชิงพหุนาม งานไปกองที่ใบ' : m.cs === 2 ? 'f(n) เท่ากันเมื่อไม่นับตัว log จึงคูณ log เพิ่มอีกหนึ่ง' : m.cs === 3 ? 'f(n) ใหญ่กว่าเชิงพหุนาม งานไปกองที่ราก (ผ่านเงื่อนไข regularity)' : '';
    done.push([ex.t, m.cs ? 'กรณี ' + m.cs : '-', m.ans]);
    R.snap(0, `กรณีที่ ${m.cs}: ${why} ได้ ${m.ans}`, v.html, P());
  });
  R.result = { ans: list.map(ex => { const m = master(ex.a, ex.b, ex.d, ex.k); return [m.cs, m.ans.replace(/<\/?sup>/g, '^')]; }) };
  return R.out();
}

/* ---------- Matrix multiplication ---------- */
function runStrassen(inp) {
  const A = inp.A, B = inp.B, R = new VRec();
  const [a11, a12, a21, a22] = [A[0][0], A[0][1], A[1][0], A[1][1]], [b11, b12, b21, b22] = [B[0][0], B[0][1], B[1][0], B[1][1]];
  const S = [b12 - b22, a11 + a12, a21 + a22, b21 - b11, a11 + a22, b11 + b22, a12 - a22, b21 + b22, a11 - a21, b11 + b12];
  const SF = ['B12 − B22', 'A11 + A12', 'A21 + A22', 'B21 − B11', 'A11 + A22', 'B11 + B22', 'A12 − A22', 'B21 + B22', 'A11 − A21', 'B11 + B12'];
  const P7 = [a11 * S[0], S[1] * b22, S[2] * b11, a22 * S[3], S[4] * S[5], S[6] * S[7], S[8] * S[9]];
  const PF = ['A11 × S1', 'S2 × B22', 'S3 × B11', 'A22 × S4', 'S5 × S6', 'S7 × S8', 'S9 × S10'];
  const C = [P7[4] + P7[3] - P7[1] + P7[5], P7[0] + P7[1], P7[2] + P7[3], P7[4] + P7[0] - P7[2] - P7[6]];
  const CF = ['P5 + P4 − P2 + P6', 'P1 + P2', 'P3 + P4', 'P5 + P1 − P3 − P7'];
  const ids = ['1', '2'];
  const base = [mat('A', ids, mStr(A)), mat('B', ids, mStr(B))];
  const shown = { S: 0, P: 0, C: 0 };
  const V2 = (cur) => {
    const row = (nm, F, V, cnt, kind) => [...Array(cnt).keys()].map(i => [`${nm}${i + 1}`, F[i], fmt(V[i])]);
    return [...base, tbl('S ที่คำนวณแล้ว', ['', 'สูตร', 'ค่า'], row('S', SF, S, shown.S), cur && cur[0] === 'S' ? cur[1] : -1), tbl('P ที่คูณแล้ว', ['', 'สูตร', 'ค่า'], row('P', PF, P7, shown.P), cur && cur[0] === 'P' ? cur[1] : -1)];
  };
  const P2 = () => shown.C ? [tbl('C = AB', ['', 'สูตร', 'ค่า'], [['C11', CF[0], fmt(C[0])], ['C12', CF[1], fmt(C[1])], ['C21', CF[2], fmt(C[2])], ['C22', CF[3], fmt(C[3])]].slice(0, shown.C))] : [];
  R.snap(1, 'แบ่ง A และ B เป็นส่วนละสี่ ตัวอย่างนี้ n = 2 แต่ละก้อนจึงเป็นตัวเลขตัวเดียว', V2(), P2());
  for (let i = 0; i < 10; i++) { shown.S = i + 1; R.snap(2, `S${i + 1} = ${SF[i]} = ${fmt(S[i])} ขั้นนี้เป็นการบวกลบ ใช้ Θ(n²)`, V2(['S', i]), P2()); }
  for (let i = 0; i < 7; i++) { shown.P = i + 1; R.snap(3, `P${i + 1} = ${PF[i]} = ${fmt(P7[i])} คูณจริงแค่ 7 ครั้ง`, V2(['P', i]), P2()); }
  for (let i = 0; i < 4; i++) { shown.C = i + 1; R.snap(4, `${['C11', 'C12', 'C21', 'C22'][i]} = ${CF[i]} = ${fmt(C[i])}`, V2(), P2()); }
  const check = [a11 * b11 + a12 * b21, a11 * b12 + a12 * b22, a21 * b11 + a22 * b21, a21 * b12 + a22 * b22];
  R.snap(0, `ตรวจกับการคูณปกติ (8 ครั้ง): ได้ ${check.map(fmt).join(', ')} ตรงกัน`, V2(), P2());
  R.result = { C, check };
  return R.out();
}
function runBlockCount() {
  const R = new VRec(), rows = [];
  for (let k = 0; k <= 5; k++) {
    const n = 2 ** k; rows.push([n, (8 ** k).toLocaleString('en-US'), (7 ** k).toLocaleString('en-US'), k ? ((7 ** k) / (8 ** k) * 100).toFixed(0) + '%' : '100%']);
    const r2 = rows.slice();
    const mx = 8 ** k;
    R.snap(0, k === 0 ? 'n = 1 เป็นกรณีฐาน คูณตัวเลขครั้งเดียว' : `n = ${n}: แบบแบ่ง 8 ก้อนคูณ ${(8 ** k).toLocaleString('en-US')} ครั้ง Strassen คูณ ${(7 ** k).toLocaleString('en-US')} ครั้ง`,
      `<div class="lv"><div class="pt">จำนวนการคูณตัวเลขที่ n = ${n}</div><div class="lr"><span>8T</span><div class="lb"><i style="width:100%"></i></div><b>${(8 ** k).toLocaleString('en-US')}</b></div><div class="lr"><span>7T</span><div class="lb"><i style="width:${(7 ** k) / mx * 100}%"></i></div><b>${(7 ** k).toLocaleString('en-US')}</b></div></div>`,
      [tbl('การคูณตัวเลขทั้งหมด', ['n', '8T(n/2)', '7T(n/2)', 'สัดส่วน'], r2)]);
  }
  R.result = {};
  return R.out();
}

/* ---------- Convex hull ---------- */
const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
function hullSVG(P, opt = {}) {
  const S = 4.4, X = p => p[0] * S + 12, Y = p => (100 - p[1]) * S + 12;
  const line = (a, b, c) => `<line class="${c}" x1="${X(P[a])}" y1="${Y(P[a])}" x2="${X(P[b])}" y2="${Y(P[b])}"/>`;
  let s = `<svg class="hull" viewBox="0 0 ${100 * S + 24} ${100 * S + 24}" role="img" aria-label="จุดบนระนาบและ convex hull">`;
  (opt.polys || []).forEach(pl => { pl.ids.forEach((a, i) => { const b = pl.ids[(i + 1) % pl.ids.length]; if (pl.open && i === pl.ids.length - 1) return; s += line(a, b, pl.c || 'h'); }); });
  (opt.lines || []).forEach(([a, b, c]) => s += line(a, b, c));
  P.forEach((p, i) => { const c = (opt.cls && opt.cls[i]) || ''; s += `<circle class="${c}" cx="${X(p)}" cy="${Y(p)}" r="${c ? 6.5 : 4.5}"/>`; });
  return s + '</svg>';
}
const HULL_PTS = [[20, 6], [55, 9], [85, 18], [95, 45], [80, 76], [50, 90], [18, 72], [6, 40], [35, 30], [60, 40], [45, 62], [70, 55], [28, 50]];
function runGift(inp) {
  const P = inp.P, n = P.length, R = new VRec();
  let start = 0; P.forEach((p, i) => { if (p[1] < P[start][1] || (p[1] === P[start][1] && p[0] < P[start][0])) start = i; });
  const hull = [start]; let cur = start, tests = 0;
  R.snap(1, `เริ่มที่จุดล่างสุด (${P[start].join(', ')})`, hullSVG(P, { cls: { [start]: 'cur' } }));
  do {
    let nx = cur === 0 ? 1 : 0;
    for (let i = 0; i < n; i++) {
      if (i === cur) continue; tests++;
      const c = cross(P[cur], P[nx], P[i]);
      if (c < 0 || (c === 0 && dist2(P[cur], P[i]) > dist2(P[cur], P[nx]))) nx = i;
    }
    const fan = []; for (let i = 0; i < n; i++) if (i !== cur && i !== nx) fan.push([cur, i, 'f']);
    const cls = { [cur]: 'cur', [nx]: 'nx' };
    R.snap(3, nx === start ? `จาก (${P[cur].join(', ')}) จุดที่หักมุมน้อยสุดคือจุดเริ่ม hull ปิดแล้ว` : `ลากจาก (${P[cur].join(', ')}) ไปทุกจุด จุดที่มุมน้อยสุดคือ (${P[nx].join(', ')})`, hullSVG(P, { polys: [{ ids: hull, open: true }], lines: [...fan, [cur, nx, 'b']], cls }));
    cur = nx; if (cur !== start) hull.push(cur);
  } while (cur !== start);
  R.snap(5, `ได้ hull ${hull.length} จุด ตรวจจุดไป ${tests} ครั้ง คือประมาณ n × h`, hullSVG(P, { polys: [{ ids: hull }] }));
  R.result = { hull: hull.map(i => P[i]), tests };
  return R.out();
}
const CH_DATA = { c1: [[8, 42], [22, 10], [50, 22], [44, 74]], c2: [[62, 12], [98, 30], [90, 78], [60, 58]], in1: [[24, 44], [34, 56]], in2: [[75, 40], [82, 58]] };
function runTangent(inp) {
  const R = new VRec(), { c1, c2, in1, in2 } = inp;
  const P = [...c1, ...c2, ...in1, ...in2], n1 = c1.length, n2 = c2.length, ida = i => i, idb = i => n1 + i;
  const polys = [{ ids: c1.map((_, i) => ida(i)) }, { ids: c2.map((_, i) => idb(i)) }];
  const startA = c1.reduce((b, p, i) => p[0] > c1[b][0] ? i : b, 0), startB = c2.reduce((b, p, i) => p[0] < c2[b][0] ? i : b, 0);
  const V2 = (a, b, extra = [], c = {}) => hullSVG(P, { polys, lines: [[ida(a), idb(b), 'g'], ...extra], cls: { [ida(a)]: 'cur', [idb(b)]: 'nx', ...c } });
  const find = (upper, off) => {
    let a = startA, b = startB, g = 0;
    const nextA = x => upper ? (x + 1) % n1 : (x - 1 + n1) % n1, nextB = x => upper ? (x - 1 + n2) % n2 : (x + 1) % n2;
    const nmA = upper ? 'ทวนเข็ม' : 'ตามเข็ม', nmB = upper ? 'ตามเข็ม' : 'ทวนเข็ม';
    R.snap(off + 1, `เริ่มเส้นจากจุดขวาสุดของ CH1 ไปจุดซ้ายสุดของ CH2`, V2(a, b));
    for (; g < 40; g++) {
      const a2 = nextA(a), b2 = nextB(b);
      const ca = cross(c2[b], c1[a], c1[a2]), cb = cross(c1[a], c2[b], c2[b2]);
      const okA = upper ? ca > 0 : ca < 0, okB = upper ? cb < 0 : cb > 0;
      if (!okA) { R.snap(off + 3, `เส้นยังไม่${upper ? 'เลี้ยวซ้าย' : 'เลี้ยวขวา'}กับจุดถัดไปของ CH1 จึงหมุน ${nmA} ไปจุดถัดไป`, V2(a, b, [[ida(a), ida(a2), 'b']], { [ida(a2)]: 'k' })); a = a2; continue; }
      if (!okB) { R.snap(off + 4, `เส้นยังไม่${upper ? 'เลี้ยวขวา' : 'เลี้ยวซ้าย'}กับจุดถัดไปของ CH2 จึงหมุน ${nmB} ไปจุดถัดไป`, V2(a, b, [[idb(b), idb(b2), 'b']], { [idb(b2)]: 'k' })); b = b2; continue; }
      break;
    }
    R.snap(off + 2, `ทั้งสองฝั่งผ่านเงื่อนไขแล้ว เส้นนี้คือ ${upper ? 'upper' : 'lower'} tangent`, V2(a, b));
    return [a, b];
  };
  const up = find(true, 0), lo = find(false, 100);
  const out = []; let x = up[0]; for (; ;) { out.push(ida(x)); if (x === lo[0]) break; x = (x + 1) % n1; }
  x = lo[1]; for (; ;) { out.push(idb(x)); if (x === up[1]) break; x = (x + 1) % n2; }
  R.snap(0, 'ตัดส่วนในทิ้ง แล้วรวมเป็น hull เดียวด้วยสอง tangent ขั้นรวมใช้ O(n)', hullSVG(P, { polys: [{ ids: out, c: 'b' }] }));
  R.result = { upper: [c1[up[0]], c2[up[1]]], lower: [c1[lo[0]], c2[lo[1]]], hull: out.map(i => P[i]) };
  return R.out();
}

/* ---------- Backtracking ---------- */
function runQueens(inp) {
  const n = inp.n, R = new VRec(), all = [{ id: 'r', p: null, tag: 0, lines: Array(1).fill('·'.repeat(n).split('').join(' ')) }], stateNow = { r: { c: 'cur' } };
  const q = []; let num2 = 0, sol = null, xid = 0;
  const board = (row, col, bad) => {
    let h = `<div class="board" style="--n:${n}">`;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const isQ = q[i] === j, conflict = bad !== undefined && (q[i] === j) && i < row && (j === col || Math.abs(j - col) === row - i);
      h += `<div class="sq ${(i + j) % 2 ? 'dk' : ''} ${i === row && j === col ? (bad ? 'bad' : 'try') : ''} ${conflict ? 'hit' : ''}">${isQ ? 'Q' : (i === row && j === col && bad ? '×' : '')}</div>`;
    }
    return h + '</div>';
  };
  const lab = () => { const a = q.map(x => x + 1); while (a.length < n) a.push('·'); return a.join(' '); };
  const views = (row, col, bad) => { const st = JSON.parse(JSON.stringify(stateNow)); const b = board(row, col, bad); return L => `<div class="two wide2"><div>${b}</div><div>${treeSVG(L, st)}</div></div>`; };
  R.snap(0, `เริ่มที่กระดานว่าง จะวาง queen ทีละแถว`, views(-1, -1));
  const go = (row, par) => {
    if (row === n) { sol = q.slice(); return true; }
    for (let c = 0; c < n; c++) {
      let bad = false; for (let i = 0; i < row; i++) if (q[i] === c || Math.abs(q[i] - c) === row - i) bad = true;
      if (bad) {
        const id = 'x' + (xid++); all.push({ id, p: par, lines: ['' + (c + 1)] }); stateNow[id] = { c: 'x', note: '×' };
        R.snap(1, `แถว ${row + 1} คอลัมน์ ${c + 1} ถูก queen เดิมโจมตี ตัดทิ้ง`, views(row, c, true));
        continue;
      }
      q[row] = c; num2++; const id = 'n' + num2; const tag = num2;
      all.push({ id, p: par, tag, lines: [lab()] }); stateNow[par].c = 'done'; stateNow[id] = { c: 'cur' };
      R.snap(2, `วาง queen แถว ${row + 1} คอลัมน์ ${c + 1} เป็นโหนดที่ ${tag}`, views(row, c, false));
      if (go(row + 1, id)) { stateNow[id].c = 'sol'; return true; }
      stateNow[id].c = 'dead'; q.length = row; stateNow[par].c = 'cur';
      R.snap(3, `ใต้โหนด ${tag} ไปต่อไม่ได้ ย้อนกลับมาลองคอลัมน์ถัดไปของแถว ${row + 1}`, views(row, c >= 0 ? -1 : -1));
    }
    return false;
  };
  const ok = go(0, 'r');
  stateNow.r.c = 'sol';
  R.snap(4, ok ? `ได้คำตอบ คอลัมน์ของแถว 1 ถึง ${n} คือ ${sol.map(x => x + 1).join(', ')} ใช้ ${num2} โหนด` : `ไม่มีคำตอบสำหรับ n = ${n}`, views(-1, -1));
  R.result = { sol: sol && sol.map(x => x + 1), nodes: num2 };
  return R.out(layoutTree(withSlots(all, stateNow)));
}
const HAM_DEF = { nameIn: true, W: 380, H: 220, nodes: [['a', 50, 45], ['b', 190, 45], ['c', 120, 105], ['d', 50, 175], ['e', 190, 175], ['f', 310, 110]],
  edges: [['a', 'b'], ['a', 'c'], ['a', 'd'], ['b', 'c'], ['b', 'f'], ['c', 'd'], ['c', 'e'], ['d', 'e'], ['e', 'f']] };
function runHam(G) {
  const R = new Rec(G), start = 'a', path = [start], used = { a: true }, n = G.ids.length;
  const all = [{ id: '0', p: null, tag: 0, lines: ['a'] }], state = { 0: { c: 'cur' } }; let cnt = 0, sol = null;
  const adj = v => G.adj[v].map(x => x.v).sort();
  const paint = () => { R.e = {}; for (let i = 0; i + 1 < path.length; i++) R.e[ek(G, path[i], path[i + 1])] = 'tree'; G.ids.forEach(v => R.n[v].c = used[v] ? 'gray' : 'white'); };
  const P = () => { const st = JSON.parse(JSON.stringify(state)); return L => [htmlP('State-space tree', treeSVG(L, st), true), chips('เส้นทางปัจจุบัน', path.map(t => ({ t })))]; };
  paint(); R.hi('a');
  R.snap(0, 'เริ่มที่ a ซึ่งจะต้องกลับมาปิดวงจรตอนท้าย', P());
  const go = (v, node) => {
    if (path.length === n) {
      if (adj(v).includes(start)) { sol = [...path, start]; return true; }
      return false;
    }
    let any = false;
    for (const u of adj(v)) {
      if (used[u]) continue;
      any = true; cnt++; const id = '' + cnt;
      all.push({ id, p: node, tag: cnt, lines: [u] }); state[node].c = 'done'; state[id] = { c: 'cur' };
      used[u] = true; path.push(u); paint(); R.hi(u); R.act(ek(G, v, u));
      R.snap(0, `จาก ${v} เดินไป ${u} เป็นโหนดที่ ${cnt}`, P());
      if (go(u, id)) return true;
      state[id].c = 'dead'; state[id].note = 'dead end';
      used[u] = false; path.pop(); state[node].c = 'cur'; paint(); R.hi(v);
      R.snap(0, `${u} ไปต่อไม่ได้ ย้อนกลับมา ${v}`, P());
    }
    return false;
  };
  go('a', '0');
  const last = path[path.length - 1], lastId = '' + cnt;
  all.push({ id: 'end', p: lastId, lines: ['a'] }); state.end = { c: 'sol', note: 'solution' }; state[lastId].c = 'done';
  R.e[ek(G, last, 'a')] = 'tree'; G.ids.forEach(v => R.n[v].c = 'black');
  R.snap(0, `${last} มี edge กลับ a ได้วงจร ${sol.join(' → ')}`, P());
  R.result = { sol, nodes: cnt };
  const out = R.out(); resolveFns(out.steps, layoutTree(withSlots(all, state)));
  return out;
}

/* ---------- Branch and bound ---------- */
const ASSIGN_C = [[9, 2, 7, 8], [6, 4, 3, 7], [5, 8, 1, 8], [7, 6, 9, 4]];
function runBBAssign(inp) {
  const C = inp.C, n = C.length, R = new VRec(), names = 'abcdefgh'.split(''), all = [], state = {};
  const lbOf = (set) => { let s = set.reduce((t, c, i) => t + C[i][c], 0); for (let i = set.length; i < n; i++) s += Math.min(...C[i].filter((_, j) => !set.includes(j))); return s; };
  const lb0 = lbOf([]);
  all.push({ id: '0', p: null, tag: 0, lines: ['start', `lb=${lb0}`] }); state[0] = { c: 'cur' };
  let live = [{ id: '0', set: [], lb: lb0 }], cnt = 0, best = INF, bestSet = null;
  const ids = ['1', '2', '3', '4'];
  const mV = set => { const c = {}; set.forEach((j, i) => c[i + ',' + j] = 'tgt'); return mat('เมทริกซ์ต้นทุน C', ids, C.map(r => r.map(String)), c, { rowIds: names.slice(0, n) }); };
  const V2 = () => { const st = JSON.parse(JSON.stringify(state)); return L => treeSVG(L, st); };
  const P = set => [mV(set), chips(`Live nodes · ดีสุด = ${best === INF ? '-' : best}`, live.slice().sort((a, b) => a.lb - b.lb).map(x => ({ t: 'node ' + x.id, sub: 'lb ' + x.lb })), 'ว่าง')];
  R.snap(0, `ขอบล่างของรากคือผลรวมค่าน้อยสุดของแต่ละแถว = ${lb0}`, V2(), P([]));
  while (live.length) {
    live.sort((a, b) => a.lb - b.lb || (+a.id - +b.id));
    const x = live.shift();
    if (x.lb >= best) { state[x.id] = { c: 'x', note: 'X' }; R.snap(0, `node ${x.id} มี lb = ${x.lb} ไม่ดีกว่าคำตอบ ${best} ตัดทิ้ง`, V2(), P(x.set)); continue; }
    state[x.id].c = 'cur';
    R.snap(0, `เลือก node ${x.id} ที่ lb น้อยสุด (${x.lb}) มาแตกกิ่ง`, V2(), P(x.set));
    const row = x.set.length;
    if (row === n - 2) {
      const left = ids.map((_, j) => j).filter(j => !x.set.includes(j));
      for (const j of left) {
        const k = left.find(t => t !== j), set = [...x.set, j, k], cost = set.reduce((t, c, i) => t + C[i][c], 0);
        cnt++; const id = '' + cnt;
        all.push({ id, p: x.id, tag: cnt, lines: [`${names[row]}→${j + 1}`, `${names[row + 1]}→${k + 1}`, `cost=${cost}`] });
        const good = cost < best; if (good) { best = cost; bestSet = set; }
        state[id] = { c: good ? 'sol' : 'dead', note: good ? 'ดีสุดตอนนี้' : 'แย่กว่า' };
        R.snap(0, `สองแถวสุดท้ายถูกบังคับ ได้คำตอบเต็ม ต้นทุน ${cost}${good ? ' ดีที่สุดเท่าที่เจอ' : ''}`, V2(), P(set));
      }
      state[x.id].c = 'done';
      continue;
    }
    for (let j = 0; j < n; j++) {
      if (x.set.includes(j)) continue;
      const set = [...x.set, j], lb = lbOf(set); cnt++; const id = '' + cnt;
      all.push({ id, p: x.id, tag: cnt, lines: [`${names[row]}→${j + 1}`, `lb=${lb}`] });
      state[id] = { c: '' }; live.push({ id, set, lb });
      R.snap(0, `${names[row]} → งาน ${j + 1}: lb = ${lb}`, V2(), P(set));
    }
    state[x.id].c = 'done';
  }
  R.snap(0, `live node หมด คำตอบดีสุด ${bestSet.map((j, i) => names[i] + '→' + (j + 1)).join(', ')} ต้นทุน ${best}`, V2(), P(bestSet));
  R.result = { best, nodes: all.map(n2 => [n2.tag, n2.lines.join('|')]) };
  return R.out(layoutTree(withSlots(all, state)));
}
function runBBKnap(inp) {
  const { items, W } = inp, n = items.length, R = new VRec(), all = [], state = {};
  const ub = (v, w, i) => i >= n ? v : v + (W - w) * (items[i].v / items[i].w);
  const u0 = ub(0, 0, 0);
  all.push({ id: '0', p: null, tag: 0, lines: ['w=0, v=0', `ub=${u0}`] }); state[0] = { c: 'cur' };
  let live = [{ id: '0', i: 0, w: 0, v: 0, ub: u0, set: [] }], cnt = 0, best = -1, bestSet = null;
  const V2 = () => { const st = JSON.parse(JSON.stringify(state)); return L => treeSVG(L, st); };
  const P = cur => [tbl('ไอเท็มเรียงตาม v/w', ['i', 'w', 'v', 'v/w'], items.map((x, i) => [i + 1, x.w, x.v, x.v / x.w]), cur), chips(`Live nodes · ดีสุด = ${best < 0 ? '-' : best}`, live.slice().sort((a, b) => b.ub - a.ub).map(x => ({ t: 'node ' + x.id, sub: 'ub ' + x.ub })), 'ว่าง')];
  R.snap(0, `ub ของราก = 0 + (${W} − 0) × ${items[0].v / items[0].w} = ${u0}`, V2(), P(-1));
  while (live.length) {
    live.sort((a, b) => b.ub - a.ub || (+a.id - +b.id));
    const x = live.shift();
    if (x.ub <= best) { state[x.id] = { c: 'x', note: 'X' }; R.snap(0, `node ${x.id} มี ub = ${x.ub} ไม่ดีกว่าคำตอบ ${best} ตัดทิ้ง`, V2(), P(-1)); continue; }
    state[x.id].c = 'cur';
    R.snap(0, `เลือก node ${x.id} ที่ ub มากสุด (${x.ub}) มาแตกกิ่ง`, V2(), P(x.i));
    const it = items[x.i];
    for (const take of [true, false]) {
      cnt++; const id = '' + cnt, w = x.w + (take ? it.w : 0), v = x.v + (take ? it.v : 0), i = x.i + 1;
      if (w > W) {
        all.push({ id, p: x.id, tag: cnt, lines: [`w=${w}`] }); state[id] = { c: 'x', note: 'เกินความจุ' };
        R.snap(0, `ใส่ไอเท็ม ${x.i + 1}: น้ำหนัก ${w} เกิน ${W} ตัดทิ้ง`, V2(), P(x.i)); continue;
      }
      const u = ub(v, w, i), set = take ? [...x.set, x.i + 1] : x.set;
      if (i === n) {
        all.push({ id, p: x.id, tag: cnt, lines: [`w=${w}, v=${v}`, `value=${v}`] });
        const good = v > best; if (good) { best = v; bestSet = set; }
        state[id] = { c: good ? 'sol' : 'dead', note: good ? 'คำตอบ' : '' };
        R.snap(0, `ตัดสินใจครบทุกไอเท็ม ได้มูลค่า ${v}${good ? ' ดีที่สุดเท่าที่เจอ' : ''}`, V2(), P(x.i));
      } else {
        all.push({ id, p: x.id, tag: cnt, lines: [`w=${w}, v=${v}`, `ub=${u}`] }); state[id] = { c: '' }; live.push({ id, i, w, v, ub: u, set });
        R.snap(0, `${take ? 'ใส่' : 'ไม่ใส่'}ไอเท็ม ${x.i + 1}: ub = ${v} + (${W} − ${w}) × ${items[i].v / items[i].w} = ${u}`, V2(), P(x.i));
      }
    }
    state[x.id].c = 'done';
  }
  R.snap(0, `live node หมด คำตอบดีสุดคือไอเท็ม {${bestSet.join(', ')}} มูลค่า ${best}`, V2(), P(-1));
  R.result = { best, bestSet, nodes: all.map(n2 => [n2.tag, n2.lines.join('|')]) };
  return R.out(layoutTree(withSlots(all, state)));
}
const TSP5 = { ids: ['a', 'b', 'c', 'd', 'e'], D: [[0, 3, 1, 5, 8], [3, 0, 6, 7, 9], [1, 6, 0, 4, 2], [5, 7, 4, 0, 3], [8, 9, 2, 3, 0]] };
function tspLB(D, path) {
  const n = D.length; let s = 0;
  for (let i = 0; i < n; i++) {
    const must = []; path.forEach((v, p) => { if (v === i) { if (p > 0) must.push(path[p - 1]); if (p + 1 < path.length) must.push(path[p + 1]); } });
    const others = []; for (let j = 0; j < n; j++) if (j !== i && !must.includes(j)) others.push(D[i][j]);
    others.sort((a, b) => a - b);
    let t = must.reduce((x, j) => x + D[i][j], 0);
    for (let k = 0; k < 2 - must.length; k++) t += others[k];
    s += t;
  }
  return Math.ceil(s / 2);
}
function runBBTSP(inp) {
  const { ids, D } = inp, n = ids.length, R = new VRec(), all = [], state = {};
  const name = p => p.map(i => ids[i]).join(', ');
  const lb0 = tspLB(D, [0]);
  all.push({ id: '0', p: null, tag: 0, lines: ['a', `lb=${lb0}`] }); state[0] = { c: 'cur' };
  let live = [{ id: '0', path: [0], lb: lb0, d: 0 }], cnt = 0, best = INF, bestP = null;
  const V2 = () => { const st = JSON.parse(JSON.stringify(state)); return L => treeSVG(L, st); };
  const P = () => [mat('ระยะทาง D', ids, D.map(r => r.map(String)), {}, {}), chips(`Live nodes · ทัวร์ดีสุด = ${best === INF ? '-' : best}`, live.slice().sort((a, b) => a.lb - b.lb).map(x => ({ t: 'node ' + x.id, sub: 'lb ' + x.lb })), 'ว่าง')];
  R.snap(0, `lb ของราก = ⌈s/2⌉ = ${lb0} โดย s คือผลรวมสองระยะที่สั้นสุดของทุกเมือง`, V2(), P());
  while (live.length) {
    live.sort((a, b) => a.lb - b.lb || b.d - a.d || (+a.id - +b.id));
    const x = live.shift();
    if (x.lb >= best) { state[x.id] = { c: 'x', note: x.lb === best ? 'lb ≥ l' : 'lb > l' }; R.snap(0, `node ${x.id} มี lb = ${x.lb} ไม่ดีกว่าทัวร์ ${best} ตัดทิ้ง`, V2(), P()); continue; }
    state[x.id].c = 'cur';
    R.snap(0, `เลือก node ${x.id} (${name(x.path)}) lb = ${x.lb} มาแตกกิ่ง`, V2(), P());
    for (let j = 1; j < n; j++) {
      if (x.path.includes(j)) continue;
      const path = [...x.path, j]; cnt++; const id = '' + cnt;
      if (j === 2 && !x.path.includes(1)) {
        all.push({ id, p: x.id, tag: cnt, lines: [name(path)] }); state[id] = { c: 'x', note: 'b ต้องมาก่อน c' };
        R.snap(0, `${name(path)}: ตัดทัวร์กลับด้าน โดยกำหนดให้ b มาก่อน c`, V2(), P());
        continue;
      }
      if (path.length === n - 1) {
        const last = [...Array(n).keys()].find(v => !path.includes(v)), tour = [...path, last];
        const len = tour.reduce((s, v, i) => s + D[v][tour[(i + 1) % n]], 0);
        all.push({ id, p: x.id, tag: cnt, lines: [name(path) + ',', `(${ids[last]}, a)`, `l=${len}`] });
        const good = len < best; if (good) { best = len; bestP = tour; }
        state[id] = { c: good ? 'sol' : 'dead', note: good ? 'ดีสุดตอนนี้' : 'แย่กว่า' };
        R.snap(0, `เหลือเมืองเดียวจึงปิดทัวร์ ${[...tour, 0].map(v => ids[v]).join('-')} ยาว ${len}${good ? ' ดีที่สุดเท่าที่เจอ' : ''}`, V2(), P());
      } else {
        const lb = tspLB(D, path);
        all.push({ id, p: x.id, tag: cnt, lines: [name(path), `lb=${lb}`] }); state[id] = { c: '' };
        live.push({ id, path, lb, d: path.length });
        R.snap(0, `${name(path)}: lb = ${lb}`, V2(), P());
      }
    }
    state[x.id].c = 'done';
  }
  R.snap(0, `live node หมด ทัวร์ที่ดีที่สุด ${[...bestP, 0].map(v => ids[v]).join('-')} ยาว ${best}`, V2(), P());
  R.result = { best, nodes: all.map(n2 => [n2.tag, n2.lines.join('|')]) };
  return R.out(layoutTree(withSlots(all, state)));
}

/* ---------- Approximation: TSP ---------- */
const TSP_A = { nameIn: true, weighted: true, W: 340, H: 270, nodes: [['a', 50, 45], ['b', 290, 45], ['c', 290, 225], ['d', 50, 225]], edges: [['a', 'b', 1], ['b', 'c', 2], ['c', 'd', 1], ['a', 'd', 6], ['a', 'c', 3, { t: .3 }], ['b', 'd', 3, { t: .3 }]] };
const TSP_B = { nameIn: true, weighted: true, W: 440, H: 300, nodes: [['a', 100, 40], ['e', 340, 40], ['b', 100, 180], ['d', 340, 180], ['c', 220, 265]], edges: [['a', 'b', 4], ['a', 'c', 8, { b: 72, t: .55 }], ['a', 'd', 9, { t: .3 }], ['a', 'e', 12], ['b', 'c', 6], ['b', 'd', 8], ['b', 'e', 9, { t: .3 }], ['c', 'd', 10], ['c', 'e', 11, { b: 72, t: .45 }], ['d', 'e', 7]] };
const wt = (G, u, v) => G.E.find(e => (e.u === u && e.v === v) || (e.u === v && e.v === u)).w;
const tourLen = (G, t) => t.reduce((s, v, i) => s + wt(G, v, t[(i + 1) % t.length]), 0);
function paintTour(R, G, t, closed) { R.e = {}; for (let i = 0; i + 1 < t.length; i++) R.e[ek(G, t[i], t[i + 1])] = 'tree'; if (closed) R.e[ek(G, t[t.length - 1], t[0])] = 'tree'; }
function runNN(G, o) {
  const R = new Rec(G), t = [o.start], seen = { [o.start]: true };
  const P = () => [chips('ทัวร์', t.map(x => ({ t: x })))];
  G.ids.forEach(v => R.n[v].c = 'white'); R.n[o.start].c = 'black'; R.hi(o.start);
  R.snap(1, `เริ่มที่เมือง ${o.start}`, P());
  while (t.length < G.ids.length) {
    const cur = t[t.length - 1]; const cand = G.adj[cur].filter(x => !seen[x.v]).sort((a, b) => a.w - b.w || (a.v < b.v ? -1 : 1));
    const nx = cand[0].v; cand.forEach(c => R.act(ek(G, cur, c.v), 'peek')); R.act(ek(G, cur, nx)); R.hi(cur);
    R.snap(2, `จาก ${cur} เมืองที่ยังไม่ไปและใกล้สุดคือ ${nx} ระยะ ${cand[0].w}`, P());
    t.push(nx); seen[nx] = true; paintTour(R, G, t, false); R.n[nx].c = 'black';
  }
  const last = t[t.length - 1]; R.act(ek(G, last, t[0])); paintTour(R, G, t, true);
  const len = tourLen(G, t);
  R.snap(3, `กลับเมืองเริ่มต้น ได้ทัวร์ ${[...t, t[0]].join('-')} ยาว ${len}${o.opt ? ` เทียบคำตอบดีสุด ${o.opt}: r = ${len}/${o.opt} = ${len / o.opt}` : ''}`, P());
  R.result = { t, len };
  return R.out();
}
function runMulti(G) {
  const R = new Rec(G), sorted = G.E.slice().sort((a, b) => a.w - b.w), deg = {}, sets = {}, n = G.ids.length, st = sorted.map(() => 'รอ'); let cnt = 0, sum = 0;
  G.ids.forEach(v => { deg[v] = 0; sets[v] = [v]; });
  const P = i => [tbl('Edge เรียงตามน้ำหนัก', ['edge', 'w', 'ผล'], sorted.map((e, x) => [e.u + '–' + e.v, e.w, st[x]]), i)];
  R.snap(1, 'เรียง edge จากเบาไปหนัก แล้วหยิบทีละเส้น', P(-1));
  sorted.forEach((e, i) => {
    if (cnt === n) return;
    const k = ek(G, e.u, e.v); R.act(k); R.hi(e.u); R.hi(e.v);
    if (deg[e.u] >= 2 || deg[e.v] >= 2) { st[i] = 'degree 3'; R.e[k] = 'rej'; R.snap(2, `${e.u}–${e.v}: จะทำให้ vertex มี degree 3 ข้าม`, P(i)); return; }
    if (sets[e.u] === sets[e.v] && cnt < n - 1) { st[i] = 'วงสั้น'; R.e[k] = 'rej'; R.snap(2, `${e.u}–${e.v}: จะเกิดวงจรที่สั้นกว่า n ข้าม`, P(i)); return; }
    deg[e.u]++; deg[e.v]++; cnt++; sum += e.w; st[i] = 'เลือก'; R.e[k] = 'tree';
    if (sets[e.u] !== sets[e.v]) { const m = sets[e.u].concat(sets[e.v]); m.forEach(v => sets[v] = m); }
    G.ids.forEach(v => R.n[v].c = deg[v] === 2 ? 'black' : deg[v] === 1 ? 'gray' : 'white');
    R.snap(2, `เพิ่ม ${e.u}–${e.v} ความยาวรวม ${sum}`, P(i));
  });
  R.snap(2, `ครบ ${n} เส้น ได้ทัวร์ความยาว ${sum}`, P(-1));
  R.result = { len: sum };
  return R.out();
}
function mstEdges(G) {
  const sets = {}; G.ids.forEach(v => sets[v] = [v]); const out = [];
  G.E.slice().sort((a, b) => a.w - b.w || (a.u + a.v < b.u + b.v ? -1 : 1)).forEach(e => { if (sets[e.u] !== sets[e.v]) { out.push(e); const m = sets[e.u].concat(sets[e.v]); m.forEach(v => sets[v] = m); } });
  return out;
}
function shortcut(walk) { const seen = {}, t = []; walk.forEach(v => { if (!seen[v]) { seen[v] = true; t.push(v); } }); return t; }
function runTwice(G) {
  const R = new Rec(G), T = mstEdges(G), adj = {};
  G.ids.forEach(v => adj[v] = []); T.forEach(e => { adj[e.u].push(e.v); adj[e.v].push(e.u); });
  const sum = T.reduce((s, e) => s + e.w, 0);
  G.ids.forEach(v => R.n[v].c = 'white');
  T.forEach(e => R.e[ek(G, e.u, e.v)] = 'tree');
  R.snap(1, `สร้าง MST น้ำหนัก ${sum}`, [chips('MST', T.map(e => ({ t: `${e.u}–${e.v} (${e.w})` })))]);
  const walk = [];
  const go = (v, p) => { walk.push(v); adj[v].slice().sort().forEach(u => { if (u !== p) { go(u, v); walk.push(v); } }); };
  go('a', null);
  for (let i = 1; i < walk.length; i++) {
    R.act(ek(G, walk[i - 1], walk[i])); R.hi(walk[i]);
    R.snap(2, `เดินรอบต้นไม้ ${walk.slice(0, i + 1).join('-')}`, [chips('Walk', walk.slice(0, i + 1).map(t => ({ t })))]);
  }
  const t = shortcut(walk), len = tourLen(G, t);
  paintTour(R, G, t, true); G.ids.forEach(v => R.n[v].c = 'black');
  R.snap(3, `ตัดตัวที่เคยเยี่ยมซ้ำออก ได้ทัวร์ ${[...t, t[0]].join('-')} ยาว ${len} ซึ่งไม่เกิน 2 เท่าของ MST (${2 * sum}) เมื่อเป็น Euclidean`, [chips('ทัวร์', [...t, t[0]].map(x => ({ t: x })))]);
  R.result = { walk, t, len, sum };
  return R.out();
}
function runChristofides(G) {
  const R = new Rec(G), T = mstEdges(G), deg = {}; G.ids.forEach(v => deg[v] = 0); T.forEach(e => { deg[e.u]++; deg[e.v]++; });
  G.ids.forEach(v => R.n[v].c = 'white'); T.forEach(e => R.e[ek(G, e.u, e.v)] = 'tree');
  R.snap(1, `สร้าง MST น้ำหนัก ${T.reduce((s, e) => s + e.w, 0)}`, [tbl('Degree ใน MST', ['v', 'deg'], G.ids.map(v => [v, deg[v]]))]);
  const odd = G.ids.filter(v => deg[v] % 2); odd.forEach(v => { R.n[v].c = 'gray'; R.hi(v); });
  R.snap(2, `vertex degree คี่คือ ${odd.join(', ')} ต้องจับคู่เพื่อให้ทุก degree เป็นคู่`, [tbl('Degree ใน MST', ['v', 'deg'], G.ids.map(v => [v, deg[v]]))]);
  let bestM = null, bestW = INF;
  const rec = (rest, cur, w) => { if (!rest.length) { if (w < bestW) { bestW = w; bestM = cur; } return; } const [a, ...r] = rest; r.forEach((b, i) => rec(r.filter((_, x) => x !== i), [...cur, [a, b]], w + wt(G, a, b))); };
  rec(odd, [], 0);
  const Mt = bestM; Mt.forEach(p => R.act(ek(G, p[0], p[1]), 'pa'));
  R.snap(2, `จับคู่น้ำหนักรวมน้อยสุด: ${Mt.map(p => `${p[0]}–${p[1]} (${wt(G, p[0], p[1])})`).join(', ')} รวม ${bestW}`, [chips('Matching', Mt.map(p => ({ t: `${p[0]}–${p[1]}` })))]);
  const multi = {}; G.ids.forEach(v => multi[v] = []);
  let eid = 0; [...T.map(e => [e.u, e.v]), ...Mt].forEach(([u, v]) => { const id = eid++; multi[u].push({ v, id }); multi[v].push({ v: u, id }); });
  G.ids.forEach(v => multi[v].sort((a, b) => a.v < b.v ? -1 : a.v > b.v ? 1 : a.id - b.id));
  const used = {}, st = ['a'], circ = [];
  while (st.length) { const v = st[st.length - 1]; const nx = multi[v].find(x => !used[x.id]); if (nx) { used[nx.id] = true; st.push(nx.v); } else circ.push(st.pop()); }
  circ.reverse();
  R.snap(3, `ทุก degree เป็นคู่แล้ว จึงมี Eulerian circuit: ${circ.join('-')}`, [chips('Eulerian circuit', circ.map(t => ({ t })))]);
  const t = shortcut(circ), len = tourLen(G, t);
  paintTour(R, G, t, true); G.ids.forEach(v => R.n[v].c = 'black');
  R.snap(4, `ตัดตัวซ้ำ ได้ทัวร์ ${[...t, t[0]].join('-')} ยาว ${len}`, [chips('ทัวร์', [...t, t[0]].map(x => ({ t: x })))]);
  R.result = { circ, t, len, match: Mt };
  return R.out();
}
function run2opt(G, o) {
  const R = new Rec(G); let t = o.start.slice(); const n = t.length, log = []; let L = tourLen(G, t);
  G.ids.forEach(v => R.n[v].c = 'gray');
  const P = () => [chips(`ทัวร์ปัจจุบัน · ยาว ${L}`, [...t, t[0]].map(x => ({ t: x }))), tbl('การลอง 2-change', ['ลบ', 'เพิ่ม', 'ยาวใหม่', 'ผล'], log.slice())];
  paintTour(R, G, t, true);
  R.snap(1, `เริ่มจากทัวร์ ${[...t, t[0]].join('-')} ยาว ${L}`, P());
  let improved = true, g = 0;
  while (improved && g++ < 20) {
    improved = false;
    outer: for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const a = t[i], b = t[i + 1], c = t[j], d = t[(j + 1) % n];
      const nt = [...t.slice(0, i + 1), ...t.slice(i + 1, j + 1).reverse(), ...t.slice(j + 1)], nl = tourLen(G, nt), good = nl < L;
      paintTour(R, G, nt, true); R.act(ek(G, a, b), 'rej'); R.act(ek(G, c, d), 'rej'); R.act(ek(G, a, c)); R.act(ek(G, b, d)); R.hi(a); R.hi(b); R.hi(c); R.hi(d);
      log.push([`${a}${b}, ${c}${d}`, `${a}${c}, ${b}${d}`, nl, good ? 'ใช้' : 'ไม่ใช้']);
      R.snap(2, `ลบ ${a}–${b} กับ ${c}–${d} แล้วต่อ ${a}–${c} กับ ${b}–${d} ได้ความยาว ${nl} ${good ? `น้อยกว่า ${L} รับทัวร์ใหม่` : `ไม่น้อยกว่า ${L}`}`, P());
      if (good) { t = nt; L = nl; improved = true; paintTour(R, G, t, true); break outer; }
      paintTour(R, G, t, true);
    }
  }
  R.snap(3, `ไม่มี 2-change ใดสั้นกว่าแล้ว คืนทัวร์ ${[...t, t[0]].join('-')} ยาว ${L}`, P());
  R.result = { t, len: L, log };
  return R.out();
}

/* ---------- Approximation: knapsack, bin packing ---------- */
function itemsTable(items, cls) {
  return tbl('ไอเท็มเรียงตาม v/w', ['i', 'w', 'v', 'v/w', 'ผล'], items.map((x, i) => [i + 1, x.w, x.v, +(x.v / x.w).toFixed(2), cls[i] || '']));
}
function runGreedyKnap(inp) {
  const { items, W } = inp, R = new VRec(), res = {}; let w = 0, v = 0;
  const bar = () => `<div class="lv"><div class="pt">เป้ความจุ ${W}: ใช้ไป ${w}, มูลค่า ${v}</div><div class="lr"><span>w</span><div class="lb"><i style="width:${Math.min(100, w / W * 100)}%"></i></div><b>${w}/${W}</b></div></div>`;
  R.snap(1, 'เรียงไอเท็มตามมูลค่าต่อหน่วยจากมากไปน้อย', bar(), [itemsTable(items, res)]);
  items.forEach((it, i) => {
    if (w + it.w <= W) { w += it.w; v += it.v; res[i] = 'ใส่'; R.snap(2, `ไอเท็ม ${i + 1} (w=${it.w}) ใส่ได้ น้ำหนักรวม ${w} มูลค่า ${v}`, bar(), [itemsTable(items, res)]); }
    else { res[i] = 'ข้าม'; R.snap(2, `ไอเท็ม ${i + 1} (w=${it.w}) ใส่ไม่ได้เพราะเหลือที่ ${W - w} ข้าม`, bar(), [itemsTable(items, res)]); }
  });
  R.snap(2, inp.note ? `มูลค่ารวม ${v} ${inp.note}` : `มูลค่ารวม ${v}`, bar(), [itemsTable(items, res)]);
  R.result = { v, w };
  return R.out();
}
function runApproxScheme(inp) {
  const { items, W, k } = inp, n = items.length, R = new VRec(), rows = []; let best = -1, bestSet = null;
  const subs = []; const rec = (s, cur) => { subs.push(cur); if (cur.length === k) return; for (let i = s; i < n; i++) rec(i + 1, [...cur, i]); };
  rec(0, []); subs.sort((a, b) => (a.length - b.length) || (a.join() < b.join() ? -1 : 1));
  const P = () => [tbl('ทุกเซตย่อยขนาดไม่เกิน k', ['เซตย่อย', 'ส่วนที่เติม', 'มูลค่า'], rows.slice())];
  R.snap(2, `k = ${k} จึงลองทุกเซตย่อยที่มีไม่เกิน ${k} ไอเท็ม`, '', [itemsTable(items, {}), ...P()]);
  subs.forEach(sb => {
    const wt0 = sb.reduce((s, i) => s + items[i].w, 0), label = '{' + sb.map(i => i + 1).join(',') + '}';
    if (wt0 > W) { rows.push([label, 'เกินความจุ', '-']); R.snap(2, `${label} หนัก ${wt0} เกิน ${W} ข้าม`, '', [itemsTable(items, {}), ...P()]); return; }
    let w = wt0, v = sb.reduce((s, i) => s + items[i].v, 0); const add = [];
    items.forEach((it, i) => { if (!sb.includes(i) && w + it.w <= W) { w += it.w; v += it.v; add.push(i + 1); } });
    rows.push([label, add.join(',') || '-', v]);
    if (v > best) { best = v; bestSet = [...sb.map(i => i + 1), ...add].sort((a, b) => a - b); }
    R.snap(2, `${label} แล้วเติมตาม v/w ได้ {${add.join(',')}} มูลค่า ${v}`, '', [itemsTable(items, {}), ...P()]);
  });
  R.snap(3, `ดีที่สุดคือ {${bestSet.join(',')}} มูลค่า ${best}`, '', [itemsTable(items, {}), ...P()]);
  R.result = { best, bestSet, rows };
  return R.out();
}
function binsHTML(bins, cur) {
  return `<div class="bins">${bins.map((b, i) => `<div class="bin"><div class="binbox">${b.map(x => `<div class="bit" style="height:${x * 100}%">${x}</div>`).join('')}</div><small>ถัง ${i + 1}</small></div>`).join('')}${cur !== undefined ? `<div class="bin wait"><div class="binbox"><div class="bit nextb" style="height:${cur * 100}%">${cur}</div></div><small>กำลังวาง</small></div>` : ''}</div>`;
}
function runBin(inp) {
  const R = new VRec(), s = inp.dec ? inp.s.slice().sort((a, b) => b - a) : inp.s.slice(), bins = [], left = [];
  const r2 = x => Math.round(x * 1000) / 1000;
  const clone = () => bins.map(b => b.slice());
  if (inp.dec) R.snap(1, `เรียงจากใหญ่ไปเล็ก: ${s.join(', ')}`, binsHTML([]));
  s.forEach(x => {
    R.snap(inp.dec ? 2 : 1, `หาถังแรกที่ใส่ ${x} ได้`, binsHTML(clone(), x));
    const i = left.findIndex(l => r2(l - x) >= 0);
    if (i >= 0) { bins[i].push(x); left[i] = r2(left[i] - x); R.snap(inp.dec ? 2 : 1, `ใส่ ${x} ในถัง ${i + 1} เหลือที่ว่าง ${left[i]}`, binsHTML(clone())); }
    else { bins.push([x]); left.push(r2(1 - x)); R.snap(inp.dec ? 3 : 2, `ไม่มีถังที่พอ เปิดถังใหม่ใส่ ${x}`, binsHTML(clone())); }
  });
  R.snap(inp.dec ? 3 : 2, `ใช้ทั้งหมด ${bins.length} ถัง`, binsHTML(clone()));
  R.result = { bins: bins.length, pack: bins };
  return R.out();
}
