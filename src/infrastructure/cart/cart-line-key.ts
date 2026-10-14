import type { ProductId, ShopperId } from "@/core";

export function cartLineKey(ownerId: ShopperId, productId: ProductId): string {
  return JSON.stringify([ownerId, productId]);
}
