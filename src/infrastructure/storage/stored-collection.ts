import type { ShopperId } from "@/core";
import { requireArray } from "@/core";
import type { KeyValueStorage } from "./key-value-storage";

type ItemParser<Item> = (value: unknown, context: string) => Item;

// One owner's list of records under one key. What the browser hands back is checked on
// every read; a list that no longer parses (an old format, a hand edit) reads as empty so
// the shop starts that list afresh instead of breaking.
export class StoredCollection<Item> {
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
      return requireArray(stored, key).map((item, index) =>
        this.parseItem(item, `${key}[${index}]`),
      );
    } catch {
      return [];
    }
  }

  replace(ownerId: ShopperId, items: readonly Item[]): void {
    this.storage.write(this.keyFor(ownerId), items);
  }

  private keyFor(ownerId: ShopperId): string {
    return `${KEY_PREFIX}:${this.name}:${ownerId}`;
  }
}

const KEY_PREFIX = "shop:v1";
