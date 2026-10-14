const CENTS_PER_DOLLAR = 100;

export function parseCents(dollars: string | undefined): number {
  return Math.round(Number(dollars ?? "0") * CENTS_PER_DOLLAR);
}

export function formatDollars(cents: number): string {
  const dollars = cents / CENTS_PER_DOLLAR;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}
