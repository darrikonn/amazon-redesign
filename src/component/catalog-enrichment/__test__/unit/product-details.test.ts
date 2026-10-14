import { describe, expect, it } from "vitest";
import {
  availabilityFrom,
  buildProductDetails,
  dummyJsonDetails,
  fakeStoreDetails,
  type RawDummyJsonProduct,
  type RawFakeStoreProduct,
} from "@/component";

const dummyJsonProduct: RawDummyJsonProduct = {
  id: 7,
  title: "Brown Leather Belt Watch",
  description: "  A classic watch with a genuine leather strap.  ",
  category: "mens-watches",
  priceInDollars: 89.99,
  discountPercentage: 12.6,
  rating: 4.19,
  tags: ["watches"],
  brand: "Fashion Timepieces",
  thumbnail: "https://cdn.dummyjson.com/watch/thumbnail.webp",
  images: ["https://cdn.dummyjson.com/watch/1.webp", " ", "https://cdn.dummyjson.com/watch/2.webp"],
  shippingInformation: "Ships in 3-5 business days",
  warrantyInformation: "1 year warranty",
  returnPolicy: "  ",
  availabilityStatus: "Low Stock",
  stock: 4,
  reviews: [
    {
      reviewerName: " Eleanor Collins ",
      rating: 5,
      comment: " Highly impressed! ",
      date: "2025-04-30T09:41:02.053Z",
    },
  ],
};

const fakeStoreProduct: RawFakeStoreProduct = {
  id: 3,
  title: "Mens Cotton Jacket",
  description: "Great outerwear.",
  category: "men's clothing",
  priceInDollars: 55.99,
  rating: 4.7,
  reviewCount: 500,
  image: "https://fakestoreapi.com/img/jacket.jpg",
};

describe("dummyJsonDetails", () => {
  it("keeps the description, the photos, the facts, and the reviews, tidied", () => {
    expect(dummyJsonDetails(dummyJsonProduct)).toEqual({
      productId: "dummyjson-0007",
      description: "A classic watch with a genuine leather strap.",
      images: ["https://cdn.dummyjson.com/watch/1.webp", "https://cdn.dummyjson.com/watch/2.webp"],
      availability: "low-stock",
      stock: 4,
      shipping: "Ships in 3-5 business days",
      warranty: "1 year warranty",
      returnPolicy: null,
      reviews: [
        {
          reviewerName: "Eleanor Collins",
          rating: 5,
          comment: "Highly impressed!",
          date: "2025-04-30",
        },
      ],
    });
  });

  it("falls back to the thumbnail when the source has no full-size photos", () => {
    expect(dummyJsonDetails({ ...dummyJsonProduct, images: [] }).images).toEqual([
      "https://cdn.dummyjson.com/watch/thumbnail.webp",
    ]);
  });

  it("fails loudly on a review date it cannot read", () => {
    const review = { reviewerName: "A", rating: 3, comment: "Ok", date: "yesterday" };

    expect(() => dummyJsonDetails({ ...dummyJsonProduct, reviews: [review] })).toThrow(
      'unreadable date "yesterday"',
    );
  });
});

describe("fakeStoreDetails", () => {
  it("keeps the description and the one photo, and has no facts or reviews", () => {
    expect(fakeStoreDetails(fakeStoreProduct)).toEqual({
      productId: "fakestore-0003",
      description: "Great outerwear.",
      images: ["https://fakestoreapi.com/img/jacket.jpg"],
      availability: null,
      stock: null,
      shipping: null,
      warranty: null,
      returnPolicy: null,
      reviews: [],
    });
  });
});

describe("availabilityFrom", () => {
  it("reads the source's three stock states and nothing else", () => {
    expect(availabilityFrom("In Stock")).toBe("in-stock");
    expect(availabilityFrom("Low Stock")).toBe("low-stock");
    expect(availabilityFrom("Out of Stock")).toBe("out-of-stock");
    expect(availabilityFrom("Discontinued")).toBeNull();
    expect(availabilityFrom(null)).toBeNull();
  });
});

describe("buildProductDetails", () => {
  it("orders the details by product id, like the catalogue", () => {
    const raw = { products: [{ ...dummyJsonProduct, id: 9 }, dummyJsonProduct] };
    const withSourceFields = {
      products: raw.products.map((product) => ({ ...product, price: product.priceInDollars })),
    };

    expect(
      buildProductDetails("dummyjson", withSourceFields).map((details) => details.productId),
    ).toEqual(["dummyjson-0007", "dummyjson-0009"]);
  });
});
