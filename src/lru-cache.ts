import { DLLNode, DoublyLinkedList } from "./dll";

export class LRUCache {
  private capacity: number;
  private keyMap: Map<number, DLLNode>;
  private list: DoublyLinkedList;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.keyMap = new Map();
    this.list = new DoublyLinkedList();
  }

  get(key: number): number {
    if (!this.keyMap.has(key)) return -1;
    const node = this.keyMap.get(key)!;
    this.list.removeNode(node);
    this.list.addToTail(node);
    return node.value;
  }

  put(key: number, value: number): void {
    if (this.capacity <= 0) return;

    if (this.keyMap.has(key)) {
      const node = this.keyMap.get(key)!;
      node.value = value;
      this.list.removeNode(node);
      this.list.addToTail(node);
      return;
    }

    if (this.keyMap.size >= this.capacity) {
      const evicted = this.list.removeLRU();
      this.keyMap.delete(evicted.key);
    }

    const node = new DLLNode(key, value);
    this.keyMap.set(key, node);
    this.list.addToTail(node);
  }
}
