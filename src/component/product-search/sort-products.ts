import type { Product, SearchSort } from "@/core";

export function sortProducts(products: readonly Product[], sort: SearchSort): Product[] {
  return [...products].sort(COMPARATORS[sort]);
}

type Comparator = (first: Product, second: Product) => number;

const COMPARATORS: Record<SearchSort, Comparator> = {
  "best-match": byBestMatch,
  "lowest-price": byLowestPrice,
  "top-rated": byTopRated,
};

function byBestMatch(first: Product, second: Product): number {
  return (
    second.rating - first.rating ||
    first.deliveryDays - second.deliveryDays ||
    first.priceInCents - second.priceInCents
  );
}

function byLowestPrice(first: Product, second: Product): number {
  return first.priceInCents - second.priceInCents || second.rating - first.rating;
}

function byTopRated(first: Product, second: Product): number {
  return second.rating - first.rating || first.priceInCents - second.priceInCents;
}
