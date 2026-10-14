import { describe, expect, it } from "vitest";
import type { OrderRepository } from "@/core";
import { NotFoundError } from "@/core";
import {
  createOrderListLoader,
  createOrderLoader,
  FixedClock,
  InMemoryKeyValueStorage,
  InMemoryOrderRepository,
  StoredOrderRepository,
} from "@/infrastructure";
import { anOrder } from "@/test-support";

const first = anOrder({ id: "first", ownerId: "robin" });
const second = anOrder({
  id: "second",
  ownerId: "robin",
  returns: [
    { productIds: ["dummyjson-0001"], reason: "damaged", requestedAt: "2026-10-05T00:00:00Z" },
  ],
});
const someoneElses = anOrder({ id: "theirs", ownerId: "sam" });

const implementations: [string, () => OrderRepository][] = [
  [
    "StoredOrderRepository",
    () => new StoredOrderRepository(new InMemoryKeyValueStorage(), new FixedClock()),
  ],
  ["InMemoryOrderRepository", () => new InMemoryOrderRepository()],
];

async function seeded(create: () => OrderRepository): Promise<OrderRepository> {
  const repository = create();
  for (const order of [first, second, someoneElses]) await repository.save(order);
  return repository;
}

describe.each(implementations)("%s", (_, create) => {
  it("gets an order only for its owner", async () => {
    const repository = await seeded(create);

    expect(await repository.get("robin", "second")).toEqual(second);
    expect(await repository.get("robin", "theirs")).toBeNull();
  });

  it("demands an order or throws not found", async () => {
    const repository = await seeded(create);

    expect(await repository.demand("sam", "theirs")).toEqual(someoneElses);
    await expect(repository.demand("sam", "first")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("gets and demands many within one owner", async () => {
    const repository = await seeded(create);

    expect(await repository.getMany("robin", ["second", "theirs", "first"])).toEqual([
      second,
      first,
    ]);
    expect(await repository.demandMany("robin", ["first", "second"])).toEqual([first, second]);
    await expect(repository.demandMany("robin", ["theirs"])).rejects.toBeInstanceOf(NotFoundError);
  });

  it("lists an owner's orders and replaces an order saved again", async () => {
    // Arrange
    const repository = await seeded(create);

    // Act
    await repository.save({ ...first, deliveryDays: 9 });

    // Assert
    const orders = await repository.listByOwner("robin");
    expect(orders.map((order) => order.id)).toEqual(["first", "second"]);
    expect(orders[0]).toEqual({ ...first, deliveryDays: 9, modified: "2026-10-14T12:00:00.000Z" });
  });

  it("keeps two shoppers' orders apart even when their ids match", async () => {
    // Arrange
    const repository = create();
    await repository.save(anOrder({ id: "order-1", ownerId: "robin" }));

    // Act
    await repository.save(anOrder({ id: "order-1", ownerId: "sam", deliveryDays: 9 }));

    // Assert
    expect((await repository.get("robin", "order-1"))?.deliveryDays).toBe(2);
    expect((await repository.get("sam", "order-1"))?.deliveryDays).toBe(9);
  });

  it("loads single orders and owners' lists in batches", async () => {
    const repository = await seeded(create);

    expect(await createOrderLoader(repository, "robin").loadMany(["first", "theirs"])).toEqual([
      first,
      null,
    ]);
    expect(await createOrderListLoader(repository).loadMany(["sam", "nobody"])).toEqual([
      [someoneElses],
      [],
    ]);
  });
});

describe("StoredOrderRepository", () => {
  it("reads stored orders that no longer parse as none", async () => {
    const storage = new InMemoryKeyValueStorage();
    storage.seedValue("shop:v2:orders:robin", [{ ...first, returns: [{ reason: "bored" }] }]);

    expect(await new StoredOrderRepository(storage, new FixedClock()).listByOwner("robin")).toEqual(
      [],
    );
  });
});

describe("InMemoryOrderRepository", () => {
  it("records calls with their owner and forgets everything on reset", async () => {
    // Arrange
    const repository = new InMemoryOrderRepository();
    repository.seedOrder(first);
    await repository.get("robin", "first");

    // Act
    const recorded = [...repository.calls];
    repository.reset();

    // Assert
    expect(recorded).toEqual([{ method: "get", ownerId: "robin", orderIds: ["first"] }]);
    expect(repository.storedOrders()).toEqual([]);
  });
});
