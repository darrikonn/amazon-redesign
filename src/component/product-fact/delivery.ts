import { PRODUCT_FACT_RULES } from "./product-fact-rule";

export function deliveryDaysFrom(shippingInformation: string): number {
  const text = shippingInformation.toLowerCase();
  const match = DELIVERY_RULES.find((rule) => rule.pattern.test(text));
  return match === undefined ? PRODUCT_FACT_RULES.unparsedDeliveryDays : match.days;
}

const DELIVERY_RULES: readonly { pattern: RegExp; days: number }[] = [
  { pattern: /overnight/, days: 1 },
  { pattern: /in 1-2 business days/, days: 2 },
  { pattern: /in 3-5 business days/, days: 4 },
  { pattern: /in 1 week/, days: 7 },
  { pattern: /in 2 weeks/, days: 14 },
  { pattern: /in 1 month/, days: 30 },
];
