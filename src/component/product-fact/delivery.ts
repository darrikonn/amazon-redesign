export const DELIVERY_FACT_RULES = {
  // Shipping text the rules cannot read is taken as a week.
  unparsedDeliveryDays: 7,
} as const;

export function deliveryDaysFrom(shippingInformation: string): number {
  const text = shippingInformation.toLowerCase();
  const match = SHIPPING_PATTERNS.find((rule) => rule.pattern.test(text));
  return match === undefined ? DELIVERY_FACT_RULES.unparsedDeliveryDays : match.days;
}

const SHIPPING_PATTERNS: readonly { pattern: RegExp; days: number }[] = [
  { pattern: /overnight/, days: 1 },
  { pattern: /in 1-2 business days/, days: 2 },
  { pattern: /in 3-5 business days/, days: 4 },
  { pattern: /in 1 week/, days: 7 },
  { pattern: /in 2 weeks/, days: 14 },
  { pattern: /in 1 month/, days: 30 },
];
