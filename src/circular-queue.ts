export class MyCircularQueue {
  private data: number[];
  private head: number;
  private tail: number;
  private size: number;
  private capacity: number;

  constructor(k: number) {
    this.data = new Array(k);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
    this.capacity = k;
  }

  enQueue(value: number): boolean {
    if (this.isFull()) return false;
    this.data[this.tail] = value;
    this.tail = (this.tail + 1) % this.capacity;
    this.size++;
    return true;
  }

  deQueue(): boolean {
    if (this.isEmpty()) return false;
    this.head = (this.head + 1) % this.capacity;
    this.size--;
    return true;
  }

  Front(): number {
    if (this.isEmpty()) return -1;
    return this.data[this.head];
  }

  Rear(): number {
    if (this.isEmpty()) return -1;
    return this.data[(this.tail - 1 + this.capacity) % this.capacity];
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  isFull(): boolean {
    return this.size === this.capacity;
  }
}
