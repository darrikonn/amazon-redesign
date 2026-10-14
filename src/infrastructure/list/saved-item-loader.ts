import type { ProductId, SavedItem, SavedItemRepository, ShopperId } from "@/core";
import { DataLoader } from "../data-loader";

export function createSavedItemLoader(
  repository: SavedItemRepository,
  ownerId: ShopperId,
): DataLoader<ProductId, SavedItem | null> {
  return new DataLoader(async (productIds) => {
    const items = await repository.getMany(ownerId, productIds);
    const itemsByProduct = new Map(items.map((item) => [item.productId, item]));
    return productIds.map((productId) => itemsByProduct.get(productId) ?? null);
  });
}

export function createSavedItemListLoader(
  repository: SavedItemRepository,
): DataLoader<ShopperId, SavedItem[]> {
  return new DataLoader((ownerIds) =>
    Promise.all(ownerIds.map((ownerId) => repository.listByOwner(ownerId))),
  );
}
