import type { Clock, ProductId, SavedItem, SavedItemRepository, ShopperId } from "@/core";
import { NotFoundError, optionalString, requireRecord, requireString } from "@/core";
import { type KeyValueStorage, StoredCollection, stampModified } from "../storage";

export class StoredSavedItemRepository implements SavedItemRepository {
  private readonly items: StoredCollection<SavedItem>;

  constructor(
    storage: KeyValueStorage,
    private readonly clock: Clock,
  ) {
    this.items = new StoredCollection(storage, "saved", parseSavedItem);
  }

  async get(ownerId: ShopperId, productId: ProductId): Promise<SavedItem | null> {
    return this.find(ownerId, productId) ?? null;
  }

  async demand(ownerId: ShopperId, productId: ProductId): Promise<SavedItem> {
    const item = this.find(ownerId, productId);
    if (item === undefined) throw new NotFoundError("saved item", productId);
    return item;
  }

  async getMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<SavedItem[]> {
    const items = this.items.list(ownerId);
    return productIds.flatMap((productId) => items.filter((item) => item.productId === productId));
  }

  async demandMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<SavedItem[]> {
    return Promise.all(productIds.map((productId) => this.demand(ownerId, productId)));
  }

  async listByOwner(ownerId: ShopperId): Promise<SavedItem[]> {
    return this.items.list(ownerId);
  }

  async save(item: SavedItem): Promise<void> {
    this.items.upsert(
      item,
      (stored) => stored.productId === item.productId,
      (existing) => stampModified(item, existing, this.clock.now()),
    );
  }

  async remove(ownerId: ShopperId, productId: ProductId): Promise<void> {
    const kept = this.items.list(ownerId).filter((item) => item.productId !== productId);
    this.items.replace(ownerId, kept);
  }

  private find(ownerId: ShopperId, productId: ProductId): SavedItem | undefined {
    return this.items.list(ownerId).find((item) => item.productId === productId);
  }
}

function parseSavedItem(value: unknown, context: string): SavedItem {
  const record = requireRecord(value, context);
  return {
    ownerId: requireString(record, "ownerId", context),
    productId: requireString(record, "productId", context),
    created: requireString(record, "created", context),
    modified: optionalString(record, "modified", context),
  };
}
