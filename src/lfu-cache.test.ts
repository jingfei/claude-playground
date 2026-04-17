import { LFUCache } from "./lfu-cache";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
}

// Basic get/put
const c1 = new LFUCache(2);
c1.put(1, 1);
c1.put(2, 2);
assert(c1.get(1) === 1, "get existing key returns value");
c1.put(3, 3); // evicts key 2 (freq=1, LRU) since key 1 freq=2
assert(c1.get(2) === -1, "evicted key returns -1");
assert(c1.get(3) === 3, "newly inserted key accessible");
c1.put(4, 4); // key 3 freq=2 (just accessed), key 1 freq=2; evict key 1 (LRU among freq=2)?
              // Wait: after get(1), key1 freq=2. After put(3), key3 freq=1. After get(3), key3 freq=2.
              // put(4): capacity full (keys 1 and 3 both freq=2). minFreq=2, LRU is key1 (added earlier).
assert(c1.get(1) === -1, "LRU among same freq is evicted");
assert(c1.get(3) === 3, "key 3 survives");
assert(c1.get(4) === 4, "key 4 inserted");

// Update existing key
const c2 = new LFUCache(1);
c2.put(1, 1);
c2.put(1, 10);
assert(c2.get(1) === 10, "put on existing key updates value");

// Capacity 1 eviction
const c3 = new LFUCache(1);
c3.put(1, 1);
c3.put(2, 2);
assert(c3.get(1) === -1, "capacity=1: first key evicted");
assert(c3.get(2) === 2, "capacity=1: second key present");

// Zero capacity
const c4 = new LFUCache(0);
c4.put(1, 1);
assert(c4.get(1) === -1, "capacity=0: nothing stored");

// Frequency tie-breaking (LRU among same freq)
const c5 = new LFUCache(3);
c5.put(1, 1); // freq[1]=1
c5.put(2, 2); // freq[2]=1
c5.put(3, 3); // freq[3]=1
c5.get(1);    // freq[1]=2
c5.get(2);    // freq[2]=2
// Now key3 freq=1 (min), key1 and key2 freq=2
c5.put(4, 4); // evicts key3 (only one with minFreq=1)
assert(c5.get(3) === -1, "LFU key evicted");
assert(c5.get(1) === 1, "key1 survives");
assert(c5.get(2) === 2, "key2 survives");

console.log("\nAll tests passed!");
