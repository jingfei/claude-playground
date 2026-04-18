import { MyCircularQueue } from "./circular-queue";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
}

// isEmpty and isFull on fresh queue
const q1 = new MyCircularQueue(3);
assert(q1.isEmpty() === true, "new queue is empty");
assert(q1.isFull() === false, "new queue is not full");
assert(q1.Front() === -1, "Front on empty queue returns -1");
assert(q1.Rear() === -1, "Rear on empty queue returns -1");
assert(q1.deQueue() === false, "deQueue on empty queue returns false");

// enQueue and basic Front/Rear
assert(q1.enQueue(1) === true, "enQueue returns true when not full");
assert(q1.Front() === 1, "Front after one enQueue");
assert(q1.Rear() === 1, "Rear after one enQueue");
assert(q1.enQueue(2) === true, "enQueue second element");
assert(q1.enQueue(3) === true, "enQueue third element");
assert(q1.isFull() === true, "queue is full after k enQueues");
assert(q1.isEmpty() === false, "full queue is not empty");
assert(q1.enQueue(4) === false, "enQueue on full queue returns false");
assert(q1.Front() === 1, "Front unchanged after failed enQueue");
assert(q1.Rear() === 3, "Rear is last inserted element");

// deQueue
assert(q1.deQueue() === true, "deQueue returns true when not empty");
assert(q1.Front() === 2, "Front advances after deQueue");
assert(q1.isFull() === false, "no longer full after deQueue");

// Wrap-around: fill again after deQueue to exercise circular indexing
assert(q1.enQueue(4) === true, "enQueue after deQueue (wrap-around)");
assert(q1.Rear() === 4, "Rear reflects wrapped element");
assert(q1.Front() === 2, "Front unchanged");

// Drain the queue
assert(q1.deQueue() === true, "deQueue 1");
assert(q1.deQueue() === true, "deQueue 2");
assert(q1.deQueue() === true, "deQueue 3");
assert(q1.isEmpty() === true, "queue empty after draining");
assert(q1.deQueue() === false, "deQueue on drained queue returns false");
assert(q1.Front() === -1, "Front on drained queue returns -1");
assert(q1.Rear() === -1, "Rear on drained queue returns -1");

// Capacity 1 edge case
const q2 = new MyCircularQueue(1);
assert(q2.isEmpty() === true, "capacity-1 queue starts empty");
assert(q2.enQueue(42) === true, "enQueue into capacity-1 queue");
assert(q2.isFull() === true, "capacity-1 queue is full");
assert(q2.Front() === 42, "Front equals only element");
assert(q2.Rear() === 42, "Rear equals only element");
assert(q2.enQueue(99) === false, "cannot enQueue into full capacity-1 queue");
assert(q2.deQueue() === true, "deQueue from capacity-1 queue");
assert(q2.isEmpty() === true, "capacity-1 queue empty after deQueue");
assert(q2.enQueue(99) === true, "can enQueue again after deQueue");
assert(q2.Front() === 99, "Front reflects new element");

console.log("\nAll tests passed!");
