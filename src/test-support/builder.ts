import type { Product, Shopper } from "@/core";

export function aProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "test-product",
    title: "Test desk lamp",
    category: "desk-lamp",
    priceInCents: 2500,
    rating: 4.2,
    reviewCount: 100,
    deliveryDays: 2,
    color: "black",
    features: [],
    illustration: { shape: "led-desk-lamp", isMirrored: false },
    ...overrides,
  };
}

export function aShopper(overrides: Partial<Shopper> = {}): Shopper {
  return {
    id: "shopper-1",
    firstName: "Robin",
    deliveryCity: "Reykjavik",
    deliveryPostalCode: "101",
    ...overrides,
  };
}
