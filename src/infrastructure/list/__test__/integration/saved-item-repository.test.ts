import { describe, expect, it } from "vitest";
import type { SavedItemRepository } from "@/core";
import { NotFoundError } from "@/core";
import {
  createSavedItemListLoader,
  createSavedItemLoader,
  FixedClock,
  InMemoryKeyValueStorage,
  InMemorySavedItemRepository,
  StoredSavedItemRepository,
} from "@/infrastructure";
import { aSavedItem } from "@/test-support";

const lamp = aSavedItem({ ownerId: "robin", productId: "lamp", created: "2026-10-01T00:00:00Z" });
const bag = aSavedItem({ ownerId: "robin", productId: "bag", created: "2026-10-02T00:00:00Z" });
const theirs = aSavedItem({ ownerId: "sam", productId: "lamp", created: "2026-10-03T00:00:00Z" });

const implementations: [string, () => SavedItemRepository][] = [
  [
    "StoredSavedItemRepository",
    () => new StoredSavedItemRepository(new InMemoryKeyValueStorage(), new FixedClock()),
  ],
  ["InMemorySavedItemRepository", () => new InMemorySavedItemRepository()],
];

async function seeded(create: () => SavedItemRepository): Promise<SavedItemRepository> {
  const repository = create();
  for (const item of [lamp, bag, theirs]) await repository.save(item);
  return repository;
}

describe.each(implementations)("%s", (_, create) => {
  it("gets and demands an item only for its owner", async () => {
    const repository = await seeded(create);

    expect(await repository.get("sam", "lamp")).toEqual(theirs);
    expect(await repository.get("sam", "bag")).toBeNull();
    expect(await repository.demand("robin", "bag")).toEqual(bag);
    await expect(repository.demand("sam", "bag")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("gets and demands many within one owner", async () => {
    const repository = await seeded(create);

    expect(await repository.getMany("robin", ["bag", "ghost", "lamp"])).toEqual([bag, lamp]);
    expect(await repository.demandMany("robin", ["lamp"])).toEqual([lamp]);
    await expect(repository.demandMany("robin", ["ghost"])).rejects.toBeInstanceOf(NotFoundError);
  });

  it("keeps one item per product and removes without touching another owner", async () => {
    // Arrange
    const repository = await seeded(create);

    // Act
    await repository.save({ ...lamp, created: "2026-10-09T00:00:00Z" });
    await repository.remove("robin", "bag");

    // Assert
    expect(await repository.listByOwner("robin")).toEqual([
      { ...lamp, modified: "2026-10-14T12:00:00.000Z" },
    ]);
    expect(await repository.listByOwner("sam")).toEqual([theirs]);
  });

  it("loads single items and owners' lists in batches", async () => {
    const repository = await seeded(create);

    expect(await createSavedItemLoader(repository, "robin").loadMany(["lamp", "ghost"])).toEqual([
      lamp,
      null,
    ]);
    expect(await createSavedItemListLoader(repository).loadMany(["sam"])).toEqual([[theirs]]);
  });
});

describe("InMemorySavedItemRepository", () => {
  it("records calls with their owner and forgets everything on reset", async () => {
    // Arrange
    const repository = new InMemorySavedItemRepository();
    repository.seedItem(lamp);
    await repository.listByOwner("robin");

    // Act
    const recorded = [...repository.calls];
    repository.reset();

    // Assert
    expect(recorded).toEqual([{ method: "listByOwner", ownerId: "robin", keys: [] }]);
    expect(repository.storedItems()).toEqual([]);
  });
});
