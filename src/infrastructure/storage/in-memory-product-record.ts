import type { Clock, ProductId, ShopperId } from "@/core";
import { NotFoundError } from "@/core";
import { FixedClock } from "../clock";
import { type ProductRecord, productRecordKey } from "./product-record";
import { stampModified } from "./record-stamp";

export type ProductRecordCall = {
  method: "get" | "demand" | "getMany" | "demandMany" | "listByOwner" | "save" | "remove";
  ownerId: ShopperId;
  productIds: readonly ProductId[];
};

// The test fake behind the in-memory cart and saved list: it records its calls, keeps
// records in the order they were first saved, and forgets everything on reset.
export class InMemoryProductRecords<Item extends ProductRecord> {
  readonly calls: ProductRecordCall[] = [];
  private readonly recordsByKey = new Map<string, Item>();

  constructor(
    private readonly label: string,
    private readonly clock: Clock = new FixedClock(),
  ) {}

  protected seedRecord(record: Item): void {
    this.recordsByKey.set(productRecordKey(record.ownerId, record.productId), record);
  }

  protected storedRecords(): Item[] {
    return [...this.recordsByKey.values()];
  }

  async get(ownerId: ShopperId, productId: ProductId): Promise<Item | null> {
    this.record("get", ownerId, [productId]);
    return this.recordsByKey.get(productRecordKey(ownerId, productId)) ?? null;
  }

  async demand(ownerId: ShopperId, productId: ProductId): Promise<Item> {
    this.record("demand", ownerId, [productId]);
    return this.require(ownerId, productId);
  }

  async getMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<Item[]> {
    this.record("getMany", ownerId, productIds);
    return productIds.flatMap((productId) => {
      const record = this.recordsByKey.get(productRecordKey(ownerId, productId));
      return record === undefined ? [] : [record];
    });
  }

  async demandMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<Item[]> {
    this.record("demandMany", ownerId, productIds);
    return productIds.map((productId) => this.require(ownerId, productId));
  }

  async listByOwner(ownerId: ShopperId): Promise<Item[]> {
    this.record("listByOwner", ownerId, []);
    return this.storedRecords().filter((record) => record.ownerId === ownerId);
  }

  async save(record: Item): Promise<void> {
    this.record("save", record.ownerId, [record.productId]);
    const key = productRecordKey(record.ownerId, record.productId);
    this.recordsByKey.set(key, stampModified(record, this.recordsByKey.get(key), this.clock.now()));
  }

  async remove(ownerId: ShopperId, productId: ProductId): Promise<void> {
    this.record("remove", ownerId, [productId]);
    this.recordsByKey.delete(productRecordKey(ownerId, productId));
  }

  reset(): void {
    this.calls.length = 0;
    this.recordsByKey.clear();
  }

  private record(
    method: ProductRecordCall["method"],
    ownerId: ShopperId,
    productIds: readonly ProductId[],
  ): void {
    this.calls.push({ method, ownerId, productIds: [...productIds] });
  }

  private require(ownerId: ShopperId, productId: ProductId): Item {
    const record = this.recordsByKey.get(productRecordKey(ownerId, productId));
    if (record === undefined)
      throw new NotFoundError(this.label, productRecordKey(ownerId, productId));
    return record;
  }
}
