import { describe, expect, it } from "vitest";
import type { CartLineRepository } from "@/core";
import { NotFoundError } from "@/core";
import {
  InMemoryCartLineRepository,
  InMemoryKeyValueStorage,
  StoredCartLineRepository,
} from "@/infrastructure";

const implementations: [string, () => CartLineRepository][] = [
  ["StoredCartLineRepository", () => new StoredCartLineRepository(new InMemoryKeyValueStorage())],
  ["InMemoryCartLineRepository", () => new InMemoryCartLineRepository()],
];

async function seeded(create: () => CartLineRepository): Promise<CartLineRepository> {
  const repository = create();
  await repository.save({ ownerId: "owner-1", productId: "lamp", quantity: 1 });
  await repository.save({ ownerId: "owner-1", productId: "bag", quantity: 1 });
  await repository.save({ ownerId: "owner-2", productId: "lamp", quantity: 1 });
  return repository;
}

describe.each(implementations)("%s", (_, create) => {
  it("gets a line only for its owner", async () => {
    const repository = await seeded(create);

    expect(await repository.get("owner-1", "bag")).toEqual({
      ownerId: "owner-1",
      productId: "bag",
      quantity: 1,
    });
    expect(await repository.get("owner-2", "bag")).toBeNull();
  });

  it("demands a line or throws not found", async () => {
    const repository = await seeded(create);

    expect(await repository.demand("owner-2", "lamp")).toEqual({
      ownerId: "owner-2",
      productId: "lamp",
      quantity: 1,
    });
    await expect(repository.demand("owner-2", "bag")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("gets and demands many within one owner", async () => {
    const repository = await seeded(create);

    expect(await repository.getMany("owner-2", ["bag", "lamp"])).toEqual([
      { ownerId: "owner-2", productId: "lamp", quantity: 1 },
    ]);
    await expect(repository.demandMany("owner-2", ["bag", "lamp"])).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(await repository.demandMany("owner-1", ["bag", "lamp"])).toHaveLength(2);
  });

  it("lists and removes lines without touching another owner", async () => {
    // Arrange
    const repository = await seeded(create);

    // Act
    await repository.remove("owner-1", "lamp");

    // Assert
    expect(await repository.listByOwner("owner-1")).toEqual([
      { ownerId: "owner-1", productId: "bag", quantity: 1 },
    ]);
    expect(await repository.listByOwner("owner-2")).toEqual([
      { ownerId: "owner-2", productId: "lamp", quantity: 1 },
    ]);
  });

  it("keeps one line per owner and product", async () => {
    const repository = await seeded(create);

    await repository.save({ ownerId: "owner-1", productId: "lamp", quantity: 1 });

    expect(await repository.listByOwner("owner-1")).toHaveLength(2);
  });
});

describe("StoredCartLineRepository", () => {
  it("keeps a changed quantity and reads a cart that no longer parses as empty", async () => {
    // Arrange
    const storage = new InMemoryKeyValueStorage();
    storage.seedValue("shop:v1:cart:sam", [{ ownerId: "sam", productId: "lamp" }]);
    const repository = new StoredCartLineRepository(storage);

    // Act
    await repository.save({ ownerId: "robin", productId: "lamp", quantity: 1 });
    await repository.save({ ownerId: "robin", productId: "lamp", quantity: 4 });

    // Assert
    expect(await repository.listByOwner("robin")).toEqual([
      { ownerId: "robin", productId: "lamp", quantity: 4 },
    ]);
    expect(await repository.listByOwner("sam")).toEqual([]);
  });
});

describe("InMemoryCartLineRepository", () => {
  it("records calls with their owner and forgets everything on reset", async () => {
    // Arrange
    const repository = new InMemoryCartLineRepository();
    repository.seedLine({ ownerId: "owner-1", productId: "lamp", quantity: 1 });
    await repository.listByOwner("owner-1");

    // Act
    const recorded = [...repository.calls];
    repository.reset();

    // Assert
    expect(recorded).toEqual([{ method: "listByOwner", ownerId: "owner-1", productIds: [] }]);
    expect(repository.calls).toEqual([]);
    expect(repository.storedLines()).toEqual([]);
  });
});
