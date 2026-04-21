export class Heap<T> {
  private data: T[];
  private compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number, items: T[] = []) {
    this.compare = compare;
    this.data = [...items];
    // O(n) heapify — sink down from last non-leaf to root
    for (let i = Math.floor(this.data.length / 2) - 1; i >= 0; i--) {
      this.sinkDown(i);
    }
  }

  push(value: T): void {
    this.data.push(value);
    this.bubbleUp(this.data.length - 1);
  }

  // Remove and return the top element, or undefined if empty
  pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  // Return the top element without removing it
  peek(): T | undefined {
    return this.data[0];
  }

  size(): number {
    return this.data.length;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  // Drain all elements in sorted order (destructive)
  toSortedArray(): T[] {
    const result: T[] = [];
    while (!this.isEmpty()) result.push(this.pop()!);
    return result;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.compare(this.data[i], this.data[parent]) < 0) {
        [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
        i = parent;
      } else {
        break;
      }
    }
  }

  private sinkDown(i: number): void {
    const n = this.data.length;
    while (true) {
      let top = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.compare(this.data[left], this.data[top]) < 0) top = left;
      if (right < n && this.compare(this.data[right], this.data[top]) < 0) top = right;
      if (top === i) break;
      [this.data[i], this.data[top]] = [this.data[top], this.data[i]];
      i = top;
    }
  }
}

export class MinHeap<T = number> extends Heap<T> {
  constructor(
    compare: (a: T, b: T) => number = (a, b) => (a as number) - (b as number),
    items: T[] = []
  ) {
    super(compare, items);
  }
}

export class MaxHeap<T = number> extends Heap<T> {
  constructor(
    compare: (a: T, b: T) => number = (a, b) => (b as number) - (a as number),
    items: T[] = []
  ) {
    super(compare, items);
  }
}
