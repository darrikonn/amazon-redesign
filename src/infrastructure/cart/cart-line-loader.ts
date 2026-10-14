import type { CartLine, CartLineRepository, ProductId, ShopperId } from "@/core";
import { DataLoader } from "../data-loader";

export function createCartLineLoader(
  repository: CartLineRepository,
  ownerId: ShopperId,
): DataLoader<ProductId, CartLine | null> {
  return new DataLoader(async (productIds) => {
    const lines = await repository.getMany(ownerId, productIds);
    const linesByProduct = new Map(lines.map((line) => [line.productId, line]));
    return productIds.map((productId) => linesByProduct.get(productId) ?? null);
  });
}

export function createCartLineListLoader(
  repository: CartLineRepository,
): DataLoader<ShopperId, CartLine[]> {
  return new DataLoader((ownerIds) =>
    Promise.all(ownerIds.map((ownerId) => repository.listByOwner(ownerId))),
  );
}
