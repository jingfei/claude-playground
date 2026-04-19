export class RangeModule {
  private ranges: [number, number][] = [];

  addRange(left: number, right: number): void {
    const result: [number, number][] = [];
    let inserted = false;

    for (const [a, b] of this.ranges) {
      if (b < left) {
        result.push([a, b]);
      } else if (a > right) {
        if (!inserted) {
          result.push([left, right]);
          inserted = true;
        }
        result.push([a, b]);
      } else {
        // overlapping or adjacent — absorb into [left, right)
        left = Math.min(left, a);
        right = Math.max(right, b);
      }
    }

    if (!inserted) result.push([left, right]);
    this.ranges = result;
  }

  queryRange(left: number, right: number): boolean {
    for (const [a, b] of this.ranges) {
      if (a > left) break;
      if (b >= right) return true;
    }
    return false;
  }

  removeRange(left: number, right: number): void {
    const result: [number, number][] = [];

    for (const [a, b] of this.ranges) {
      if (b <= left || a >= right) {
        result.push([a, b]);
      } else {
        if (a < left) result.push([a, left]);
        if (b > right) result.push([right, b]);
      }
    }

    this.ranges = result;
  }
}
