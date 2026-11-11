/* ===== กราฟตัวอย่างจากสไลด์ และเนื้อหาบทเรียน ===== */
const m = s => `<span class="m">${s}</span>`;

const GD = {
  repU: { nameIn: true, W: 420, H: 270, nodes: [['1', 70, 60], ['2', 230, 60], ['3', 350, 135], ['4', 230, 210], ['5', 70, 210]],
    edges: [['1', '2'], ['1', '5'], ['2', '5'], ['2', '3'], ['2', '4'], ['3', '4'], ['4', '5']],
    adj: { 1: ['2', '5'], 2: ['1', '5', '3', '4'], 3: ['2', '4'], 4: ['2', '5', '3'], 5: ['4', '1', '2'] } },
  repD: { nameIn: true, directed: true, W: 440, H: 270, nodes: [['1', 60, 60], ['2', 200, 60], ['3', 340, 60], ['4', 60, 210], ['5', 200, 210], ['6', 340, 210]],
    edges: [['1', '2'], ['1', '4'], ['2', '5'], ['3', '6'], ['3', '5'], ['4', '2'], ['5', '4'], ['6', '6']] },
  bfs: { W: 480, H: 280, nodes: [['r', 60, 75], ['s', 180, 75], ['t', 300, 75], ['u', 420, 75], ['v', 60, 205], ['w', 180, 205], ['x', 300, 205], ['y', 420, 205]],
    edges: [['r', 's'], ['s', 'w'], ['r', 'v'], ['w', 't'], ['w', 'x'], ['t', 'x'], ['t', 'u'], ['x', 'u'], ['x', 'y'], ['u', 'y']],
    adj: { s: ['w', 'r'], w: ['s', 't', 'x'], r: ['s', 'v'], t: ['w', 'x', 'u'], x: ['w', 't', 'u', 'y'], v: ['r'], u: ['t', 'x', 'y'], y: ['x', 'u'] } },
  dfs13: { directed: true, W: 520, H: 290, nodes: [['u', 70, 75], ['v', 230, 75], ['w', 390, 75], ['x', 70, 215], ['y', 230, 215], ['z', 390, 215]],
    edges: [['u', 'v'], ['u', 'x'], ['v', 'y'], ['w', 'y'], ['w', 'z'], ['x', 'v'], ['y', 'x'], ['z', 'z']] },
  dfs15: { directed: true, W: 610, H: 280, nodes: [['s', 370, 75], ['z', 220, 75], ['y', 70, 75], ['x', 70, 215], ['w', 220, 215], ['t', 520, 75], ['v', 370, 215], ['u', 520, 215]],
    edges: [['s', 'z'], ['s', 'w'], ['z', 'y'], ['z', 'w'], ['y', 'x'], ['x', 'z'], ['w', 'x'], ['t', 'v'], ['t', 'u'], ['v', 's'], ['v', 'w'], ['u', 't'], ['u', 'v']] },
  topo: { directed: true, nameIn: true, W: 680, H: 340, order: ['shirt', 'tie', 'jacket', 'belt', 'watch', 'undershorts', 'pants', 'shoes', 'socks'],
    nodes: [['undershorts', 140, 40, 'l'], ['pants', 140, 115, 'l'], ['belt', 150, 190, 'l'], ['shirt', 320, 155, 'r'], ['tie', 320, 225, 'r'], ['jacket', 320, 300, 'r'], ['socks', 480, 40, 'r'], ['shoes', 480, 115, 'r'], ['watch', 600, 200, 'b']],
    edges: [['undershorts', 'pants'], ['undershorts', 'shoes'], ['pants', 'shoes'], ['pants', 'belt'], ['belt', 'jacket'], ['shirt', 'tie'], ['shirt', 'belt'], ['tie', 'jacket'], ['socks', 'shoes']] },
  scc: { directed: true, W: 640, H: 290, order: ['c', 'g', 'f', 'h', 'd', 'b', 'e', 'a'], nodes: [['a', 70, 75], ['b', 220, 75], ['c', 370, 75], ['d', 520, 75], ['e', 70, 215], ['f', 220, 215], ['g', 370, 215], ['h', 520, 215]],
    edges: [['a', 'b'], ['b', 'e'], ['b', 'c'], ['b', 'f'], ['c', 'g'], ['c', 'd'], ['d', 'c'], ['d', 'h'], ['e', 'a'], ['e', 'f'], ['f', 'g'], ['g', 'f'], ['g', 'h'], ['h', 'h']],
    adj: { c: ['g', 'd'], g: ['f', 'h'], d: ['c', 'h'], b: ['e', 'c', 'f'], e: ['a', 'f'] } },
  sssp37: { directed: true, weighted: true, W: 800, H: 345, nodes: [['s', 60, 170], ['a', 200, 70], ['b', 340, 70], ['c', 200, 170], ['d', 340, 170], ['e', 200, 280], ['f', 340, 280], ['g', 480, 170], ['h', 610, 95], ['i', 750, 95], ['j', 680, 225]],
    edges: [['s', 'a', 3], ['a', 'b', -4], ['b', 'g', 4], ['s', 'c', 5], ['c', 'd', 6], ['d', 'c', -3], ['d', 'g', 8], ['s', 'e', 2], ['e', 'f', 3], ['f', 'e', -6], ['f', 'g', 7], ['h', 'i', 2], ['i', 'j', 3], ['j', 'h', -8]] },
  relax: { directed: true, weighted: true, W: 340, H: 240, nodes: [['u1', 70, 65], ['v1', 270, 65], ['u2', 70, 185], ['v2', 270, 185]], edges: [['u1', 'v1', 2], ['u2', 'v2', 2]] },
  bf: { directed: true, weighted: true, W: 480, H: 300, nodes: [['s', 60, 150], ['t', 220, 55], ['x', 400, 55], ['y', 220, 245], ['z', 400, 245]],
    edges: [['t', 'x', 5], ['t', 'y', 8, { t: .3 }], ['t', 'z', -4, { t: .74 }], ['x', 't', -2], ['y', 'x', -3, { t: .74 }], ['y', 'z', 9], ['z', 'x', 7], ['z', 's', 2, { t: .3 }], ['s', 't', 6], ['s', 'y', 7]] },
  bfNeg: { directed: true, weighted: true, W: 560, H: 200, nodes: [['s', 60, 100], ['e', 200, 100], ['f', 360, 100], ['g', 500, 100]], edges: [['s', 'e', 2], ['e', 'f', 3], ['f', 'e', -6], ['f', 'g', 7]] },
  dag: { directed: true, weighted: true, W: 610, H: 230, nodes: [['r', 55, 112], ['s', 155, 112], ['t', 255, 112], ['x', 355, 112], ['y', 455, 112], ['z', 555, 112]],
    edges: [['r', 's', 5], ['r', 't', 3, { b: 38 }], ['s', 't', 2], ['s', 'x', 6, { b: -44 }], ['t', 'x', 7], ['t', 'y', 4, { b: 38 }], ['t', 'z', 2, { b: 76 }], ['x', 'y', -1], ['x', 'z', 1, { b: -44 }], ['y', 'z', -2]] },
  dij: { directed: true, weighted: true, W: 480, H: 300, nodes: [['s', 60, 150], ['t', 220, 55], ['x', 400, 55], ['y', 220, 245], ['z', 400, 245]],
    edges: [['s', 't', 10], ['s', 'y', 5], ['t', 'x', 1], ['t', 'y', 2], ['y', 't', 3], ['y', 'x', 9, { t: .4 }], ['y', 'z', 2], ['x', 'z', 4], ['z', 'x', 6], ['z', 's', 7, { t: .3 }]] },
  dijNeg: { directed: true, weighted: true, W: 480, H: 250, nodes: [['s', 60, 125], ['a', 240, 60], ['b', 240, 195], ['t', 420, 60]], edges: [['s', 'a', 2], ['s', 'b', 4], ['b', 'a', -3], ['a', 't', 1]] },
  apsp: { directed: true, weighted: true, nameIn: true, W: 430, H: 270, nodes: [['1', 70, 95], ['2', 215, 35], ['3', 360, 95], ['4', 300, 230], ['5', 130, 230]],
    edges: [['1', '2', 3], ['1', '3', 8, { t: .68 }], ['1', '5', -4], ['2', '4', 1, { t: .72 }], ['2', '5', 7, { t: .72 }], ['3', '2', 4], ['4', '1', 2, { t: .68 }], ['4', '3', -5], ['5', '4', 6]] },
};
const mstDef = nameIn => ({ nameIn, weighted: true, W: 590, H: 305, nodes: [['a', 50, 150], ['b', 150, 60], ['c', 295, 60], ['d', 440, 60], ['e', 540, 150], ['f', 440, 245], ['g', 295, 245], ['h', 150, 245], ['i', 240, 150]],
  edges: [['a', 'b', 4], ['a', 'h', 8], ['b', 'c', 8], ['b', 'h', 11], ['c', 'd', 7], ['c', 'f', 4, { t: .62 }], ['c', 'i', 2], ['d', 'e', 9], ['d', 'f', 14], ['e', 'f', 10], ['f', 'g', 2], ['g', 'h', 1], ['g', 'i', 6], ['h', 'i', 7]] });
