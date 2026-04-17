import { LRUCache } from "./lru-cache";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
}

// Basic get/put
const c1 = new LRUCache(2);
c1.put(1, 1);
c1.put(2, 2);
assert(c1.get(1) === 1, "get existing key returns value");
c1.put(3, 3); // evicts key 2 (LRU) since key 1 was recently accessed
assert(c1.get(2) === -1, "LRU key evicted");
assert(c1.get(3) === 3, "newly inserted key accessible");

// Update existing key
const c2 = new LRUCache(2);
c2.put(1, 1);
c2.put(2, 2);
c2.put(1, 10); // update key 1, makes it MRU
c2.put(3, 3);  // evicts key 2 (LRU)
assert(c2.get(1) === 10, "updated value is correct");
assert(c2.get(2) === -1, "non-updated key evicted");
assert(c2.get(3) === 3, "new key accessible");

// Capacity 1
const c3 = new LRUCache(1);
c3.put(1, 1);
c3.put(2, 2);
assert(c3.get(1) === -1, "capacity=1: first key evicted");
assert(c3.get(2) === 2, "capacity=1: second key present");

// Zero capacity
const c4 = new LRUCache(0);
c4.put(1, 1);
assert(c4.get(1) === -1, "capacity=0: nothing stored");

// get refreshes recency
const c5 = new LRUCache(2);
c5.put(1, 1);
c5.put(2, 2);
c5.get(1);     // key 1 becomes MRU
c5.put(3, 3);  // evicts key 2 (now LRU)
assert(c5.get(1) === 1, "recently accessed key survives");
assert(c5.get(2) === -1, "stale key evicted");
assert(c5.get(3) === 3, "new key accessible");

console.log("\nAll tests passed!");
