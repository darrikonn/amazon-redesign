import type { Clock, ShopperId } from "@/core";
import { FixedClock } from "../clock";
import { KeyedRecords } from "../keyed-record";
import { type OwnedRecord, ownedRecordKey } from "./owned-record";
import { stampModified } from "./record-stamp";

export type OwnedRecordCall = {
  method: "get" | "demand" | "getMany" | "demandMany" | "listByOwner" | "save" | "remove";
  ownerId: ShopperId;
  keys: readonly string[];
};

// The test fake behind the in-memory cart, saved list, and orders: it records its calls,
// keeps records in the order they were first saved, and forgets everything on reset.
export class InMemoryOwnedRecords<Item extends OwnedRecord> {
  readonly calls: OwnedRecordCall[] = [];
  private readonly recordsByKey = new Map<string, Item>();
  private readonly lookup: KeyedRecords<string, Item>;

  constructor(
    label: string,
    private readonly keyOf: (record: Item) => string,
    private readonly clock: Clock = new FixedClock(),
  ) {
    this.lookup = new KeyedRecords(label, this.recordsByKey);
  }

  protected seedRecord(record: Item): void {
    this.recordsByKey.set(this.storageKeyOf(record), record);
  }

  protected storedRecords(): Item[] {
    return this.lookup.values();
  }

  async get(ownerId: ShopperId, key: string): Promise<Item | null> {
    this.record("get", ownerId, [key]);
    return this.lookup.get(ownedRecordKey(ownerId, key));
  }

  async demand(ownerId: ShopperId, key: string): Promise<Item> {
    this.record("demand", ownerId, [key]);
    return this.lookup.demand(ownedRecordKey(ownerId, key));
  }

  async getMany(ownerId: ShopperId, keys: readonly string[]): Promise<Item[]> {
    this.record("getMany", ownerId, keys);
    return this.lookup.getMany(keys.map((key) => ownedRecordKey(ownerId, key)));
  }

  async demandMany(ownerId: ShopperId, keys: readonly string[]): Promise<Item[]> {
    this.record("demandMany", ownerId, keys);
    return this.lookup.demandMany(keys.map((key) => ownedRecordKey(ownerId, key)));
  }

  async listByOwner(ownerId: ShopperId): Promise<Item[]> {
    this.record("listByOwner", ownerId, []);
    return this.storedRecords().filter((record) => record.ownerId === ownerId);
  }

  async save(record: Item): Promise<void> {
    this.record("save", record.ownerId, [this.keyOf(record)]);
    const storageKey = this.storageKeyOf(record);
    this.recordsByKey.set(
      storageKey,
      stampModified(record, this.recordsByKey.get(storageKey), this.clock.now()),
    );
  }

  reset(): void {
    this.calls.length = 0;
    this.recordsByKey.clear();
  }

  protected removeRecord(ownerId: ShopperId, key: string): void {
    this.record("remove", ownerId, [key]);
    this.recordsByKey.delete(ownedRecordKey(ownerId, key));
  }

  private storageKeyOf(record: Item): string {
    return ownedRecordKey(record.ownerId, this.keyOf(record));
  }

  private record(
    method: OwnedRecordCall["method"],
    ownerId: ShopperId,
    keys: readonly string[],
  ): void {
    this.calls.push({ method, ownerId, keys: [...keys] });
  }
}
