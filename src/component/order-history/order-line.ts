import type {
  Order,
  OrderId,
  OrderLine,
  Product,
  ProductDetails,
  ProductId,
  ShopperId,
} from "@/core";
import { returnWindowDaysFrom } from "./order-return";

export type OrderItem = {
  product: Product;
  details: ProductDetails | null;
  quantity: number;
};

type WantedItem = {
  productId: ProductId;
  quantity: number;
};

// Matches what is wanted (cart lines, sample purchases) to the catalogue; a product that has
// left the catalogue is left out rather than ordered without a name or price.
export function orderItemsFor(
  wanted: readonly WantedItem[],
  products: readonly Product[],
  details: readonly ProductDetails[],
): OrderItem[] {
  return wanted.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (product === undefined) return [];
    const productDetails = details.find((entry) => entry.productId === item.productId) ?? null;
    return [{ product, details: productDetails, quantity: item.quantity }];
  });
}

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
