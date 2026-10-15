import type { Order, OrderId, OrderLine, Product, ProductDetails, ShopperId } from "@/core";
import { returnWindowDaysFrom } from "./order-return";

export type OrderItem = {
  product: Product;
  details: ProductDetails | null;
  quantity: number;
};

export type NewOrder = {
  id: OrderId;
  ownerId: ShopperId;
  isSample: boolean;
  placedAt: Date;
  created: Date;
  deliveryPostalCode: string;
  items: readonly OrderItem[];
};

// An order arrives with its slowest item, and starts with no returns.
export function newOrder(order: NewOrder): Order {
  return {
    id: order.id,
    ownerId: order.ownerId,
    isSample: order.isSample,
    placedAt: order.placedAt.toISOString(),
    deliveryDays: Math.max(...order.items.map((item) => item.product.deliveryDays)),
    deliveryPostalCode: order.deliveryPostalCode,
    lines: order.items.map((item) => orderLineFor(item.product, item.details, item.quantity)),
    returns: [],
    created: order.created.toISOString(),
    modified: null,
  };
}

export function orderLineFor(
  product: Product,
  details: ProductDetails | null,
  quantity: number,
): OrderLine {
  return {
    productId: product.id,
    name: product.name,
    category: product.category,
    priceInCents: product.priceInCents,
    quantity,
    returnWindowDays: returnWindowDaysFrom(details?.returnPolicy ?? null),
  };
}

// Unique per shopper: the moment it was placed, and how many orders came before.
export function orderIdFor(placedAt: Date, earlierOrderCount: number): OrderId {
  return `order-${placedAt.getTime().toString(36)}-${earlierOrderCount + 1}`;
}
