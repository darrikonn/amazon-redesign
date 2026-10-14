import type { Product, Shopper } from "@/core";

export function aProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "dummyjson-0001",
    source: "dummyjson",
    sourceId: 1,
    name: "Test laptop",
    category: "laptops",
    categoryLabel: "laptop",
    categoryPlural: "laptops",
    priceInCents: 99_900,
    rating: 4.2,
    reviewCount: 3,
    deliveryDays: 2,
    color: null,
    tags: [],
    image: null,
    brand: null,
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
