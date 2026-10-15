import type { Clock, ShopperId } from "@/core";
import { KeyedRecords } from "../keyed-record";
import type { KeyValueStorage } from "./key-value-storage";
import { stampModified } from "./record-stamp";
import { StoredCollection } from "./stored-collection";

// A record that belongs to one owner: a cart line, a saved item, an order (ADR 0012).
export type OwnedRecord = {
  ownerId: ShopperId;
  created: string;
  modified: string | null;
};

export type OwnedRecordKind<Item> = {
  name: string;
  label: string;
  keyOf: (record: Item) => string;
  parseRecord: (value: unknown, context: string) => Item;
};

// A record's own key is only unique per owner, so records are found, and reported missing,
// by the owner and the key together.
export function ownedRecordKey(ownerId: ShopperId, key: string): string {
  return JSON.stringify([ownerId, key]);
}

// The repository surface for one kind of owned record kept in the browser (ADR 0030); the
// cart, the saved list, and orders differ only in their kind.
export class StoredOwnedRecords<Item extends OwnedRecord> {
  private readonly records: StoredCollection<Item>;

  constructor(
    storage: KeyValueStorage,
    private readonly clock: Clock,
    private readonly kind: OwnedRecordKind<Item>,
  ) {
    this.records = new StoredCollection(storage, kind.name, kind.parseRecord);
  }

  async get(ownerId: ShopperId, key: string): Promise<Item | null> {
    return this.ownersRecords(ownerId).get(ownedRecordKey(ownerId, key));
  }

  async demand(ownerId: ShopperId, key: string): Promise<Item> {
    return this.ownersRecords(ownerId).demand(ownedRecordKey(ownerId, key));
  }

  async getMany(ownerId: ShopperId, keys: readonly string[]): Promise<Item[]> {
    return this.ownersRecords(ownerId).getMany(keys.map((key) => ownedRecordKey(ownerId, key)));
  }

  async demandMany(ownerId: ShopperId, keys: readonly string[]): Promise<Item[]> {
    return this.ownersRecords(ownerId).demandMany(keys.map((key) => ownedRecordKey(ownerId, key)));
  }

  async listByOwner(ownerId: ShopperId): Promise<Item[]> {
    return this.records.list(ownerId);
  }

  async save(record: Item): Promise<void> {
    const key = this.kind.keyOf(record);
    this.records.upsert(
      record,
      (stored) => this.kind.keyOf(stored) === key,
      (existing) => stampModified(record, existing, this.clock.now()),
    );
  }

  protected removeRecord(ownerId: ShopperId, key: string): void {
    const kept = this.records.list(ownerId).filter((record) => this.kind.keyOf(record) !== key);
    this.records.replace(ownerId, kept);
  }

  private ownersRecords(ownerId: ShopperId): KeyedRecords<string, Item> {
    const recordsByKey = new Map(
      this.records
        .list(ownerId)
        .map((record) => [ownedRecordKey(ownerId, this.kind.keyOf(record)), record]),
    );
    return new KeyedRecords(this.kind.label, recordsByKey);
  }
}
