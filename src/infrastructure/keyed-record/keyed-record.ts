import { NotFoundError } from "@/core";

// Lookups by key over records held in memory, answering the repository surface: get is
// nullable, demand throws, and the many forms keep the order of the keys asked for.
export class KeyedRecords<Key, Item> {
  constructor(
    private readonly label: string,
    private readonly recordsByKey: ReadonlyMap<Key, Item>,
  ) {}

  get(key: Key): Item | null {
    return this.recordsByKey.get(key) ?? null;
  }

  demand(key: Key): Item {
    const record = this.recordsByKey.get(key);
    if (record === undefined) throw new NotFoundError(this.label, String(key));
    return record;
  }

  getMany(keys: readonly Key[]): Item[] {
    return keys.flatMap((key) => {
      const record = this.recordsByKey.get(key);
      return record === undefined ? [] : [record];
    });
  }

  demandMany(keys: readonly Key[]): Item[] {
    return keys.map((key) => this.demand(key));
  }

  values(): Item[] {
    return [...this.recordsByKey.values()];
  }
}
