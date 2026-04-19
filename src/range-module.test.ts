import { RangeModule } from "./range-module";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
}

// Example from problem statement
const r1 = new RangeModule();
r1.addRange(10, 20);
r1.removeRange(14, 16);
assert(r1.queryRange(10, 14) === true,  "example: [10,14) fully tracked");
assert(r1.queryRange(13, 15) === false, "example: [13,15) not fully tracked (gap at 14-16)");
assert(r1.queryRange(16, 17) === true,  "example: [16,17) tracked");

// queryRange on empty module
const r2 = new RangeModule();
assert(r2.queryRange(1, 5) === false, "empty module: queryRange returns false");

// addRange: no overlap
const r3 = new RangeModule();
r3.addRange(1, 5);
r3.addRange(10, 15);
assert(r3.queryRange(1, 5)   === true,  "disjoint add: first range tracked");
assert(r3.queryRange(10, 15) === true,  "disjoint add: second range tracked");
assert(r3.queryRange(5, 10)  === false, "disjoint add: gap between ranges not tracked");

// addRange: adjacent intervals merge
const r4 = new RangeModule();
r4.addRange(1, 5);
r4.addRange(5, 10);
assert(r4.queryRange(1, 10) === true,  "adjacent ranges merge into one");
assert(r4.queryRange(3, 7)  === true,  "middle of merged range is tracked");

// addRange: overlapping intervals merge
const r5 = new RangeModule();
r5.addRange(1, 10);
r5.addRange(5, 15);
assert(r5.queryRange(1, 15) === true, "overlapping add merges into [1,15)");

// addRange: new range spans multiple existing ranges
const r6 = new RangeModule();
r6.addRange(1, 3);
r6.addRange(5, 7);
r6.addRange(9, 11);
r6.addRange(2, 10); // spans all three
assert(r6.queryRange(1, 11) === true, "spanning add merges all covered ranges");

// removeRange: split an interval
const r7 = new RangeModule();
r7.addRange(1, 20);
r7.removeRange(8, 12);
assert(r7.queryRange(1, 8)   === true,  "left part after split is tracked");
assert(r7.queryRange(12, 20) === true,  "right part after split is tracked");
assert(r7.queryRange(8, 12)  === false, "removed middle is not tracked");
assert(r7.queryRange(7, 13)  === false, "range spanning gap is not tracked");

// removeRange: remove entire interval
const r8 = new RangeModule();
r8.addRange(5, 10);
r8.removeRange(5, 10);
assert(r8.queryRange(5, 10) === false, "entirely removed interval not tracked");

// removeRange: remove beyond interval boundaries (clips to boundary)
const r9 = new RangeModule();
r9.addRange(5, 10);
r9.removeRange(1, 20);
assert(r9.queryRange(5, 10) === false, "interval removed when remove range is larger");

// removeRange: no-op when range not tracked
const r10 = new RangeModule();
r10.addRange(1, 5);
r10.removeRange(10, 20);
assert(r10.queryRange(1, 5) === true, "removeRange outside tracked range is no-op");

// queryRange: partial coverage returns false
const r11 = new RangeModule();
r11.addRange(1, 5);
assert(r11.queryRange(3, 8) === false, "partially covered range returns false");
assert(r11.queryRange(1, 5) === true,  "exactly covered range returns true");

// Interleaved add/remove
const r12 = new RangeModule();
r12.addRange(10, 180);
r12.queryRange(50, 100);
r12.removeRange(150, 180);
assert(r12.queryRange(10, 150)  === true,  "interleaved: [10,150) still tracked");
assert(r12.queryRange(150, 180) === false, "interleaved: [150,180) removed");
r12.addRange(150, 180);
assert(r12.queryRange(10, 180) === true, "interleaved: re-added restores full range");

console.log("\nAll tests passed!");
