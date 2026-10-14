const CENTS_PER_DOLLAR = 100;

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function resultCountLabel(count: number): string {
  return pluralize(count, "result", "results");
}

export type PriceParts = {
  dollars: string;
  cents: string;
  spoken: string;
};

export function splitPrice(priceInCents: number): PriceParts {
  const dollars = String(Math.floor(priceInCents / CENTS_PER_DOLLAR));
  const cents = String(priceInCents % CENTS_PER_DOLLAR).padStart(2, "0");
  return { dollars, cents, spoken: `$${dollars}.${cents}` };
}

export function deliveryLabel(deliveryDays: number): string {
  return deliveryDays === 1 ? "Tomorrow" : `in ${deliveryDays} days`;
}

export function formatReviewCount(reviewCount: number): string {
  return reviewCount.toLocaleString("en-US");
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
