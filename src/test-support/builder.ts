import type { Product, ProductDetails, Shopper } from "@/core";

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

export function aProductDetails(overrides: Partial<ProductDetails> = {}): ProductDetails {
  return {
    productId: "dummyjson-0001",
    description: "A test laptop.",
    images: ["https://cdn.dummyjson.com/product-images/laptop/1.webp"],
    availability: "in-stock",
    stock: 20,
    shipping: "Ships in 1 week",
    warranty: "1 year warranty",
    returnPolicy: "30 days return policy",
    reviews: [{ reviewerName: "Robin Lee", rating: 4, comment: "Solid.", date: "2025-04-30" }],
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
