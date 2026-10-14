import { describe, expect, it } from "vitest";
import {
  createCartLineListLoader,
  createCartLineLoader,
  InMemoryCartLineRepository,
} from "@/infrastructure";
import { aCartLine } from "@/test-support";

function seeded(): InMemoryCartLineRepository {
  const repository = new InMemoryCartLineRepository();
  repository.seedLine(aCartLine({ ownerId: "owner-1", productId: "lamp", quantity: 1 }));
  repository.seedLine(aCartLine({ ownerId: "owner-2", productId: "bag", quantity: 1 }));
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
    expect(loaded).toEqual([
      aCartLine({ ownerId: "owner-1", productId: "lamp", quantity: 1 }),
      null,
    ]);
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
      [aCartLine({ ownerId: "owner-1", productId: "lamp", quantity: 1 })],
      [aCartLine({ ownerId: "owner-2", productId: "bag", quantity: 1 })],
    ]);
    expect(repository.calls.map((call) => call.ownerId)).toEqual(["owner-1", "owner-2"]);
  });
});
