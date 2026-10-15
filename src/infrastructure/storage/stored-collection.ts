import type { ShopperId } from "@/core";
import type { KeyValueStorage } from "./key-value-storage";

type ItemParser<Item> = (value: unknown, context: string) => Item;

type Owned = {
  ownerId: ShopperId;
};

// One owner's list of records under one key. What the browser hands back is checked on
// every read. A row that no longer parses (a hand edit) is skipped on its own, so one bad
// row never costs the owner the rest of the list, and a row naming another owner is never
// returned (ADR 0012).
export class StoredCollection<Item extends Owned> {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly name: string,
    private readonly parseItem: ItemParser<Item>,
  ) {}

  list(ownerId: ShopperId): Item[] {
    const key = this.keyFor(ownerId);
    const stored = this.storage.read(key);
    if (!Array.isArray(stored)) return [];
    return stored
      .flatMap((item, index) => this.parsedOrSkipped(item, `${key}[${index}]`))
      .filter((item) => item.ownerId === ownerId);
  }

  replace(ownerId: ShopperId, items: readonly Item[]): void {
    this.storage.write(this.keyFor(ownerId), items);
  }

  // Saving over a record keeps its place in the list, so a changed line does not move.
  upsert(
    item: Item,
    isSame: (stored: Item) => boolean,
    stamp: (existing: Item | undefined) => Item,
  ): void {
    const stored = this.list(item.ownerId);
    const existing = stored.find(isSame);
    const saved = stamp(existing);
    const next =
      existing === undefined
        ? [...stored, saved]
        : stored.map((candidate) => (candidate === existing ? saved : candidate));
    this.replace(item.ownerId, next);
  }

  private keyFor(ownerId: ShopperId): string {
    return `${KEY_PREFIX}:${this.name}:${ownerId}`;
  }

  private parsedOrSkipped(value: unknown, context: string): Item[] {
    try {
      return [this.parseItem(value, context)];
    } catch {
      return [];
    }
  }
}

// Version 2 added created and modified to every record (ADR 0030). Version 1 rows are left
// where they are and never read, rather than read as empty and overwritten.
const KEY_PREFIX = "shop:v2";
