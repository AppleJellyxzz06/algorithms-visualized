/* ===== ส่วนแสดงผล ===== */
const $ = (s, r = document) => r.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const S = { L: null, pi: 0, G: null, out: null, i: 0, timer: null, speed: 1000, detail: false, custom: null, customSrc: null, pq: null, nodes: {}, edges: {} };

const LEG_N = {
  bfs: { white: 'ยังไม่พบ', gray: 'อยู่ในคิว', black: 'เสร็จแล้ว' }, dfs: { white: 'ยังไม่พบ', gray: 'อยู่ใน call stack', black: 'เสร็จแล้ว' },
  topo: { white: 'ยังไม่พบ', gray: 'กำลังทำ', black: 'เสร็จแล้ว' }, scc: { white: 'ยังไม่จัดกลุ่ม', gray: 'กำลังทำ', black: 'เสร็จแล้ว' },
  prim: { white: 'อยู่ใน Q', black: 'อยู่ใน tree' }, bellman: { white: 'd = ∞', gray: 'มีค่า d แล้ว' },
  dag: { white: 'รอ', gray: 'กำลัง relax ขาออก', black: 'เสร็จแล้ว' }, dijkstra: { white: 'อยู่ใน Q', gray: 'เพิ่งดึงออก', black: 'อยู่ใน S' },
  mst: { c0: 'ฝั่ง S', white: 'ฝั่ง V − S' }, kruskal: { white: 'ยังเดี่ยว' }, sssp: { gray: 'พิจารณาแล้ว', white: 'ยังไม่พิจารณา' },
  heap: { white: 'อยู่ใน heap' }, bheap: { white: 'อยู่ใน heap' }, hsort: { white: 'อยู่ใน heap', black: 'เรียงเสร็จแล้ว' }, pq: { white: 'อยู่ใน heap' },
  dsu: { white: 'ยังเดี่ยว' }, als: { gray: 'คำนวณ f แล้ว' }, ham: { white: 'ยังไม่ไป', gray: 'อยู่บนเส้นทาง', black: 'อยู่ในวงจร' }, tspg: { white: 'ยังไม่ไป', gray: 'มี 1 เส้น', black: 'เสร็จแล้ว' }, tspm: { white: 'ยังไม่ไป', gray: 'degree คี่', black: 'อยู่ในทัวร์' },
};
const LEGV = { tgt: '--hot', src: '--pink', band: '--band', lo: '--c0', hi: '--c1', piv: '--c2', pv: '--c2', done: '--band', try: '--c0', bad: '--bad', cur: '--panel', out: '--paper' };
const LEG_E = { act: 'กำลังใช้งาน', peek: 'กำลังตรวจ', tree: 'เส้นที่เลือกไว้', cand: 'ผู้สมัคร / ข้าม cut', rej: 'ถูกทิ้ง', back: 'back edge', pa: 'ท่อน i ⇝ k', pb: 'ท่อน k ⇝ j' };
const EDGE_VAR = { act: '--hot', peek: '--pink', tree: '--accent', cand: '--accent', rej: '--bad', back: '--pink', pa: '--pink', pb: '--hot' };
const FILL = { white: '--v-w', gray: '--v-g', black: '--v-b', c0: '--c0' };

