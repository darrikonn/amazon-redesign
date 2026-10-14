import { cardDetailsFor } from "@/component";
import type { Product } from "@/core";
import type { DealPriceView, ProductListing } from "./search-catalog";

// A product shown outside search (buy again, deals, the saved list): no best match or
// highlight, and the same detail line as a search card unless the shelf has a better one.
export function toShelfListing(
  product: Product,
  details: readonly string[] = cardDetailsFor(product),
  deal: DealPriceView | null = null,
): ProductListing {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    categoryLabel: product.categoryLabel,
    color: product.color,
    details,
    rating: product.rating,
    priceInCents: product.priceInCents,
    deliveryDays: product.deliveryDays,
    image: product.image,
    isBestMatch: false,
    highlightLabel: null,
    deal,
  };
}
