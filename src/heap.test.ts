import { Heap, MinHeap, MaxHeap } from "./heap";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
}

// ── MinHeap ──────────────────────────────────────────────────────────────────

console.log("--- MinHeap ---");

const min1 = new MinHeap();
assert(min1.isEmpty() === true,  "empty on creation");
assert(min1.size() === 0,        "size 0 on creation");
assert(min1.peek() === undefined, "peek on empty returns undefined");
assert(min1.pop() === undefined,  "pop on empty returns undefined");

min1.push(5);
min1.push(1);
min1.push(3);
assert(min1.peek() === 1,  "peek returns minimum");
assert(min1.size() === 3,  "size reflects pushes");

assert(min1.pop() === 1, "pop returns minimum (1)");
assert(min1.pop() === 3, "pop returns next minimum (3)");
assert(min1.pop() === 5, "pop returns last element (5)");
assert(min1.isEmpty() === true, "empty after all pops");

// push after drain
min1.push(10);
min1.push(2);
assert(min1.peek() === 2, "peek correct after re-push");

// heapify from array
const min2 = new MinHeap(undefined, [9, 4, 7, 1, 6, 2]);
assert(min2.peek() === 1, "heapify: peek is global min");
assert(min2.size() === 6, "heapify: size matches input");
assert(
  min2.toSortedArray().join(",") === "1,2,4,6,7,9",
  "heapify: toSortedArray yields ascending order"
);

// toSortedArray on fresh heap
const min3 = new MinHeap(undefined, [3, 1, 4, 1, 5, 9, 2, 6]);
assert(
  min3.toSortedArray().join(",") === "1,1,2,3,4,5,6,9",
  "toSortedArray: ascending, handles duplicates"
);

// ── MaxHeap ──────────────────────────────────────────────────────────────────

console.log("--- MaxHeap ---");

const max1 = new MaxHeap();
assert(max1.isEmpty() === true,   "empty on creation");
assert(max1.peek() === undefined,  "peek on empty returns undefined");
assert(max1.pop() === undefined,   "pop on empty returns undefined");

max1.push(5);
max1.push(1);
max1.push(9);
max1.push(3);
assert(max1.peek() === 9, "peek returns maximum");
assert(max1.pop() === 9,  "pop returns maximum (9)");
assert(max1.pop() === 5,  "pop returns next maximum (5)");
assert(max1.pop() === 3,  "pop returns next (3)");
assert(max1.pop() === 1,  "pop returns last (1)");
assert(max1.isEmpty() === true, "empty after all pops");

// heapify from array
const max2 = new MaxHeap(undefined, [9, 4, 7, 1, 6, 2]);
assert(max2.peek() === 9, "heapify: peek is global max");
assert(
  max2.toSortedArray().join(",") === "9,7,6,4,2,1",
  "heapify: toSortedArray yields descending order"
);

// ── Custom comparator (objects) ───────────────────────────────────────────────

console.log("--- Custom comparator ---");

type Task = { name: string; priority: number };
const taskHeap = new MinHeap<Task>((a, b) => a.priority - b.priority);
taskHeap.push({ name: "low",    priority: 10 });
taskHeap.push({ name: "high",   priority: 1  });
taskHeap.push({ name: "medium", priority: 5  });

assert(taskHeap.pop()!.name === "high",   "custom: pops highest-priority task first");
assert(taskHeap.pop()!.name === "medium", "custom: pops medium-priority task second");
assert(taskHeap.pop()!.name === "low",    "custom: pops lowest-priority task last");

// custom max by priority: flip comparator to get highest priority-number first
const taskMax = new MaxHeap<Task>((a, b) => b.priority - a.priority);
taskMax.push({ name: "low",    priority: 10 });
taskMax.push({ name: "high",   priority: 1  });
taskMax.push({ name: "medium", priority: 5  });
assert(taskMax.pop()!.name === "low",    "custom max: pops highest priority number first");
assert(taskMax.pop()!.name === "medium", "custom max: pops medium priority number second");
assert(taskMax.pop()!.name === "high",   "custom max: pops lowest priority number last");

// ── Base Heap class ───────────────────────────────────────────────────────────

console.log("--- Base Heap ---");

// min-heap via base class
const baseMin = new Heap<number>((a, b) => a - b, [5, 3, 8, 1]);
assert(baseMin.peek() === 1, "base Heap works as min-heap");

// max-heap via base class
const baseMax = new Heap<number>((a, b) => b - a, [5, 3, 8, 1]);
assert(baseMax.peek() === 8, "base Heap works as max-heap");

// single-element heap
const single = new MinHeap(undefined, [42]);
assert(single.peek() === 42, "single-element: peek correct");
assert(single.pop() === 42,  "single-element: pop correct");
assert(single.isEmpty() === true, "single-element: empty after pop");

console.log("\nAll tests passed!");
