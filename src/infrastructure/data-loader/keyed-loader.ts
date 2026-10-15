import type { ShopperId } from "@/core";
import { DataLoader } from "./data-loader";

// Loads records by key in one batch, answering null for a key with no record.
export function createKeyedLoader<Key, Item>(
  findMany: (keys: readonly Key[]) => Promise<readonly Item[]>,
  keyOf: (item: Item) => Key,
): DataLoader<Key, Item | null> {
  return new DataLoader<Key, Item | null>(async (keys) => {
    const itemsByKey = new Map((await findMany(keys)).map((item) => [keyOf(item), item]));
    return keys.map((key) => itemsByKey.get(key) ?? null);
  });
}

// Loads each owner's whole list; the lists are per owner, so there is nothing to share.
export function createOwnerListLoader<Item>(
  listByOwner: (ownerId: ShopperId) => Promise<Item[]>,
): DataLoader<ShopperId, Item[]> {
  return new DataLoader((ownerIds) => Promise.all(ownerIds.map(listByOwner)));
}
