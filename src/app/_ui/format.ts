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

type DeliveryLocation = {
  deliveryCity: string | null;
  deliveryPostalCode: string;
};

// "Minneapolis 55401", or just the ZIP code where it names no city we know.
export function deliveryLocationLabel(location: DeliveryLocation): string {
  return [location.deliveryCity, location.deliveryPostalCode].filter(Boolean).join(" ");
}

// Dates are written the way a US shop writes them ("Oct 14, 2026"), and read in UTC so the
// server and the browser agree.
const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// Review dates are calendar dates (YYYY-MM-DD), so no time zone may move them.
export function formatReviewDate(calendarDate: string): string {
  return SHORT_DATE.format(new Date(`${calendarDate}T00:00:00Z`));
}

// Order dates are moments.
export function formatOrderDate(moment: string): string {
  return SHORT_DATE.format(new Date(moment));
}

export function formatDayAndDate(moment: string): string {
  return DAY_AND_DATE.format(new Date(moment));
}

const DAY_AND_DATE = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