GD.bf.edgeOrder = [['t', 'x'], ['t', 'y'], ['t', 'z'], ['x', 't'], ['y', 'x'], ['y', 'z'], ['z', 'x'], ['z', 's'], ['s', 't'], ['s', 'y']];

const MEDIA = {
  trav: { t: 'VisuAlgo: Graph Traversal', u: 'https://visualgo.net/en/dfsbfs', d: 'วาดกราฟเองแล้วรัน BFS, DFS, Topological Sort และ SCC ได้ เหมาะใช้ตรวจการบ้าน' },
  mst: { t: 'VisuAlgo: Minimum Spanning Tree', u: 'https://visualgo.net/en/mst', d: 'เทียบ Kruskal กับ Prim บนกราฟเดียวกัน' },
  sssp: { t: 'VisuAlgo: Single-Source Shortest Paths', u: 'https://visualgo.net/en/sssp', d: 'Bellman-Ford, Dijkstra และ SSSP บน DAG พร้อมตัวอย่างที่ Dijkstra พลาด' },
  galles: { t: 'USFCA Data Structure Visualizations', u: 'https://www.cs.usfca.edu/~galles/visualization/Algorithms.html', d: 'ของ David Galles มีทั้ง BFS, DFS, Topological Sort, Prim, Kruskal, Dijkstra' },
  floyd: { t: 'USFCA: Floyd-Warshall', u: 'https://www.cs.usfca.edu/~galles/visualization/Floyd.html', d: 'ดูตารางค่อย ๆ เปลี่ยนในรูปแบบอื่น' },
  mitBF: { t: 'MIT 6.006 Lecture 12: Bellman-Ford (วิดีโอ)', u: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-12-bellman-ford/', d: 'บรรยายเต็ม ครอบคลุมขั้นตอน ความถูกต้อง และเวลาทำงาน' },
  mitNotes: { t: 'MIT 6.006 Lecture notes', u: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/lecture-notes', d: 'มี Dijkstra, Bellman-Ford และ All-pairs ในรูป PDF' },
  fiset: { t: 'WilliamFiset: Graph Theory playlist', u: 'https://classcentral.com/classroom/youtube-graph-theory-playlist-49636/60f0f284945d4', d: 'วิดีโอแบบแอนิเมชันรวมหลายสิบตอน มี Bellman-Ford และ Floyd-Warshall' },
  guru: { t: 'BFS พร้อมตัวอย่าง (ภาษาไทย)', u: 'https://www.guru99.com/th/breadth-first-search-bfs-graph-example.html', d: 'อ่านทบทวน BFS เป็นภาษาไทย' },
};

const CHAPTERS = { 1: 'การแทนกราฟและการท่องกราฟ', 2: 'Minimum spanning tree', 3: 'Single-source shortest paths', 4: 'All-pairs shortest paths' };

const INIT_SS = { name: 'INITIALIZE-SINGLE-SOURCE(G, s)', lines: ['for each vertex v ∈ G.V', '    v.d = ∞', '    v.π = NIL', 's.d = 0'] };

const LESSONS = [
{
  id: 'rep', ch: 1, title: 'การแทนกราฟ', en: 'Graph representations', slides: '3–5',
  lead: 'กราฟ G = (V, E) เก็บในคอมพิวเตอร์ได้สองแบบหลัก เลือกผิดแล้วเวลาทำงานของทุกอัลกอริทึมเปลี่ยนตาม',
  procs: [],
  presets: [
    { name: 'ไม่มีทิศ (สไลด์ 5 บน)', def: GD.repU, run: runRep },
    { name: 'มีทิศ (สไลด์ 5 ล่าง)', def: GD.repD, run: runRep },
  ],
  notes: [
    ['Adjacency list', `<p>อาร์เรย์ขนาด |V| โดย ${m('Adj[u]')} เก็บทุก ${m('v')} ที่มี edge ${m('(u, v)')} เหมาะกับกราฟ <b>sparse</b> ที่ |E| น้อยกว่า |V|² มาก ถ้ามีน้ำหนักก็เก็บ ${m('w(u, v)')} ไว้คู่กับ ${m('v')}</p><p>ผลรวมความยาวทุก list เท่ากับ |E| ในกราฟมีทิศ และ 2|E| ในกราฟไม่มีทิศ เพราะ edge เดียวปรากฏในสอง list</p>`],
    ['Adjacency matrix', `<p>เมทริกซ์ |V|×|V| โดย ${m('a(i, j) = 1')} เมื่อ ${m('(i, j) ∈ E')} เหมาะกับกราฟ <b>dense</b> ที่ |E| ใกล้ |V|² ถ้ามีน้ำหนักให้เก็บ ${m('w(u, v)')} ในแถว ${m('u')} คอลัมน์ ${m('v')} กราฟไม่มีทิศจะได้เมทริกซ์สมมาตร</p>`],
    ['เทียบกันตรง ๆ', `<div class="tw"><table class="cmp"><thead><tr><th>คำถาม</th><th>List</th><th>Matrix</th></tr></thead><tbody>
      <tr><td>พื้นที่</td><td>Θ(V + E)</td><td>Θ(V²)</td></tr><tr><td>มี edge (u, v) ไหม</td><td>O(degree(u))</td><td>O(1)</td></tr><tr><td>ไล่เพื่อนบ้านของ u</td><td>Θ(degree(u))</td><td>Θ(V)</td></tr><tr><td>ไล่ทุก edge</td><td>Θ(V + E)</td><td>Θ(V²)</td></tr></tbody></table></div>
      <p>แถว "ไล่เพื่อนบ้าน" คือเหตุผลที่ BFS และ DFS ได้ O(V + E) เมื่อใช้ list แต่กลายเป็น O(V²) เมื่อใช้ matrix</p>`],
  ],
  pitfalls: ['กราฟไม่มีทิศ รวมความยาว list ได้ 2|E| ไม่ใช่ |E|', 'Self-loop อย่าง (6, 6) ก็นับเป็น edge เก็บในแนวทแยงของ matrix'],
  quiz: [
    { q: 'กราฟไม่มีทิศในสไลด์ 5 มี 7 edge ความยาวรวมของทุก adjacency list เท่าไร', o: ['7', '14', '25'], a: 1, why: '2 + 4 + 2 + 3 + 3 = 14 = 2|E|' },
    { q: 'กราฟถนนมี 100,000 จุด แต่ละจุดเชื่อมไม่เกิน 4 เส้น ควรเก็บแบบไหน', o: ['Adjacency list', 'Adjacency matrix'], a: 0, why: 'E ≤ 2×10⁵ เป็น sparse matrix จะใช้ถึง 10¹⁰ ช่อง' },
  ],
  links: ['trav'],
},
{
  id: 'bfs', ch: 1, title: 'Breadth-first search', en: 'BFS', slides: '6–9',
  lead: 'เดินจากจุดเริ่ม s ออกไปทีละชั้นเหมือนคลื่นน้ำ ใครอยู่ห่าง k edge จะถูกค้นพบก่อนคนที่ห่าง k+1',
  procs: [{ name: 'BFS(G, s)', lines: ['for each vertex u ∈ G.V − {s}', '    u.color = WHITE', '    u.d = ∞', '    u.π = NIL', 's.color = GRAY', 's.d = 0', 's.π = NIL', 'Q = ∅', 'ENQUEUE(Q, s)', 'while Q ≠ ∅', '    u = DEQUEUE(Q)', '    for each v ∈ G.Adj[u]', '        if v.color == WHITE', '            v.color = GRAY', '            v.d = u.d + 1', '            v.π = u', '            ENQUEUE(Q, v)', '    u.color = BLACK'] }],
  presets: [{ name: 'กราฟในสไลด์ 8', def: GD.bfs, run: runBFS, opt: { source: 's' } }],
  custom: { directed: false, weighted: false, source: true, sample: 'a b\na c\nb d\nc d\nd e' },
  notes: [
    ['สามสีบอกอะไร', `<p><b>ขาว</b> ยังไม่เคยเจอ <b>เทา</b> เจอแล้วและรออยู่ในคิว <b>ดำ</b> ไล่เพื่อนบ้านครบแล้ว สีเทาคือเส้นแบ่งระหว่างส่วนที่รู้กับส่วนที่ยังไม่รู้</p>`],
    ['ทำไม d ถึงเป็นระยะสั้นสุด', `<p>คิวเป็น FIFO ค่า d ในคิวจึงเรียงไม่ลดลงและต่างกันไม่เกิน 1 ทุก vertex ที่ระยะ k ออกจากคิวก่อนทุก vertex ที่ระยะ k+1 เมื่อเจอ ${m('v')} ครั้งแรกจึงเป็นทางที่ใช้ edge น้อยที่สุดเสมอ</p>`],
    ['ผลพลอยได้: breadth-first tree', `<p>ค่า ${m('π')} ประกอบเป็น ${m('G<sub>π</sub> = (V<sub>π</sub>, E<sub>π</sub>)')} โดย ${m('V<sub>π</sub> = {v : v.π ≠ NIL} ∪ {s}')} ตามสไลด์ 9 เส้นหนาในภาพคือ tree edges และการย้อน π จาก ${m('v')} ถึง ${m('s')} ให้เส้นทางสั้นสุด</p>`],
  ],
  runtime: { a: 'O(V + E)', why: 'การกำหนดค่าเริ่มต้น O(V) แต่ละ vertex เข้าและออกคิวไม่เกินครั้งเดียวเพราะเฝ้าด้วยสี รวม O(V) และแต่ละ adjacency list ถูกไล่ตอน dequeue ครั้งเดียว ผลรวมความยาวคือ Θ(E) ถ้าเก็บด้วย matrix จะเป็น O(V²)' },
  pitfalls: ['ต้องทำเป็นเทาตอน enqueue ไม่ใช่ตอน dequeue ไม่งั้น vertex เข้าคิวซ้ำได้', 'd นับจำนวน edge ใช้กับกราฟที่น้ำหนักไม่เท่ากันไม่ได้', 'ลำดับใน Adj ทำให้ tree เปลี่ยนได้ แต่ค่า d ไม่เปลี่ยน'],
  quiz: [
    { q: 'ในสไลด์ 8 หลัง dequeue w และไล่เพื่อนบ้านครบ คิวเป็นอะไร', o: ['r t x', 't x r', 'r t x v'], a: 0, why: 'ก่อนหน้าคิวคือ w r เอา w ออกเหลือ r แล้วเติม t และ x ต่อท้าย' },
    { q: 'y.d ในตัวอย่างนี้เท่าไร', o: ['2', '3', '4'], a: 1, why: 's→w→x→y ใช้ 3 edge' },
  ],
  links: ['trav', 'guru', 'galles'],
},
{
  id: 'dfs', ch: 1, title: 'Depth-first search', en: 'DFS', slides: '10–16',
  lead: 'ลงลึกที่สุดก่อน ตันแล้วค่อยย้อน ผลลัพธ์สำคัญคือ timestamp สองค่าที่ใช้ต่อยอดเป็น topological sort และ SCC',
  procs: [
    { name: 'DFS(G)', lines: ['for each vertex u ∈ G.V', '    u.color = WHITE', '    u.π = NIL', 'time = 0', 'for each vertex u ∈ G.V', '    if u.color == WHITE', '        DFS-VISIT(G, u)'] },
    { name: 'DFS-VISIT(G, u)', lines: ['time = time + 1', 'u.d = time', 'u.color = GRAY', 'for each v ∈ G.Adj[u]', '    if v.color == WHITE', '        v.π = u', '        DFS-VISIT(G, v)', 'u.color = BLACK', 'time = time + 1', 'u.f = time'] },
  ],
  presets: [{ name: 'กราฟในสไลด์ 13', def: GD.dfs13, run: runDFS }, { name: 'กราฟในสไลด์ 15', def: GD.dfs15, run: runDFS }],
  custom: { directed: true, weighted: false, sample: 'a b\nb c\nc a\nb d\nd e' },
  notes: [
    ['Timestamp', `<p>${m('v.d')} คือเวลาที่ค้นพบ (เปลี่ยนเป็นเทา) ${m('v.f')} คือเวลาที่ไล่ Adj ครบ (เปลี่ยนเป็นดำ) ค่า time เพิ่มทีละ 1 ทั้งสองจังหวะ จึงมีค่าตั้งแต่ 1 ถึง 2|V| และ ${m('v.d &lt; v.f')} เสมอ</p>`],
    ['Parenthesis structure', `<p>เขียน <code>(u</code> ตอนค้นพบ และ <code>u)</code> ตอนเสร็จ แล้ววงเล็บจะจับคู่ถูกต้องเสมอ ช่วงเวลาของสอง vertex จึงมีได้แค่สองแบบ คือ <b>แยกจากกันเด็ดขาด</b> หรือ <b>ซ้อนอยู่ข้างในทั้งช่วง</b> ไม่มีทางเกยกันครึ่ง ๆ แถบในแผง Parenthesis คือภาพเดียวกับสไลด์ 15</p><p>${m('v')} เป็นลูกหลานของ ${m('u')} ก็ต่อเมื่อ ${m('u.d &lt; v.d &lt; v.f &lt; u.f')}</p>`],
    ['จำแนก edge จากสีของ v ตอนสำรวจ (u, v)', `<div class="tw"><table class="cmp"><thead><tr><th>สีของ v</th><th>ประเภท</th><th>ความหมาย</th></tr></thead><tbody><tr><td>ขาว</td><td><b>T</b> Tree</td><td>ค้นพบ v ผ่าน edge นี้</td></tr><tr><td>เทา</td><td><b>B</b> Back</td><td>ชี้กลับหา ancestor รวม self-loop</td></tr><tr><td>ดำ และ u.d &lt; v.d</td><td><b>F</b> Forward</td><td>ชี้ลงหา descendant ที่ไม่ใช่ tree edge</td></tr><tr><td>ดำ และ u.d &gt; v.d</td><td><b>C</b> Cross</td><td>ที่เหลือทั้งหมด</td></tr></tbody></table></div><p>กราฟมีวงจรก็ต่อเมื่อ DFS เจอ back edge ข้อนี้คือฐานของ topological sort</p>`],
  ],
  runtime: { a: 'Θ(V + E)', why: 'ลูปหลักใน DFS ใช้ Θ(V) DFS-VISIT ถูกเรียกครั้งเดียวต่อ vertex เพราะเรียกเฉพาะตัวที่ขาว และลูปในมันรวมทั้งหมดเท่ากับผลรวมความยาว Adj คือ Θ(E)' },
  pitfalls: ['Forward กับ Cross ดำทั้งคู่ ต้องเทียบค่า d', 'DFS ได้ forest ได้หลายต้น เพราะเริ่มใหม่จาก vertex ขาวที่เหลือ', 'กราฟไม่มีทิศจะมีแค่ tree edge กับ back edge'],
  quiz: [
    { q: 'ในสไลด์ 13 ค่า d/f ของ w คือ', o: ['9/12', '10/11', '2/7'], a: 0, why: 'หลังต้นแรกจบที่ time = 8 w เป็นรากใหม่ที่ 9 เสร็จหลัง z ที่ 12' },
    { q: 'u มีช่วง [3, 6] และ v มีช่วง [5, 9] เป็นไปได้หรือไม่', o: ['เป็นไปได้ v เป็นลูกของ u', 'เป็นไปไม่ได้ เพราะช่วงเกยกัน'], a: 1, why: 'ตาม parenthesis structure ช่วงต้องแยกกันหรือซ้อนกันทั้งหมด' },
    { q: 'สำรวจ (u, v) แล้ว v เป็นสีดำ และ u.d > v.d แปลว่า', o: ['Forward', 'Back', 'Cross'], a: 2, why: 'v จบไปก่อน u จะถูกค้นพบ จึงไม่ใช่ลูกหลาน' },
  ],
  links: ['trav', 'galles'],
},
{
  id: 'topo', ch: 1, title: 'Topological sorting', en: 'Topological sort', slides: '17–18',
  lead: 'เรียงทุก vertex ของ DAG เป็นเส้นตรงให้ทุก edge ชี้ไปข้างหน้า ตัวอย่างในสไลด์คือลำดับการแต่งตัว',
  procs: [{ name: 'TOPOLOGICAL-SORT(G)', lines: ['call DFS(G) to compute finishing times v.f for each vertex v', 'as each vertex is finished, insert it onto the front of a linked list', 'return the linked list of vertices'] }],
  presets: [{ name: 'การแต่งตัว (สไลด์ 18)', def: GD.topo, run: runTopo }],
  custom: { directed: true, weighted: false, sample: 'a b\na c\nb d\nc d\nd e' },
  notes: [
    ['แนวคิด', `<p>ผลลัพธ์คือการเรียงตาม ${m('f')} จากมากไปน้อย เพราะแทรกที่หัว list ทุกครั้งที่ vertex เสร็จ ตัวที่เสร็จทีหลังจึงอยู่หน้า ไม่ต้องเรียงลำดับเพิ่ม</p>`],
    ['ทำไมถูก', `<p>ดู edge ${m('(u, v)')} ตอนที่ถูกสำรวจ ${m('v')} เป็นเทาไม่ได้เพราะจะเป็น back edge ซึ่ง DAG ไม่มี ถ้า ${m('v')} ขาวมันจะเป็นลูกหลานและเสร็จก่อน ${m('u')} ถ้าดำก็เสร็จไปแล้ว ทั้งสองกรณีได้ ${m('v.f &lt; u.f')} ดังนั้น ${m('u')} อยู่หน้า ${m('v')} ทุกครั้ง</p>`],
  ],
  runtime: { a: 'Θ(V + E)', why: 'DFS ใช้ Θ(V + E) และการแทรกหัว list ใช้ O(1) ต่อ vertex รวม O(V)' },
  pitfalls: ['ใช้ได้กับ DAG เท่านั้น เจอ back edge แปลว่าไม่มีคำตอบ', 'คำตอบไม่จำเป็นต้องมีแบบเดียว', 'อย่าเรียงตาม f หลัง DFS จบ จะเสีย O(V lg V) โดยไม่จำเป็น'],
  quiz: [
    { q: 'ในสไลด์ 18 ของชิ้นแรกในลำดับคืออะไร', o: ['undershorts', 'socks', 'shirt'], a: 1, why: 'socks มี f = 18 มากที่สุด' },
    { q: 'DFS บนกราฟหนึ่งพบ back edge สรุปได้ว่า', o: ['กราฟมีวงจร จึงไม่มี topological order', 'ต้องรัน DFS ใหม่จากจุดอื่น', 'ลำดับยังใช้ได้แต่ไม่เดียว'], a: 0, why: 'back edge กับวงจรเป็นเงื่อนไขที่เทียบเท่ากัน' },
  ],
  links: ['trav', 'galles'],
},
{
  id: 'scc', ch: 1, title: 'Strongly connected components', en: 'SCC', slides: '19–21',
  lead: 'แบ่งกราฟมีทิศเป็นกลุ่มที่เดินถึงกันได้ไปกลับ ใช้ DFS สองรอบ รอบสองเดินบนกราฟกลับทิศ',
  procs: [{ name: 'STRONGLY-CONNECTED-COMPONENTS(G)', lines: ['call DFS(G) to compute finishing times u.f for each vertex u', 'compute G^{T}', 'call DFS(G^{T}), but in the main loop consider the vertices in order of decreasing u.f', 'output the vertices of each tree in the depth-first forest formed in line 3 as a separate SCC'] }],
  presets: [{ name: 'กราฟในสไลด์ 21', def: GD.scc, run: runSCC }],
  custom: { directed: true, weighted: false, sample: 'a b\nb c\nc a\nc d\nd e\ne d' },
  notes: [
    ['นิยาม', `<p>SCC คือเซต ${m('C ⊆ V')} ที่ทุกคู่ ${m('u, v')} เดินถึงกันได้ทั้งไปและกลับ สไลด์ 19 ไม่ได้เขียนคำว่า <b>maximal</b> แต่ตำรา CLRS มี ต้องเป็นเซตที่ใหญ่สุดแล้ว ไม่งั้น vertex เดี่ยวทุกตัวจะนับเป็น SCC ไปหมด</p>`],
    ['ทำไมต้องกลับทิศ', `<p>${m('G')} กับ ${m('G<sup>T</sup>')} มี SCC ชุดเดียวกัน ถ้ายุบแต่ละ SCC เป็นจุดเดียวจะได้ DAG เช่น abe → cd → fg → h ในสไลด์ 21</p><p>Vertex ที่ ${m('f')} มากสุดอยู่ใน SCC ต้นทางของ DAG นั้น พอกลับทิศ SCC นี้จะไม่มีทางออกไปหา SCC อื่น DFS จึงเดินวนอยู่ในกลุ่มตัวเองแล้วหยุด จากนั้นตัดกลุ่มนี้ออกและทำซ้ำกับ ${m('f')} สูงสุดที่เหลือ</p>`],
  ],
  runtime: { a: 'Θ(V + E)', why: 'DFS สองครั้งครั้งละ Θ(V + E) สร้าง G<sup>T</sup> จาก adjacency list ใช้ Θ(V + E) และลำดับ f ได้ฟรีจากการแทรกหัว list ตอน vertex เสร็จ' },
  pitfalls: ['DFS รอบสองต้องทำบน G<sup>T</sup> และวนตาม f ลดลง ขาดข้อใดข้อหนึ่งคำตอบผิด', 'Vertex เดี่ยวที่ไม่อยู่ในวงจรใดก็เป็น SCC ขนาด 1'],
  quiz: [
    { q: 'กราฟในสไลด์ 21 มี SCC กี่กลุ่ม', o: ['3', '4', '5'], a: 1, why: '{a,b,e}, {c,d}, {f,g}, {h}' },
    { q: 'DFS รอบสองเริ่มที่ vertex ใดในตัวอย่างนี้', o: ['c เพราะ d น้อยสุด', 'b เพราะ f = 16 มากสุด', 'a เพราะมาก่อนตามตัวอักษร'], a: 1, why: 'ลูปหลักวนตาม f จากมากไปน้อย' },
  ],
  links: ['trav', 'fiset'],
},
{
  id: 'mst', ch: 2, title: 'แนวคิด MST และ safe edge', en: 'Generic MST', slides: '22–25',
  lead: 'หาชุด edge ที่เชื่อมทุก vertex ด้วยน้ำหนักรวมน้อยสุด Kruskal กับ Prim เป็นวิธีต่างกันในการตอบบรรทัดที่ 3',
  procs: [{ name: 'GENERIC-MST(G, w)', lines: ['A = ∅', 'while A does not form a spanning tree', '    find an edge (u, v) that is safe for A', '    A = A ∪ {(u, v)}', 'return A'] }],
  presets: [{ name: 'ดู cut ทีละแบบ (กราฟสไลด์ 23)', def: mstDef(true), run: runCuts }],
  notes: [
    ['โจทย์', `<p>กราฟไม่มีทิศ เชื่อมต่อกัน มีน้ำหนัก ต้องการ ${m('T ⊆ E')} ที่ไม่มีวงจร เชื่อมทุก vertex และ ${m('w(T) = Σ w(u, v)')} น้อยสุด ${m('T')} มีเสมอ |V| − 1 edge งานที่ใช้จริงคือออกแบบวงจรและวางเครือข่าย</p>`],
    ['ทำไมบรรทัด 3 สำคัญ', `<p><b>Safe edge</b> คือ edge ที่เพิ่มเข้า ${m('A')} แล้ว ${m('A')} ยังเป็นส่วนหนึ่งของ MST สักต้น ถ้าเพิ่มแต่ safe edge ก็รับรองได้ว่าตอนจบได้ MST</p><p>วิธีหา safe edge คือ แบ่ง vertex เป็นสองฝั่ง (cut) โดยไม่มี edge ของ ${m('A')} ข้ามฝั่ง แล้วเลือก edge <b>เบาที่สุด</b>ที่ข้ามฝั่ง (light edge) ทฤษฎีบทรับรองว่า light edge นี้ safe</p><p>ภาพด้านบน เส้นประคือ edge ที่ข้าม cut และเส้นส้มคือ light edge</p>`],
    ['Kruskal ต่างจาก Prim ตรงไหน', `<div class="tw"><table class="cmp"><thead><tr><th></th><th>Kruskal</th><th>Prim</th></tr></thead><tbody><tr><td>รูปร่างของ A</td><td>Forest หลายต้น</td><td>Tree ต้นเดียว</td></tr><tr><td>Safe edge</td><td>เบาสุดที่เชื่อมสองต้นต่างกัน</td><td>เบาสุดที่เชื่อม tree กับ vertex นอก tree</td></tr><tr><td>โครงสร้างข้อมูล</td><td>Disjoint set</td><td>Min-priority queue</td></tr></tbody></table></div>`],
  ],
  pitfalls: ['MST ไม่จำเป็นต้องมีแบบเดียว สไลด์ 23 ใช้ b–c แต่ Kruskal ในสไลด์ 29 ใช้ a–h น้ำหนักรวมเท่ากันคือ 37', 'ถ้าน้ำหนักทุก edge ต่างกัน MST จะมีแบบเดียว'],
  quiz: [
    { q: 'MST ของกราฟ 9 vertex มีกี่ edge', o: ['8', '9', '14'], a: 0, why: 'tree ที่มี |V| vertex มี |V| − 1 edge' },
    { q: 'ข้อใดรับรองว่าเพิ่ม edge แล้วปลอดภัย', o: ['เป็น edge เบาสุดของทั้งกราฟที่ยังไม่ถูกใช้', 'เป็น light edge ของ cut ที่เคารพ A', 'ไม่ทำให้ degree เกิน 2'], a: 1, why: 'ข้อแรกไม่พอ เพราะอาจสร้างวงจรกับ A ได้' },
  ],
  links: ['mst'],
},
{
  id: 'kruskal', ch: 2, title: 'Kruskal’s algorithm', en: 'Kruskal', slides: '26–29',
  lead: 'เรียง edge จากเบาไปหนัก หยิบทีละเส้น ถ้าปลายทั้งสองอยู่คนละต้นก็เก็บ ถ้าต้นเดียวกันก็ทิ้ง',
  procs: [{ name: 'MST-KRUSKAL(G, w)', lines: ['A = ∅', 'for each vertex v ∈ G.V', '    MAKE-SET(v)', 'sort the edges of G.E into nondecreasing order by weight w', 'for each edge (u, v) ∈ G.E, taken in nondecreasing order by weight', '    if FIND-SET(u) ≠ FIND-SET(v)', '        A = A ∪ {(u, v)}', '        UNION(u, v)', 'return A'] }],
  presets: [{ name: 'กราฟในสไลด์ 28–29', def: mstDef(true), run: runKruskal }],
  custom: { directed: false, weighted: true, sample: 'a b 3\nb c 1\na c 2\nc d 4\nb d 5' },
  notes: [
    ['แนวคิด', `<p>เป็นอัลกอริทึม greedy ทุกขั้นเลือก edge เบาสุดที่เชื่อมสอง tree ต่างกัน edge นั้นคือ light edge ของ cut รอบ tree หนึ่ง จึง safe</p>`],
    ['Disjoint set ทำอะไร', `<p>${m('FIND-SET')} ตอบว่า vertex อยู่ tree ไหน ถ้าปลายสองข้างอยู่ชุดเดียวกัน การเพิ่ม edge จะปิดวงจร ส่วน ${m('UNION')} รวมสองชุดเมื่อเลือก edge นั้น สีของ vertex ในภาพแทนชุดที่มันอยู่</p>`],
  ],
  runtime: { a: 'O(E lg V)', why: 'MAKE-SET O(V) การเรียง O(E lg E) ส่วน FIND-SET และ UNION รวม O((V + E) α(V)) เมื่อใช้ union by rank และ path compression พจน์ที่ใหญ่สุดคือการเรียง และเพราะ |E| < |V|² จึงได้ lg E = O(lg V)' },
  pitfalls: ['ระหว่างทำ A เป็น forest ยังไม่ใช่ tree', 'edge น้ำหนักเท่ากันเลือกลำดับไหนก็ได้ MST อาจต่างแต่น้ำหนักรวมเท่าเดิม'],
  quiz: [
    { q: 'Edge แรกที่ถูกทิ้งในตัวอย่างคือเส้นใด', o: ['h–i (7)', 'i–g (6)', 'b–c (8)'], a: 1, why: 'ตอนนั้น i–c–f–g เชื่อมกันแล้ว' },
    { q: 'ขั้นตอนใดกำหนดเวลาทำงานรวมของ Kruskal', o: ['MAKE-SET', 'การเรียง edge', 'การคืนค่า A'], a: 1, why: 'Disjoint set ที่ดีเกือบเป็นเชิงเส้น การเรียงจึงใหญ่สุด' },
  ],
  links: ['mst', 'galles'],
},
{
  id: 'prim', ch: 2, title: 'Prim’s algorithm', en: 'Prim', slides: '30–33',
  lead: 'เริ่มจาก root แล้วขยาย tree ต้นเดียว ทุกขั้นดึง vertex นอก tree ที่ต่อเข้ามาได้ด้วย edge เบาสุด',
  procs: [{ name: 'MST-PRIM(G, w, r)', lines: ['for each u ∈ G.V', '    u.key = ∞', '    u.π = NIL', 'r.key = 0', 'Q = G.V', 'while Q ≠ ∅', '    u = EXTRACT-MIN(Q)', '    for each v ∈ G.Adj[u]', '        if v ∈ Q and w(u, v) < v.key', '            v.π = u', '            v.key = w(u, v)'] }],
  presets: [{ name: 'กราฟในสไลด์ 33', def: mstDef(false), run: runPrim, opt: { source: 'a' } }],
  custom: { directed: false, weighted: true, source: true, sample: 'a b 3\nb c 1\na c 2\nc d 4\nb d 5' },
  notes: [
    ['ความหมายของ key', `<p>${m('v.key')} คือน้ำหนัก edge ที่เบาสุดซึ่งเชื่อม ${m('v')} เข้ากับ tree ปัจจุบัน เป็น ∞ ถ้ายังไม่มี edge แบบนั้น ค่าในวงกลมคือ key และเส้นประคือ edge ผู้สมัครของแต่ละ vertex ใน Q</p>`],
    ['เซต A อยู่ตรงไหน', `<p>โค้ดไม่ได้เก็บ ${m('A')} ตรง ๆ แต่ ${m('A = {(v, v.π) : v ∈ V − {r} − Q}')} เมื่อ Q ว่างจึงได้ ${m('A = {(v, v.π) : v ∈ V − {r}}')} ตามสไลด์ 31</p>`],
    ['เทียบกับ Dijkstra', `<p>โครงเหมือนกันแทบทุกบรรทัด ต่างกันที่การอัปเดต Prim ใช้ ${m('v.key = w(u, v)')} คือน้ำหนัก edge เดียว ส่วน Dijkstra ใช้ ${m('v.d = u.d + w(u, v)')} คือระยะสะสมจากจุดเริ่ม</p>`],
  ],
  runtime: { a: 'O(E lg V) ด้วย binary heap', why: 'สร้าง heap O(V) EXTRACT-MIN |V| ครั้ง ครั้งละ O(lg V) และ DECREASE-KEY ไม่เกิน 2|E| ครั้ง ครั้งละ O(lg V) รวม O(V lg V + E lg V) = O(E lg V) ถ้าใช้อาร์เรย์ธรรมดาได้ O(V²) ซึ่งดีกับกราฟ dense และ Fibonacci heap ได้ O(E + V lg V)' },
  pitfalls: ['key ไม่ใช่ระยะสะสม', 'เงื่อนไข v ∈ Q ขาดไม่ได้ ไม่งั้น vertex ใน tree ถูกแก้ π'],
  quiz: [
    { q: 'หลังดึง a และ b ค่า key ของ c และ h คือ', o: ['c = 8, h = 8', 'c = 12, h = 8', 'c = 8, h = 11'], a: 0, why: 'b–c = 8 ลด key ของ c ส่วน b–h = 11 ไม่น้อยกว่า 8 จาก a–h' },
    { q: 'กราฟ dense มี |E| ≈ |V|² ควรใช้ Q แบบไหนใน Prim', o: ['Binary heap ได้ O(V² lg V)', 'อาร์เรย์ ได้ O(V²)'], a: 1, why: 'อาร์เรย์เสีย O(V) ต่อการดึง แต่ลด key ได้ O(1)' },
  ],
  links: ['mst', 'galles'],
},
{
  id: 'sssp', ch: 3, title: 'พื้นฐาน Shortest paths และ Relaxation', en: 'SSSP basics', slides: '34–41',
  lead: 'นิยาม δ(u, v) ผลของน้ำหนักลบ และ RELAX ซึ่งเป็นปฏิบัติการหลักของทุกอัลกอริทึมในบทนี้',
  procs: [INIT_SS, { name: 'RELAX(u, v, w)', lines: ['if v.d > u.d + w(u, v)', '    v.d = u.d + w(u, v)', '    v.π = u'] }],
  presets: [
    { name: 'RELAX สองกรณี (สไลด์ 41)', def: GD.relax, run: G => shiftRelaxLines(runRelaxDemo(G)) },
    { name: 'น้ำหนักลบ (สไลด์ 37)', def: GD.sssp37, run: runNegDemo, procs: [] },
  ],
  notes: [
    ['นิยาม', `<p>น้ำหนักเส้นทาง ${m('w(p) = Σ w(v<sub>i−1</sub>, v<sub>i</sub>)')} และ ${m('δ(u, v)')} คือค่าน้อยสุดของ ${m('w(p)')} ทุกเส้นทางจาก ${m('u')} ไป ${m('v')} ถ้าไม่มีเส้นทางให้เป็น ∞ เส้นทางใดที่มี ${m('w(p) = δ(u, v)')} เรียกว่า shortest path</p>`],
    ['รูปแบบปัญหา', `<p>Single-source จากจุดเดียวไปทุกจุด, Single-destination ทุกจุดไปหาจุดเดียว (กลับทิศแล้วใช้ single-source), Single-pair หนึ่งคู่, และ All-pairs ทุกคู่</p>`],
    ['น้ำหนักลบ', `<p>Edge ลบไม่ใช่ปัญหา ปัญหาคือ<b>วงจรลบที่ไปถึงได้จาก s</b> เพราะวนได้ไม่รู้จบ δ จึงไม่นิยามและเขียนเป็น −∞ ถ้าไม่มีวงจรลบ เส้นทางสั้นสุดไม่ต้องวนและยาวไม่เกิน |V| − 1 edge</p>`],
    ['Shortest-paths tree', `<p>${m('G<sub>π</sub>')} เหมือน breadth-first tree แต่วัดด้วยน้ำหนักแทนจำนวน edge กราฟเดียวอาจมีหลาย tree ที่ถูกต้อง สไลด์ 40 แสดงสองแบบของกราฟเดียวกัน</p>`],
    ['ทำไม RELAX เป็นหัวใจ', `<p>ค่า ${m('v.d')} เป็นขอบบนของ ${m('δ(s, v)')} เสมอและลดลงเท่านั้น ถ้า edge บนเส้นทางสั้นสุดถูก relax <b>เรียงตามลำดับเส้นทาง</b> ค่า d จะถูกต้อง อัลกอริทึมสามตัวต่อไปคือสามวิธีทำให้เกิดลำดับนั้น</p>`],
  ],
  pitfalls: ['วงจรลบที่ s ไปไม่ถึงไม่กระทบคำตอบ', 'Shortest-paths tree ไม่จำเป็นต้องมีแบบเดียว'],
  quiz: [
    { q: 'u.d = 5, w(u, v) = 2, v.d = 6 หลัง RELAX ค่า v.d คือ', o: ['6', '7', '5'], a: 0, why: '6 ไม่มากกว่า 7 จึงไม่เปลี่ยน' },
    { q: 'ในสไลด์ 37 ค่า δ(s, g) คือ', o: ['14', '11', '−∞'], a: 2, why: 'g ไปถึงได้จากวงจรลบ e→f→e' },
  ],
  links: ['sssp', 'mitNotes'],
},
{
  id: 'bellman', ch: 3, title: 'Bellman-Ford algorithm', en: 'Bellman-Ford', slides: '42–43',
  lead: 'Relax ทุก edge ซ้ำ |V| − 1 รอบ รับน้ำหนักลบได้ และตรวจวงจรลบได้ด้วยรอบสุดท้าย',
  procs: [{ name: 'BELLMAN-FORD(G, w, s)', lines: ['INITIALIZE-SINGLE-SOURCE(G, s)', 'for i = 1 to |G.V| − 1', '    for each edge (u, v) ∈ G.E', '        RELAX(u, v, w)', 'for each edge (u, v) ∈ G.E', '    if v.d > u.d + w(u, v)', '        return FALSE', 'return TRUE'] }],
  presets: [
    { name: 'กราฟในสไลด์ 43', def: GD.bf, run: runBF, opt: { source: 's' } },
    { name: 'มีวงจรลบ (ส่วนหนึ่งของสไลด์ 37)', def: GD.bfNeg, run: runBF, opt: { source: 's' } },
  ],
  custom: { directed: true, weighted: true, source: true, sample: 'a b 4\nb c -2\na c 5\nc d 1' },
  notes: [
    ['ทำไม |V| − 1 รอบพอ', `<p>Shortest path ไม่วนจึงยาวไม่เกิน |V| − 1 edge รอบที่ i จะ relax edge ที่ i ของเส้นทางอย่างแน่นอน ไม่ว่าลำดับ edge จะเป็นแบบไหน หลังรอบที่ i ทุก vertex ที่เส้นทางสั้นสุดใช้ไม่เกิน i edge จะมีค่าถูกแล้ว</p>`],
    ['รอบตรวจจับ', `<p>หลัง |V| − 1 รอบ ถ้ายังมี edge ที่ลด d ได้อีก แปลว่าไม่มีคำตอบที่นิ่ง จึงต้องมีวงจรลบที่ไปถึงจาก s แล้วคืน FALSE ลองเลือกตัวอย่างที่สอง</p>`],
  ],
  runtime: { a: 'O(VE)', why: 'Initialize Θ(V) ลูป |V| − 1 รอบ รอบละ Θ(E) และรอบตรวจ O(E)' },
  pitfalls: ['ลำดับ edge มีผลต่อจำนวนรอบที่ค่าเริ่มนิ่ง แต่ไม่มีผลกับคำตอบสุดท้าย', 'ตรวจพบเฉพาะวงจรลบที่ไปถึงได้จาก s', 'สไลด์ใช้ครบทุกรอบ การหยุดก่อนเมื่อรอบใดไม่เปลี่ยนเป็นการปรับปรุงเพิ่ม'],
  quiz: [
    { q: 'กราฟในสไลด์ 43 มี 5 vertex ต้องทำลูปหลักกี่รอบ', o: ['4', '5', '10'], a: 0, why: '|V| − 1 = 4' },
    { q: 'ค่าสุดท้ายของ z.d คือ', o: ['2', '−2', '−4'], a: 1, why: 's→y→x→t→z = 7 − 3 − 2 − 4 = −2' },
  ],
  links: ['sssp', 'mitBF', 'fiset'],
},
{
  id: 'dag', ch: 3, title: 'Shortest paths ใน DAG', en: 'DAG shortest paths', slides: '44–45',
  lead: 'ถ้ากราฟไม่มีวงจร เรียงทอพอโลยีแล้ว relax รอบเดียวก็จบ เร็วกว่าทุกวิธีและรับน้ำหนักลบได้',
  procs: [{ name: 'DAG-SHORTEST-PATHS(G, w, s)', lines: ['topologically sort the vertices of G', 'INITIALIZE-SINGLE-SOURCE(G, s)', 'for each vertex u, taken in topologically sorted order', '    for each vertex v ∈ G.Adj[u]', '        RELAX(u, v, w)'] }],
  presets: [{ name: 'กราฟในสไลด์ 45', def: GD.dag, run: runDAG, opt: { source: 's' } }],
  custom: { directed: true, weighted: true, source: true, sample: 'a b 3\na c 6\nb c -2\nb d 4\nc d 1' },
  notes: [
    ['ทำไมรอบเดียวพอ', `<p>ทุกเส้นทางใน DAG เรียงตามลำดับทอพอโลยีเสมอ เมื่อไล่ vertex ตามลำดับนั้น edge บนเส้นทางสั้นสุดจึงถูก relax เรียงตามเส้นทางพอดี ตรงกับเงื่อนไขของ RELAX ที่เรียนไป</p>`],
    ['จุดสังเกตในตัวอย่าง', `<p>${m('r')} อยู่ก่อน ${m('s')} ในลำดับ ${m('r.d')} จึงเป็น ∞ และ relax จาก ${m('r')} ไม่เปลี่ยนอะไร ทุกเส้นที่ออกจาก ${m('r')} ไม่เกี่ยวกับคำตอบ</p>`],
  ],
  runtime: { a: 'Θ(V + E)', why: 'Topological sort Θ(V + E) Initialize Θ(V) และแต่ละ edge ถูก relax ครั้งเดียว' },
  pitfalls: ['ใช้เมื่อกราฟไม่มีวงจรเท่านั้น', 'มีน้ำหนักลบได้ เพราะไม่มีวงจรให้เกิดวงจรลบ'],
  quiz: [
    { q: 'ค่าสุดท้าย z.d ในสไลด์ 45 คือ', o: ['4', '3', '5'], a: 1, why: 's→x→y→z = 6 − 1 − 2 = 3' },
    { q: 'กราฟนี้มี edge ลบ ทำไมยังใช้วิธีนี้ได้', o: ['เพราะ DAG ไม่มีวงจร', 'เพราะ edge ลบมีน้อย', 'เพราะเริ่มจาก s'], a: 0, why: 'ความถูกต้องมาจากลำดับ relax ไม่ได้ขึ้นกับเครื่องหมายน้ำหนัก' },
  ],
  links: ['sssp'],
},
{
  id: 'dijkstra', ch: 3, title: 'Dijkstra’s algorithm', en: 'Dijkstra', slides: '46–47',
  lead: 'ดึง vertex ที่ใกล้ที่สุดซึ่งยังไม่สรุปผลออกมา แล้ว relax ขาออกของมัน ใช้ได้เมื่อทุก edge ไม่ติดลบ',
  procs: [{ name: 'DIJKSTRA(G, w, s)', lines: ['INITIALIZE-SINGLE-SOURCE(G, s)', 'S = ∅', 'Q = G.V', 'while Q ≠ ∅', '    u = EXTRACT-MIN(Q)', '    S = S ∪ {u}', '    for each vertex v ∈ G.Adj[u]', '        RELAX(u, v, w)'] }],
  presets: [
    { name: 'กราฟในสไลด์ 47', def: GD.dij, run: runDijkstra, opt: { source: 's' } },
    { name: 'ทำไม edge ลบถึงพัง', def: GD.dijNeg, run: runDijkstra, opt: { source: 's' } },
  ],
  custom: { directed: true, weighted: true, source: true, sample: 'a b 4\na c 1\nc b 2\nb d 5\nc d 8' },
  notes: [
    ['แนวคิด greedy', `<p>Vertex ใน ${m('S')} มีระยะสรุปแล้ว ทุกรอบเลือก ${m('u ∈ V − S')} ที่ d น้อยสุด สไลด์ 46 พิมพ์ว่า "closet" คำที่ถูกคือ closest</p>`],
    ['ทำไม w ≥ 0 จำเป็น', `<p>สมมติ ${m('u')} มี d น้อยสุดใน Q ทางอื่นใดที่ไป ${m('u')} ต้องออกจาก ${m('S')} ผ่าน vertex ใน Q ที่ d ไม่น้อยกว่า ${m('u.d')} อยู่แล้ว และเมื่อ edge ไม่ติดลบ เดินต่อก็ไม่สั้นลง ${m('u.d')} จึงเป็นค่าจริง ถ้ามี edge ลบ ข้อสรุปนี้พัง ดูตัวอย่างที่สอง</p>`],
    ['ความสัมพันธ์กับ BFS', `<p>ถ้าทุก edge หนัก 1 Dijkstra ทำงานเหมือน BFS คิว FIFO ทำหน้าที่แทน priority queue ได้เพราะ d ที่เข้าคิวเรียงอยู่แล้ว</p>`],
  ],
  runtime: { a: 'O(V²) ด้วยอาร์เรย์ · O(E lg V) ด้วย binary heap', why: 'ดึงค่า |V| ครั้ง และลด key ไม่เกิน |E| ครั้ง อาร์เรย์: O(V) × V + O(1) × E = O(V²) Binary heap: O((V + E) lg V) ซึ่งเป็น O(E lg V) เมื่อทุก vertex ไปถึงได้ Fibonacci heap: O(V lg V + E)' },
  pitfalls: ['ห้ามใช้เมื่อมี edge ลบ', 'ระยะของ vertex ใน S ถือว่าสรุปแล้ว', 'Prim ใช้น้ำหนัก edge เดียว Dijkstra ใช้ระยะสะสม'],
  quiz: [
    { q: 'ลำดับ EXTRACT-MIN ในสไลด์ 47 คือ', o: ['s, y, z, t, x', 's, t, y, z, x', 's, y, t, z, x'], a: 0, why: 'ค่า d ตอนดึงคือ 0, 5, 7, 8, 9' },
    { q: 'กราฟ dense ควรใช้ Q แบบไหน', o: ['Binary heap', 'อาร์เรย์เชิงเส้น'], a: 1, why: 'O(V²) ดีกว่า O(V² lg V) เมื่อ E ≈ V²' },
  ],
  links: ['sssp', 'mitNotes', 'galles'],
},
{
  id: 'apsp', ch: 4, title: 'All-pairs และการคูณเมทริกซ์', en: 'Matrix-multiplication APSP', slides: '48–59',
  lead: 'หาระยะทุกคู่ด้วยการต่อเส้นทางทีละ edge ซึ่งหน้าตาเหมือนการคูณเมทริกซ์ทุกประการ',
  procs: [{ name: 'SLOW-ALL-PAIRS-SHORTEST-PATHS(W)', lines: ['n = W.rows', 'L^{(1)} = W', 'for m = 2 to n − 1', '    let L^{(m)} be a new n × n matrix', '    L^{(m)} = EXTEND-SHORTEST-PATHS(L^{(m−1)}, W)', 'return L^{(n−1)}'] },
    { name: 'EXTEND-SHORTEST-PATHS(L, W)', lines: ['n = L.rows', "let L′ = (l′_{ij}) be a new n × n matrix", 'for i = 1 to n', '    for j = 1 to n', "        l′_{ij} = ∞", '        for k = 1 to n', "            l′_{ij} = min(l′_{ij}, l_{ik} + w_{kj})", "return L′"] }],
  presets: [
    { name: 'แบบช้า (สไลด์ 56–57)', def: GD.apsp, run: (G, o) => runAPSP(G, { ...o, mode: 'slow' }) },
    { name: 'Repeated squaring (สไลด์ 58–59)', def: GD.apsp, run: (G, o) => runAPSP(G, { ...o, mode: 'faster' }),
      procs: [{ name: 'FASTER-ALL-PAIRS-SHORTEST-PATHS(W)', lines: ['n = W.rows', 'L^{(1)} = W', 'm = 1', 'while m < n − 1', '    let L^{(2m)} be a new n × n matrix', '    L^{(2m)} = EXTEND-SHORTEST-PATHS(L^{(m)}, L^{(m)})', '    m = 2m', 'return L^{(m)}'] }, { name: 'EXTEND-SHORTEST-PATHS(L, W)', lines: ['n = L.rows', "let L′ = (l′_{ij}) be a new n × n matrix", 'for i = 1 to n', '    for j = 1 to n', "        l′_{ij} = ∞", '        for k = 1 to n', "            l′_{ij} = min(l′_{ij}, l_{ik} + w_{kj})", "return L′"] }] },
  ],
  detail: true,
  custom: { directed: true, weighted: true, sample: '1 2 3\n2 3 4\n1 3 10\n3 4 -2\n4 1 6' },
  notes: [
    ['ทางเลือกแบบง่าย (สไลด์ 48)', `<p>ถ้าน้ำหนักไม่ติดลบ รัน Dijkstra จากทุก vertex ได้ ด้วยอาร์เรย์เป็น O(V³) ถ้ามีน้ำหนักลบ ต้องรัน Bellman-Ford จากทุก vertex เป็น O(V²E) ซึ่งบนกราฟ dense คือ O(V⁴)</p>`],
    ['เมทริกซ์ที่ใช้', `<p>${m('W = (w<sub>ij</sub>)')} โดย ${m('w<sub>ii</sub> = 0')} และเป็น ∞ เมื่อไม่มี edge ส่วน ${m('Π = (π<sub>ij</sub>)')} เก็บ vertex ก่อนหน้า ${m('j')} บนเส้นทางสั้นสุดจาก ${m('i')} พิมพ์เส้นทางโดย PRINT-ALL-PAIRS-SHORTEST-PATH ที่ย้อนจาก ${m('j')} กลับหา ${m('i')} แบบ recursive</p>`],
    ['สูตร recursive', `<p>${m('l<sub>ij</sub><sup>(m)</sup>')} คือน้ำหนักน้อยสุดจาก ${m('i')} ไป ${m('j')} ที่ใช้ไม่เกิน ${m('m')} edge ตัว edge สุดท้ายมาจาก ${m('k')} ใด ๆ:</p><p class="eq">${m('l<sub>ij</sub><sup>(m)</sup> = min<sub>1≤k≤n</sub> { l<sub>ik</sub><sup>(m−1)</sup> + w<sub>kj</sub> }')}</p><p>กรณี ${m('k = j')} ใช้ ${m('w<sub>jj</sub> = 0')} จึงครอบคลุมการไม่เพิ่ม edge ไว้แล้ว</p>`],
    ['เทียบกับการคูณเมทริกซ์', `<div class="tw"><table class="cmp"><thead><tr><th>SQUARE-MATRIX-MULTIPLY</th><th>EXTEND-SHORTEST-PATHS</th></tr></thead><tbody><tr><td>c<sub>ij</sub> = 0</td><td>l′<sub>ij</sub> = ∞</td></tr><tr><td>+</td><td>min</td></tr><tr><td>×</td><td>+</td></tr></tbody></table></div><p>แถบที่ไฮไลต์ในแผงเมทริกซ์คือแถว ${m('i')} ของตัวตั้ง จับคู่กับคอลัมน์ ${m('j')} ของตัวคูณ เหมือนคูณเมทริกซ์ทุกอย่าง</p>`],
    ['Repeated squaring', `<p>การดำเนินการนี้เปลี่ยนหมู่ได้ จึงคำนวณ ${m('L<sup>(1)</sup>, L<sup>(2)</sup>, L<sup>(4)</sup>, L<sup>(8)</sup>')} ได้โดยยกกำลังสอง ถ้าเกิน n−1 ก็ไม่เป็นไร เพราะเมื่อไม่มีวงจรลบ ${m('δ(i, j) = l<sub>ij</sub><sup>(n−1)</sup> = l<sub>ij</sub><sup>(n)</sup> = …')}</p>`],
  ],
  runtime: { a: 'SLOW Θ(n⁴) · FASTER Θ(n³ lg n)', why: 'EXTEND มีสามลูปซ้อนจึงเป็น Θ(n³) SLOW เรียก n − 2 ครั้ง FASTER เรียก ⌈lg(n − 1)⌉ ครั้ง' },
  pitfalls: ['ต้องมี w<sub>ii</sub> = 0 ไม่งั้นสูตร min รวม l<sup>(m−1)</sup><sub>ij</sub> ไม่ได้', 'FASTER คำนวณแค่ระยะ ไม่ได้สร้าง Π ไปด้วย'],
  quiz: [
    { q: 'n = 5 แบบ FASTER เรียก EXTEND กี่ครั้ง', o: ['2', '3', '4'], a: 0, why: 'm = 1 → 2 → 4 หยุดเมื่อ m ≥ n − 1' },
    { q: 'ค่า L<sup>(2)</sup>[4][2] ในสไลด์ 57 คือ', o: ['∞', '5', '−1'], a: 2, why: 'ผ่าน 3: −5 + 4 = −1 ใช้ 2 edge' },
  ],
  links: ['mitNotes', 'fiset'],
},
{
  id: 'floyd', ch: 4, title: 'Floyd-Warshall algorithm', en: 'Floyd-Warshall', slides: '60–68',
  lead: 'Dynamic programming ที่ค่อย ๆ อนุญาต vertex กลางเพิ่มทีละตัว จบใน Θ(n³) ด้วยสามลูปซ้อนธรรมดา',
  procs: [{ name: 'FLOYD-WARSHALL(W)', lines: ['n = W.rows', 'D^{(0)} = W', 'for k = 1 to n', '    let D^{(k)} = (d_{ij}^{(k)}) be a new n × n matrix', '    for i = 1 to n', '        for j = 1 to n', '            d_{ij}^{(k)} = min(d_{ij}^{(k−1)}, d_{ik}^{(k−1)} + d_{kj}^{(k−1)})', 'return D^{(n)}'] }],
  presets: [{ name: 'กราฟในสไลด์ 66–68', def: GD.apsp, run: runFW }],
  detail: true,
  custom: { directed: true, weighted: true, sample: '1 2 3\n2 3 4\n1 3 10\n3 4 -2\n4 1 6' },
  notes: [
    ['แนวคิดหลัก', `<p><b>Intermediate vertex</b> คือ vertex บนเส้นทางที่ไม่ใช่จุดต้นหรือจุดปลาย ${m('d<sub>ij</sub><sup>(k)</sup>')} คือระยะสั้นสุดจาก ${m('i')} ไป ${m('j')} เมื่อ vertex กลางทั้งหมดอยู่ใน ${m('{1, 2, …, k}')}</p>`],
    ['สองกรณีของ k', `<p>เส้นทางที่ดีที่สุดไม่ผ่าน ${m('k')} คำตอบคงเดิมที่ ${m('d<sub>ij</sub><sup>(k−1)</sup>')} หรือผ่าน ${m('k')} ก็แยกเป็นสองท่อน ${m('i ⇝ k')} และ ${m('k ⇝ j')} ซึ่งไม่ผ่าน ${m('k')} อีก เส้นชมพูและส้มในภาพคือสองท่อนนั้น ตรงกับ p₁ และ p₂ ในสไลด์ 62</p><p class="eq">${m('d<sub>ij</sub><sup>(k)</sup> = min( d<sub>ij</sub><sup>(k−1)</sup>, d<sub>ik</sub><sup>(k−1)</sup> + d<sub>kj</sub><sup>(k−1)</sup> )')}</p>`],
    ['สร้าง Π ไปพร้อมกัน', `<p>${m('π<sub>ij</sub><sup>(0)</sup>')} เป็น NIL ถ้า ${m('i = j')} หรือไม่มี edge มิฉะนั้นเป็น ${m('i')} ทุกรอบ ถ้าไม่ดีขึ้นใช้ค่าเดิม ถ้าดีขึ้นผ่าน ${m('k')} ให้ใช้ ${m('π<sub>kj</sub><sup>(k−1)</sup>')} เพราะ vertex ก่อน ${m('j')} คือตัวเดียวกับบนท่อน ${m('k ⇝ j')}</p>`],
  ],
  runtime: { a: 'Θ(n³)', why: 'สามลูปซ้อน n × n × n และบรรทัด 7 ใช้ O(1) ค่าคงที่เล็ก ไม่ต้องใช้โครงสร้างข้อมูลซับซ้อน' },
  pitfalls: ['k ต้องเป็นลูปนอกสุด เพราะ D(k) ต้องการ D(k−1) ครบทั้งตาราง', 'น้ำหนักลบใช้ได้ แต่ห้ามมีวงจรลบ ตรวจได้จาก d<sub>ii</sub> < 0 ตอนจบ', 'ค่าเท่ากันไม่ต้องอัปเดต Π ใช้เครื่องหมาย ≤ ตามสไลด์ 65'],
  quiz: [
    { q: 'ค่า d<sup>(1)</sup>[4][2] ในสไลด์ 67 คือ', o: ['∞', '5', '−1'], a: 1, why: 'ผ่าน 1: d[4][1] + d[1][2] = 2 + 3 = 5' },
    { q: 'ถ้าเอา i เป็นลูปนอกสุดแทน k เกิดอะไรขึ้น', o: ['ได้คำตอบเดิมแต่ช้าลง', 'คำตอบอาจผิด เพราะใช้ค่าที่ยังไม่ครบ', 'ใช้ไม่ได้เฉพาะเมื่อมีน้ำหนักลบ'], a: 1, why: 'นิยาม DP ต้องให้ทุกช่องของรอบ k−1 เสร็จก่อน' },
  ],
  links: ['floyd', 'fiset', 'mitNotes'],
},
];

/* RELAX อยู่ใน proc ที่สอง จึงเลื่อนเลขบรรทัดเป็น 100+ */
function shiftRelaxLines(out) {
  out.steps.forEach(s => {
    const f = x => x === 0 ? 0 : 100 + x;
    s.line = Array.isArray(s.line) ? s.line.map(f) : f(s.line);
  });
  return out;
}

const OVERVIEW_ROWS = [
  ['ระยะเป็นจำนวน edge จากจุดเดียว กราฟไม่มีน้ำหนัก', 'bfs', 'BFS', 'O(V + E)', '6–9'],
  ['จำแนก edge หาวงจร ใช้เป็นฐานของงานอื่น', 'dfs', 'DFS', 'Θ(V + E)', '10–16'],
  ['เรียงงานที่มีเงื่อนไขก่อนหลัง กราฟเป็น DAG', 'topo', 'Topological sort', 'Θ(V + E)', '17–18'],
  ['หากลุ่มที่เดินถึงกันไปกลับ', 'scc', 'SCC', 'Θ(V + E)', '19–21'],
  ['เชื่อมทุกจุดให้ถูกสุด กราฟ sparse', 'kruskal', 'Kruskal', 'O(E lg V)', '26–29'],
  ['เชื่อมทุกจุดให้ถูกสุด กราฟ dense', 'prim', 'Prim', 'O(V²) อาร์เรย์, O(E lg V) heap', '30–33'],
  ['ทางสั้นสุดจากจุดเดียว มีน้ำหนักลบ หรือต้องตรวจวงจรลบ', 'bellman', 'Bellman-Ford', 'O(VE)', '42–43'],
  ['ทางสั้นสุดจากจุดเดียว กราฟไม่มีวงจร', 'dag', 'DAG shortest paths', 'Θ(V + E)', '44–45'],
  ['ทางสั้นสุดจากจุดเดียว น้ำหนักไม่ติดลบ', 'dijkstra', 'Dijkstra', 'O(V²) อาร์เรย์, O(E lg V) heap', '46–47'],
  ['ทุกคู่ แบบต่อเส้นทางทีละ edge', 'apsp', 'Matrix multiplication', 'Θ(n⁴), Θ(n³ lg n)', '51–59'],
  ['ทุกคู่ มีน้ำหนักลบได้ กราฟ dense', 'floyd', 'Floyd-Warshall', 'Θ(n³)', '60–68'],
];

if (typeof module !== 'undefined') module.exports = { GD, mstDef, LESSONS, OVERVIEW_ROWS, MEDIA, shiftRelaxLines };
