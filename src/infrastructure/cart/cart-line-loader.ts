import type { CartLine, CartLineRepository, ProductId, ShopperId } from "@/core";
import { createKeyedLoader, createOwnerListLoader, type DataLoader } from "../data-loader";

export function createCartLineLoader(
  repository: CartLineRepository,
  ownerId: ShopperId,
): DataLoader<ProductId, CartLine | null> {
  return createKeyedLoader(
    (productIds) => repository.getMany(ownerId, productIds),
    (line) => line.productId,
  );
}

export function createCartLineListLoader(
  repository: CartLineRepository,
): DataLoader<ShopperId, CartLine[]> {
  return createOwnerListLoader((ownerId) => repository.listByOwner(ownerId));
}
