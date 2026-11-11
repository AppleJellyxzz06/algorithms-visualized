/* ===== เนื้อหาบท DP, Heap, Divide & Conquer, Backtracking/B&B/Approximation ===== */
Object.assign(MEDIA, {
  heapv: { t: 'VisuAlgo: Binary Heap', u: 'https://visualgo.net/en/heap', d: 'ดู heap ทั้งแบบต้นไม้และแบบอาร์เรย์' },
  ufds: { t: 'VisuAlgo: Union-Find Disjoint Sets', u: 'https://visualgo.net/en/ufds', d: 'เห็น path compression และ union by rank' },
  sortv: { t: 'VisuAlgo: Sorting', u: 'https://visualgo.net/en/sorting', d: 'Merge sort, Quicksort และ Randomized Quicksort' },
  recv: { t: 'VisuAlgo: Recursion Tree/DAG', u: 'https://visualgo.net/en/recursion', d: 'เขียน recursion เองแล้วดูปัญหาย่อยที่ซ้อนทับกัน' },
  tspv: { t: 'VisuAlgo: Travelling Salesman', u: 'https://visualgo.net/en/tsp', d: 'TSP แบบ brute force, DP และ approximation' },
  algv: { t: 'Algorithm Visualizers (N-Queens, Knapsack, LCS)', u: 'https://ravensmove.com/tools/algorithm-visualizers', d: 'รวมเครื่องมือลองโจทย์ DP และ backtracking ด้วยข้อมูลของตัวเอง' },
  lcsv: { t: 'Virtual Lab: LCS Visualizer', u: 'https://daa-dei.vlabs.ac.in/exp/dp-lcs/simulation/index.html', d: 'เติมตาราง LCS และย้อนเส้นทางทีละขั้น' },
});

const numsOf = (t, min, max) => {
  const a = t.trim().split(/[\s,]+/).filter(Boolean).map(Number);
  if (!a.length || a.some(Number.isNaN)) throw new Error('ใส่ตัวเลขคั่นด้วยช่องว่าง เช่น 5 2 4 7');
  if (a.length < min) throw new Error(`ต้องมีอย่างน้อย ${min} ตัว`);
  if (a.length > max) throw new Error(`ใส่ได้ไม่เกิน ${max} ตัว เพื่อให้ภาพยังอ่านออก`);
  return a;
};
const ARR_LEG = [['tgt', 'ตำแหน่งที่กำลังเขียน'], ['src', 'ค่าที่นำมาใช้'], ['band', 'กำลังพิจารณา']];

