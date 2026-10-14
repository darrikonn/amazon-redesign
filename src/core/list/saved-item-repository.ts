import type { ProductId } from "../product/product";
import type { ShopperId } from "../shopper/shopper";
import type { SavedItem } from "./saved-item";

export interface SavedItemRepository {
  get(ownerId: ShopperId, productId: ProductId): Promise<SavedItem | null>;
  demand(ownerId: ShopperId, productId: ProductId): Promise<SavedItem>;
  getMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<SavedItem[]>;
  demandMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<SavedItem[]>;
  listByOwner(ownerId: ShopperId): Promise<SavedItem[]>;
  save(item: SavedItem): Promise<void>;
  remove(ownerId: ShopperId, productId: ProductId): Promise<void>;
}
