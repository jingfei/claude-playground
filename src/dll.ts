export class DLLNode {
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
export class DoublyLinkedList {
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
