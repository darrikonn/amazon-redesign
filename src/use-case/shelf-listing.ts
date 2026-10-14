import { cardDetailsFor } from "@/component";
import type { Product } from "@/core";
import type { DealPriceView, ProductListing } from "./search-catalog";

type ShelfOptions = {
  details?: readonly string[];
  deal?: DealPriceView;
};

// A product shown outside search (buy again, deals, the saved list): no best match or
// highlight, and the same detail line as a search card unless the shelf has a better one.
export function toShelfListing(product: Product, options: ShelfOptions = {}): ProductListing {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    categoryLabel: product.categoryLabel,
    color: product.color,
    details: options.details ?? cardDetailsFor(product),
    rating: product.rating,
    priceInCents: product.priceInCents,
    deliveryDays: product.deliveryDays,
    image: product.image,
    isBestMatch: false,
    highlightLabel: null,
    deal: options.deal ?? null,
  };
}
