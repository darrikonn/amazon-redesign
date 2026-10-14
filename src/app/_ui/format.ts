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
  const dollars = Math.floor(priceInCents / CENTS_PER_DOLLAR).toLocaleString("en-US");
  const cents = String(priceInCents % CENTS_PER_DOLLAR).padStart(2, "0");
  return { dollars, cents, spoken: `$${dollars}.${cents}` };
}

export function deliveryLabel(deliveryDays: number): string {
  return deliveryDays === 1 ? "Tomorrow" : `in ${deliveryDays} days`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
