import { isOneOf } from "../literal/is-one-of";
import type { CategoryId } from "./category";
import type { Color } from "./color";
import type { Tag } from "./tag";

export const PRODUCT_SOURCES = ["dummyjson", "fakestore"] as const;

export type ProductSource = (typeof PRODUCT_SOURCES)[number];

export type ProductId = string;

export type Product = {
  id: ProductId;
  source: ProductSource;
  sourceId: number;
  name: string;
  category: CategoryId;
  priceInCents: number;
  // How far below its list price the product sells, as a whole percentage; 0 when it is
  // not discounted. The price above is what the shopper pays (ADR 0030).
  discountPercent: number;
  rating: number;
  reviewCount: number;
  deliveryDays: number;
  color: Color | null;
  tags: readonly Tag[];
  image: string | null;
  brand: string | null;
  // Units the source has; 0 is sold out, and null means the source does not say.
  stock: number | null;
};

export function isProductSource(value: string): value is ProductSource {
  return isOneOf(PRODUCT_SOURCES, value);
}
