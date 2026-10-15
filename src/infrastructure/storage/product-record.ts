import type { Clock, ProductId, ShopperId } from "@/core";
import { NotFoundError } from "@/core";
import type { KeyValueStorage } from "./key-value-storage";
import { stampModified } from "./record-stamp";
import { StoredCollection } from "./stored-collection";

// A record one owner keeps about one product: a cart line, a saved item.
export type ProductRecord = {
  ownerId: ShopperId;
  productId: ProductId;
  created: string;
  modified: string | null;
};

export function productRecordKey(ownerId: ShopperId, productId: ProductId): string {
  return JSON.stringify([ownerId, productId]);
}

type RecordParser<Item> = (value: unknown, context: string) => Item;

// The whole repository surface for product records kept in the browser (ADR 0030); the
// cart and the saved list differ only in their name and the shape of a record.
export class StoredProductRecords<Item extends ProductRecord> {
  private readonly records: StoredCollection<Item>;

  constructor(
    storage: KeyValueStorage,
    private readonly clock: Clock,
    name: string,
    private readonly label: string,
    parseRecord: RecordParser<Item>,
  ) {
    this.records = new StoredCollection(storage, name, parseRecord);
  }

  async get(ownerId: ShopperId, productId: ProductId): Promise<Item | null> {
    return this.find(ownerId, productId) ?? null;
  }

  async demand(ownerId: ShopperId, productId: ProductId): Promise<Item> {
    const record = this.find(ownerId, productId);
    if (record === undefined)
      throw new NotFoundError(this.label, productRecordKey(ownerId, productId));
    return record;
  }

  async getMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<Item[]> {
    const records = this.records.list(ownerId);
    return productIds.flatMap((productId) =>
      records.filter((record) => record.productId === productId),
    );
  }

  async demandMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<Item[]> {
    return Promise.all(productIds.map((productId) => this.demand(ownerId, productId)));
  }

  async listByOwner(ownerId: ShopperId): Promise<Item[]> {
    return this.records.list(ownerId);
  }

  async save(record: Item): Promise<void> {
    this.records.upsert(
      record,
      (stored) => stored.productId === record.productId,
      (existing) => stampModified(record, existing, this.clock.now()),
    );
  }

  async remove(ownerId: ShopperId, productId: ProductId): Promise<void> {
    const kept = this.records.list(ownerId).filter((record) => record.productId !== productId);
    this.records.replace(ownerId, kept);
  }

  private find(ownerId: ShopperId, productId: ProductId): Item | undefined {
    return this.records.list(ownerId).find((record) => record.productId === productId);
  }
}
