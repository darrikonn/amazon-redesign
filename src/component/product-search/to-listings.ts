import type { Product, SearchIntent, SearchSort } from "@/core";
import { colorLabel, featureLabel } from "../query-interpretation";

export const LISTING_RULES = {
  maximumExtraDetails: 2,
  minimumMatchesToHighlight: 2,
} as const;

export type Highlight = "top-rated-pick" | "lowest-price-pick" | "lowest-price";

export type Listing = {
  product: Product;
  isBestMatch: boolean;
  highlight: Highlight | null;
  details: readonly string[];
};

export type ListingContext = {
  intent: SearchIntent;
  sort: SearchSort;
  matchCount: number;
  understoodTermCount: number;
  isClosestMatch: boolean;
};

export function toListings(products: readonly Product[], context: ListingContext): Listing[] {
  const lowestPrice = Math.min(...products.map((product) => product.priceInCents));
  return products.map((product, index) => {
    const isBestMatch = index === 0 && canHighlightBestMatch(context);
    const isLowestPrice = canHighlight(context) && product.priceInCents === lowestPrice;
    return {
      product,
      isBestMatch,
      highlight: highlightFor(isBestMatch, isLowestPrice, context.sort),
      details: detailsFor(product, context.intent),
    };
  });
}

function canHighlightBestMatch(context: ListingContext): boolean {
  return canHighlight(context) && !context.isClosestMatch && context.understoodTermCount > 0;
}

function canHighlight(context: ListingContext): boolean {
  return context.matchCount >= LISTING_RULES.minimumMatchesToHighlight;
}

function highlightFor(
  isBestMatch: boolean,
  isLowestPrice: boolean,
  sort: SearchSort,
): Highlight | null {
  if (isBestMatch) return sort === "lowest-price" ? "lowest-price-pick" : "top-rated-pick";
  return isLowestPrice ? "lowest-price" : null;
}

// Features the shopper already asked for are left out: they are true of every result.
function detailsFor(product: Product, intent: SearchIntent): string[] {
  const extraFeatures = product.features
    .filter((feature) => !intent.features.includes(feature))
    .slice(0, LISTING_RULES.maximumExtraDetails)
    .map(featureLabel);
  return [colorLabel(product.color), ...extraFeatures];
}
