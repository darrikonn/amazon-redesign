import type { Clock, ProductId, ShopperId } from "@/core";
import { InMemoryOwnedRecords } from "./in-memory-owned-record";
import type { KeyValueStorage } from "./key-value-storage";
import { type OwnedRecord, StoredOwnedRecords } from "./owned-record";

// A record one owner keeps about one product, which can be taken away again: a cart line,
// a saved item.
export type ProductRecord = OwnedRecord & {
  productId: ProductId;
};

type ProductRecordKind<Item> = {
  name: string;
  label: string;
  parseRecord: (value: unknown, context: string) => Item;
};

export class StoredProductRecords<Item extends ProductRecord> extends StoredOwnedRecords<Item> {
  constructor(storage: KeyValueStorage, clock: Clock, kind: ProductRecordKind<Item>) {
    super(storage, clock, { ...kind, keyOf: (record) => record.productId });
  }

  async remove(ownerId: ShopperId, productId: ProductId): Promise<void> {
    this.removeRecord(ownerId, productId);
  }
}

export class InMemoryProductRecords<Item extends ProductRecord> extends InMemoryOwnedRecords<Item> {
  constructor(label: string, clock?: Clock) {
    super(label, (record) => record.productId, clock);
  }

  async remove(ownerId: ShopperId, productId: ProductId): Promise<void> {
    this.removeRecord(ownerId, productId);
  }
}
