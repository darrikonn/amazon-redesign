import type { ProductId, SavedItem, SavedItemRepository, ShopperId } from "@/core";
import { createKeyedLoader, createOwnerListLoader, type DataLoader } from "../data-loader";

export function createSavedItemLoader(
  repository: SavedItemRepository,
  ownerId: ShopperId,
): DataLoader<ProductId, SavedItem | null> {
  return createKeyedLoader(
    (productIds) => repository.getMany(ownerId, productIds),
    (item) => item.productId,
  );
}

export function createSavedItemListLoader(
  repository: SavedItemRepository,
): DataLoader<ShopperId, SavedItem[]> {
  return createOwnerListLoader((ownerId) => repository.listByOwner(ownerId));
}
