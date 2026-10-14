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

const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// Review dates are calendar dates (YYYY-MM-DD), read in UTC so no time zone moves them.
export function formatReviewDate(calendarDate: string): string {
  return SHORT_DATE.format(new Date(`${calendarDate}T00:00:00Z`));
}

const DAY_AND_DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

// Order dates are moments; they are shown in UTC so the server and the browser agree.
export function formatOrderDate(moment: string): string {
  return SHORT_DATE.format(new Date(moment));
}

export function formatDayAndDate(moment: string): string {
  return DAY_AND_DATE.format(new Date(moment));
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
