import type { Clock, ProductId, ShopperId } from "@/core";
import { InMemoryOwnedRecords } from "./in-memory-owned-record";
import type { ProductRecord } from "./product-record";

// The test fake behind the in-memory cart and saved list.
export class InMemoryProductRecords<Item extends ProductRecord> extends InMemoryOwnedRecords<Item> {
  constructor(label: string, clock?: Clock) {
    super(label, (record) => record.productId, clock);
  }

  async remove(ownerId: ShopperId, productId: ProductId): Promise<void> {
    this.removeRecord(ownerId, productId);
  }
}