const DP_L = [
{
  id: 'dp-bin', sub: 'dp', title: 'Top-down และ Bottom-up', en: 'Top-down / Bottom-up', slides: '2–9',
  lead: 'c(n, k) คือตัวอย่างที่เห็นชัดว่า recursion ธรรมดาคำนวณซ้ำแค่ไหน และตารางช่วยตัดงานซ้ำออกอย่างไร',
  procs: [{ name: 'c(n, k)', lines: ['if k = 0 or k = n', '    return 1', 'if k < 0 or k > n', '    return 0', 'return c(n−1, k−1) + c(n−1, k)'] }],
  presets: [
    { name: 'Recursion ตรง ๆ (สไลด์ 3)', input: { n: 6, k: 3 }, run: runBinomRec },
    { name: 'Memoization (สไลด์ 4–5)', input: { n: 6, k: 3 }, run: runBinomMemo, procs: [{ name: 'Lookup_c(n, k)', lines: ['if k = 0 or k = n', '    return 1', 'if k < 0 or k > n', '    return 0', 'if c[n, k] < 0', '    c[n, k] ← Lookup_c(n−1, k−1) + Lookup_c(n−1, k)', 'return c[n, k]'] }] },
    { name: 'Bottom-up (สไลด์ 6)', input: { n: 6, k: 3 }, run: runBinomBU, procs: [{ name: 'Bottom-up', lines: ['for i ← 0 to n: for j ← 0 to min(i, k)', '    if j = 0 or j = i then c[i, j] ← 1', '    else', '        c[i, j] ← c[i−1, j−1] + c[i−1, j]', 'return c[n, k]'] }] },
  ],
  legend: [['tgt', 'ช่องที่กำลังทำ'], ['src', 'ค่าที่นำมาใช้']],
  custom: { label: 'ใส่ n และ k', sample: '6 3', parse: t => { const a = numsOf(t, 2, 2), [n, k] = a; if (n > 9 || n < 1 || k < 0 || k > n) throw new Error('กำหนด 1 ≤ n ≤ 9 และ 0 ≤ k ≤ n'); return { n, k }; } },
  notes: [
    ['ปัญหาของ recursion ตรง ๆ', '<p>c(6, 3) ต้องเรียกฟังก์ชัน 39 ครั้งเพื่อได้คำตอบ 20 ตัวเลขในตารางของตัวอย่างแรกคือจำนวนครั้งที่ช่องนั้นถูกคำนวณซ้ำ</p>'],
    ['สองวิธีแก้', '<p><b>Top-down + memoization</b> ยังเขียนแบบ recursive แต่จดคำตอบไว้ แก้เฉพาะปัญหาย่อยที่จำเป็น เสีย overhead ของการเรียกฟังก์ชัน</p><p><b>Bottom-up</b> เติมตารางจากเล็กไปใหญ่ แก้ทุกปัญหาย่อย แต่รูปแบบการเข้าถึงที่สม่ำเสมอช่วยลดเวลาหรือพื้นที่ได้ เช่นเก็บแค่แถวก่อนหน้า</p>'],
    ['เงื่อนไขที่ DP ใช้ได้', '<p><b>Optimal substructure</b> คำตอบดีสุดประกอบจากคำตอบดีสุดของปัญหาย่อย และ <b>Overlapping sub-problems</b> ปัญหาย่อยมีจำนวนไม่มาก (พหุนาม) แต่ถูกเรียกซ้ำบ่อย</p>'],
  ],
  runtime: { a: 'Recursion Θ(C(n, k)) · ตาราง Θ(nk)', why: 'แบบ recursive จำนวนการเรียกคือ 2·C(n, k) − 1 ซึ่งโตแบบ exponential เมื่อ k ≈ n/2 แบบตารางมี Θ(nk) ช่อง ช่องละ O(1) ใช้พื้นที่ Θ(nk) และลดเหลือ Θ(k) ได้เมื่อเก็บแค่แถวก่อนหน้า' },
  pitfalls: ['Memoization ต้องตรวจตารางก่อนเรียกต่อ ไม่งั้นก็ซ้ำเหมือนเดิม', 'ลำดับเติมตาราง bottom-up ต้องให้ช่องที่ต้องใช้เสร็จก่อนเสมอ'],
  slideNotes: ['สไลด์ 2 และ 5 เขียนเงื่อนไขว่า <code>if k = 1 or k = n</code> แต่สมการด้านบนและตารางใช้ k = 0 ถ้าใช้ตามโค้ด c(n, 1) จะคืน 1 ซึ่งผิด (ค่าจริงคือ n) บทเรียนนี้จึงใช้ k = 0'],
  quiz: [
    { q: 'c(6, 3) แบบ recursion ตรง ๆ เรียกฟังก์ชันกี่ครั้ง', o: ['20', '39', '84'], a: 1, why: '2·C(6,3) − 1 = 39' },
    { q: 'ข้อใดคือข้อดีของ top-down memoization เทียบกับ bottom-up', o: ['ไม่มี overhead ของ recursion', 'แก้เฉพาะปัญหาย่อยที่จำเป็น', 'ใช้พื้นที่น้อยกว่าเสมอ'], a: 1, why: 'bottom-up แก้ทุกปัญหาย่อย แต่ top-down แตะเฉพาะที่ถูกเรียก' },
  ],
  links: ['recv'],
},
{
  id: 'mcm', sub: 'dp', title: 'Matrix chain multiplication', en: 'Matrix chain', slides: '10–21',
  lead: 'ลำดับการใส่วงเล็บไม่เปลี่ยนผลลัพธ์ แต่เปลี่ยนจำนวนการคูณได้มาก DP เติมตาราง N ตามเส้นทแยงเพื่อหาลำดับที่ถูกสุด',
  procs: [{ name: 'matrixChain()', lines: ['for i ← 0 to n−1 do', '    N[i, i] ← 0', 'for b ← 1 to n−1 do', '    for i ← 0 to n−b−1 do', '        j ← i + b', '        N[i, j] ← ∞', '        for k ← i to j−1 do', '            N[i, j] ← min{N[i, j], N[i, k] + N[k+1, j] + dᵢ dₖ₊₁ dⱼ₊₁} and S[i, j] ← k'] }],
  presets: [
    { name: 'สไลด์ 13', input: { d: [10, 5, 10, 5, 10], names: ['A', 'B', 'C', 'D'] }, run: runMCM },
    { name: 'สไลด์ 14', input: { d: [101, 11, 9, 100, 99], names: ['A', 'B', 'C', 'D'] }, run: runMCM },
    { name: 'สไลด์ 11', input: { d: [3, 100, 5, 5], names: ['B', 'C', 'D'] }, run: runMCM },
  ],
  legend: [['tgt', 'ช่องที่กำลังเติม'], ['src', 'ปัญหาย่อยสองฝั่ง']],
  custom: { label: 'ใส่มิติ d₀ d₁ … dₙ โดย Aᵢ มีขนาด dᵢ × dᵢ₊₁', sample: '30 35 15 5 10', parse: t => ({ d: numsOf(t, 3, 8), names: undefined }) },
  notes: [
    ['ทำไมไม่ลองทุกแบบ และทำไม greedy ไม่พอ', '<p>จำนวนวิธีใส่วงเล็บคือจำนวน Catalan ซึ่งโตเกือบ 4ⁿ ส่วน greedy ทั้งสองแบบในสไลด์ 13–14 ไม่ให้คำตอบที่ดีที่สุด ลองกดตัวอย่างแล้วเทียบได้เลย</p>'],
    ['สมการ', '<p>พิจารณาการคูณครั้งสุดท้ายว่าแบ่งที่ไหน ถ้าแบ่งหลัง k จะได้สองปัญหาย่อยบวกต้นทุนการคูณครั้งสุดท้าย:</p><p class="eq">N<sub>i,j</sub> = min<sub>i≤k&lt;j</sub> { N<sub>i,k</sub> + N<sub>k+1,j</sub> + d<sub>i</sub> d<sub>k+1</sub> d<sub>j+1</sub> }</p>'],
    ['ทำไมเติมตามเส้นทแยง', '<p>N<sub>i,j</sub> ต้องใช้ช่องในแถว i และคอลัมน์ j ที่ช่วงสั้นกว่า จึงเติมตามความยาวช่วง b = 1, 2, … จบที่มุมขวาบน ตาราง S จำจุดแบ่ง ใช้สร้างวงเล็บตอนท้าย</p>'],
  ],
  runtime: { a: 'O(n³)', why: 'มี Θ(n²) ช่อง แต่ละช่องลอง k ไม่เกิน n ค่า เวอร์ชัน memoized ก็เป็น O(n³) เช่นกัน เพราะแต่ละ (i, j) คำนวณจริงครั้งเดียว ส่วน recursion ธรรมดาเป็น Ω(2ⁿ) ตามสไลด์ 19' },
  pitfalls: ['ต้นทุนการคูณเมทริกซ์ d × e กับ e × f คือ d·e·f', 'S[i, j] อัปเดตเฉพาะเมื่อได้ค่าที่ดีกว่า'],
  slideNotes: ['สไลด์ 17 เขียน <code>for i ← 1 to n−1</code> แต่ตารางเริ่มที่ 0 จึงต้องเป็น i ← 0', 'สไลด์ 19–20 เขียน <code>for k ← 1 to j−1</code> ที่ถูกคือ k ← i ไม่งั้นช่วงจะแบ่งนอกขอบเขต [i, j]'],
  quiz: [
    { q: 'ตัวอย่างสไลด์ 13 คำตอบที่ดีที่สุดใช้การคูณกี่ครั้ง', o: ['1000', '2000', '1250'], a: 0, why: 'A·((B·C)·D) = 250 + 250 + 500' },
    { q: 'เติมตาราง N ลำดับใด', o: ['แถวบนลงล่าง', 'ตามความยาวช่วงจากสั้นไปยาว', 'คอลัมน์ขวาไปซ้าย'], a: 1, why: 'ช่วงยาวต้องใช้คำตอบของช่วงที่สั้นกว่าทุกตัว' },
  ],
  links: ['recv'],
},
{
  id: 'knap', sub: 'dp', title: '0/1 Knapsack', en: '0/1 Knapsack', slides: '22–27',
  lead: 'เลือกไอเท็มให้ได้มูลค่ามากสุดโดยน้ำหนักไม่เกินความจุ กุญแจคือเพิ่มตัวแปร w เข้าไปในนิยามของปัญหาย่อย',
  procs: [{ name: '01Knapsack(S, W)', lines: ['for w ← 0 to W do', '    B[w] ← 0', 'for k ← 1 to n do', '    for w ← W downto wₖ do', '        if B[w−wₖ] + bₖ > B[w] then', '            B[w] ← B[w−wₖ] + bₖ'] }],
  presets: [
    { name: 'สไลด์ 24 (W = 9)', input: { items: [{ w: 4, b: 20 }, { w: 2, b: 3 }, { w: 2, b: 6 }, { w: 6, b: 25 }, { w: 2, b: 80 }], W: 9 }, run: runKnap },
    { name: 'สไลด์ 25 (W = 20)', input: { items: [{ w: 2, b: 3 }, { w: 4, b: 5 }, { w: 5, b: 8 }, { w: 3, b: 4 }, { w: 9, b: 10 }], W: 20 }, run: runKnap },
  ],
  legend: [['tgt', 'ช่องที่กำลังตัดสินใจ'], ['src', 'ค่าเมื่อถือไอเท็มนี้'], ['band', 'ค่าเมื่อไม่ถือ']],
  custom: { label: 'บรรทัดแรกคือ W บรรทัดต่อไป <code>น้ำหนัก มูลค่า</code>', sample: '7\n3 4\n2 3\n4 5\n5 6', parse: t => {
    const ln = t.trim().split('\n').map(s => s.trim()).filter(Boolean); const W = numsOf(ln[0], 1, 1)[0];
    if (!Number.isInteger(W) || W < 1 || W > 25) throw new Error('W ต้องเป็นจำนวนเต็ม 1 ถึง 25');
    const items = ln.slice(1).map((l, i) => { const a = numsOf(l, 2, 2); if (!Number.isInteger(a[0]) || a[0] < 1) throw new Error(`บรรทัด ${i + 2}: น้ำหนักต้องเป็นจำนวนเต็มบวก`); return { w: a[0], b: a[1] }; });
    if (!items.length || items.length > 7) throw new Error('ใส่ไอเท็ม 1 ถึง 7 ชิ้น'); return { items, W }; } },
  notes: [
    ['นิยามแรกใช้ไม่ได้', '<p>ถ้านิยาม B[k] เป็นชุดที่ดีสุดจาก k ไอเท็มแรก คำตอบของ S₅ อาจไม่ได้ต่อยอดจากคำตอบของ S₄ ในสไลด์ 25 ชุดที่ดีสุดของ S₄ มีไอเท็ม 4 แต่ชุดที่ดีสุดของ S₅ ต้องทิ้งมัน</p>'],
    ['นิยามที่ใช้ได้', '<p>เพิ่มตัวแปรน้ำหนัก: B[k, w] คือมูลค่าดีสุดจาก k ไอเท็มแรกเมื่อใช้น้ำหนัก w ไอเท็ม k มีสองทางเลือกคือไม่ถือ หรือถือแล้วเหลือความจุ w − w<sub>k</sub></p><p class="eq">B[k, w] = max{ B[k−1, w], B[k−1, w−w<sub>k</sub>] + b<sub>k</sub> }</p>'],
    ['ทำไมวน w จากมากไปน้อย', '<p>แถว k ใช้ค่าจากแถว k−1 เท่านั้น การใช้อาร์เรย์มิติเดียวและวนถอยหลังทำให้ B[w − w<sub>k</sub>] ยังเป็นค่าของแถวเก่า แต่ละไอเท็มจึงถูกใช้ได้ครั้งเดียว ถ้าวนไปข้างหน้าจะกลายเป็น unbounded knapsack</p>'],
  ],
  runtime: { a: 'O(nW)', why: 'สองลูปซ้อน n × W ค่านี้เป็น pseudo-polynomial เพราะ W ใช้แค่ lg W บิตในการเขียน ถ้า W ใหญ่มากจะไม่ใช่เวลาพหุนามของขนาดอินพุต' },
  pitfalls: ['วน w ขึ้นจะหยิบไอเท็มเดิมซ้ำ', 'O(nW) ไม่ใช่เวลาพหุนามเมื่อเทียบกับจำนวนบิตของ W'],
  slideNotes: ['สไลด์ 25 เขียนว่า weight-benefit pairs แต่ความกว้างช่องและเลข 20 แสดงว่าเป็น (benefit, weight) บทเรียนจึงอ่านตามลำดับนั้น', 'สไลด์ 26 นิยาม B[k, w] ว่าน้ำหนัก exactly w แต่โค้ดสไลด์ 27 ตั้งค่าเริ่มเป็น 0 ทุกช่อง ค่าที่ได้จึงหมายถึงน้ำหนักไม่เกิน w'],
  quiz: [
    { q: 'คำตอบของสไลด์ 24 คือ', o: ['106', '108', '111'], a: 0, why: 'ไอเท็ม 1, 3, 5 น้ำหนัก 8 มูลค่า 20 + 6 + 80' },
    { q: 'ถ้าเปลี่ยนเป็นวน w จาก wₖ ขึ้นไป W จะเกิดอะไร', o: ['ผลเหมือนเดิม', 'หยิบไอเท็มเดิมซ้ำได้', 'เร็วขึ้นเท่าตัว'], a: 1, why: 'B[w − wₖ] จะเป็นค่าที่อัปเดตในรอบเดียวกันแล้ว' },
  ],
  links: ['algv', 'recv'],
},
{
  id: 'lcs', sub: 'dp', title: 'Longest Common Subsequence', en: 'LCS', slides: '28–34',
  lead: 'หา subsequence ที่ยาวสุดซึ่งอยู่ในทั้งสองลำดับ ตาราง c เก็บความยาว ตาราง b เก็บทิศสำหรับย้อนเส้นทาง',
  procs: [{ name: 'LCS(X, Y)', lines: ['m ← LENGTH[X]; n ← LENGTH[Y]', 'b ← c', 'for i ← 1 to m do c[i, 0] ← 0', 'for j ← 0 to n do c[0, j] ← 0', 'for i ← 1 to m do', '    for j ← 1 to n do', '        if xᵢ = yⱼ', '            c[i, j] ← c[i−1, j−1] + 1; b[i, j] ← "UP-LEFT"', '        else if c[i−1, j] ≥ c[i, j−1]', '            c[i, j] ← c[i−1, j]; b[i, j] ← "UP"', '        else', '            c[i, j] ← c[i, j−1]; b[i, j] ← "LEFT"', 'return c and b'] }],
  presets: [{ name: 'สไลด์ 32', input: { X: 'ABCBDAB', Y: 'BDCABA' }, run: runLCS }],
  legend: [['tgt', 'ช่องที่กำลังเติม / ตัวอักษรที่เก็บ'], ['src', 'ค่าที่นำมาใช้ / เส้นทางย้อน']],
  custom: { label: 'บรรทัดแรก X บรรทัดที่สอง Y', sample: 'AGGTAB\nGXTXAYB', parse: t => { const ln = t.trim().split('\n').map(s => s.trim().toUpperCase()).filter(Boolean); if (ln.length !== 2) throw new Error('ใส่สองบรรทัด บรรทัดละหนึ่งลำดับ'); if (ln.some(s => s.length > 12 || !/^[A-Z0-9]+$/.test(s))) throw new Error('ใช้ตัวอักษรหรือตัวเลข ยาวไม่เกิน 12'); return { X: ln[0], Y: ln[1] }; } },
  notes: [
    ['โครงสร้างย่อย', '<p>ดูตัวสุดท้าย ถ้า x<sub>m</sub> = y<sub>n</sub> ตัวนี้อยู่ใน LCS แน่นอนและเหลือปัญหา (m−1, n−1) ถ้าไม่เท่ากัน LCS ต้องไม่ใช้ตัวท้ายของฝั่งใดฝั่งหนึ่ง จึงเอาค่าที่ดีกว่าระหว่าง (m−1, n) กับ (m, n−1)</p><p class="eq">c[i, j] = c[i−1, j−1] + 1 เมื่อ x<sub>i</sub> = y<sub>j</sub> มิฉะนั้น max(c[i, j−1], c[i−1, j])</p>'],
    ['การย้อนหาคำตอบ', '<p>เริ่มที่ (m, n) แล้วเดินตามลูกศร ช่อง ↖ คือตัวอักษรของ LCS ตัวอักษรจึงได้จากท้ายมาหน้า</p>'],
  ],
  runtime: { a: 'O(mn) · ย้อนคำตอบ O(m + n)', why: 'ตารางมี (m+1)(n+1) ช่อง ช่องละ O(1) การย้อนเดินขึ้นหรือซ้ายทุกก้าว จึงไม่เกิน m + n ก้าว' },
  pitfalls: ['Subsequence ไม่จำเป็นต้องติดกัน ต่างจาก substring', 'LCS มีได้หลายคำตอบ เช่น BCBA และ BDAB การเลือกทิศเมื่อค่าเท่ากันเปลี่ยนคำตอบที่ได้'],
  slideNotes: ['สไลด์ 31 มีบรรทัด <code>for w ← 0 to W do</code> ติดมาจากโค้ด knapsack บรรทัดนี้ไม่เกี่ยวกับ LCS จึงตัดออก'],
  quiz: [
    { q: 'ความยาว LCS ของ ABCBDAB กับ BDCABA คือ', o: ['3', '4', '5'], a: 1, why: 'c[7, 6] = 4' },
    { q: 'ถ้าเปลี่ยน ≥ เป็น > ในบรรทัด 9 จะเกิดอะไร', o: ['ความยาวผิด', 'ความยาวเท่าเดิม แต่ตัว LCS อาจต่างไป', 'โปรแกรมไม่จบ'], a: 1, why: 'เมื่อค่าเท่ากันเลือกซ้ายแทนบน ย้อนได้ลำดับอื่นที่ยาวเท่ากัน' },
  ],
  links: ['lcsv', 'algv'],
},
{
  id: 'als', sub: 'dp', title: 'Assembly-line scheduling', en: 'Assembly line', slides: '35–44',
  lead: 'เลือกว่าแต่ละสถานีจะอยู่สายไหนให้รถออกจากโรงงานเร็วสุด ทางเลือก 2ⁿ แบบลดเหลือเชิงเส้นด้วย DP',
  procs: [{ name: 'FASTEST-WAY(a, t, e, x, n)', lines: ['f₁[1] ← e₁ + a₁,₁', 'f₂[1] ← e₂ + a₂,₁', 'for j ← 2 to n', '    do if f₁[j−1] + a₁,ⱼ ≤ f₂[j−1] + t₂,ⱼ₋₁ + a₁,ⱼ', '        then f₁[j] ← f₁[j−1] + a₁,ⱼ', '             l₁[j] ← 1', '        else f₁[j] ← f₂[j−1] + t₂,ⱼ₋₁ + a₁,ⱼ', '             l₁[j] ← 2', '    if f₂[j−1] + a₂,ⱼ ≤ f₁[j−1] + t₁,ⱼ₋₁ + a₂,ⱼ', '        then f₂[j] ← f₂[j−1] + a₂,ⱼ', '             l₂[j] ← 2', '        else f₂[j] ← f₁[j−1] + t₁,ⱼ₋₁ + a₂,ⱼ', '             l₂[j] ← 1', 'if f₁[n] + x₁ ≤ f₂[n] + x₂', '    then f* ← f₁[n] + x₁', '         l* ← 1', '    else f* ← f₂[n] + x₂', '         l* ← 2'] }],
  presets: [{ name: 'สไลด์ 44', def: alsDef(ALS_DATA), run: runALS, opt: { data: ALS_DATA } }],
  notes: [
    ['โครงสร้างย่อย', '<p>ทางเร็วสุดถึง S<sub>1,j</sub> ต้องมาจาก S<sub>1,j−1</sub> หรือ S<sub>2,j−1</sub> และช่วงก่อนหน้าต้องเป็นทางเร็วสุดถึงสถานีนั้นด้วย</p><p class="eq">f<sub>1</sub>[j] = min( f<sub>1</sub>[j−1] + a<sub>1,j</sub>, f<sub>2</sub>[j−1] + t<sub>2,j−1</sub> + a<sub>1,j</sub> )</p>'],
    ['ถ้าเขียนแบบ recursive', '<p>f<sub>i</sub>[j] ถูกอ้างถึง 2<sup>n−j</sup> ครั้ง รวมเป็น Θ(2ⁿ) แต่จริง ๆ มีปัญหาย่อยแค่ 2n ตัว</p>'],
  ],
  runtime: { a: 'O(n)', why: 'ลูปเดียว n − 1 รอบ รอบละ O(1) เทียบกับ brute force ที่ต้องลอง 2ⁿ เส้นทาง เส้นทางละ Θ(n)' },
  pitfalls: ['อยู่สายเดิมไม่มีค่าย้าย ค่า t คิดเฉพาะตอนเปลี่ยนสาย', 'อย่าลืมบวก e ตอนเข้าและ x ตอนออก'],
  quiz: [
    { q: 'f* ของตัวอย่างในสไลด์ 44 คือ', o: ['35', '37', '38'], a: 2, why: 'min(35 + 3, 37 + 2) = 38' },
    { q: 'จำนวนปัญหาย่อยที่ต่างกันทั้งหมดคือ', o: ['2n', 'n²', '2ⁿ'], a: 0, why: 'f₁[j] และ f₂[j] อย่างละ n ค่า' },
  ],
  links: [],
},
];

