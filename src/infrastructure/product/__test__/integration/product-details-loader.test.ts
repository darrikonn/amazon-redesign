import { describe, expect, it } from "vitest";
import {
  createProductDetailsLoader,
  createProductReviewListLoader,
  InMemoryProductDetailsRepository,
} from "@/infrastructure";
import { aProductDetails } from "@/test-support";

const lamp = aProductDetails({ productId: "lamp" });
const bag = aProductDetails({ productId: "bag", reviews: [] });

function seeded(): InMemoryProductDetailsRepository {
  const repository = new InMemoryProductDetailsRepository();
  repository.seedManyDetails([lamp, bag]);
  return repository;
}

describe("createProductDetailsLoader", () => {
  it("batches concurrent loads into one getMany call", async () => {
    // Arrange
    const repository = seeded();
    const loader = createProductDetailsLoader(repository);

    // Act
    const loaded = await Promise.all([loader.load("lamp"), loader.load("ghost")]);

    // Assert
    expect(loaded).toEqual([lamp, null]);
    expect(repository.calls).toEqual([{ method: "getMany", productIds: ["lamp", "ghost"] }]);
  });
});

describe("createProductReviewListLoader", () => {
  it("loads each product's reviews, empty for unknown products", async () => {
    // Arrange
    const repository = seeded();
    const loader = createProductReviewListLoader(repository);

    // Act
    const loaded = await loader.loadMany(["lamp", "bag", "ghost"]);

    // Assert
    expect(loaded).toEqual([lamp.reviews, [], []]);
    expect(repository.calls).toEqual([{ method: "getMany", productIds: ["lamp", "bag", "ghost"] }]);
  });
});
