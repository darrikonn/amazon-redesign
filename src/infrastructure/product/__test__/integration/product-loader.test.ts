import { describe, expect, it } from "vitest";
import {
  createProductListLoader,
  createProductLoader,
  InMemoryProductRepository,
} from "@/infrastructure";
import { aProduct } from "@/test-support";

const lamp = aProduct({ id: "lamp" });
const bag = aProduct({ id: "bag", category: "bags", categoryLabel: "bag", categoryPlural: "bags" });

function seeded(): InMemoryProductRepository {
  const repository = new InMemoryProductRepository();
  repository.seedProducts([lamp, bag]);
  return repository;
}

describe("createProductLoader", () => {
  it("batches concurrent loads into one getMany call", async () => {
    // Arrange
    const repository = seeded();
    const loader = createProductLoader(repository);

    // Act
    const loaded = await Promise.all([
      loader.load("lamp"),
      loader.load("ghost"),
      loader.load("bag"),
    ]);

    // Assert
    expect(loaded).toEqual([lamp, null, bag]);
    expect(repository.calls).toEqual([{ method: "getMany", ids: ["lamp", "ghost", "bag"] }]);
  });
});

describe("createProductListLoader", () => {
  it("loads the products of each category with one list call", async () => {
    // Arrange
    const repository = seeded();
    const loader = createProductListLoader(repository);

    // Act
    const loaded = await loader.loadMany(["bags", "audio"]);

    // Assert
    expect(loaded).toEqual([[bag], []]);
    expect(repository.calls).toEqual([{ method: "list", ids: [] }]);
  });
});
