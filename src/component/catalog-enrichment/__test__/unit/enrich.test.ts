import { describe, expect, it } from "vitest";
import { buildCatalog, NORMALISATION_RULES, parseOverrides } from "@/component";

// One DummyJSON product as the source sends it.
const watch = {
  id: 7,
  title: "  Brown Leather Belt Watch  ",
  description: "  A classic watch with a genuine leather strap. Water resistant.  ",
  category: "mens-watches",
  price: 89.99,
  discountPercentage: 12.6,
  rating: 4.8,
  tags: ["watches", "leather watches"],
  brand: "Fashion Timepieces",
  thumbnail: "https://cdn.dummyjson.com/watch/thumbnail.webp",
  images: ["https://cdn.dummyjson.com/watch/1.webp", " ", "https://cdn.dummyjson.com/watch/2.webp"],
  shippingInformation: "Ships in 3-5 business days",
  warrantyInformation: "1 year warranty",
  returnPolicy: "  ",
  availabilityStatus: "Low Stock",
  stock: 4,
  reviews: [5, 4, 1].map((rating) => ({
    reviewerName: ` Reviewer ${rating} `,
    reviewerEmail: `reviewer.${rating}@x.dummyjson.com`,
    rating,
    comment: " Fine. ",
    date: "2025-04-30T09:41:02.053Z",
  })),
};

const noOverrides = parseOverrides({});

function dummyJson(...products: readonly Record<string, unknown>[]) {
  return { products };
}

describe("buildCatalog from DummyJSON", () => {
  it("builds the app's product, rated by its reviews", () => {
    const catalog = buildCatalog("dummyjson", dummyJson(watch), noOverrides);

    expect(catalog.products).toEqual([
      {
        id: "dummyjson-0007",
        source: "dummyjson",
        sourceId: 7,
        name: "Brown Leather Belt Watch",
        category: "watches",
        priceInCents: 8999,
        discountPercent: 13,
        rating: 3.3,
        reviewCount: 3,
        deliveryDays: 4,
        color: "brown",
        tags: [],
        image: "https://cdn.dummyjson.com/watch/thumbnail.webp",
        brand: "Fashion Timepieces",
        stock: 4,
      },
    ]);
  });

  it("keeps the description, the photos, the facts, and the reviews, tidied", () => {
    const [details] = buildCatalog("dummyjson", dummyJson(watch), noOverrides).details;

    expect(details).toEqual({
      productId: "dummyjson-0007",
      description: "A classic watch with a genuine leather strap. Water resistant.",
      images: ["https://cdn.dummyjson.com/watch/1.webp", "https://cdn.dummyjson.com/watch/2.webp"],
      availability: "low-stock",
      shipping: "Ships in 3-5 business days",
      warranty: "1 year warranty",
      returnPolicy: null,
      reviews: [5, 4, 1].map((rating) => ({
        reviewerName: `Reviewer ${rating}`,
        rating,
        comment: "Fine.",
        date: "2025-04-30",
      })),
    });
  });

  it("never keeps a reviewer's email address", () => {
    const catalog = buildCatalog("dummyjson", dummyJson(watch), noOverrides);

    expect(JSON.stringify(catalog)).not.toContain("@");
  });

  it("falls back to the thumbnail when the source has no full-size photos", () => {
    const [details] = buildCatalog(
      "dummyjson",
      dummyJson({ ...watch, images: [] }),
      noOverrides,
    ).details;

    expect(details?.images).toEqual(["https://cdn.dummyjson.com/watch/thumbnail.webp"]);
  });

  it("orders products and details by product id", () => {
    const catalog = buildCatalog("dummyjson", dummyJson({ ...watch, id: 9 }, watch), noOverrides);

    expect(catalog.products.map((product) => product.id)).toEqual([
      "dummyjson-0007",
      "dummyjson-0009",
    ]);
    expect(catalog.details.map((details) => details.productId)).toEqual([
      "dummyjson-0007",
      "dummyjson-0009",
    ]);
  });

  it("keeps only tags that at least two products share", () => {
    const luxury = { ...watch, id: 8, tags: ["luxury"], title: "Gold Watch", description: "" };
    const catalog = buildCatalog(
      "dummyjson",
      dummyJson(watch, luxury, { ...luxury, id: 9 }),
      noOverrides,
    );

    expect(catalog.products.map((product) => product.tags)).toEqual([[], ["luxury"], ["luxury"]]);
  });

  it("accepts a product without a brand", () => {
    const catalog = buildCatalog(
      "dummyjson",
      dummyJson({ ...watch, brand: undefined }),
      noOverrides,
    );

    expect(catalog.products[0]?.brand).toBeNull();
  });

  it("fails loudly when a field the app needs is missing or unreadable", () => {
    const review = { reviewerName: "A", rating: 3, comment: "Ok", date: "yesterday" };

    expect(() =>
      buildCatalog(
        "dummyjson",
        dummyJson({ ...watch, shippingInformation: undefined }),
        noOverrides,
      ),
    ).toThrow('"shippingInformation"');
    expect(() =>
      buildCatalog(
        "dummyjson",
        dummyJson({ ...watch, reviews: [{ rating: 5, reviewerName: "A", date: "x" }] }),
        noOverrides,
      ),
    ).toThrow('"comment"');
    expect(() =>
      buildCatalog("dummyjson", dummyJson({ ...watch, reviews: [review] }), noOverrides),
    ).toThrow('unreadable date "yesterday"');
  });
});

describe("buildCatalog from FakeStore", () => {
  it("reads the nested rating, gives a fixed delivery estimate, and has no facts", () => {
    // Arrange
    const jacket = {
      id: 3,
      title: "Mens Cotton Jacket",
      description: "Great outerwear.",
      category: "men's clothing",
      price: 55.99,
      rating: { rate: 4.7, count: 500 },
      image: "https://fakestoreapi.com/img/jacket.jpg",
    };

    // Act
    const catalog = buildCatalog("fakestore", [jacket], noOverrides);

    // Assert
    expect(catalog.products[0]).toMatchObject({
      id: "fakestore-0003",
      category: "clothing",
      rating: 4.7,
      reviewCount: 500,
      deliveryDays: NORMALISATION_RULES.fakeStoreDeliveryDays,
      brand: null,
      stock: null,
    });
    expect(catalog.details[0]).toEqual({
      productId: "fakestore-0003",
      description: "Great outerwear.",
      images: ["https://fakestoreapi.com/img/jacket.jpg"],
      availability: null,
      shipping: null,
      warranty: null,
      returnPolicy: null,
      reviews: [],
    });
  });
});

describe("buildCatalog with overrides", () => {
  it("replaces only the fields an override names, after the rules have run", () => {
    // Arrange
    const overrides = parseOverrides({
      dummyjson: { "7": { reason: "test", color: "black", category: "bags", tags: ["vegan"] } },
    });

    // Act
    const [product] = buildCatalog("dummyjson", dummyJson(watch), overrides).products;

    // Assert
    expect(product).toMatchObject({
      name: "Brown Leather Belt Watch",
      color: "black",
      category: "bags",
      tags: ["vegan"],
    });
  });
});
