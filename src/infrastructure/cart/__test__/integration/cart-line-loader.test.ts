import { describe, expect, it } from "vitest";
import {
  createCartLineListLoader,
  createCartLineLoader,
  InMemoryCartLineRepository,
} from "@/infrastructure";

function seeded(): InMemoryCartLineRepository {
  const repository = new InMemoryCartLineRepository();
  repository.seedLine({ ownerId: "owner-1", productId: "lamp" });
  repository.seedLine({ ownerId: "owner-2", productId: "bag" });
  return repository;
}

describe("createCartLineLoader", () => {
  it("batches loads for one owner into one getMany call", async () => {
    // Arrange
    const repository = seeded();
    const loader = createCartLineLoader(repository, "owner-1");

    // Act
    const loaded = await loader.loadMany(["lamp", "bag"]);

    // Assert
    expect(loaded).toEqual([{ ownerId: "owner-1", productId: "lamp" }, null]);
    expect(repository.calls).toEqual([
      { method: "getMany", ownerId: "owner-1", productIds: ["lamp", "bag"] },
    ]);
  });
});

describe("createCartLineListLoader", () => {
  it("loads each owner's lines with a query scoped to that owner", async () => {
    // Arrange
    const repository = seeded();
    const loader = createCartLineListLoader(repository);

    // Act
    const loaded = await loader.loadMany(["owner-1", "owner-2"]);

    // Assert
    expect(loaded).toEqual([
      [{ ownerId: "owner-1", productId: "lamp" }],
      [{ ownerId: "owner-2", productId: "bag" }],
    ]);
    expect(repository.calls.map((call) => call.ownerId)).toEqual(["owner-1", "owner-2"]);
  });
});
