import type { CartLine, ShopperId } from "@/core";

export const CART_RULES = {
  maximumQuantity: 10,
} as const;

// Zero and below remove the line; above the limit is held at the limit.
export function clampQuantity(quantity: number): number {
  return Math.min(Math.max(Math.floor(quantity), 0), CART_RULES.maximumQuantity);
}

// The guest's lines join the shopper's cart on sign-in; a product in both keeps the sum.
export function mergeIntoCart(
  shopperLines: readonly CartLine[],
  guestLines: readonly CartLine[],
  ownerId: ShopperId,
): CartLine[] {
  return guestLines.map((guestLine) => {
    const existing = shopperLines.find((line) => line.productId === guestLine.productId);
    return {
      ownerId,
      productId: guestLine.productId,
      quantity: clampQuantity((existing?.quantity ?? 0) + guestLine.quantity),
    };
  });
}
