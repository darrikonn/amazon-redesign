import type { OrderLine, Product, ProductDetails } from "@/core";
import { returnWindowDaysFrom } from "./order-return";

export function orderLineFor(
  product: Product,
  details: ProductDetails | null,
  quantity: number,
): OrderLine {
  return {
    productId: product.id,
    name: product.name,
    category: product.category,
    image: product.image,
    priceInCents: product.priceInCents,
    quantity,
    returnWindowDays: returnWindowDaysFrom(details?.returnPolicy ?? null),
  };
}

export function orderTotalInCents(lines: readonly OrderLine[]): number {
  return lines.reduce((total, line) => total + line.priceInCents * line.quantity, 0);
}

export function orderItemCount(lines: readonly OrderLine[]): number {
  return lines.reduce((count, line) => count + line.quantity, 0);
}

// Unique per shopper: the moment it was placed, and how many orders came before.
export function orderIdFor(placedAt: Date, earlierOrderCount: number): string {
  return `order-${placedAt.getTime().toString(36)}-${earlierOrderCount + 1}`;
}
