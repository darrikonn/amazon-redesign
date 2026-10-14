export const DEFAULT_POSTAL_CODE = "55401";

// The ZIP codes the fake shop knows a city for; any other five-digit ZIP is accepted and
// shown on its own.
const DELIVERY_AREAS: Readonly<Record<string, string>> = {
  "02108": "Boston",
  "10001": "New York",
  "19103": "Philadelphia",
  "30303": "Atlanta",
  "33131": "Miami",
  "55401": "Minneapolis",
  "60601": "Chicago",
  "73301": "Austin",
  "80202": "Denver",
  "90012": "Los Angeles",
  "94103": "San Francisco",
  "98101": "Seattle",
};

const POSTAL_CODE_PATTERN = /^\d{5}$/;

export function normalisePostalCode(text: string): string | null {
  const postalCode = text.trim();
  return POSTAL_CODE_PATTERN.test(postalCode) ? postalCode : null;
}

export function deliveryCityFor(postalCode: string): string | null {
  return DELIVERY_AREAS[postalCode] ?? null;
}
