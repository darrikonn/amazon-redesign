export type BatchFunction<Key, Value> = (keys: readonly Key[]) => Promise<readonly Value[]>;

export class DataLoader<Key, Value> {
  private readonly cache = new Map<string, Promise<Value>>();
  private queue: QueuedLoad<Key, Value>[] = [];

  constructor(
    private readonly batch: BatchFunction<Key, Value>,
    private readonly cacheKeyOf: (key: Key) => string = String,
  ) {}

  load(key: Key): Promise<Value> {
    const cacheKey = this.cacheKeyOf(key);
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) return cached;
    const pending = this.enqueue(key);
    this.cache.set(cacheKey, pending);
    return pending;
  }

  loadMany(keys: readonly Key[]): Promise<Value[]> {
    return Promise.all(keys.map((key) => this.load(key)));
  }

  private enqueue(key: Key): Promise<Value> {
    return new Promise<Value>((resolve, reject) => {
      this.queue.push({ key, resolve, reject });
      if (this.queue.length === 1) queueMicrotask(() => void this.dispatch());
    });
  }

  private async dispatch(): Promise<void> {
    const queued = this.queue;
    this.queue = [];
    try {
      settle(queued, await this.batch(queued.map((load) => load.key)));
    } catch (error) {
      for (const load of queued) {
        this.cache.delete(this.cacheKeyOf(load.key));
        load.reject(error);
      }
    }
  }
}

type QueuedLoad<Key, Value> = {
  key: Key;
  resolve: (value: Value) => void;
  reject: (reason: unknown) => void;
};

function settle<Key, Value>(
  queued: readonly QueuedLoad<Key, Value>[],
  values: readonly Value[],
): void {
  if (values.length !== queued.length) {
    throw new Error(`Batch returned ${values.length} values for ${queued.length} keys`);
  }
  for (const [index, value] of values.entries()) {
    queued[index]?.resolve(value);
  }
}
