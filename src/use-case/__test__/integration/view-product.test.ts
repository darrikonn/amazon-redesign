import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { aProduct, aProductDetails } from "@/test-support";

let container: Container;
let fakes: TestFakes;

const watch = aProduct({
  id: "watch",
  name: "Brown Leather Belt Watch",
  brand: "Fashion Timepieces",
  category: "watches",
  color: "brown",
  tags: ["leather", "luxury"],
  priceInCents: 8_999,
  rating: 4.2,
  deliveryDays: 4,
  image: "https://cdn.dummyjson.com/watch/thumbnail.webp",
});

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
  fakes.products.seedProduct(watch);
});

describe("ViewProduct", () => {
  it("combines the product and its details into what the modal shows", async () => {
    // Arrange
    fakes.productDetails.seedDetails(
      aProductDetails({
        productId: "watch",
        description: "A classic watch.",
        images: [
          "https://cdn.dummyjson.com/watch/1.webp",
          "https://cdn.dummyjson.com/watch/2.webp",
        ],
        availability: "in-stock",
        shipping: "Ships in 3-5 business days",
        warranty: "1 year warranty",
        returnPolicy: "30 days return policy",
        reviews: [
          { reviewerName: "Eleanor Collins", rating: 5, comment: "Lovely.", date: "2025-04-30" },
        ],
      }),
    );

    // Act
    const view = await container.viewProduct.execute({ productId: "watch" });

    // Assert
    expect(view).toEqual({
      id: "watch",
      name: "Brown Leather Belt Watch",
      brand: "Fashion Timepieces",
      category: "watches",
      categoryLabel: "watch",
      color: "brown",
      priceInCents: 8_999,
      rating: 4.2,
      deliveryDays: 4,
      features: ["Brown", "Leather", "Luxury"],
      description: "A classic watch.",
      images: ["https://cdn.dummyjson.com/watch/1.webp", "https://cdn.dummyjson.com/watch/2.webp"],
      availability: { label: "In stock", canBuy: true },
      facts: [
        { label: "Shipping", value: "Ships in 3-5 business days" },
        { label: "Warranty", value: "1 year warranty" },
        { label: "Returns", value: "30 days return policy" },
      ],
      reviews: [
        {
          id: "watch-review-1",
          reviewerName: "Eleanor Collins",
          rating: 5,
          comment: "Lovely.",
          date: "2025-04-30",
        },
      ],
    });
  });

  it("says how many are left when stock is low, and that an empty shelf cannot be bought", async () => {
    // Arrange
    fakes.products.seedProducts([{ ...watch, stock: 4 }, aProduct({ id: "gone", stock: 0 })]);
    fakes.productDetails.seedManyDetails([
      aProductDetails({ productId: "watch", availability: "low-stock" }),
      aProductDetails({ productId: "gone", availability: "out-of-stock" }),
    ]);

    // Act
    const [low, gone] = await Promise.all([
      container.viewProduct.execute({ productId: "watch" }),
      container.viewProduct.execute({ productId: "gone" }),
    ]);

    // Assert
    expect(low?.availability).toEqual({ label: "Only 4 left", canBuy: true });
    expect(gone?.availability).toEqual({ label: "Out of stock", canBuy: false });
  });

  it("says low stock without a number when the count is unknown", async () => {
    // Arrange
    fakes.products.seedProduct({ ...watch, stock: null });
    fakes.productDetails.seedDetails(
      aProductDetails({ productId: "watch", availability: "low-stock" }),
    );

    // Act
    const view = await container.viewProduct.execute({ productId: "watch" });

    // Assert
    expect(view?.availability).toEqual({ label: "Low stock", canBuy: true });
  });

  it("uses the card photo when the details have no photos", async () => {
    // Arrange
    fakes.productDetails.seedDetails(aProductDetails({ productId: "watch", images: [] }));

    // Act
    const view = await container.viewProduct.execute({ productId: "watch" });

    // Assert
    expect(view?.images).toEqual(["https://cdn.dummyjson.com/watch/thumbnail.webp"]);
  });

  it("leaves out facts the source does not have", async () => {
    // Arrange
    fakes.productDetails.seedDetails(
      aProductDetails({ productId: "watch", shipping: null, warranty: null, returnPolicy: null }),
    );

    // Act
    const view = await container.viewProduct.execute({ productId: "watch" });

    // Assert
    expect(view?.facts).toEqual([]);
  });

  it("still shows the product with its card photo when it has no details", async () => {
    // Act
    const view = await container.viewProduct.execute({ productId: "watch" });

    // Assert
    expect(view).toMatchObject({
      name: "Brown Leather Belt Watch",
      description: null,
      images: ["https://cdn.dummyjson.com/watch/thumbnail.webp"],
      availability: null,
      facts: [],
      reviews: [],
    });
  });

  it("opens nothing for a product that is not in the catalogue", async () => {
    // Arrange
    fakes.productDetails.seedDetails(aProductDetails({ productId: "ghost" }));

    // Act
    const view = await container.viewProduct.execute({ productId: "ghost" });

    // Assert
    expect(view).toBeNull();
  });
});
