import type {
  CartLine,
  Order,
  OrderLine,
  Product,
  ProductDetails,
  SavedItem,
  Session,
  Shopper,
} from "@/core";

export function aProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "dummyjson-0001",
    source: "dummyjson",
    sourceId: 1,
    name: "Test laptop",
    category: "laptops",
    priceInCents: 99_900,
    discountPercent: 0,
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
    id: "shopper:robin.lee@example.com",
    email: "robin.lee@example.com",
    firstName: "Robin",
    fullName: "Robin Lee",
    deliveryCity: "Minneapolis",
    deliveryPostalCode: "55401",
    ...overrides,
  };
}

export function aSession(overrides: Partial<Session> = {}): Session {
  return {
    email: "robin.lee@example.com",
    deliveryPostalCode: "55401",
    ...overrides,
  };
}

export function anOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "order-1",
    ownerId: "shopper:robin.lee@example.com",
    isSample: false,
    placedAt: "2026-10-01T12:00:00.000Z",
    deliveryDays: 2,
    deliveryPostalCode: "55401",
    lines: [anOrderLine()],
    returns: [],
    created: "2026-10-01T12:00:00.000Z",
    modified: null,
    ...overrides,
  };
}

export function anOrderLine(overrides: Partial<OrderLine> = {}): OrderLine {
  return {
    productId: "dummyjson-0001",
    name: "Test laptop",
    category: "laptops",
    priceInCents: 99_900,
    quantity: 1,
    returnWindowDays: 30,
    ...overrides,
  };
}

// Both stand at the test clock's moment (FixedClock), never changed since.
export function aCartLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    ownerId: "shopper:robin.lee@example.com",
    productId: "dummyjson-0001",
    quantity: 1,
    created: "2026-10-14T12:00:00.000Z",
    modified: null,
    ...overrides,
  };
}

export function aSavedItem(overrides: Partial<SavedItem> = {}): SavedItem {
  return {
    ownerId: "shopper:robin.lee@example.com",
    productId: "dummyjson-0001",
    created: "2026-10-14T12:00:00.000Z",
    modified: null,
    ...overrides,
  };
}
