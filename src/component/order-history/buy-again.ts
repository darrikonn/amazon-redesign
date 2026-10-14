import type { Order, ProductId } from "@/core";
import { isReturned } from "./order-return";
import { trackOrder } from "./order-tracking";

export const BUY_AGAIN_RULES = {
  maximumProducts: 24,
} as const;

export type Purchase = {
  productId: ProductId;
  timesBought: number;
};

// Products from delivered orders that were kept, counted in units: the ones bought most
// often first, then the most recently bought.
export function buyAgainPurchases(orders: readonly Order[], now: Date): Purchase[] {
  const purchases = new Map<ProductId, { count: number; lastPlacedAt: number }>();
  for (const order of orders) {
    if (trackOrder(order, now).stage !== "delivered") continue;
    const placedAt = new Date(order.placedAt).getTime();
    for (const line of order.lines) {
      if (isReturned(order, line.productId)) continue;
      const previous = purchases.get(line.productId);
      purchases.set(line.productId, {
        count: (previous?.count ?? 0) + line.quantity,
        lastPlacedAt: Math.max(previous?.lastPlacedAt ?? 0, placedAt),
      });
    }
  }
  return [...purchases.entries()]
    .sort(
      ([, first], [, second]) =>
        second.count - first.count || second.lastPlacedAt - first.lastPlacedAt,
    )
    .slice(0, BUY_AGAIN_RULES.maximumProducts)
    .map(([productId, purchase]) => ({ productId, timesBought: purchase.count }));
}
