import type { Product } from "@/core";
import { dayNumber } from "../calendar";
import { stableHash } from "../stable-hash";

export const DEAL_RULES = {
  minimumDiscountPercent: 10,
  dealsPerDay: 12,
} as const;

export type Deal = {
  product: Product;
  listPriceInCents: number;
};

// A fresh set every day, the same for every shopper that day (ADR 0030), shown with the
// biggest discount first.
export function todaysDeals(catalog: readonly Product[], today: Date): Deal[] {
  const day = dayNumber(today);
  return catalog
    .filter((product) => product.discountPercent >= DEAL_RULES.minimumDiscountPercent)
    .sort((first, second) => stableHash(`${day}:${first.id}`) - stableHash(`${day}:${second.id}`))
    .slice(0, DEAL_RULES.dealsPerDay)
    .sort((first, second) => second.discountPercent - first.discountPercent)
    .map((product) => ({ product, listPriceInCents: listPriceInCents(product) }));
}

// The price before the discount; the catalogue price is what the shopper pays.
export function listPriceInCents(product: Product): number {
  return Math.round((product.priceInCents * 100) / (100 - product.discountPercent));
}