const H0 = [16, 14, 10, 8, 7, 9, 3, 2, 4, 1], H_IN = [4, 1, 3, 2, 16, 9, 10, 14, 8, 7];
const MAXH = { name: 'MAX-HEAPIFY(A, i)', lines: ['l = LEFT(i)', 'r = RIGHT(i)', 'if l ≤ A.heap-size and A[l] > A[i]', '    largest = l', 'else largest = i', 'if r ≤ A.heap-size and A[r] > A[largest]', '    largest = r', 'if largest ≠ i', '    exchange A[i] with A[largest]', '    MAX-HEAPIFY(A, largest)'] };
const HEAP_L = [
{
  id: 'heap', sub: 'heap', title: 'Heap และ MAX-HEAPIFY', en: 'Heap / Max-Heapify', slides: '3–8',
  lead: 'Heap คืออาร์เรย์ที่มองเป็นต้นไม้ไบนารีเกือบสมบูรณ์ได้ MAX-HEAPIFY ดันค่าที่ผิดที่ลงไปจนถูกตำแหน่ง',
  procs: [MAXH],
  presets: [{ name: 'สไลด์ 8', def: heapDef(10), run: runHeapify, opt: { A: [16, 4, 10, 14, 7, 9, 3, 2, 8, 1], i: 2 } }],
  notes: [
    ['อาร์เรย์กับต้นไม้', '<p>รากคือ A[1] และคำนวณตำแหน่งได้ทันที: PARENT(i) = ⌊i/2⌋, LEFT(i) = 2i, RIGHT(i) = 2i + 1 ตัวเลขเล็กมุมซ้ายบนของโหนดคือ index ในอาร์เรย์ <code>A.length</code> คือขนาดอาร์เรย์ ส่วน <code>A.heap-size</code> คือจำนวนสมาชิกที่นับเป็น heap</p>'],
    ['สมบัติ', '<p><b>Max-heap</b>: A[PARENT(i)] ≥ A[i] ค่ามากสุดจึงอยู่ที่ราก <b>Min-heap</b> กลับกัน ความสูงของ heap ขนาด n คือ ⌊lg n⌋</p>'],
    ['เงื่อนไขก่อนเรียก', '<p>MAX-HEAPIFY สมมติว่า subtree ซ้ายและขวาของ i เป็น max-heap แล้ว เหลือแค่ A[i] ที่อาจเล็กเกินไป จึงเทียบกับลูกสองตัวแล้วสลับลงทีละชั้น</p>'],
  ],
  runtime: { a: 'O(lg n)', why: 'แต่ละชั้นทำงาน Θ(1) และลงได้ไม่เกินความสูงของต้นไม้ สมการคือ T(n) ≤ T(2n/3) + Θ(1) เพราะ subtree ที่ใหญ่สุดมีไม่เกิน 2n/3 โหนด ซึ่งกรณีที่ 2 ของ Master theorem ให้ O(lg n) หรือเขียนเป็น O(h) ตามความสูงโหนด' },
  pitfalls: ['ต้องสลับกับลูกตัวที่ใหญ่กว่า', 'ใช้ได้เมื่อ subtree ทั้งสองเป็น heap แล้วเท่านั้น'],
  quiz: [
    { q: 'ลูกซ้ายและขวาของ A[5] คือตำแหน่งใด', o: ['10 และ 11', '9 และ 10', '6 และ 7'], a: 0, why: 'LEFT = 2i, RIGHT = 2i + 1' },
    { q: 'ในสไลด์ 8 ค่า 4 จบที่ตำแหน่งใด', o: ['4', '8', '9'], a: 2, why: '4 สลับกับ 14 ที่ตำแหน่ง 4 แล้วสลับกับ 8 ที่ตำแหน่ง 9' },
  ],
  links: ['heapv', 'galles'],
},
{
  id: 'bheap', sub: 'heap', title: 'Build-Max-Heap', en: 'Build-Max-Heap', slides: '9–10',
  lead: 'แปลงอาร์เรย์ใด ๆ เป็น max-heap โดยเรียก MAX-HEAPIFY จากโหนดกลางไล่ขึ้นมาถึงราก',
  procs: [{ name: 'BUILD-MAX-HEAP(A)', lines: ['A.heap-size = A.length', 'for i = ⌊A.length/2⌋ downto 1', '    MAX-HEAPIFY(A, i)'] }, MAXH],
  presets: [{ name: 'สไลด์ 10', def: heapDef(10), run: runBuild, opt: { A: H_IN }, adapt: A => ({ def: heapDef(A.length), opt: { A } }) }],
  custom: { label: 'ใส่ตัวเลขคั่นด้วยช่องว่าง', sample: '3 9 2 1 4 5', parse: t => numsOf(t, 2, 15) },
  notes: [
    ['ทำไมเริ่มที่ ⌊n/2⌋', '<p>ตำแหน่ง ⌊n/2⌋ + 1 ถึง n เป็นใบทั้งหมด ใบคือ heap ขนาด 1 อยู่แล้ว จึงเริ่มจากโหนดที่มีลูกตัวสุดท้าย</p>'],
    ['ทำไมไล่จากล่างขึ้นบน', '<p>เงื่อนไขของ MAX-HEAPIFY คือลูกทั้งสองต้องเป็น heap แล้ว การไล่ลดลงทำให้ subtree ด้านล่างเสร็จก่อนเสมอ</p>'],
    ['Min-heap', '<p>ใช้ BUILD-MIN-HEAP โดยเปลี่ยนบรรทัด 3 เป็น MIN-HEAPIFY</p>'],
  ],
  runtime: { a: 'O(n)', why: 'ขอบบนหยาบคือ O(n lg n) แต่โหนดส่วนใหญ่อยู่ใกล้ใบและ heapify สั้นมาก โหนดความสูง h มีไม่เกิน ⌈n/2^(h+1)⌉ ตัว ต้นทุนรวมคือ Σ ⌈n/2^(h+1)⌉·O(h) = O(n·Σ h/2^h) = O(n)' },
  pitfalls: ['ถ้าไล่จาก 1 ขึ้นไปจะได้ผลผิด เพราะลูกยังไม่เป็น heap', 'ตอบ O(n lg n) ถูกในแง่ขอบบน แต่ขอบที่แน่นคือ O(n)'],
  quiz: [
    { q: 'n = 10 ลูปเริ่มที่ i เท่าไร', o: ['5', '9', '10'], a: 0, why: '⌊10/2⌋ = 5' },
    { q: 'Running time ที่แน่นของ BUILD-MAX-HEAP คือ', o: ['O(lg n)', 'O(n)', 'O(n lg n)'], a: 1, why: 'ผลรวม h/2^h ลู่เข้าค่าคงที่' },
  ],
  links: ['heapv'],
},
{
  id: 'hsort', sub: 'heap', title: 'Heapsort', en: 'Heapsort', slides: '11–13',
  lead: 'สร้าง max-heap แล้วสลับรากไปท้ายซ้ำ ๆ ส่วนท้ายอาร์เรย์จึงค่อย ๆ เรียงเสร็จ',
  procs: [{ name: 'HEAPSORT(A)', lines: ['BUILD-MAX-HEAP(A)', 'for i = A.length downto 2', '    exchange A[1] with A[i]', '    A.heap-size = A.heap-size − 1', '    MAX-HEAPIFY(A, 1)'] }, MAXH],
  presets: [{ name: 'สไลด์ 12–13', def: heapDef(10), run: runHeapsort, opt: { A: H_IN }, adapt: A => ({ def: heapDef(A.length), opt: { A } }) }],
  custom: { label: 'ใส่ตัวเลขคั่นด้วยช่องว่าง', sample: '3 9 2 1 4 5', parse: t => numsOf(t, 2, 15) },
  notes: [['ขั้นตอน', '<p>ค่ามากสุดอยู่ที่รากเสมอ สลับไปตำแหน่งสุดท้ายของ heap แล้วลด heap-size ค่าใหม่ที่รากอาจละเมิดสมบัติ จึงเรียก MAX-HEAPIFY(A, 1) ทำซ้ำจนเหลือขนาด 2 โหนดสีดำในภาพคือสมาชิกที่อยู่ตำแหน่งสุดท้ายแล้ว</p>'], ['จุดเด่น', '<p>เรียงในที่ (in-place) ใช้พื้นที่เพิ่ม O(1) และเวลาแย่สุดเป็น O(n lg n) แต่ไม่ stable</p>']],
  runtime: { a: 'O(n lg n)', why: 'BUILD ใช้ O(n) และเรียก MAX-HEAPIFY n − 1 ครั้ง ครั้งละ O(lg n)' },
  pitfalls: ['ต้องลด heap-size ก่อนเรียก heapify ไม่งั้นค่าที่เรียงแล้วถูกดึงกลับ', 'ลูปหยุดที่ i = 2 เพราะตัวสุดท้ายเรียงอยู่แล้ว'],
  quiz: [{ q: 'Heapsort ใช้พื้นที่เพิ่มเท่าไร (ไม่นับ stack ของ recursion ใน heapify)', o: ['O(1)', 'O(lg n)', 'O(n)'], a: 0, why: 'สลับภายในอาร์เรย์เดิม' }],
  links: ['heapv', 'sortv'],
},
{
  id: 'pq', sub: 'heap', title: 'Priority queue', en: 'Priority queue', slides: '14–17',
  lead: 'Heap ทำให้ดึงค่ามากสุดและปรับ key ได้ใน O(lg n) จึงเป็นโครงสร้างหลักของ Prim, Dijkstra และ best-first B&B',
  procs: [{ name: 'HEAP-INCREASE-KEY(A, i, key)', lines: ['if key < A[i]', '    error "new key is smaller than current key"', 'A[i] = key', 'while i > 1 and A[PARENT(i)] < A[i]', '    exchange A[i] with A[PARENT(i)]', '    i = PARENT(i)'] }],
  presets: [
    { name: 'Increase-Key (สไลด์ 17)', def: heapDef(10), run: runPQIncrease, opt: { A: H0, i: 9, key: 15 } },
    { name: 'Extract-Max', def: heapDef(10), run: runPQExtract, opt: { A: H0 }, procs: [{ name: 'HEAP-EXTRACT-MAX(A)', lines: ['if A.heap-size < 1', '    error "heap underflow"', 'max = A[1]', 'A[1] = A[A.heap-size]', 'A.heap-size = A.heap-size − 1', 'MAX-HEAPIFY(A, 1)', 'return max'] }, MAXH] },
    { name: 'Insert', def: heapDef(11), run: runPQInsert, opt: { A: H0, key: 15 }, procs: [{ name: 'MAX-HEAP-INSERT(A, key)', lines: ['A.heap-size = A.heap-size + 1', 'A[A.heap-size] = −∞', 'HEAP-INCREASE-KEY(A, A.heap-size, key)'] }, { name: 'HEAP-INCREASE-KEY(A, i, key)', lines: ['if key < A[i]', '    error "new key is smaller than current key"', 'A[i] = key', 'while i > 1 and A[PARENT(i)] < A[i]', '    exchange A[i] with A[PARENT(i)]', '    i = PARENT(i)'] }] },
  ],
  notes: [['Operation', '<div class="tw"><table class="cmp"><thead><tr><th>Max-priority queue</th><th>ความหมาย</th><th>เวลา</th></tr></thead><tbody><tr><td>Maximum(S)</td><td>ดูค่ามากสุด</td><td>Θ(1)</td></tr><tr><td>Extract-Max(S)</td><td>เอาค่ามากสุดออก</td><td>O(lg n)</td></tr><tr><td>Increase-Key(S, x, k)</td><td>เพิ่ม key เป็น k</td><td>O(lg n)</td></tr><tr><td>Insert(S, x)</td><td>เพิ่มสมาชิก</td><td>O(lg n)</td></tr></tbody></table></div><p>Min-priority queue มี Insert, Minimum, Extract-Min และ Decrease-Key ซึ่งเป็นตัวที่ Prim และ Dijkstra ใช้</p>'], ['ทำไม Insert ใส่ −∞ ก่อน', '<p>−∞ ไม่ละเมิด heap แน่นอน แล้วใช้ Increase-Key ที่มีอยู่แล้วดันขึ้นไปยังตำแหน่งที่ถูก</p>']],
  runtime: { a: 'Maximum Θ(1) · อื่น ๆ O(lg n)', why: 'HEAP-MAXIMUM อ่าน A[1] Extract-Max เรียก heapify ครั้งเดียว Increase-Key เดินจากโหนดขึ้นรากไม่เกินความสูง ส่วน Insert เพิ่ม O(1) แล้วเรียก Increase-Key' },
  pitfalls: ['Increase-Key เดินขึ้น Extract-Max เดินลง', 'Min-heap ใช้ Decrease-Key ไม่ใช่ Increase-Key'],
  quiz: [{ q: 'Increase-Key ที่ตำแหน่ง 9 เป็น 15 ในสไลด์ 17 ค่า 15 จบที่ตำแหน่งใด', o: ['2', '4', '9'], a: 0, why: 'สลับกับ 8 ที่ตำแหน่ง 4 แล้วกับ 14 ที่ตำแหน่ง 2 จากนั้นพ่อคือ 16 จึงหยุด' }],
  links: ['heapv'],
},
{
  id: 'dsu', sub: 'heap', title: 'Disjoint sets', en: 'Disjoint sets', slides: '18–20',
  lead: 'เก็บกลุ่มของสมาชิกที่ไม่ซ้อนกัน รวมกลุ่มและถามว่าอยู่กลุ่มเดียวกันไหม เป็นหัวใจของ Kruskal',
  procs: [{ name: 'CONNECTED-COMPONENTS(G)', lines: ['for each vertex v ∈ G.V', '    MAKE-SET(v)', 'for each edge (u, v) ∈ G.E', '    if FIND-SET(u) ≠ FIND-SET(v)', '        UNION(u, v)'] }, { name: 'SAME-COMPONENT(u, v)', lines: ['if FIND-SET(u) == FIND-SET(v)', '    return TRUE', 'else return FALSE'] }],
  presets: [{ name: 'กราฟในสไลด์ 19', def: DSU_DEF, run: runDSU }],
  notes: [['Operation', '<p><b>MAKE-SET(x)</b> สร้างชุดใหม่ที่มี x ตัวเดียว <b>UNION(x, y)</b> รวมชุดของ x กับ y <b>FIND-SET(x)</b> คืน representative ของชุด สมาชิกชุดเดียวกันจะได้ representative เดียวกัน</p>'], ['ตัวอย่างการใช้', '<p>แต่ละ edge เรียก UNION เมื่อปลายอยู่คนละชุด ตอนจบแต่ละชุดคือหนึ่ง connected component Kruskal ใช้ตรรกะเดียวกันนี้เพื่อกันการเกิดวงจร</p>']],
  runtime: { a: 'O(m α(n)) ด้วย rank + path compression', why: 'สไลด์ไม่ได้ถามเวลาโดยตรง ตาม CLRS ถ้าใช้ disjoint-set forest กับ union by rank และ path compression ลำดับ m operation ที่มี MAKE-SET n ครั้งใช้ O(m α(n)) และ α(n) แทบเป็นค่าคงที่' },
  pitfalls: ['representative จะเป็นสมาชิกตัวไหนก็ได้ ขอแค่ทุกคนในชุดได้ตัวเดียวกัน', 'edge (b, c) ตัวสุดท้ายในสไลด์ไม่เปลี่ยนอะไร เพราะอยู่ชุดเดียวกันแล้ว'],
  quiz: [{ q: 'กราฟในสไลด์ 19 มี connected components กี่ชุด', o: ['3', '4', '5'], a: 1, why: '{a,b,c,d}, {e,f,g}, {h,i}, {j}' }],
  links: ['ufds', 'galles'],
},
];