const SUB_OF = {}; SUBJECTS.forEach(x => x.L.forEach(l => SUB_OF[l.id] = x));
function nav() {
  let h = `<a class="brand" href="#home" data-go="home">Algorithms<br><span style="font:400 12px var(--f-b);opacity:.75">บทเรียนแบบเห็นภาพ</span></a><button class="navb" data-go="home">ภาพรวมทุกบท</button>`;
  let opts = `<option value="home">ภาพรวมทุกบท</option>`;
  SUBJECTS.forEach(sb => {
    h += `<details class="grp" data-sub="${sb.id}"><summary><span class="no">${sb.no}</span>${esc(sb.title)}</summary>`;
    opts += `<optgroup label="${sb.no} ${esc(sb.title)}">`;
    let ch = 0;
    sb.L.forEach(l => {
      if (l.ch && l.ch !== ch) { ch = l.ch; h += `<div class="chap">${ch}. ${CHAPTERS[ch]}</div>`; }
      h += `<button class="navb" data-go="${l.id}">${esc(l.en === l.title ? l.title : l.en)}</button>`;
      opts += `<option value="${l.id}">${esc(l.title)}</option>`;
    });
    h += `</details>`; opts += `</optgroup>`;
  });
  h += `<label class="navsel"><span class="brand" style="padding:0">Algorithms</span><select id="navsel" aria-label="เลือกบทเรียน">${opts}</select></label>`;
  $('#rail').innerHTML = h;
  $('#navsel').onchange = e => { location.hash = e.target.value; };
}
function markNav(id) {
  document.querySelectorAll('.navb').forEach(b => { if (b.dataset.go === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  const cur = SUB_OF[id];
  document.querySelectorAll('details.grp').forEach(d => { d.open = !!cur && d.dataset.sub === cur.id; });
  $('#navsel').value = id;
}

/* ---------- หน้าแรก ---------- */
function mapSVG() {
  const P = { rep: [90, 60], bfs: [90, 128], dfs: [90, 196], topo: [90, 264], scc: [90, 332], mst: [320, 110], kruskal: [320, 200], prim: [320, 290], sssp: [550, 60], bellman: [550, 140], dag: [550, 220], dijkstra: [550, 310], apsp: [790, 130], floyd: [790, 240] };
  const NM = { rep: 'การแทนกราฟ', bfs: 'BFS', dfs: 'DFS', topo: 'Topological sort', scc: 'SCC', mst: 'Safe edge', kruskal: 'Kruskal', prim: 'Prim', sssp: 'RELAX', bellman: 'Bellman-Ford', dag: 'DAG-SP', dijkstra: 'Dijkstra', apsp: 'คูณเมทริกซ์', floyd: 'Floyd-Warshall' };
  const hw = 66, hh = 19;
  const links = [['rep', 'bfs'], ['bfs', 'dfs', 1], ['dfs', 'topo'], ['topo', 'scc', 1], ['mst', 'kruskal'], ['kruskal', 'prim', 1], ['sssp', 'bellman'], ['bellman', 'dag', 1], ['dag', 'dijkstra', 1], ['apsp', 'floyd', 1]];
  const cross = [['topo', 'dag', 'เรียงก่อน แล้ว relax'], ['prim', 'dijkstra', 'โครงเดียวกัน'], ['bellman', 'apsp', 'รันจากทุกจุด'], ['dijkstra', 'apsp', 'รันจากทุกจุด']];
  let s = `<svg id="map" viewBox="0 0 900 370" role="img" aria-label="แผนที่ความเชื่อมโยงของหัวข้อทั้งหมด"><defs><marker id="mh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto"><path class="ah" d="M0 0L10 5L0 10z" style="stroke:none"/></marker></defs>`;
  [[90, 'ท่องกราฟ'], [320, 'MST'], [550, 'ต้นทางเดียว'], [790, 'ทุกคู่']].forEach(([x, t]) => s += `<text class="hd" x="${x}" y="20">${t}</text>`);
  s += links.map(([a, b]) => `<path d="M${P[a][0]} ${P[a][1] + hh}L${P[b][0]} ${P[b][1] - hh}" marker-end="url(#mh)"/>`).join('');
  cross.forEach(([a, b, t]) => {
    const [x1, y1] = P[a], [x2, y2] = P[b]; const sx = x1 + hw, ex = x2 - hw, mx = (sx + ex) / 2;
    s += `<path d="M${sx} ${y1}C${mx} ${y1},${mx} ${y2},${ex} ${y2}" marker-end="url(#mh)"/>`;
    s += `<text class="lb" x="${mx}" y="${(y1 + y2) / 2}">${t}</text>`;
  });
  for (const id in P) { const [x, y] = P[id]; s += `<g class="node" tabindex="0" role="link" data-go="${id}" aria-label="ไปบทเรียน ${NM[id]}"><rect x="${x - hw}" y="${y - hh}" width="${2 * hw}" height="${2 * hh}" rx="5"/><text x="${x}" y="${y}">${NM[id]}</text></g>`; }
  return s + '</svg>';
}
function medLi(k) { const m = MEDIA[k]; return `<li><a href="${m.u}" target="_blank" rel="noopener">${esc(m.t)}</a><span>${esc(m.d)}</span></li>`; }
function renderHome() {
  stop(); S.L = null; markNav('home');
  const rows = sb => {
    const list = sb.id === 'graph' ? OVERVIEW_ROWS : OVERVIEW2[sb.id];
    return `<tr class="gh"><th colspan="4">${sb.no} · ${esc(sb.title)}</th></tr>` + list.map(r => `<tr><td>${r[0]}</td><td><button class="linkb" data-go="${r[1]}">${r[2]}</button></td><td class="mono">${r[3]}</td><td class="mono">${r[4]}</td></tr>`).join('');
  };
  const total = SUBJECTS.reduce((t, x) => t + x.pages, 0);
  $('#main').innerHTML = `<div class="home">
    <p class="crumb">รวมจาก 5 เอกสาร ${total} สไลด์ · ${ALL_LESSONS.length} บทเรียน</p>
    <h1>Algorithms แบบเห็นภาพทีละขั้น</h1>
    <p class="lead">ทุกบทรันอัลกอริทึมจริงบนตัวอย่างชุดเดียวกับในสไลด์ ใช้ปุ่มถัดไปหรือลูกศรซ้ายขวาดูทีละขั้นคู่กับ pseudocode คำถาม Running time ที่ทิ้งไว้ในสไลด์มีเฉลยพร้อมที่มาในแต่ละบท</p>
    <section><h2>เลือกวิชา</h2><div class="subs">${SUBJECTS.map(sb => `<div class="subc"><p class="crumb">บท ${sb.no} · ${sb.pages} สไลด์</p><h3>${esc(sb.title)}</h3><div class="subl">${sb.L.map(l => `<button class="linkb sm" data-go="${l.id}">${esc(l.en === l.title ? l.title : l.en)}</button>`).join('')}</div></div>`).join('')}</div></section>
    <section><h2>แนวคิดที่เชื่อมข้ามบท</h2><ul class="xl">${LINKS_X.map(x => `<li><button class="linkb sm" data-go="${x[1]}">${x[0]}</button> ${x[2]} ${x[3].map(y => `<button class="linkb sm" data-go="${y[0]}">${y[1]}</button>`).join(', ')} ${x[4]}</li>`).join('')}</ul></section>
    <section><h2>โจทย์แบบนี้ ใช้อะไร</h2><div class="tw"><table class="ov"><thead><tr><th>โจทย์</th><th>อัลกอริทึม</th><th>เวลา</th><th>สไลด์</th></tr></thead><tbody>${SUBJECTS.map(rows).join('')}</tbody></table></div></section>
    <section><h2>แผนที่บท Graph</h2><figure style="margin:0"><div class="mapbox">${mapSVG()}</div><figcaption class="crumb" style="margin-top:6px">ลูกศรตรงคือลำดับเรียนในแต่ละหมวด เส้นโค้งคือแนวคิดที่ต่อยอดข้ามหมวด คลิกกล่องเพื่อเข้าบทเรียน</figcaption></figure></section>
    <section><h2>สื่อภายนอกที่แนะนำ</h2><ul class="med">${['recv', 'heapv', 'ufds', 'sortv', 'trav', 'mst', 'sssp', 'tspv', 'floyd', 'galles', 'algv', 'lcsv', 'fiset', 'mitBF', 'mitNotes', 'guru'].map(medLi).join('')}</ul></section>
  </div>`;
  window.scrollTo(0, 0);
}

/* ---------- หน้าบทเรียน ---------- */
function renderLesson(L) {
  stop(); S.L = L; S.pi = 0; S.custom = null; S.customSrc = null; S.detail = false; markNav(L.id);
  const idx = ALL_LESSONS.indexOf(L), prev = ALL_LESSONS[idx - 1], next = ALL_LESSONS[idx + 1], sb = SUB_OF[L.id];
  const wide = ['rep', 'apsp', 'floyd'].includes(L.id);
  $('#main').innerHTML = `<header class="lh"><p class="crumb">บท ${sb.no} ${esc(sb.title)}${L.ch ? ' · ' + CHAPTERS[L.ch] : ''} · สไลด์ ${L.slides}</p><h1>${esc(L.title)}</h1><p class="lead">${L.lead}</p></header>
  <div class="bench${wide ? ' wide' : ''}" id="bench">
    <div class="stage">
      <div class="presets" id="presets"></div>
      <svg id="gsvg" role="img" aria-label="ภาพกราฟของขั้นปัจจุบัน"></svg><div id="vis" class="vis"></div>
      <div class="narr" id="narr" aria-live="polite"></div>
      <div class="ctrl">
        <button class="btn" id="first" title="กลับไปขั้นแรก">เริ่มใหม่</button>
        <button class="btn" id="prev">‹ ก่อนหน้า</button>
        <button class="btn main" id="play">เล่น</button>
        <button class="btn" id="next">ถัดไป ›</button>
        <input type="range" id="rng" min="0" value="0" aria-label="เลื่อนไปยังขั้นที่ต้องการ">
        <span class="count" id="count"></span>
        <select id="speed" aria-label="ความเร็ว"><option value="1800">ช้า</option><option value="1000" selected>ปกติ</option><option value="450">เร็ว</option></select>
      </div>
      ${L.detail ? `<label class="chk" style="margin-top:8px"><input type="checkbox" id="detail"> แสดงทุกช่อง ไม่เฉพาะช่องที่ค่าเปลี่ยน</label>` : ''}
      <div class="legend" id="legend"></div>
      ${L.custom ? `<details class="cust"><summary>${L.custom.parse ? 'ลองข้อมูลของคุณเอง' : 'ลองกราฟของคุณเอง'}</summary><div class="cform">
        <label for="cg">${L.custom.parse ? L.custom.label : `${L.custom.directed ? 'Edge มีทิศ' : 'Edge ไม่มีทิศ'} บรรทัดละเส้น รูปแบบ <code>${L.custom.weighted ? 'u v น้ำหนัก' : 'u v'}</code>`}</label>
        <textarea id="cg" spellcheck="false">${esc(L.custom.sample)}</textarea>
        <div class="row">${L.custom.source ? `<label>เริ่มที่ <input id="cs" value="${esc(L.custom.sample.split(/\s+/)[0])}"></label>` : ''}<button class="btn" id="crun">รันข้อมูลนี้</button></div>
        <p class="err" id="cerr" role="alert"></p></div></details>` : ''}
    </div>
    <div class="codebox" id="code"></div>
    <div class="panels" id="panels"></div>
  </div>
  <div class="notes">
    ${L.notes.map(([h, b]) => `<section><h2>${h}</h2>${b}</section>`).join('')}
    ${L.runtime ? `<details class="rt"><summary>Running time ? กดดูเฉลย</summary><p class="big">${L.runtime.a}</p><p>${L.runtime.why}</p></details>` : ''}
    <section><h2>จุดที่มักพลาด</h2><ul class="pit">${L.pitfalls.map(p => `<li>${p}</li>`).join('')}</ul></section>
    ${L.slideNotes ? `<section class="sn"><h2>ข้อสังเกตในสไลด์</h2><ul class="pit">${L.slideNotes.map(p => `<li>${p}</li>`).join('')}</ul></section>` : ''}
    <section><h2>ลองตอบ</h2><div class="quiz" id="quiz">${L.quiz.map((q, i) => `<div data-q="${i}"><p class="qq">${i + 1}. ${q.q}</p><div class="opts">${q.o.map((o, j) => `<button class="opt" data-a="${j}">${o}</button>`).join('')}</div><p class="why" hidden></p></div>`).join('')}</div></section>
    ${L.links.length ? `<section><h2>สื่อเพิ่มเติม</h2><ul class="med">${L.links.map(medLi).join('')}</ul></section>` : ''}
  </div>
  <nav class="pn">${prev ? `<button class="btn" data-go="${prev.id}">‹ ${esc(prev.title)}</button>` : '<span></span>'}${next ? `<button class="btn" data-go="${next.id}">${esc(next.title)} ›</button>` : '<span></span>'}</nav>`;
  bindLesson(L);
  loadRun();
  window.scrollTo(0, 0);
}

function bindLesson(L) {
  $('#first').onclick = () => { stop(); setStep(0); };
  $('#prev').onclick = () => { stop(); setStep(S.i - 1); };
  $('#next').onclick = () => { stop(); setStep(S.i + 1); };
  $('#play').onclick = () => S.timer ? stop() : play();
  $('#rng').oninput = e => { stop(); setStep(+e.target.value); };
  $('#speed').onchange = e => { S.speed = +e.target.value; if (S.timer) { stop(); play(); } };
  const d = $('#detail'); if (d) d.onchange = e => { S.detail = e.target.checked; loadRun(); };
  const cr = $('#crun'); if (cr) cr.onclick = () => {
    const er = $('#cerr'); er.textContent = '';
    try {
      if (L.custom.parse) { S.custom = L.custom.parse($('#cg').value); if (L.custom.only !== undefined) S.pi = L.custom.only; loadRun(); return; }
      const def = parseCustom($('#cg').value, L.custom);
      if (L.custom.source) { const v = $('#cs').value.trim(); if (!def.nodes.some(n => n[0] === v)) throw new Error(`ไม่มี vertex ชื่อ "${v}" ในกราฟนี้`); S.customSrc = v; }
      S.custom = def; loadRun();
    } catch (ex) { er.textContent = ex.message; }
  };
  $('#quiz').onclick = e => {
    const b = e.target.closest('.opt'); if (!b) return;
    const box = b.closest('[data-q]'), q = L.quiz[+box.dataset.q], a = +b.dataset.a;
    box.querySelectorAll('.opt').forEach((x, j) => { x.classList.remove('right', 'wrong'); if (j === q.a && a === q.a) x.classList.add('right'); });
    if (a !== q.a) b.classList.add('wrong');
    const w = box.querySelector('.why'); w.hidden = false; w.textContent = (a === q.a ? 'ถูกต้อง ' : 'ยังไม่ใช่ ') + (a === q.a ? q.why : 'ลองอีกครั้ง หรือย้อนดูภาพด้านบน');
  };
}

function renderPresets() {
  const L = S.L;
  $('#presets').innerHTML = L.presets.map((p, i) => `<button class="pre" data-p="${i}" aria-pressed="${!S.custom && i === S.pi}">${p.name}</button>`).join('') + (S.custom ? `<button class="pre" aria-pressed="true">ข้อมูลของคุณ</button>` : '');
  $('#presets').onclick = e => { const b = e.target.closest('[data-p]'); if (!b) return; S.pi = +b.dataset.p; S.custom = null; S.customSrc = null; loadRun(); };
}

function loadRun() {
  stop(); S.pq = null;
  const L = S.L, P = L.presets[S.pi];
  let def = P.def, opt = { ...(P.opt || {}), detail: S.detail }, input = P.input;
  if (S.custom) {
    if (L.custom && L.custom.parse) {
      if (P.adapt) { const a = P.adapt(S.custom); def = a.def; opt = { ...opt, ...a.opt }; }
      else input = { ...(P.input || {}), ...S.custom };
    } else { def = S.custom; if (S.customSrc) opt.source = S.customSrc; }
  }
  if (def) { S.G = makeGraph(def); S.out = P.run(S.G, opt); }
  else { S.G = null; S.out = P.run(input, opt); }
  renderPresets();
  buildCode(P.procs || L.procs);
  $('#gsvg').style.display = S.G ? '' : 'none';
  $('#vis').style.display = S.G ? 'none' : '';
  if (S.G) buildGraph();
  $('#rng').max = S.out.steps.length - 1;
  buildLegend();
  setStep(0);
}

const SUBM = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', 'ᵢ': 'i', 'ⱼ': 'j', 'ₖ': 'k', 'ₙ': 'n', 'ₘ': 'm', '₊': '+', '₋': '−' };
const SUPM = { 'ᵏ': 'k', '⁺': '+', '¹': '1' };
function codeMark(t) {
  return t.replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>').replace(/_\{([^}]*)\}/g, '<sub>$1</sub>')
    .replace(/[₀₁₂₃₄₅₆₇₈₉ᵢⱼₖₙₘ₊₋]+/g, m => '<sub>' + [...m].map(c => SUBM[c]).join('') + '</sub>')
    .replace(/[ᵏ⁺¹]+/g, m => '<sup>' + [...m].map(c => SUPM[c]).join('') + '</sup>');
}
function buildCode(procs) {
  $('#bench').classList.toggle('nocode', !procs.length);
  const box = $('#code'); box.style.display = procs.length ? '' : 'none';
  box.innerHTML = procs.map((p, pi) => `<div class="proc">${esc(p.name)}</div>` + p.lines.map((t, i) => {
    const ind = t.match(/^ */)[0].length / 4;
    return `<div class="ln" data-l="${pi * 100 + i + 1}"><span class="no">${i + 1}</span><span style="padding-left:${ind * 1.15}em">${codeMark(esc(t.trim()))}</span></div>`;
  }).join('')).join('');
}

function buildLegend() {
  const P = S.L.presets[S.pi], custom = P.legend || S.L.legend;
  if (!S.G) {
    $('#legend').innerHTML = (custom || []).map(([c, t]) => `<span><i class="sw sq2" style="background:var(${LEGV[c] || '--band'})"></i>${t}</span>`).join('');
    return;
  }
  const used = new Set(), usedE = new Set();
  S.out.steps.forEach(s => { Object.values(s.n).forEach(x => used.add(x.c)); Object.values(s.e).forEach(x => usedE.add(x)); });
  const map = LEG_N[S.L.id] || {};
  let h = '';
  for (const c in map) if (used.has(c)) h += `<span><i class="sw" style="background:var(${FILL[c]})"></i>${map[c]}</span>`;
  for (const c in LEG_E) if (usedE.has(c)) h += `<span><i class="sl" style="color:var(${EDGE_VAR[c]})"></i>${LEG_E[c]}</span>`;
  $('#legend').innerHTML = h;
}

/* ---------- วาดกราฟ ---------- */
function el(n, a = {}, p) { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
const MK = ['base', 'act', 'peek', 'tree', 'cand', 'rej', 'back', 'nt', 'pa', 'pb'];
function buildGraph() {
  const G = S.G, svg = $('#gsvg'); svg.innerHTML = ''; S.nodes = {}; S.edges = {};
  svg.setAttribute('viewBox', `-14 -8 ${G.W + 28} ${G.H + 16}`);
  const defs = el('defs', {}, svg);
  MK.forEach(c => { const m = el('marker', { id: 'mk-' + c, viewBox: '0 0 10 10', refX: 5.5, refY: 5, markerWidth: 11, markerHeight: 11, markerUnits: 'userSpaceOnUse', orient: 'auto' }, defs); el('path', { d: 'M0 0L10 5L0 10z', class: 'mk-' + c }, m); });
  const size = {};
  G.ids.forEach(id => {
    let mx = 0; S.out.steps.forEach(s => { const t = G.nameIn ? id : s.n[id].t; mx = Math.max(mx, (t || '').length); });
    const w = Math.max(40, mx * 8.6 + 18); size[id] = [w, w === 40 ? 40 : 36];
  });
  const has = (a, b) => G.E.some(e => e.u === a && e.v === b);
  const eg = el('g', {}, svg), ng = el('g', {}, svg);
  G.E.forEach(e => {
    const g = geom(G, e, size, G.directed && has(e.v, e.u));
    const key = ek(G, e.u, e.v);
    const wrap = el('g', { class: 'e' }, eg);
    const path = el('path', { d: g.d }, wrap);
    let lab = null;
    if (G.weighted && !e.opt.nl) { lab = el('text', { class: 'w', x: g.lx, y: g.ly }, wrap); lab.textContent = fmt(e.w); }
    const cl = el('text', { class: 'cl', x: g.cx, y: g.cy }, wrap);
    S.edges[key] = { wrap, path, g, cl };
  });
  G.ids.forEach(id => {
    const [x, y] = G.pos[id], [w, h] = size[id];
    const g = el('g', { class: 'n', transform: `translate(${x} ${y})` }, ng);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2 }, g);
    const tin = el('text', { class: 'in', y: 0.5 }, g);
    let la = G.la[id]; if (!la) la = y < G.H / 2 ? 'a' : 'b';
    const off = { a: [0, -h / 2 - 11], b: [0, h / 2 + 12], l: [-w / 2 - 24, 0], r: [w / 2 + 24, 0], tl: [-w / 2 - 3, -h / 2 - 2] }[la];
    const tout = el('text', { class: 'out', x: off[0], y: off[1] }, g);
    S.nodes[id] = { g, tin, tout };
  });
}
function geom(G, e, size, rev) {
  const [x1, y1] = G.pos[e.u], [x2, y2] = G.pos[e.v];
  if (e.u === e.v) {
    const hw = size[e.u][0] / 2, x = x1 + hw - 3, y = y1;
    const d = `M${x} ${y - 11}C${x + 52} ${y - 42},${x + 52} ${y + 42},${x + 4} ${y + 13}`;
    return { d, dr: d, lx: x + 46, ly: y, cx: x + 40, cy: y - 18 };
  }
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const b = e.opt.b !== undefined ? e.opt.b : (rev ? 18 : 0);
  const qx = (x1 + x2) / 2 + nx * b * 2, qy = (y1 + y2) / 2 + ny * b * 2;
  const trim = (px, py, tx, ty, s, gap) => {
    const ax = tx - px, ay = ty - py, f = 1 / Math.sqrt((ax * ax) / ((s[0] / 2) ** 2) + (ay * ay) / ((s[1] / 2) ** 2));
    const l = Math.hypot(ax, ay), g = gap / l;
    return [px + ax * (f + g), py + ay * (f + g)];
  };
  const gap = G.directed ? 6 : 0;
  const p0 = trim(x1, y1, qx, qy, size[e.u], gap ? 1 : 0), p1 = trim(x2, y2, qx, qy, size[e.v], gap);
  const pr0 = trim(x2, y2, qx, qy, size[e.v], gap ? 1 : 0), pr1 = trim(x1, y1, qx, qy, size[e.u], gap);
  const f = n => n.toFixed(1);
  const d = `M${f(p0[0])} ${f(p0[1])}Q${f(qx)} ${f(qy)} ${f(p1[0])} ${f(p1[1])}`;
  const dr = `M${f(pr0[0])} ${f(pr0[1])}Q${f(qx)} ${f(qy)} ${f(pr1[0])} ${f(pr1[1])}`;
  const t = e.opt.t !== undefined ? e.opt.t : .5, u = 1 - t;
  const lx = u * u * x1 + 2 * u * t * qx + t * t * x2, ly = u * u * y1 + 2 * u * t * qy + t * t * y2;
  return { d, dr, lx, ly, cx: lx + nx * 12, cy: ly + ny * 12 };
}

/* ---------- แสดงขั้นปัจจุบัน ---------- */
function setStep(i) {
  const steps = S.out.steps; i = Math.max(0, Math.min(steps.length - 1, i));
  S.i = i; S.pq = null; const s = steps[i], G = S.G;
  if (G) {
    G.ids.forEach(id => {
      const o = S.nodes[id], st = s.n[id];
      o.g.setAttribute('class', `n ${st.c} ${st.h || ''} ${G.nameIn ? 'nameIn' : ''}`);
      o.tin.textContent = G.nameIn ? id.replace(/^[uv](\d)$/, '$1') : st.t;
      o.tout.textContent = G.nameIn ? st.t : (G.labels[id] !== undefined ? G.labels[id] : id.replace(/^([uv])\d$/, '$1'));
    });
    paintEdges(s.e, s);
  } else {
    $('#vis').innerHTML = Array.isArray(s.view) ? `<div class="vgrid">${s.view.map(panelHTML).join('')}</div>` : (s.view || '');
  }
  const set = new Set([].concat(s.line));
  document.querySelectorAll('.ln').forEach(n => n.classList.toggle('on', set.has(+n.dataset.l)));
  $('#narr').innerHTML = s.msg;
  $('#rng').value = i;
  $('#count').textContent = `${i + 1} / ${steps.length}`;
  $('#prev').disabled = i === 0; $('#next').disabled = i === steps.length - 1;
  renderPanels(s);
}
function paintEdges(map, s) {
  const G = S.G;
  G.E.forEach(e => {
    const k = ek(G, e.u, e.v), o = S.edges[k], c = map[k] || '';
    o.wrap.setAttribute('class', 'e ' + c);
    o.path.setAttribute('d', s.flip ? o.g.dr : o.g.d);
    if (G.directed) o.path.setAttribute('marker-end', `url(#mk-${c || 'base'})`);
    o.cl.textContent = s.el[k] || '';
  });
}
function renderPanels(s) {
  const box = $('#panels');
  box.innerHTML = s.panels.map(panelHTML).join('') + (S.pq ? pathBox(s) : (s.query ? `<div class="pathbox">คลิกช่องใดก็ได้ในตาราง D เพื่อให้ PRINT-ALL-PAIRS-SHORTEST-PATH แสดงเส้นทางจาก Π</div>` : ''));
  box.onclick = e => {
    const td = e.target.closest('td.click'); if (!td) return;
    S.pq = [+td.dataset.i, +td.dataset.j];
    const map = { ...s.e };
    const p = pathOf(s.Pi, s.ids, S.pq[0], S.pq[1]);
    if (p) for (let t = 0; t + 1 < p.length; t++) map[ek(S.G, s.ids[p[t]], s.ids[p[t + 1]])] = 'pa';
    paintEdges(map, s);
    renderPanels(s);
  };
}
function pathBox(s) {
  const [i, j] = S.pq, ids = s.ids, p = pathOf(s.Pi, ids, i, j);
  if (!p) return `<div class="pathbox">ไม่มีเส้นทางจาก ${ids[i]} ไป ${ids[j]} ในรอบนี้</div>`;
  return `<div class="pathbox">เส้นทาง ${ids[i]} ไป ${ids[j]}: <b class="mono">${p.map(x => ids[x]).join(' → ')}</b> น้ำหนัก <b class="mono">${fmt(s.D[i][j])}</b></div>`;
}
function panelHTML(p) {
  const h = `<h3>${p.title}</h3>`;
  if (p.type === 'html') return `<div class="panel${p.wide ? ' fullw' : ''}">${h}${p.html}</div>`;
  if (p.type === 'queue') return `<div class="panel">${h}<div class="q">${p.items.length ? p.items.map(x => `<div class="cell">${esc(x.v)}<small>${x.sub}</small></div>`).join('') : `<span class="empty">${p.empty}</span>`}</div></div>`;
  if (p.type === 'chips') return `<div class="panel">${h}<div class="chips">${p.items.length ? p.items.map(x => `<span class="chip ${x.c || ''}">${esc(x.t)}${x.sub !== undefined ? `<small>${x.sub}</small>` : ''}</span>`).join('') : `<span class="empty">${p.note || ''}</span>`}</div></div>`;
  if (p.type === 'table') return `<div class="panel">${h}<div class="tw"><table class="t"><thead><tr>${p.head.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${p.rows.map((r, i) => `<tr${i === p.hi ? ' class="hi"' : ''}>${r.map(x => `<td>${p.raw ? x : esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  if (p.type === 'matrix') return `<div class="panel">${h}<div class="tw"><table class="mx${p.small ? ' small' : ''}"><thead><tr><th></th>${p.ids.map(x => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${p.M.map((r, i) => `<tr><th>${esc(p.rowIds ? p.rowIds[i] : p.ids[i])}</th>${r.map((x, j) => `<td class="${p.cells[i + ',' + j] || ''}${p.click ? ' click' : ''}" data-i="${i}" data-j="${j}">${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  if (p.type === 'adjlist') return `<div class="panel">${h}<div class="alist">${p.rows.map(r => `<div class="${r.hi ? 'hi' : ''}"><b>${esc(r.v)}</b>→ ${r.list.length ? r.list.map(esc).join(' → ') : '/'}</div>`).join('')}</div></div>`;
  if (p.type === 'paren') {
    const W = 330, step = (W - 8) / p.total, rh = 18, depth = Math.max(0, ...p.iv.map(x => x.depth)) + 1, H = Math.max(depth, 2) * rh + 18;
    let s = `<svg class="pbar" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="ช่วงเวลาของแต่ละ vertex">`;
    p.iv.forEach(x => { const a = 4 + (x.d - 1) * step, b = 4 + ((x.f || p.total) - 1) * step + step, y = x.depth * rh + 1; s += `<rect class="${x.f ? '' : 'open'}" x="${a}" y="${y}" width="${b - a}" height="${rh - 3}" rx="2"/><text x="${(a + b) / 2}" y="${y + (rh - 3) / 2}">${esc(x.v)}</text>`; });
    for (let t = 1; t <= p.total; t++) s += `<text class="tick" x="${4 + (t - .5) * step}" y="${H - 5}">${t}</text>`;
    return `<div class="panel">${h}${s}</svg><div class="parent tw">${esc(p.text) || '&nbsp;'}</div></div>`;
  }
  if (p.type === 'linear') {
    let x = 6; const X = {}, Wd = {};
    p.order.forEach(v => { const w = Math.max(26, v.length * 7.4 + 12); X[v] = x + w / 2; Wd[v] = w; x += w + 12; });
    const y = 84;
    const arcs = p.edges.map(([a, b]) => { const h = Math.min(66, 14 + Math.abs(X[b] - X[a]) * .16), mx = (X[a] + X[b]) / 2; return `<path d="M${X[a]} ${y - 11}Q${mx} ${y - 11 - h * 2} ${X[b]} ${y - 12}" marker-end="url(#mk-tree)"/>`; }).join('');
    const nodes = p.order.map(v => `<rect x="${X[v] - Wd[v] / 2}" y="${y - 11}" width="${Wd[v]}" height="22" rx="11"/><text x="${X[v]}" y="${y}">${esc(v)}</text>`).join('');
    return `<div class="panel" style="grid-column:1/-1">${h}<div class="tw"><svg class="lin" viewBox="0 0 ${x} 104" style="min-width:${Math.min(x, 460)}px;width:100%;height:auto" role="img" aria-label="${esc(p.title)}">${arcs}${nodes}</svg></div></div>`;
  }
  return '';
}

function play() {
  if (S.i >= S.out.steps.length - 1) setStep(0);
  $('#play').textContent = 'หยุด';
  S.timer = setInterval(() => { if (S.i >= S.out.steps.length - 1) { stop(); return; } setStep(S.i + 1); }, S.speed);
}
function stop() { if (S.timer) { clearInterval(S.timer); S.timer = null; } const b = $('#play'); if (b) b.textContent = 'เล่น'; }

function route() {
  const id = (location.hash || '').slice(1);
  const L = ALL_LESSONS.find(x => x.id === id);
  if (L) renderLesson(L); else renderHome();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go]'); if (!b) return;
  e.preventDefault();
  const id = b.dataset.go;
  if ((location.hash || '').slice(1) === id) route(); else location.hash = id;
});
document.addEventListener('keydown', e => {
  const t = e.target, tag = t.tagName;
  if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return;
  if (e.target.matches && e.target.matches('.node') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); location.hash = e.target.dataset.go; return; }
  if (!S.L) return;
  if (e.key === 'ArrowRight') { stop(); setStep(S.i + 1); e.preventDefault(); }
  else if (e.key === 'ArrowLeft') { stop(); setStep(S.i - 1); e.preventDefault(); }
  else if (e.key === ' ' && tag !== 'BUTTON') { S.timer ? stop() : play(); e.preventDefault(); }
});
window.addEventListener('hashchange', route);
nav(); route();
