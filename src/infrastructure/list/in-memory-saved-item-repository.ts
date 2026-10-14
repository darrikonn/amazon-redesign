import type { Clock, ProductId, SavedItem, SavedItemRepository, ShopperId } from "@/core";
import { NotFoundError } from "@/core";
import { FixedClock } from "../clock";
import { stampModified } from "../storage";

export type SavedItemRepositoryCall = {
  method: "get" | "demand" | "getMany" | "demandMany" | "listByOwner" | "save" | "remove";
  ownerId: ShopperId;
  productIds: readonly ProductId[];
};

export class InMemorySavedItemRepository implements SavedItemRepository {
  readonly calls: SavedItemRepositoryCall[] = [];
  private readonly items: SavedItem[] = [];

  constructor(private readonly clock: Clock = new FixedClock()) {}

  seedItem(item: SavedItem): void {
    this.items.push(item);
  }

  storedItems(): SavedItem[] {
    return [...this.items];
  }

  async get(ownerId: ShopperId, productId: ProductId): Promise<SavedItem | null> {
    this.record("get", ownerId, [productId]);
    return this.find(ownerId, productId) ?? null;
  }

  async demand(ownerId: ShopperId, productId: ProductId): Promise<SavedItem> {
    this.record("demand", ownerId, [productId]);
    return this.require(ownerId, productId);
  }

  async getMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<SavedItem[]> {
    this.record("getMany", ownerId, productIds);
    return productIds.flatMap((productId) => {
      const item = this.find(ownerId, productId);
      return item === undefined ? [] : [item];
    });
  }

  async demandMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<SavedItem[]> {
    this.record("demandMany", ownerId, productIds);
    return productIds.map((productId) => this.require(ownerId, productId));
  }

  async listByOwner(ownerId: ShopperId): Promise<SavedItem[]> {
    this.record("listByOwner", ownerId, []);
    return this.items.filter((item) => item.ownerId === ownerId);
  }

  async save(item: SavedItem): Promise<void> {
    this.record("save", item.ownerId, [item.productId]);
    const existing = this.find(item.ownerId, item.productId);
    const saved = stampModified(item, existing, this.clock.now());
    if (existing === undefined) this.items.push(saved);
    else this.items.splice(this.items.indexOf(existing), 1, saved);
  }

  async remove(ownerId: ShopperId, productId: ProductId): Promise<void> {
    this.record("remove", ownerId, [productId]);
    this.removeStored(ownerId, productId);
  }

  reset(): void {
    this.calls.length = 0;
    this.items.length = 0;
  }

  private record(
    method: SavedItemRepositoryCall["method"],
    ownerId: ShopperId,
    productIds: readonly ProductId[],
  ): void {
    this.calls.push({ method, ownerId, productIds: [...productIds] });
  }

  private find(ownerId: ShopperId, productId: ProductId): SavedItem | undefined {
    return this.items.find((item) => item.ownerId === ownerId && item.productId === productId);
  }

  private require(ownerId: ShopperId, productId: ProductId): SavedItem {
    const item = this.find(ownerId, productId);
    if (item === undefined) throw new NotFoundError("saved item", productId);
    return item;
  }

  private removeStored(ownerId: ShopperId, productId: ProductId): void {
    const index = this.items.findIndex(
      (item) => item.ownerId === ownerId && item.productId === productId,
    );
    if (index >= 0) this.items.splice(index, 1);
  }
}