const SORT_IN = [5, 2, 4, 7, 1, 3, 2, 6];
const MS_PROC = { name: 'MERGE-SORT(A, p, r)', lines: ['if p < r', '    q = ⌊(p + r)/2⌋', '    MERGE-SORT(A, p, q)', '    MERGE-SORT(A, q + 1, r)', '    MERGE(A, p, q, r)'] };
const MG_PROC = { name: 'MERGE(A, p, q, r)', lines: ['n₁ = q − p + 1', 'n₂ = r − q', 'let L[1..n₁+1] and R[1..n₂+1] be new arrays', 'for i = 1 to n₁', '    L[i] = A[p + i − 1]', 'for j = 1 to n₂', '    R[j] = A[q + j]', 'L[n₁ + 1] = ∞', 'R[n₂ + 1] = ∞', 'i = 1', 'j = 1', 'for k = p to r', '    if L[i] ≤ R[j]', '        A[k] = L[i]', '        i = i + 1', '    else A[k] = R[j]', '        j = j + 1'] };
const PART_PROC = { name: 'PARTITION(A, p, r)', lines: ['x = A[r]', 'i = p − 1', 'for j = p to r − 1', '    if A[j] ≤ x', '        i = i + 1', '        exchange A[i] with A[j]', 'exchange A[i + 1] with A[r]', 'return i + 1'] };
const QS_PROC = { name: 'QUICKSORT(A, p, r)', lines: ['if p < r', '    q = PARTITION(A, p, r)', '    QUICKSORT(A, p, q − 1)', '    QUICKSORT(A, q + 1, r)'] };
const PQ_LEG = [['lo', '≤ pivot'], ['hi', '> pivot'], ['piv', 'pivot'], ['tgt', 'ตำแหน่งสุดท้ายของ pivot']];
const DC_L = [
{
  id: 'dc', sub: 'dc', title: 'แนวคิด Divide and Conquer', en: 'Paradigm', slides: '3–6',
  lead: 'แบ่งเป็นปัญหาย่อยแบบเดียวกัน แก้แบบ recursive แล้วรวมคำตอบ ตัวอย่างการหาผลรวมแสดงว่าไม่ได้เร็วขึ้นเสมอไป',
  procs: [{ name: 'SUM(a, l, r)', lines: ['if l = r return a[l]', 'm = ⌊(l + r)/2⌋', 'return SUM(a, l, m) + SUM(a, m + 1, r)'] }],
  presets: [{ name: 'ผลรวม 8 ตัว (สไลด์ 4)', input: { A: SORT_IN }, run: runSum }],
  legend: [['cur', 'ช่วงที่กำลังทำ'], ['done', 'คำตอบของช่วง']],
  custom: { label: 'ใส่ตัวเลขคั่นด้วยช่องว่าง', sample: '3 1 4 1 5', parse: t => ({ A: numsOf(t, 2, 12) }) },
  notes: [['สามขั้นตอน', '<p><b>Divide</b> แบ่งเป็นปัญหาย่อยแบบเดียวกัน <b>Conquer</b> แก้แบบ recursive ถ้าเล็กพอก็แก้ตรง ๆ <b>Combine</b> รวมคำตอบย่อย วิเคราะห์เวลาด้วยสมการ recurrence</p>'], ['คำถามในสไลด์ 4', '<p>เร็วกว่า brute force ไหม คำตอบคือไม่ T(n) = 2T(n/2) + 1 ได้ Θ(n) ใช้การบวก n − 1 ครั้งเท่ากัน แต่แบ่งงานให้ประมวลผลขนานได้ดี</p>']],
  runtime: { a: 'Θ(n)', why: 'T(n) = 2T(n/2) + Θ(1) เป็นกรณีที่ 1 ของ Master theorem' },
  pitfalls: ['D&C ไม่ได้เร็วกว่าเสมอ ขึ้นกับต้นทุนการรวมและจำนวนปัญหาย่อย'],
  quiz: [{ q: 'รวมตัวเลข 8 ตัวแบบ D&C ใช้การบวกกี่ครั้ง', o: ['3', '7', '8'], a: 1, why: 'n − 1 ครั้ง เท่ากับแบบไล่บวก' }],
  links: ['recv'],
},
{
  id: 'merge', sub: 'dc', title: 'Merge sort', en: 'Merge sort', slides: '7–13',
  lead: 'แบ่งครึ่งจนเหลือตัวเดียว แล้วรวมสองส่วนที่เรียงแล้วด้วย MERGE ซึ่งเป็นงานหลักของอัลกอริทึมนี้',
  procs: [MS_PROC],
  presets: [
    { name: 'ทั้งอัลกอริทึม (สไลด์ 11–12)', input: { A: SORT_IN }, run: runMergeSort, legend: [['cur', 'ช่วงที่กำลังทำ'], ['done', 'เรียงแล้ว']] },
    { name: 'ขั้น MERGE (สไลด์ 9–10)', input: { A: [2, 4, 5, 7, 1, 2, 3, 6], base: 9, p: 9, q: 12, r: 16 }, run: runMerge, procs: [MG_PROC], legend: [['lo', 'วางแล้ว'], ['tgt', 'ตำแหน่ง k'], ['src', 'ตัวที่กำลังเทียบ'], ['out', 'ใช้ไปแล้ว']] },
  ],
  custom: { label: 'ใส่ตัวเลขคั่นด้วยช่องว่าง', sample: '38 27 43 3 9 82 10', parse: t => ({ A: numsOf(t, 2, 12) }), only: 0 },
  notes: [['MERGE', '<p>คัดลอกสองครึ่งไป L และ R แล้วปิดด้วย ∞ เป็น sentinel จากนั้นเทียบหัวของสองอาร์เรย์ทีละตำแหน่ง วางตัวเล็กลงใน A เมื่อฝั่งหนึ่งหมด ∞ ทำให้อีกฝั่งถูกเลือกเองโดยไม่ต้องตรวจเงื่อนไข</p>'], ['วิเคราะห์', '<p>Divide ใช้ Θ(1) Conquer คือ 2T(n/2) Combine ใช้ Θ(n)</p><p class="eq">T(n) = 2T(n/2) + Θ(n)</p>']],
  runtime: { a: 'Θ(n lg n)', why: 'ต้นไม้ recursion มี lg n + 1 ชั้น ชั้นละ cn หรือใช้ Master theorem กรณีที่ 2 กับ a = 2, b = 2, f(n) = n' },
  pitfalls: ['MERGE ใช้ ≤ เพื่อรักษาลำดับของค่าที่เท่ากัน (stable)', 'ต้องใช้พื้นที่เพิ่ม Θ(n) สำหรับ L และ R'],
  quiz: [{ q: 'MERGE บนช่วงขนาด n ใช้เวลาเท่าไร', o: ['Θ(lg n)', 'Θ(n)', 'Θ(n lg n)'], a: 1, why: 'แต่ละรอบวางค่าหนึ่งตำแหน่ง' }],
  links: ['sortv', 'galles'],
},
{
  id: 'recur', sub: 'dc', title: 'Recurrence และ Master theorem', en: 'Master theorem', slides: '14–22',
  lead: 'แปลงโครงสร้าง recursive เป็นสมการ แล้วดูว่างานไปกองที่ราก เท่ากันทุกชั้น หรือไปกองที่ใบ',
  procs: [{ name: 'Master theorem (สไลด์ 20)', lines: ['T(n) = a·T(n/b) + f(n)', 'คำนวณ n^(log_b a)', 'กรณี 1: f(n) = O(n^(log_b a − ε)) → Θ(n^(log_b a))', 'กรณี 2: f(n) = Θ(n^(log_b a) lgᵏ n) → Θ(n^(log_b a) lgᵏ⁺¹ n)', 'กรณี 3: f(n) = Ω(n^(log_b a + ε)) และ a·f(n/b) ≤ c·f(n) → Θ(f(n))'] }],
  presets: [
    { name: 'แบบฝึก 9 ข้อ (สไลด์ 21–22)', input: { list: MASTER_EX }, run: runMaster },
    { name: 'Recursion tree (สไลด์ 17–18)', input: {}, run: runRecTree, procs: [] },
  ],
  custom: { label: 'ใส่ <code>a b d k</code> สำหรับ T(n) = aT(n/b) + n^d log^k n', sample: '7 2 2 0', parse: t => { const [a, b, d, k] = numsOf(t, 4, 4); if (a < 1 || b <= 1 || d < 0 || k < 0) throw new Error('กำหนด a ≥ 1, b > 1, d ≥ 0, k ≥ 0'); return { list: [{ t: `${a}T(n/${b}) + n^${d} log^${k} n`, a, b, d, k }] }; }, only: 0 },
  notes: [
    ['สามวิธี', '<p><b>Iterative substitution</b> แทนค่าซ้ำจนเห็นแบบแผน <b>Recursion tree</b> รวมงานทีละชั้น <b>Master method</b> เทียบ f(n) กับ n<sup>log<sub>b</sub> a</sup></p>'],
    ['อ่านกราฟแท่งอย่างไร', '<p>แต่ละแท่งคืองานรวมของชั้นนั้น n<sup>log<sub>b</sub> a</sup> คืองานที่ใบ ถ้าใบหนักสุดเข้ากรณี 1 ถ้าแต่ละชั้นใกล้กันเข้ากรณี 2 ถ้ารากหนักสุดเข้ากรณี 3</p>'],
    ['เฉลยแบบฝึก', '<div class="tw"><table class="cmp"><thead><tr><th>ข้อ</th><th>T(n)</th><th>n<sup>log<sub>b</sub> a</sup></th><th>กรณี</th><th>คำตอบ</th></tr></thead><tbody><tr><td>1</td><td>4T(n/2) + n</td><td>n²</td><td>1</td><td>Θ(n²)</td></tr><tr><td>2</td><td>2T(n/2) + n log n</td><td>n</td><td>2 (k=1)</td><td>Θ(n log² n)</td></tr><tr><td>3</td><td>T(n/3) + n log n</td><td>1</td><td>3</td><td>Θ(n log n)</td></tr><tr><td>4</td><td>8T(n/2) + n²</td><td>n³</td><td>1</td><td>Θ(n³)</td></tr><tr><td>5</td><td>9T(n/3) + n</td><td>n²</td><td>1</td><td>Θ(n²)</td></tr><tr><td>6</td><td>T(n/2) + 1</td><td>1</td><td>2 (k=0)</td><td>Θ(log n)</td></tr><tr><td>7</td><td>2T(n/2) + log n</td><td>n</td><td>1</td><td>Θ(n)</td></tr><tr><td>8</td><td>T(2n/3) + 1</td><td>1</td><td>2 (k=0)</td><td>Θ(log n)</td></tr><tr><td>9</td><td>3T(n/4) + n log n</td><td>n^0.793</td><td>3</td><td>Θ(n log n)</td></tr></tbody></table></div>'],
  ],
  pitfalls: ['กรณี 1 และ 3 ต้องต่างกันเชิงพหุนาม (มี ε) ส่วนต่างแค่ตัว log ต้องดูกรณี 2', 'กรณี 3 ต้องตรวจเงื่อนไข regularity ด้วย', 'ข้อ 8: b = 3/2 เพราะ n ลดเหลือ 2n/3'],
  quiz: [
    { q: 'T(n) = 7T(n/2) + n² ได้เท่าไร', o: ['Θ(n²)', 'Θ(n^2.81)', 'Θ(n³)'], a: 1, why: 'log₂ 7 ≈ 2.81 > 2 จึงเข้ากรณี 1' },
    { q: 'T(n) = 2T(n/2) + n log n เข้ากรณีไหนตามรูปแบบในสไลด์', o: ['1', '2 โดย k = 1', '3'], a: 1, why: 'n log n เท่ากับ n¹ คูณ log¹ n ได้ Θ(n log² n)' },
  ],
  links: ['recv'],
},
{
  id: 'quick', sub: 'dc', title: 'Quicksort', en: 'Quicksort', slides: '23–30',
  lead: 'งานหลักอยู่ขั้น Divide คือ PARTITION รอบ pivot แล้วไม่ต้องรวมอะไร ความเร็วจึงขึ้นกับว่าแบ่งได้สมดุลแค่ไหน',
  procs: [PART_PROC],
  presets: [
    { name: 'PARTITION (สไลด์ 25)', input: { A: [2, 8, 7, 1, 3, 5, 6, 4] }, run: runPartition, legend: PQ_LEG },
    { name: 'ทั้งอัลกอริทึม', input: { A: [2, 8, 7, 1, 3, 5, 6, 4] }, run: runQuick, procs: [QS_PROC], legend: [['pv', 'pivot หลังแบ่ง'], ['done', 'ช่วงตัวเดียว']] },
    { name: 'Worst case: เรียงอยู่แล้ว', input: { A: [1, 2, 3, 4, 5, 6, 7, 8] }, run: runQuick, procs: [QS_PROC], legend: [['pv', 'pivot หลังแบ่ง'], ['done', 'ช่วงตัวเดียว']] },
    { name: 'Randomized (สไลด์ 30)', input: { A: [1, 2, 3, 4, 5, 6, 7, 8] }, opt: { random: true }, run: runQuick, procs: [{ name: 'RANDOMIZED-QUICKSORT(A, p, r)', lines: ['if p < r', '    q = RANDOMIZED-PARTITION(A, p, r)', '    RANDOMIZED-QUICKSORT(A, p, q − 1)', '    RANDOMIZED-QUICKSORT(A, q + 1, r)'] }], legend: [['pv', 'pivot หลังแบ่ง'], ['done', 'ช่วงตัวเดียว']] },
  ],
  custom: { label: 'ใส่ตัวเลขคั่นด้วยช่องว่าง', sample: '9 3 7 1 8 2', parse: t => ({ A: numsOf(t, 2, 12) }) },
  notes: [['Invariant ของ PARTITION', '<p>ระหว่างลูป A[p..i] ≤ x, A[i+1..j−1] > x และ A[j..r−1] ยังไม่ได้ตรวจ ท้ายสุดสลับ pivot มาตรงกลาง สีในภาพคือสามโซนนี้</p>'], ['สามกรณี', '<div class="tw"><table class="cmp"><thead><tr><th>กรณี</th><th>สมการ</th><th>ผล</th></tr></thead><tbody><tr><td>Worst</td><td>T(n−1) + T(0) + Θ(n)</td><td>Θ(n²)</td></tr><tr><td>Best</td><td>2T(n/2) + Θ(n)</td><td>Θ(n lg n)</td></tr><tr><td>Average</td><td>(1/n)Σ[T(k−1) + T(n−k)] + (n−1)</td><td>Θ(n lg n)</td></tr></tbody></table></div>'], ['ทำไมต้องสุ่ม', '<p>Worst case เกิดกับ input ที่เรียงอยู่แล้วเมื่อใช้ A[r] เป็น pivot การสุ่ม pivot ทำให้ผลไม่ขึ้นกับ input ลองเปรียบเทียบจำนวนการเทียบในตัวอย่าง Worst case กับ Randomized</p>']],
  runtime: { a: 'Worst Θ(n²) · Average และ Best Θ(n lg n)', why: 'PARTITION ใช้ Θ(n) ความลึกของ recursion ขึ้นกับการแบ่ง ถ้าเอียงสุดลึก n ชั้น ถ้าสมดุลลึก lg n ชั้น' },
  pitfalls: ['ไม่มีขั้น Combine งานอยู่ที่ Divide', 'Input ที่เรียงแล้วคือกรณีแย่สุดเมื่อใช้ตัวท้ายเป็น pivot', 'Quicksort ไม่ stable'],
  quiz: [{ q: 'อาร์เรย์เรียงแล้วขนาด 8 ใช้ A[r] เป็น pivot เปรียบเทียบกี่ครั้ง', o: ['16', '24', '28'], a: 2, why: '7 + 6 + … + 1 = 28' }, { q: 'PARTITION ในสไลด์ 25 คืนค่า q เท่าไร', o: ['3', '4', '5'], a: 1, why: 'pivot 4 จบที่ตำแหน่ง 4' }],
  links: ['sortv', 'galles'],
},
{
  id: 'bs', sub: 'dc', title: 'Binary search', en: 'Binary search', slides: '31–32',
  lead: 'เทียบกับตัวกลางแล้วตัดอีกครึ่งทิ้ง อาร์เรย์ต้องเรียงแล้วเท่านั้น',
  procs: [{ name: 'BINARY-SEARCH(A, K)', lines: ['lo = 0; hi = n − 1', 'while lo ≤ hi', '    m = ⌊(lo + hi)/2⌋', '    if K = A[m] return m', '    else if K < A[m] then hi = m − 1', '    else lo = m + 1', 'return −1'] }],
  presets: [{ name: 'พบ K = 23', input: { A: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], K: 23 }, run: runBinSearch }, { name: 'ไม่พบ K = 40', input: { A: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], K: 40 }, run: runBinSearch }],
  legend: [['piv', 'ตัวกลาง'], ['tgt', 'พบแล้ว'], ['out', 'ตัดทิ้ง']],
  custom: { label: 'บรรทัดแรกคืออาร์เรย์ บรรทัดสองคือ K', sample: '1 3 5 7 9 11\n7', parse: t => { const ln = t.trim().split('\n').filter(s => s.trim()); if (ln.length !== 2) throw new Error('ใส่สองบรรทัด'); const A = numsOf(ln[0], 1, 16).sort((a, b) => a - b); return { A, K: numsOf(ln[1], 1, 1)[0] }; } },
  notes: [['เฉลยคำถามสไลด์ 32', '<p>จำนวนการเทียบกรณีแย่สุดคือ ⌊lg n⌋ + 1 เพราะแต่ละครั้งเหลือไม่เกินครึ่ง ตัวอย่าง n = 10 ใช้ไม่เกิน 4 ครั้ง</p><p>T(n) = T(n/2) + Θ(1): a = 1, b = 2 ดังนั้น n<sup>log₂1</sup> = 1 = f(n) เข้ากรณีที่ 2 เมื่อ k = 0 ได้ Θ(log n)</p>']],
  runtime: { a: 'Θ(lg n)', why: 'กรณีที่ 2 ของ Master theorem กรณีดีสุดเป็น Θ(1) เมื่อเจอที่ตัวกลางพอดี' },
  pitfalls: ['ถ้าอาร์เรย์ไม่เรียง ผลใช้ไม่ได้', 'เงื่อนไข lo ≤ hi ใช้ ≤ ไม่ใช่ <'],
  quiz: [{ q: 'อาร์เรย์ 1,000 ตัว เทียบกรณีแย่สุดกี่ครั้ง', o: ['10', '11', '500'], a: 0, why: '⌊lg 1000⌋ + 1 = 9 + 1 = 10' }],
  links: [],
},
{
  id: 'matmul', sub: 'dc', title: 'การคูณเมทริกซ์และ Strassen', en: 'Matrix multiplication', slides: '33–45',
  lead: 'แบ่งเมทริกซ์เป็นสี่ก้อนยังคูณ 8 ครั้งอยู่ Strassen ลดเหลือ 7 ครั้ง ซึ่งเปลี่ยนอันดับเวลาโดยตรง',
  procs: [{ name: "STRASSEN (สไลด์ 41)", lines: ['แบ่ง A, B, C เป็นก้อน n/2 × n/2', 'สร้าง S₁…S₁₀ จากการบวกลบ', 'คูณ recursive 7 ครั้ง ได้ P₁…P₇', 'บวกลบ Pᵢ เพื่อสร้าง C₁₁, C₁₂, C₂₁, C₂₂'] }],
  presets: [
    { name: 'Strassen ตัวเลข 2×2', input: { A: [[1, 3], [7, 5]], B: [[6, 8], [4, 2]] }, run: runStrassen },
    { name: '8 ก้อน เทียบ 7 ก้อน', input: {}, run: runBlockCount, procs: [] },
  ],
  custom: { label: 'ใส่ <code>a11 a12 a21 a22 b11 b12 b21 b22</code>', sample: '1 2 3 4 5 6 7 8', parse: t => { const a = numsOf(t, 8, 8); return { A: [[a[0], a[1]], [a[2], a[3]]], B: [[a[4], a[5]], [a[6], a[7]]] }; }, only: 0 },
  notes: [['สามวิธี', '<div class="tw"><table class="cmp"><thead><tr><th>วิธี</th><th>สมการ</th><th>เวลา</th></tr></thead><tbody><tr><td>Brute force</td><td>สามลูปซ้อน</td><td>Θ(n³)</td></tr><tr><td>D&amp;C แบบง่าย</td><td>8T(n/2) + Θ(n²)</td><td>Θ(n³)</td></tr><tr><td>Strassen</td><td>7T(n/2) + Θ(n²)</td><td>Θ(n<sup>lg 7</sup>) ≈ Θ(n<sup>2.81</sup>)</td></tr></tbody></table></div>'], ['สูตร', '<p>S₁ = B₁₂−B₂₂, S₂ = A₁₁+A₁₂, S₃ = A₂₁+A₂₂, S₄ = B₂₁−B₁₁, S₅ = A₁₁+A₂₂, S₆ = B₁₁+B₂₂, S₇ = A₁₂−A₂₂, S₈ = B₂₁+B₂₂, S₉ = A₁₁−A₂₁, S₁₀ = B₁₁+B₁₂</p><p>P₁ = A₁₁S₁, P₂ = S₂B₂₂, P₃ = S₃B₁₁, P₄ = A₂₂S₄, P₅ = S₅S₆, P₆ = S₇S₈, P₇ = S₉S₁₀</p><p>C₁₁ = P₅+P₄−P₂+P₆, C₁₂ = P₁+P₂, C₂₁ = P₃+P₄, C₂₂ = P₅+P₁−P₃−P₇</p>'], ['ทำไมลดหนึ่งครั้งถึงสำคัญ', '<p>การคูณลดจาก 8 เป็น 7 ลดจำนวนกิ่งของ recursion ทุกชั้น ส่วนการบวกที่เพิ่มขึ้นเป็นแค่ค่าคงที่ใน Θ(n²)</p>']],
  runtime: { a: 'แบบง่าย Θ(n³) · Strassen Θ(n^lg 7)', why: '8T(n/2) + Θ(n²): n^log₂8 = n³ เข้ากรณี 1 ส่วน 7T(n/2) + Θ(n²): n^log₂7 ≈ n^2.81 เข้ากรณี 1 เช่นกัน' },
  pitfalls: ['D&C แบบง่ายไม่ได้เร็วกว่า brute force', 'วิธีนี้สมมติว่า n เป็นกำลังของ 2'],
  quiz: [{ q: 'Strassen ทำ recursive multiplication ต่อชั้นกี่ครั้ง', o: ['4', '7', '8'], a: 1, why: 'P₁ ถึง P₇' }],
  links: [],
},
{
  id: 'hull', sub: 'dc', title: 'Convex hull', en: 'Convex hull', slides: '46–55',
  lead: 'หารั้วที่สั้นที่สุดซึ่งล้อมทุกจุด เทียบ Gift wrapping กับ Divide and Conquer ที่รวมสอง hull ด้วยเส้นสัมผัส',
  procs: [{ name: 'Gift wrapping (สไลด์ 47)', lines: ['เริ่มที่จุดล่างสุด (ถ้าเท่ากันเอาซ้ายสุด)', 'ทำซ้ำ', '    หาจุดที่มี polar angle น้อยสุดเทียบกับ segment ก่อนหน้า', '    เพิ่มจุดนั้นเข้า hull', 'จนกลับมาที่จุดเริ่ม'] }],
  presets: [
    { name: 'Gift wrapping', input: { P: HULL_PTS }, run: runGift },
    { name: 'D&C: หา tangent แล้วรวม (สไลด์ 51–54)', input: CH_DATA, run: runTangent, procs: [{ name: 'Upper tangent', lines: ['เริ่มจากจุดขวาสุดของ CH1 และจุดซ้ายสุดของ CH2', 'หยุดเมื่อเลี้ยวซ้ายกับจุดถัดไปทวนเข็มของ CH1 และเลี้ยวขวากับจุดถัดไปตามเข็มของ CH2', 'ถ้าไม่เลี้ยวซ้ายกับ CH1: หมุนทวนเข็มไปจุดถัดไปใน CH1', 'มิฉะนั้นถ้าไม่เลี้ยวขวากับ CH2: หมุนตามเข็มไปจุดถัดไปใน CH2'] }, { name: 'Lower tangent', lines: ['เริ่มจากจุดขวาสุดของ CH1 และจุดซ้ายสุดของ CH2', 'หยุดเมื่อเลี้ยวขวากับจุดถัดไปตามเข็มของ CH1 และเลี้ยวซ้ายกับจุดถัดไปทวนเข็มของ CH2', 'ถ้าไม่เลี้ยวขวากับ CH1: หมุนตามเข็มไปจุดถัดไปใน CH1', 'มิฉะนั้นถ้าไม่เลี้ยวซ้ายกับ CH2: หมุนทวนเข็มไปจุดถัดไปใน CH2'] }] },
  ],
  notes: [['Gift wrapping', '<p>เหมือนพันเชือกรอบจุด จากจุดปัจจุบันหาจุดที่ทำให้จุดอื่นอยู่ทางซ้ายของเส้นทั้งหมด ไม่ต้องคำนวณมุมจริงก็ได้ ใช้ cross product เทียบทิศพอ</p>'], ['Divide and Conquer', '<p>เรียงจุดตาม x แบ่งซ้ายขวา หา hull แต่ละฝั่ง แล้วรวมด้วย upper tangent และ lower tangent จุดในภาพเป็นตัวอย่างที่สร้างให้มีรูปคล้ายสไลด์ 52 และ 54 เพราะสไลด์ไม่ได้ให้พิกัด</p>']],
  runtime: { a: 'Gift wrapping O(nh) · D&C O(n lg n)', why: 'Gift wrapping หาจุดล่างสุด O(n) และต่อหนึ่งจุดบน hull สแกน O(n) รวม O(nh) แย่สุด O(n²) เมื่อทุกจุดอยู่บน hull ส่วน D&C เรียง T_S = Θ(n lg n) และ T_R(n) = 2T_R(n/2) + O(n) = O(n lg n) รวมเป็น O(n lg n)' },
  pitfalls: ['h คือจำนวนจุดบน hull ไม่ใช่จำนวนจุดทั้งหมด', 'จุดร่วมเส้นตรงต้องเลือกจุดไกลสุด'],
  quiz: [{ q: 'กรณีใด Gift wrapping เร็วกว่า D&C', o: ['เมื่อ h น้อยกว่า lg n', 'เมื่อทุกจุดอยู่บน hull', 'ไม่มีกรณีเลย'], a: 0, why: 'O(nh) < O(n lg n) เมื่อ h < lg n' }],
  links: [],
},
];

