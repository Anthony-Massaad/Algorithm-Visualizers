export interface ItemInQueue<T> {
  priority: number; // distance or heuristic from current distance to end
  item: T;
}

interface PriorityQueueInterface<T> {
  /**
   * return the size of the list
   */
  getSize: () => number;

  /**
   * Checks whether the queue is empty.
   */
  isEmpty: () => boolean;

  /**
   * inserts a value, the smallest value being at the top of the queue
   */
  push: (value: ItemInQueue<T>) => void;

  /**
   * pop and retrieve if anything
   */
  pop: () => ItemInQueue<T> | undefined;
}

export class PriorityQueue<T> implements PriorityQueueInterface<T> {
  private _queue: ItemInQueue<T>[];

  constructor() {
    this._queue = [];
  }

  public push(value: ItemInQueue<T>): void {
    if (
      this.isEmpty() ||
      value.priority >= this._queue[this.getSize() - 1].priority
    ) {
      this._queue.push(value);
    } else {
      for (let index = 0; index < this._queue.length; index++) {
        if (value.priority < this._queue[index].priority) {
          this._queue.splice(index, 0, value);
          break;
        }
      }
    }
  }

  public pop(): ItemInQueue<T> | undefined {
    return this._queue.shift();
  }

  public isEmpty(): boolean {
    return this._queue.length === 0;
  }

  public getSize(): number {
    return this._queue.length;
  }
}
