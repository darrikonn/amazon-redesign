import type { ShopperId } from "@/core";
import { requireArray } from "@/core";
import type { KeyValueStorage } from "./key-value-storage";

type ItemParser<Item> = (value: unknown, context: string) => Item;

type Owned = {
  ownerId: ShopperId;
};

// One owner's list of records under one key. What the browser hands back is checked on
// every read; a list that no longer parses (an old format, a hand edit) reads as empty so
// the shop starts that list afresh instead of breaking, and a row naming another owner is
// never returned (ADR 0012).
export class StoredCollection<Item extends Owned> {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly name: string,
    private readonly parseItem: ItemParser<Item>,
  ) {}

  list(ownerId: ShopperId): Item[] {
    const key = this.keyFor(ownerId);
    const stored = this.storage.read(key);
    if (stored === null) return [];
    try {
      return requireArray(stored, key)
        .map((item, index) => this.parseItem(item, `${key}[${index}]`))
        .filter((item) => item.ownerId === ownerId);
    } catch {
      return [];
    }
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
}

// Version 2 added created and modified to every record (ADR 0030). Version 1 rows are left
// where they are and never read, rather than read as empty and overwritten.
const KEY_PREFIX = "shop:v2";
