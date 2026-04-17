class DLLNode {
  key: number;
  value: number;
  prev: DLLNode | null = null;
  next: DLLNode | null = null;

  constructor(key: number, value: number) {
    this.key = key;
    this.value = value;
  }
}

// Doubly linked list where head.next is LRU and tail.prev is MRU
class DoublyLinkedList {
  head: DLLNode;
  tail: DLLNode;
  size: number;

  constructor() {
    this.head = new DLLNode(0, 0);
    this.tail = new DLLNode(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }

  addToTail(node: DLLNode): void {
    node.prev = this.tail.prev;
    node.next = this.tail;
    this.tail.prev!.next = node;
    this.tail.prev = node;
    this.size++;
  }

  removeNode(node: DLLNode): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
    this.size--;
  }

  removeLRU(): DLLNode {
    const node = this.head.next!;
    this.removeNode(node);
    return node;
  }
}

export class LFUCache {
  private capacity: number;
  private minFreq: number;
  private keyMap: Map<number, DLLNode>;        // key -> node
  private keyFreq: Map<number, number>;         // key -> frequency
  private freqMap: Map<number, DoublyLinkedList>; // freq -> list of nodes

  constructor(capacity: number) {
    this.capacity = capacity;
    this.minFreq = 0;
    this.keyMap = new Map();
    this.keyFreq = new Map();
    this.freqMap = new Map();
  }

  get(key: number): number {
    if (!this.keyMap.has(key)) return -1;
    this.incrementFreq(key);
    return this.keyMap.get(key)!.value;
  }

  put(key: number, value: number): void {
    if (this.capacity <= 0) return;

    if (this.keyMap.has(key)) {
      this.keyMap.get(key)!.value = value;
      this.incrementFreq(key);
      return;
    }

    if (this.keyMap.size >= this.capacity) {
      const lruNode = this.freqMap.get(this.minFreq)!.removeLRU();
      this.keyMap.delete(lruNode.key);
      this.keyFreq.delete(lruNode.key);
    }

    const node = new DLLNode(key, value);
    this.keyMap.set(key, node);
    this.keyFreq.set(key, 1);
    if (!this.freqMap.has(1)) this.freqMap.set(1, new DoublyLinkedList());
    this.freqMap.get(1)!.addToTail(node);
    this.minFreq = 1;
  }

  private incrementFreq(key: number): void {
    const freq = this.keyFreq.get(key)!;
    const newFreq = freq + 1;
    const node = this.keyMap.get(key)!;

    this.freqMap.get(freq)!.removeNode(node);
    if (this.freqMap.get(freq)!.size === 0 && freq === this.minFreq) {
      this.minFreq = newFreq;
    }

    this.keyFreq.set(key, newFreq);
    if (!this.freqMap.has(newFreq)) this.freqMap.set(newFreq, new DoublyLinkedList());
    this.freqMap.get(newFreq)!.addToTail(node);
  }
}