const BT_L = [
{
  id: 'nq', sub: 'bt', title: 'Backtracking: N-Queens', en: 'N-Queens', slides: '3–7',
  lead: 'สร้างคำตอบทีละส่วนบน state-space tree เมื่อโหนดไม่มีทางไปถึงคำตอบก็ตัดทิ้งแล้วย้อนกลับ',
  procs: [{ name: 'BACKTRACK (สไลด์ 5)', lines: ['ขยายคำตอบบางส่วนด้วยตัวเลือกถัดไป', 'ถ้า nonpromising: ตัดทิ้ง ไม่ลงไปต่อ', 'ถ้า promising: ลงไปที่โหนดลูก (DFS)', 'ไม่มีตัวเลือกเหลือ: backtrack กลับหาพ่อ', 'ถึงคำตอบ: จบ'] }],
  presets: [{ name: '4-Queens (สไลด์ 7)', input: { n: 4 }, run: runQueens }],
  legend: [['try', 'ช่องที่กำลังลอง'], ['bad', 'ถูกโจมตี']],
  custom: { label: 'ใส่ n (4 ถึง 6)', sample: '5', parse: t => { const n = numsOf(t, 1, 1)[0]; if (n < 4 || n > 6 || !Number.isInteger(n)) throw new Error('n ต้องเป็นจำนวนเต็ม 4 ถึง 6'); return { n }; } },
  notes: [
    ['กลยุทธ์สำหรับโจทย์ยาก', '<p>ทางเลือกที่รับประกันคำตอบตรง: exhaustive search, DP, backtracking, branch-and-bound สองตัวหลังตัดกิ่งได้ แต่แย่สุดยังเป็น exponential อีกทางคือ approximation ที่ได้คำตอบใกล้เคียงในเวลาพหุนาม</p>'],
    ['State-space tree', '<p>โหนดคือคำตอบบางส่วน edge คือการตัดสินใจเพิ่ม เดินแบบ DFS เมื่อพบโหนด nonpromising จะหยุดลงกิ่งนั้น เลขในต้นไม้ของภาพบอกคอลัมน์ที่เลือกในแต่ละแถว</p>'],
  ],
  runtime: { a: 'แย่สุด exponential', why: 'ไม่มีการรับประกันเชิงพหุนาม แต่การตัดกิ่งมักลดโหนดได้มาก 4-queens ใช้เพียง 8 โหนดที่วางได้ จาก 4⁴ รูปแบบ' },
  pitfalls: ['ต้องคืนสถานะก่อนลองตัวเลือกถัดไป', 'ตรวจทั้งคอลัมน์และสองเส้นทแยง'],
  quiz: [{ q: 'คำตอบแรกของ 4-queens ตามลำดับสไลด์ 7 คือคอลัมน์', o: ['1, 3, 4, 2', '2, 4, 1, 3', '3, 1, 4, 2'], a: 1, why: 'เริ่ม queen 1 คอลัมน์ 1 ไม่สำเร็จ จึงย้ายเป็นคอลัมน์ 2' }],
  links: ['algv'],
},
{
  id: 'ham', sub: 'bt', title: 'Hamiltonian circuit', en: 'Hamiltonian circuit', slides: '8',
  lead: 'หาวงจรที่ผ่านทุก vertex ครั้งเดียว ลองเดินตามลำดับตัวอักษร เมื่อตันก็ย้อนกลับ',
  procs: [],
  presets: [{ name: 'กราฟในสไลด์ 8', def: HAM_DEF, run: runHam }],
  notes: [['ขั้นตอน', '<p>เริ่มที่ a เลือก vertex ที่ยังไม่เคยไปตามลำดับตัวอักษร เมื่อเดินครบทุก vertex แล้วมี edge กลับ a ได้จึงเป็นคำตอบ กราฟซ้ายคือเส้นทางปัจจุบัน และต้นไม้คือประวัติการตัดสินใจ</p>']],
  runtime: { a: 'แย่สุด exponential', why: 'เป็นปัญหา NP-complete ไม่มีอัลกอริทึมพหุนามที่รู้จัก' },
  pitfalls: ['เดินครบทุก vertex แล้วยังต้องมี edge กลับจุดเริ่ม', 'Dead end ไม่ได้แปลว่าไม่มีคำตอบ แค่ต้องย้อนกลับไปลองทางอื่น'],
  quiz: [{ q: 'วงจรที่พบตามสไลด์ 8 คือ', o: ['a-b-f-e-c-d-a', 'a-b-c-d-e-f-a', 'a-d-e-f-b-c-a'], a: 0, why: 'โหนด 9 ถึง 12 คือ f, e, c, d แล้วปิดด้วย a' }],
  links: ['algv'],
},
{
  id: 'bba', sub: 'bt', title: 'Branch-and-Bound: Assignment', en: 'B&B Assignment', slides: '9–13',
  lead: 'เพิ่มค่าขอบเขตให้แต่ละโหนด เลือกแตกกิ่งโหนดที่มีแนวโน้มดีสุด และตัดโหนดที่ขอบเขตแย่กว่าคำตอบที่มี',
  procs: [{ name: 'Best-first B&B (สไลด์ 9)', lines: ['คำนวณ bound ของราก', 'เลือก live node ที่ bound ดีสุด', 'แตกกิ่ง คำนวณ bound ของลูก', 'ตัดโหนดที่ bound ไม่ดีกว่าคำตอบที่ดีสุดตอนนี้', 'จบเมื่อไม่มี live node'] }],
  presets: [{ name: 'เมทริกซ์ในสไลด์ 10', input: { C: ASSIGN_C }, run: i => runBBAssign(i) }],
  notes: [['Lower bound', '<p>งานหนึ่งคนต่อหนึ่งงาน ทุกคำตอบมีต้นทุนไม่น้อยกว่าผลรวมค่าน้อยสุดของแต่ละแถว: 2 + 3 + 1 + 4 = 10 เมื่อกำหนด a → 1 แล้ว lb = 9 + 3 + 1 + 4 = 17 โดยแถวที่เหลือเลือกจากคอลัมน์ที่ยังว่าง</p>'], ['ต่างจาก backtracking อย่างไร', '<p>ใช้กับปัญหา optimization มี bound ใช้ตัดกิ่ง และใช้เลือกโหนดถัดไปแบบ best-first แทน DFS ตามลำดับ</p>']],
  runtime: { a: 'แย่สุด exponential', why: 'bound ที่ดีลดจำนวนโหนดได้มาก แต่ไม่มีการรับประกัน ตัวอย่างนี้แตะ 10 โหนดจากทั้งหมด 4! = 24 ทางเลือก' },
  pitfalls: ['Lower bound ใช้กับ minimization ส่วน upper bound ใช้กับ maximization', 'bound ต้องไม่ประเมินเกินจริง ไม่งั้นตัดคำตอบที่ดีทิ้ง'],
  quiz: [{ q: 'ค่า lb ของ a → 3 คือ', o: ['17', '20', '18'], a: 1, why: '7 + 4 + 5 + 4 แถว c เลี่ยงคอลัมน์ 3 จึงได้ 5' }],
  links: [],
},
{
  id: 'bbk', sub: 'bt', title: 'Branch-and-Bound: Knapsack', en: 'B&B Knapsack', slides: '14–16',
  lead: 'เรียงไอเท็มตาม v/w แล้วใช้ upper bound บอกว่ากิ่งนี้ดีได้มากสุดเท่าไร',
  procs: [{ name: 'Upper bound (สไลด์ 15)', lines: ['เรียงไอเท็มตาม v/w จากมากไปน้อย', 'กิ่งซ้าย: ใส่ไอเท็มถัดไป กิ่งขวา: ไม่ใส่', 'ub = v + (W − w)·(vᵢ₊₁/wᵢ₊₁)', 'ตัดกิ่งที่เกินความจุ หรือ ub ไม่ดีกว่าคำตอบที่มี'] }],
  presets: [{ name: 'ตัวอย่างในสไลด์ 15–16', input: { items: [{ w: 4, v: 40 }, { w: 7, v: 42 }, { w: 5, v: 25 }, { w: 3, v: 12 }], W: 10 }, run: i => runBBKnap(i) }],
  notes: [['ทำไม ub ใช้ได้', '<p>ความจุที่เหลือถูกเติมด้วยอัตราดีสุดของไอเท็มที่เหลือ ซึ่งเกินจริงได้แต่ไม่ต่ำกว่าจริง จึงตัดกิ่งได้อย่างปลอดภัย</p>']],
  runtime: { a: 'แย่สุด exponential', why: 'ต้นไม้เต็มมี 2ⁿ ใบ B&B ตัดกิ่งได้แต่ไม่มีการรับประกัน' },
  pitfalls: ['ต้องเรียงตาม v/w ก่อน ไม่งั้น ub ไม่ถูกต้อง'],
  quiz: [{ q: 'ub ของโหนด with 1 (w=4, v=40) คือ', o: ['70', '76', '100'], a: 1, why: '40 + 6 × 6 = 76' }],
  links: ['algv'],
},
{
  id: 'bbt', sub: 'bt', title: 'Branch-and-Bound: TSP', en: 'B&B TSP', slides: '17–19',
  lead: 'ทุกเมืองมีสองเส้นในทัวร์ ขอบล่างจึงมาจากผลรวมสองระยะที่สั้นสุดของทุกเมืองหารสอง',
  procs: [{ name: 'Lower bound (สไลด์ 17)', lines: ['แต่ละเมือง i: sᵢ = ผลรวมสองระยะที่สั้นสุดจาก i', 's = Σ sᵢ', 'lb = ⌈s / 2⌉', 'ถ้าบังคับ edge ใด ต้องนับ edge นั้นในเมืองปลายทั้งสอง'] }],
  presets: [{ name: 'กราฟในสไลด์ 18–19', input: TSP5, run: i => runBBTSP(i) }],
  notes: [['เฉลยช่องว่างในสไลด์ 18', '<p>lb = ⌈[(1+3) + (3+6) + (1+2) + (3+4) + (2+3)] / 2⌉ = 14</p><p>เมื่อต้องมี edge (a, d): lb = ⌈[(1+5) + (3+6) + (1+2) + (3+5) + (2+3)] / 2⌉ = ⌈31/2⌉ = 16</p>'], ['ลดทัวร์ซ้ำ', '<p>ทัวร์หนึ่งเดินได้สองทิศ จึงเริ่มที่ a และกำหนดให้ b มาก่อน c โหนด a, c จึงถูกตัดทันที</p>']],
  runtime: { a: 'แย่สุด exponential', why: 'TSP เป็น NP-hard' },
  pitfalls: ['ตอนเหลือเมืองเดียวทัวร์ถูกกำหนดแล้ว ไม่ต้องแตกกิ่ง', 'โหนดที่ lb = ค่าทัวร์ดีสุดก็ตัดได้ เพราะไม่มีทางดีกว่า'],
  quiz: [{ q: 'ทัวร์ที่ดีที่สุดในสไลด์ 19 ยาวเท่าไร', o: ['16', '19', '24'], a: 0, why: 'a-b-d-e-c-a = 3 + 7 + 3 + 2 + 1' }],
  links: ['tspv'],
},
{
  id: 'tspg', sub: 'bt', title: 'Approximation: Greedy TSP', en: 'Greedy TSP', slides: '20–23',
  lead: 'ยอมรับคำตอบที่ไม่ดีที่สุดเพื่อให้ได้เวลาพหุนาม และวัดคุณภาพด้วย accuracy ratio',
  procs: [{ name: 'Nearest-Neighbor', lines: ['เริ่มที่เมืองใดเมืองหนึ่ง', 'ไปเมืองที่ยังไม่ได้ไปและใกล้สุด จนครบ', 'กลับเมืองเริ่มต้น'] }],
  presets: [
    { name: 'Nearest-Neighbor (สไลด์ 22)', def: TSP_A, run: runNN, opt: { start: 'a', opt: 8 } },
    { name: 'Multifragment (กราฟสไลด์ 25)', def: TSP_B, run: runMulti, procs: [{ name: 'Multifragment-Heuristic', lines: ['เรียง edge จากน้อยไปมาก เซตคำตอบว่าง', 'หยิบ edge ถัดไป ข้ามถ้าทำให้ degree 3 หรือเกิดวงจรสั้นกว่า n'] }] },
  ],
  notes: [['Accuracy ratio', '<p>Minimization: r(s<sub>a</sub>) = f(s<sub>a</sub>) / f(s*) Maximization: r(s<sub>a</sub>) = f(s*) / f(s<sub>a</sub>) ทั้งคู่มีค่า ≥ 1 ยิ่งใกล้ 1 ยิ่งดี อัลกอริทึมเป็น c-approximation ถ้า r ≤ c ทุกอินสแตนซ์ และค่า c ที่เล็กสุดเรียกว่า performance ratio R<sub>A</sub></p>'], ['เฉลยสไลด์ 22', '<p>r(s<sub>a</sub>) = 10/8 = 1.25 แต่ R<sub>A</sub> = ∞ เพราะเพิ่มระยะ AD ให้ใหญ่ได้เรื่อย ๆ</p>']],
  runtime: { a: 'NN O(n²) · Multifragment O(n² lg n)', why: 'NN หาเมืองใกล้สุด n รอบ รอบละ O(n) Multifragment เรียง n² edge (เป็นความรู้เพิ่มเติม สไลด์ไม่ได้ถาม)' },
  pitfalls: ['ทัวร์ NN ขึ้นกับเมืองเริ่มต้น', 'edge สุดท้ายของ Multifragment ปิดวงจรความยาว n ได้'],
  quiz: [{ q: 'accuracy ratio ในสไลด์ 22 เท่ากับ', o: ['1.25', '0.8', '2'], a: 0, why: '10 / 8' }],
  links: ['tspv'],
},
{
  id: 'tspm', sub: 'bt', title: 'Approximation: MST-based TSP', en: 'Twice-around / Christofides', slides: '24–28',
  lead: 'MST เป็นขอบล่างของทัวร์ จึงใช้เป็นโครงสร้างทัวร์ที่พิสูจน์คุณภาพได้เมื่อระยะทางเป็น Euclidean',
  procs: [{ name: 'Twice-Around-the-Tree', lines: ['สร้าง minimum spanning tree', 'เดินรอบต้นไม้สองรอบกลับมาที่เดิม', 'ทำ shortcut ไม่เยี่ยมซ้ำ'] }],
  presets: [
    { name: 'Twice-around (สไลด์ 25)', def: TSP_B, run: runTwice },
    { name: 'Christofides (สไลด์ 27)', def: TSP_B, run: runChristofides, procs: [{ name: 'Christofides', lines: ['สร้าง minimum spanning tree', 'จับคู่น้ำหนักน้อยสุดของ vertex degree คี่', 'หา Eulerian circuit', 'ทำ shortcut ไม่เยี่ยมซ้ำ'] }] },
  ],
  notes: [['Euclidean instance (สไลด์ 28)', '<p>ถ้า P ≠ NP TSP ทั่วไปไม่มี approximation ที่ ratio จำกัด แต่ถ้าสมมาตรและเป็นไปตามอสมการสามเหลี่ยม:</p><div class="tw"><table class="cmp"><thead><tr><th>อัลกอริทึม</th><th>R<sub>A</sub></th></tr></thead><tbody><tr><td>Nearest-neighbor, Multifragment</td><td>0.5(⌈log₂ n⌉ + 1)</td></tr><tr><td>Twice-around-the-tree</td><td>2</td></tr><tr><td>Christofides</td><td>1.5</td></tr></tbody></table></div>'], ['ทำไม Twice-around ได้ 2', '<p>w(MST) ≤ ความยาวทัวร์ที่ดีที่สุด เพราะถอด edge หนึ่งเส้นจากทัวร์ได้ spanning tree เดินรอบต้นไม้ยาว 2·w(MST) และอสมการสามเหลี่ยมทำให้ shortcut ไม่ยาวขึ้น</p>']],
  runtime: { a: 'Twice-around ใช้ MST: O(E lg V)', why: 'ขึ้นกับการสร้าง MST ส่วนการเดินเป็น O(n) Christofides เพิ่มการจับคู่ minimum-weight matching ที่แพงกว่า (ความรู้เพิ่มเติม)' },
  pitfalls: ['R = 2 และ 1.5 ใช้ได้เฉพาะ Euclidean instance', 'Vertex degree คี่มีจำนวนคู่เสมอ จึงจับคู่ได้'],
  quiz: [{ q: 'ทัวร์ Christofides ในสไลด์ 27 ยาวเท่าไร', o: ['37', '38', '39'], a: 0, why: 'a-b-c-e-d-a = 4 + 6 + 11 + 7 + 9' }],
  links: ['tspv'],
},
{
  id: 'opt2', sub: 'bt', title: 'Local search: 2-opt', en: '2-opt', slides: '29–34',
  lead: 'เริ่มจากทัวร์ที่มี แล้วปรับปรุงเฉพาะจุดด้วยการสลับ edge สองเส้น จนสลับแบบไหนก็ไม่ดีขึ้น',
  procs: [{ name: '2-opt', lines: ['เริ่มจากทัวร์หนึ่ง เช่น nearest neighbor', 'ลบ edge สองเส้นที่ไม่ติดกัน แล้วต่อปลายแบบอื่น ถ้าสั้นลงก็รับ', 'ไม่มี 2-change ที่สั้นลง: คืนทัวร์ปัจจุบัน'] }],
  presets: [{ name: 'ตัวอย่างในสไลด์ 31', def: TSP_B, run: run2opt, opt: { start: ['a', 'b', 'c', 'd', 'e'] } }],
  notes: [['ตระกูล Local search', '<p><b>2-opt</b> เปลี่ยนทีละ 2 edge <b>k-opt</b> เปลี่ยนทีละ k edge <b>Lin-Kernighan</b> เป็น variable-opt คือ 3-opt ตามด้วย 2-opt ต่อเนื่อง และถือเป็นตัวที่ดีมากในงานคุณภาพสูง</p>'], ['เวลาจริงจากสไลด์ 34', '<div class="tw"><table class="cmp"><thead><tr><th>Heuristic</th><th>วินาที (10,000 เมือง)</th></tr></thead><tbody><tr><td>Nearest neighbor</td><td>0.28</td></tr><tr><td>Multifragment</td><td>0.20</td></tr><tr><td>Christofides</td><td>1.04</td></tr><tr><td>2-opt</td><td>1.41</td></tr><tr><td>3-opt</td><td>1.50</td></tr><tr><td>Lin-Kernighan</td><td>2.06</td></tr></tbody></table></div>']],
  pitfalls: ['2-opt หยุดที่ local optimum ซึ่งอาจไม่ใช่คำตอบดีสุด ตัวอย่างนี้จบที่ 38 ทั้งที่ Christofides ได้ 37', 'การต่อใหม่ของ 2-change มีแบบเดียวที่ยังเป็นทัวร์'],
  slideNotes: ['แผงแรกของสไลด์ 31 ระบุ a–c = 9 และ l = 42 แต่กราฟในสไลด์ 25 และแผงสุดท้ายของสไลด์ 31 ใช้ a–c = 8 ความยาวที่ถูกจึงเป็น 41 ข้อสรุปไม่เปลี่ยน เพราะยังยาวกว่า 39'],
  quiz: [{ q: '2-change ใดในตัวอย่างทำให้ทัวร์สั้นลงจาก 39 เป็น 38', o: ['ลบ ab, de', 'ลบ bc, ea', 'ลบ bc, de'], a: 1, why: 'ต่อ b–e และ c–a แทน' }],
  links: ['tspv'],
},
{
  id: 'apk', sub: 'bt', title: 'Approximation: Knapsack', en: 'Approx Knapsack', slides: '35–37',
  lead: 'Greedy ตาม v/w เร็วแต่แย่ได้ไม่จำกัด Approximation scheme แลกเวลาเพื่อรับประกันคุณภาพ',
  procs: [{ name: 'Greedy', lines: ['เรียงไอเท็มตาม v/w จากมากไปน้อย', 'เลือกตามลำดับ ข้ามชิ้นที่ใส่ไม่ได้'] }],
  presets: [
    { name: 'Greedy (สไลด์ 35)', input: { items: [{ w: 4, v: 40 }, { w: 7, v: 42 }, { w: 5, v: 25 }, { w: 3, v: 12 }], W: 10 }, run: i => runGreedyKnap(i) },
    { name: 'Greedy แย่ได้แค่ไหน (W = 10)', input: { items: [{ w: 1, v: 2 }, { w: 10, v: 10 }], W: 10, note: 'แต่คำตอบดีสุดคือ 10 อัตราส่วน W/2 โตได้ไม่จำกัด' }, run: i => runGreedyKnap(i) },
    { name: 'Approx scheme k = 2 (สไลด์ 37)', input: { items: [{ w: 4, v: 40 }, { w: 7, v: 42 }, { w: 5, v: 25 }, { w: 1, v: 4 }], W: 10, k: 2 }, run: i => runApproxScheme(i), procs: [{ name: 'Approximation scheme', lines: ['เรียงไอเท็มตาม v/w', 'ทุกเซตย่อยที่มีไม่เกิน k ไอเท็มและใส่ได้: เติมไอเท็มที่เหลือตาม v/w', 'คืนเซตที่มีมูลค่ามากสุด'] }] },
  ],
  notes: [['คุณภาพของ scheme', '<p>f(s*) / f(s<sub>a</sub>) ≤ 1 + 1/k เวลา O(k n<sup>k+1</sup>) เลือก k มากขึ้นได้คุณภาพสูงขึ้นแต่แพงขึ้นเร็วมาก</p>'], ['Greedy แบบตัวอย่างสอง', '<p>item (w=1, v=2) มี v/w สูงกว่า จึงถูกเลือกก่อน แล้ว item (w=W, v=W) ใส่ไม่ได้ ได้ค่า 2 จากคำตอบจริง W</p>']],
  runtime: { a: 'Greedy O(n lg n) · Scheme O(k n^(k+1))', why: 'Greedy เรียงแล้วไล่รอบเดียว Scheme มี O(n^k) เซตย่อย เซตละ O(n) และคูณ k จากการจัดการเซต' },
  pitfalls: ['Greedy แบบนี้ไม่มี finite performance ratio'],
  quiz: [{ q: 'k = 2 รับประกันอัตราส่วนไม่เกินเท่าไร', o: ['1.5', '2', '3'], a: 0, why: '1 + 1/2' }],
  links: ['algv'],
},
{
  id: 'bin', sub: 'bt', title: 'Bin packing', en: 'Bin packing', slides: '38–39',
  lead: 'บรรจุของขนาดไม่เกิน 1 ลงถังจุ 1 ให้ใช้ถังน้อยสุด เรียงก่อนบรรจุทำให้ดีขึ้นได้มาก',
  procs: [{ name: 'First-Fit', lines: ['พิจารณาตามลำดับที่ให้: ใส่ถังแรกที่พอ', 'ไม่มีถังพอ: เปิดถังใหม่'] }],
  presets: [
    { name: 'First-Fit (สไลด์ 38)', input: { s: [.4, .2, .6, .7] }, run: i => runBin(i) },
    { name: 'First-Fit Decreasing (สไลด์ 39)', input: { s: [.4, .2, .6, .7], dec: true }, run: i => runBin(i), procs: [{ name: 'First-Fit Decreasing', lines: ['เรียงจากใหญ่ไปเล็ก', 'ใส่ถังแรกที่พอ', 'ไม่มีถังพอ: เปิดถังใหม่'] }] },
  ],
  custom: { label: 'ใส่ขนาด 0 ถึง 1 คั่นด้วยช่องว่าง', sample: '0.5 0.7 0.5 0.2 0.4 0.2 0.5', parse: t => { const s = numsOf(t, 1, 14); if (s.some(x => x <= 0 || x > 1)) throw new Error('ขนาดต้องมากกว่า 0 และไม่เกิน 1'); return { s }; } },
  notes: [['คุณภาพ', '<p>First-Fit: R<sub>A</sub> = 1.7 ใช้ถังเกินคำตอบดีสุดไม่เกิน 70% First-Fit Decreasing: R<sub>A</sub> = 1.5 และค่าเฉลี่ยในทางปฏิบัติดีกว่านี้มาก ตัวอย่างในสไลด์ FF ใช้ 3 ถัง FFD ใช้ 2 ถัง</p>']],
  runtime: { a: 'FF O(n²) · FFD O(n²)', why: 'วิธีตรงไปตรงมาไล่หาถังแรกที่พอ ถังมีไม่เกิน n (ความรู้เพิ่มเติม สไลด์ไม่ได้ถาม)' },
  pitfalls: ['FFD ต้องเรียงจากใหญ่ไปเล็กก่อน'],
  quiz: [{ q: 'ขนาด 0.4, 0.2, 0.6, 0.7 FFD ใช้กี่ถัง', o: ['2', '3', '4'], a: 0, why: '{0.7, 0.2} และ {0.6, 0.4}' }],
  links: ['algv'],
},
];

