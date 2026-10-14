import type { KeyValueStorage } from "./key-value-storage";

export type KeyValueStorageCall = {
  method: "read" | "write" | "remove";
  key: string;
};

export class InMemoryKeyValueStorage implements KeyValueStorage {
  readonly calls: KeyValueStorageCall[] = [];
  private readonly values = new Map<string, string>();

  seedValue(key: string, value: unknown): void {
    this.values.set(key, JSON.stringify(value));
  }

  storedValue(key: string): unknown {
    const text = this.values.get(key);
    return text === undefined ? null : JSON.parse(text);
  }

  read(key: string): unknown {
    this.calls.push({ method: "read", key });
    return this.storedValue(key);
  }

  write(key: string, value: unknown): void {
    this.calls.push({ method: "write", key });
    this.values.set(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.calls.push({ method: "remove", key });
    this.values.delete(key);
  }

  reset(): void {
    this.calls.length = 0;
    this.values.clear();
  }
}
