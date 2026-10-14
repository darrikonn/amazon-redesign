import { describe, expect, it } from "vitest";
import type { CartLineRepository } from "@/core";
import { NotFoundError } from "@/core";
import {
  FixedClock,
  InMemoryCartLineRepository,
  InMemoryKeyValueStorage,
  StoredCartLineRepository,
} from "@/infrastructure";
import { aCartLine } from "@/test-support";

const implementations: [string, () => CartLineRepository][] = [
  [
    "StoredCartLineRepository",
    () => new StoredCartLineRepository(new InMemoryKeyValueStorage(), new FixedClock()),
  ],
  ["InMemoryCartLineRepository", () => new InMemoryCartLineRepository()],
];

async function seeded(create: () => CartLineRepository): Promise<CartLineRepository> {
  const repository = create();
  await repository.save(aCartLine({ ownerId: "owner-1", productId: "lamp", quantity: 1 }));
  await repository.save(aCartLine({ ownerId: "owner-1", productId: "bag", quantity: 1 }));
  await repository.save(aCartLine({ ownerId: "owner-2", productId: "lamp", quantity: 1 }));
  return repository;
}

describe.each(implementations)("%s", (_, create) => {
  it("gets a line only for its owner", async () => {
    const repository = await seeded(create);

    expect(await repository.get("owner-1", "bag")).toEqual(
      aCartLine({
        ownerId: "owner-1",
        productId: "bag",
        quantity: 1,
      }),
    );
    expect(await repository.get("owner-2", "bag")).toBeNull();
  });

  it("demands a line or throws not found", async () => {
    const repository = await seeded(create);

    expect(await repository.demand("owner-2", "lamp")).toEqual(
      aCartLine({
        ownerId: "owner-2",
        productId: "lamp",
        quantity: 1,
      }),
    );
    await expect(repository.demand("owner-2", "bag")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("gets and demands many within one owner", async () => {
    const repository = await seeded(create);

    expect(await repository.getMany("owner-2", ["bag", "lamp"])).toEqual([
      aCartLine({ ownerId: "owner-2", productId: "lamp", quantity: 1 }),
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
      aCartLine({ ownerId: "owner-1", productId: "bag", quantity: 1 }),
    ]);
    expect(await repository.listByOwner("owner-2")).toEqual([
      aCartLine({ ownerId: "owner-2", productId: "lamp", quantity: 1 }),
    ]);
  });

  it("keeps one line per owner and product", async () => {
    const repository = await seeded(create);

    await repository.save(aCartLine({ ownerId: "owner-1", productId: "lamp", quantity: 1 }));

    expect(await repository.listByOwner("owner-1")).toHaveLength(2);
  });
});

describe.each(implementations)("%s, saving again", (_, create) => {
  it("keeps the line's place and created, and stamps modified", async () => {
    // Arrange
    const repository = create();
    await repository.save(aCartLine({ ownerId: "robin", productId: "lamp" }));
    await repository.save(aCartLine({ ownerId: "robin", productId: "bag" }));

    // Act
    await repository.save(
      aCartLine({
        ownerId: "robin",
        productId: "lamp",
        quantity: 4,
        created: "2030-01-01T00:00:00Z",
      }),
    );

    // Assert
    expect(await repository.listByOwner("robin")).toEqual([
      aCartLine({
        ownerId: "robin",
        productId: "lamp",
        quantity: 4,
        modified: "2026-10-14T12:00:00.000Z",
      }),
      aCartLine({ ownerId: "robin", productId: "bag" }),
    ]);
  });
});

describe("StoredCartLineRepository", () => {
  it("reads a cart that no longer parses, or names another owner, as empty", async () => {
    const storage = new InMemoryKeyValueStorage();
    storage.seedValue("shop:v1:cart:sam", [{ ownerId: "sam", productId: "lamp" }]);
    storage.seedValue("shop:v1:cart:robin", [aCartLine({ ownerId: "sam", productId: "lamp" })]);
    const repository = new StoredCartLineRepository(storage, new FixedClock());

    expect(await repository.listByOwner("sam")).toEqual([]);
    expect(await repository.listByOwner("robin")).toEqual([]);
  });
});

describe("InMemoryCartLineRepository", () => {
  it("records calls with their owner and forgets everything on reset", async () => {
    // Arrange
    const repository = new InMemoryCartLineRepository();
    repository.seedLine(aCartLine({ ownerId: "owner-1", productId: "lamp", quantity: 1 }));
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
