import type { CartLine, ProductId, SavedItem, ShopperId } from "@/core";

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

export function newSavedItem(ownerId: ShopperId, productId: ProductId, now: Date): SavedItem {
  return { ownerId, productId, created: now.toISOString(), modified: null };
}

// Zero and below remove the line; above the limit is held at the limit.
export function clampQuantity(quantity: number): number {
  return Math.min(Math.max(Math.floor(quantity), 0), CART_RULES.maximumQuantity);
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
