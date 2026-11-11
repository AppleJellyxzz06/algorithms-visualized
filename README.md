# Algorithms แบบเห็นภาพทีละขั้น

บทเรียนอัลกอริทึมภาษาไทย 41 บท จาก 5 เอกสารประกอบการเรียน (231 สไลด์) ทุกบทรันอัลกอริทึมจริงบนตัวอย่างชุดเดียวกับในสไลด์ แล้วให้กดดูทีละขั้นคู่กับ pseudocode

| บท | หัวข้อ |
|---|---|
| 06 Dynamic Programming | Top-down/Bottom-up, Matrix chain, 0/1 Knapsack, LCS, Assembly line |
| 08 Heaps, Priority Queues, Disjoint Sets | Max-Heapify, Build-Max-Heap, Heapsort, Priority queue, Disjoint sets |
| 10 Divide and Conquer | Merge sort, Master theorem, Quicksort, Binary search, Strassen, Convex hull |
| 11 Graph Algorithms | BFS, DFS, Topological sort, SCC, Kruskal, Prim, Bellman-Ford, DAG, Dijkstra, All-pairs, Floyd-Warshall |
| 12 Backtracking, B&B, Approximation | N-Queens, Hamiltonian, B&B (Assignment, Knapsack, TSP), Greedy/MST TSP, 2-opt, Knapsack, Bin packing |

## เปิดใช้งาน

เปิด `index.html` ในเบราว์เซอร์ได้เลย ไม่ต้องติดตั้งอะไร ใช้ลูกศรซ้ายขวาเพื่อเลื่อนทีละขั้น

## โครงสร้าง

- `index.html` ไฟล์รวมพร้อมใช้ (สร้างจาก `build.py`)
- `src/algos.js`, `src/algos2.js` อัลกอริทึมที่บันทึกสถานะทีละขั้น
- `src/lessons.js`, `src/lessons2.js` เนื้อหาบทเรียน ตัวอย่างจากสไลด์ แบบฝึกหัด
- `src/ui.js`, `src/style.css` ส่วนแสดงผล
- `tests/` เทียบผลลัพธ์กับค่าในสไลด์

```bash
python3 build.py          # สร้าง index.html ใหม่
node tests/check.js       # Graph
node tests/check2.js      # DP, Heap, D&C, BT/B&B
node tests/check3.js      # ทุกบทรันได้ครบ
```
