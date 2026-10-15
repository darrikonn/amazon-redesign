import type { CartLine, Product, ProductId, ShopperId } from "@/core";

export const CART_RULES = {
  maximumQuantity: 10,
} as const;

// A record is created by the model with its creation time, and is unchanged so far
// (ADR 0007).
export function newCartLine(
  ownerId: ShopperId,
  productId: ProductId,
  quantity: number,
  now: Date,
): CartLine {
  return { ownerId, productId, quantity, created: now.toISOString(), modified: null };
}

// No more than the cart allows, and no more than the source has in stock; a sold-out
// product allows none.
export function quantityLimitFor(product: Pick<Product, "stock">): number {
  if (product.stock === null) return CART_RULES.maximumQuantity;
  return Math.max(Math.min(CART_RULES.maximumQuantity, product.stock), 0);
}

export function canBuy(product: Pick<Product, "stock">): boolean {
  return quantityLimitFor(product) > 0;
}

// Zero and below remove the line; above the limit is held at the limit.
export function clampQuantity(
  quantity: number,
  limit: number = CART_RULES.maximumQuantity,
): number {
  return Math.min(Math.max(Math.floor(quantity), 0), limit);
}

// The guest's lines join the shopper's cart on sign-in; a product in both keeps the sum.
export function mergeIntoCart(
  shopperLines: readonly CartLine[],
  guestLines: readonly CartLine[],
  ownerId: ShopperId,
  now: Date,
): CartLine[] {
  return guestLines.map((guestLine) => {
    const existing = shopperLines.find((line) => line.productId === guestLine.productId);
    const quantity = clampQuantity((existing?.quantity ?? 0) + guestLine.quantity);
    if (existing !== undefined) return { ...existing, quantity };
    return newCartLine(ownerId, guestLine.productId, quantity, now);
  });
}
