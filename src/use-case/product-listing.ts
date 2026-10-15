import { canBuy, cardDetailsFor, categoryLabel } from "@/component";
import type { CategoryId, Color, Product, ProductId } from "@/core";

// A product card, wherever it is shown: search, buy again, deals, the saved list.
export type ProductListing = {
  id: ProductId;
  name: string;
  category: CategoryId;
  categoryLabel: string;
  color: Color | null;
  details: readonly string[];
  rating: number;
  priceInCents: number;
  deliveryDays: number;
  image: string | null;
  canBuy: boolean;
  isBestMatch: boolean;
  highlightLabel: string | null;
  deal: DealPriceView | null;
};

export type DealPriceView = {
  listPriceInCents: number;
  discountPercent: number;
};

type ListingExtras = {
  details?: readonly string[];
  isBestMatch?: boolean;
  highlightLabel?: string | null;
  deal?: DealPriceView | null;
};

// Outside search a card has no best match or highlight, and shows the same detail line as
// a search card unless the page has a better one.
export function toProductListing(product: Product, extras: ListingExtras = {}): ProductListing {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    categoryLabel: categoryLabel(product.category),
    color: product.color,
    details: extras.details ?? cardDetailsFor(product),
    rating: product.rating,
    priceInCents: product.priceInCents,
    deliveryDays: product.deliveryDays,
    image: product.image,
    canBuy: canBuy(product),
    isBestMatch: extras.isBestMatch ?? false,
    highlightLabel: extras.highlightLabel ?? null,
    deal: extras.deal ?? null,
  };
}