const SUBJECTS = [
  { id: 'dp', no: '06', title: 'Dynamic Programming', pages: 45, L: DP_L },
  { id: 'heap', no: '08', title: 'Heaps, Priority Queues, Disjoint Sets', pages: 21, L: HEAP_L },
  { id: 'dc', no: '10', title: 'Divide and Conquer', pages: 56, L: DC_L },
  { id: 'graph', no: '11', title: 'Graph Algorithms', pages: 69, L: LESSONS.map(l => ({ ...l, sub: 'graph' })) },
  { id: 'bt', no: '12', title: 'Backtracking, B&B, Approximation', pages: 40, L: BT_L },
];
const ALL_LESSONS = SUBJECTS.flatMap(s => s.L);

const OVERVIEW2 = {
  dp: [['คำนวณค่าที่นิยามซ้ำตัวเอง ลดงานซ้ำ', 'dp-bin', 'Memoization / Bottom-up', 'Θ(nk)', '2–9'], ['หาลำดับการคูณเมทริกซ์', 'mcm', 'Matrix chain', 'O(n³)', '10–21'], ['เลือกของไม่เกินความจุ มูลค่ามากสุด', 'knap', '0/1 Knapsack', 'O(nW)', '22–27'], ['หาลำดับร่วมที่ยาวสุด', 'lcs', 'LCS', 'O(mn)', '28–34'], ['เลือกเส้นทางผ่านสองสายการผลิต', 'als', 'Fastest-way', 'O(n)', '35–44']],
  heap: [['ซ่อมสมบัติ heap จากตำแหน่งหนึ่ง', 'heap', 'MAX-HEAPIFY', 'O(lg n)', '7–8'], ['แปลงอาร์เรย์เป็น heap', 'bheap', 'BUILD-MAX-HEAP', 'O(n)', '9–10'], ['เรียงแบบ in-place แย่สุด n lg n', 'hsort', 'Heapsort', 'O(n lg n)', '11–13'], ['ดึงค่ามากสุด/ปรับ key บ่อย', 'pq', 'Priority queue', 'O(lg n)', '14–17'], ['รวมกลุ่มและถามว่าอยู่กลุ่มเดียวกันไหม', 'dsu', 'Disjoint sets', 'O(m α(n))', '18–20']],
  dc: [['เรียงแบบ stable รับประกันเวลา', 'merge', 'Merge sort', 'Θ(n lg n)', '7–13'], ['หาคำตอบของ T(n) = aT(n/b) + f(n)', 'recur', 'Master theorem', 'ตามกรณี', '19–22'], ['เรียงเร็วเฉลี่ยดี', 'quick', 'Quicksort', 'เฉลี่ย Θ(n lg n), แย่สุด Θ(n²)', '23–30'], ['ค้นในอาร์เรย์ที่เรียงแล้ว', 'bs', 'Binary search', 'Θ(lg n)', '31–32'], ['คูณเมทริกซ์ให้เร็วกว่า n³', 'matmul', 'Strassen', 'Θ(n^2.81)', '40–45'], ['หารั้วล้อมจุด', 'hull', 'Convex hull', 'O(nh), O(n lg n)', '46–55']],
  bt: [['ต้องได้คำตอบตรงและตัดกิ่งที่ไปไม่รอด', 'nq', 'Backtracking', 'แย่สุด exponential', '5–8'], ['Optimization ที่คำนวณขอบเขตได้', 'bba', 'Branch-and-Bound', 'แย่สุด exponential', '9–19'], ['TSP แบบเร็ว', 'tspg', 'Nearest-neighbor', 'R = ∞', '22–23'], ['TSP ที่รับประกันคุณภาพ (Euclidean)', 'tspm', 'Twice-around / Christofides', 'R = 2 / 1.5', '24–28'], ['ปรับปรุงทัวร์ที่มีอยู่', 'opt2', '2-opt', 'local optimum', '29–34'], ['Knapsack แบบประมาณ', 'apk', 'Approximation scheme', 'O(k n^(k+1))', '35–37'], ['บรรจุลงถังให้น้อยสุด', 'bin', 'FF / FFD', 'R = 1.7 / 1.5', '38–39']],
};
const LINKS_X = [
  ['Priority queue', 'pq', 'เป็น Q ใน', [['prim', 'Prim'], ['dijkstra', 'Dijkstra']], 'และเป็นตัวเลือกโหนดของ B&B แบบ best-first'],
  ['Disjoint sets', 'dsu', 'ใช้กันวงจรใน', [['kruskal', 'Kruskal']], ''],
  ['DP', 'dp-bin', 'บนกราฟคือ', [['floyd', 'Floyd-Warshall'], ['bellman', 'Bellman-Ford']], 'ซึ่งเติมตารางจากปัญหาย่อยเหมือนกัน'],
  ['Matrix chain', 'mcm', 'มีรูปสมการเดียวกับ', [['apsp', 'การต่อเส้นทางแบบคูณเมทริกซ์']], ''],
  ['Strassen', 'matmul', 'และ repeated squaring ใน', [['apsp', 'All-pairs']], 'มาจากแนวคิดการคูณเมทริกซ์ชุดเดียวกัน'],
  ['DFS', 'dfs', 'คือวิธีเดินต้นไม้สถานะของ', [['nq', 'Backtracking']], ''],
  ['Kruskal / Prim', 'kruskal', 'เป็นขั้นแรกของ', [['tspm', 'Twice-around และ Christofides']], ''],
  ['0/1 Knapsack', 'knap', 'แก้แบบอื่นได้ด้วย', [['bbk', 'B&B'], ['apk', 'Approximation']], 'จุดต่างคือเวลาเทียบกับความแม่นยำ'],
];
