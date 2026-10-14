import { describe, expect, it } from "vitest";
import { parseDummyJsonResponse, parseFakeStoreResponse } from "@/component";

const dummyJsonProduct = {
  id: 1,
  title: "Essence Mascara Lash Princess",
  description: "Volumizing mascara.",
  category: "beauty",
  price: 9.99,
  discountPercentage: 10.48,
  rating: 2.56,
  tags: ["beauty", "mascara"],
  brand: "Essence",
  thumbnail: "https://cdn.dummyjson.com/x/thumbnail.webp",
  images: ["https://cdn.dummyjson.com/x/1.webp", "https://cdn.dummyjson.com/x/2.webp"],
  shippingInformation: "Ships in 3-5 business days",
  warrantyInformation: "1 week warranty",
  returnPolicy: "No return policy",
  availabilityStatus: "Low Stock",
  stock: 4,
  reviews: [
    {
      rating: 5,
      comment: "Highly impressed!",
      date: "2025-04-30T09:41:02.053Z",
      reviewerName: "Eleanor Collins",
      reviewerEmail: "eleanor.collins@x.dummyjson.com",
    },
  ],
};

describe("parseDummyJsonResponse", () => {
  it("reads the fields the app uses", () => {
    expect(parseDummyJsonResponse({ products: [dummyJsonProduct] })).toEqual([
      {
        id: 1,
        title: "Essence Mascara Lash Princess",
        description: "Volumizing mascara.",
        category: "beauty",
        priceInDollars: 9.99,
        discountPercentage: 10.48,
        rating: 2.56,
        tags: ["beauty", "mascara"],
        brand: "Essence",
        thumbnail: "https://cdn.dummyjson.com/x/thumbnail.webp",
        images: ["https://cdn.dummyjson.com/x/1.webp", "https://cdn.dummyjson.com/x/2.webp"],
        shippingInformation: "Ships in 3-5 business days",
        warrantyInformation: "1 week warranty",
        returnPolicy: "No return policy",
        availabilityStatus: "Low Stock",
        stock: 4,
        reviews: [
          {
            reviewerName: "Eleanor Collins",
            rating: 5,
            comment: "Highly impressed!",
            date: "2025-04-30T09:41:02.053Z",
          },
        ],
      },
    ]);
  });

  it("never reads a reviewer's email address", () => {
    const [product] = parseDummyJsonResponse({ products: [dummyJsonProduct] });

    expect(JSON.stringify(product)).not.toContain("@");
  });

  it("fails loudly when a review is missing its comment", () => {
    const broken = { ...dummyJsonProduct, reviews: [{ rating: 5, reviewerName: "A", date: "x" }] };

    expect(() => parseDummyJsonResponse({ products: [broken] })).toThrow('"comment"');
  });

  it("accepts a product without a brand", () => {
    expect(
      parseDummyJsonResponse({ products: [without(dummyJsonProduct, "brand")] })[0]?.brand,
    ).toBeNull();
  });

  it("fails loudly when a field the app needs is missing", () => {
    const broken = without(dummyJsonProduct, "shippingInformation");

    expect(() => parseDummyJsonResponse({ products: [broken] })).toThrow('"shippingInformation"');
  });
});

describe("parseFakeStoreResponse", () => {
  it("reads the rating and review count from the nested rating", () => {
    const [product] = parseFakeStoreResponse([
      {
        id: 3,
        title: "Mens Cotton Jacket",
        description: "Great outerwear.",
        category: "men's clothing",
        price: 55.99,
        rating: { rate: 4.7, count: 500 },
        image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
      },
    ]);

    expect(product).toMatchObject({ priceInDollars: 55.99, rating: 4.7, reviewCount: 500 });
  });
});

function without(record: Record<string, unknown>, key: string): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([name]) => name !== key));
}
