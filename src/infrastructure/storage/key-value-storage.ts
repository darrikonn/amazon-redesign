// Where the browser-stored shop keeps its JSON (ADR 0030). Reads return null for a key
// that was never written.
export interface KeyValueStorage {
  read(key: string): unknown;
  write(key: string, value: unknown): void;
  remove(key: string): void;
}

// localStorage when the page has it; on the server, or when the browser refuses storage
// (a private window, full quota), it keeps the values in memory for the page's lifetime.
export class BrowserKeyValueStorage implements KeyValueStorage {
  private readonly fallback = new Map<string, string>();

  read(key: string): unknown {
    const text = this.readText(key);
    if (text === null) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  write(key: string, value: unknown): void {
    const text = JSON.stringify(value);
    try {
      window.localStorage.setItem(key, text);
    } catch {
      this.fallback.set(key, text);
    }
  }

  remove(key: string): void {
    this.fallback.delete(key);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Nothing was stored there.
    }
  }

  private readText(key: string): string | null {
    try {
      return window.localStorage.getItem(key) ?? this.fallback.get(key) ?? null;
    } catch {
      return this.fallback.get(key) ?? null;
    }
  }
}
