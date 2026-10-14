import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { anOrder, anOrderLine, aSession } from "@/test-support";

let container: Container;
let fakes: TestFakes;
const SHOPPER_ID = "shopper:robin.lee@example.com";

// The test clock reads 2026-10-14T12:00:00Z.
const delivered = anOrder({
  id: "delivered",
  ownerId: SHOPPER_ID,
  placedAt: "2026-10-10T12:00:00.000Z",
  deliveryDays: 2,
  lines: [
    anOrderLine({ productId: "lamp", priceInCents: 2_000, quantity: 2, returnWindowDays: 30 }),
    anOrderLine({ productId: "mascara", priceInCents: 500, returnWindowDays: 0 }),
  ],
});
const onItsWay = anOrder({
  id: "on-its-way",
  ownerId: SHOPPER_ID,
  isSample: true,
  placedAt: "2026-10-13T12:00:00.000Z",
  deliveryDays: 3,
});

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
  fakes.sessions.seedSession(aSession());
  for (const order of [delivered, onItsWay, anOrder({ id: "theirs", ownerId: "sam" })]) {
    fakes.orders.seedOrder(order);
  }
});

describe("ListOrders", () => {
  it("lists the shopper's orders newest first, with their stage and totals", async () => {
    const list = await container.listOrders.execute({ show: "all" });

    expect(list?.show).toBe("all");
    expect(
      list?.orders.map((order) => [
        order.id,
        order.stage,
        order.totalInCents,
        order.itemCount,
        order.isSample,
      ]),
    ).toEqual([
      ["on-its-way", "shipped", 99_900, 1, true],
      ["delivered", "delivered", 4_500, 3, false],
    ]);
  });

  it("shows only orders still on their way when asked, and all for an unknown filter", async () => {
    const onTheWay = await container.listOrders.execute({ show: "on-the-way" });
    const unknown = await container.listOrders.execute({ show: "everything" });

    expect(onTheWay?.orders.map((order) => order.id)).toEqual(["on-its-way"]);
    expect(unknown?.show).toBe("all");
  });

  it("is null for a signed-out visitor", async () => {
    fakes.sessions.reset();

    expect(await container.listOrders.execute({ show: "all" })).toBeNull();
  });
});

describe("ViewOrder", () => {
  it("shows the tracking steps and which lines can be returned", async () => {
    // Act
    const order = await container.viewOrder.execute({ orderId: "delivered" });

    // Assert
    expect(order?.steps.map((step) => [step.label, step.isReached])).toEqual([
      ["Ordered", true],
      ["Shipped", true],
      ["Out for delivery", true],
      ["Delivered", true],
    ]);
    expect(
      order?.lines.map((line) => [line.productId, line.isReturnable, line.returnableUntil]),
    ).toEqual([
      ["lamp", true, "2026-11-11T12:00:00.000Z"],
      ["mascara", false, null],
    ]);
  });

  it("does not show another shopper's order, or any order when signed out", async () => {
    const theirs = await container.viewOrder.execute({ orderId: "theirs" });
    fakes.sessions.reset();

    expect(theirs).toBeNull();
    expect(await container.viewOrder.execute({ orderId: "delivered" })).toBeNull();
  });
});

describe("StartReturn", () => {
  it("records a return for returnable lines and says so on the order", async () => {
    // Act
    const result = await container.startReturn.execute({
      orderId: "delivered",
      productIds: ["lamp", "lamp"],
      reason: "damaged",
    });

    // Assert
    expect(result.status).toBe("started");
    if (result.status !== "started") return;
    expect(result.order.returns).toEqual([
      {
        productIds: ["lamp"],
        reasonLabel: "Arrived damaged",
        requestedAt: "2026-10-14T12:00:00.000Z",
      },
    ]);
    expect(result.order.lines[0]).toMatchObject({ isReturned: true, isReturnable: false });
  });

  it("refuses the whole return when any line cannot be returned, or the reason is unknown", async () => {
    const mixed = await container.startReturn.execute({
      orderId: "delivered",
      productIds: ["lamp", "mascara"],
      reason: "damaged",
    });
    const notDelivered = await container.startReturn.execute({
      orderId: "on-its-way",
      productIds: ["dummyjson-0001"],
      reason: "damaged",
    });
    const badReason = await container.startReturn.execute({
      orderId: "delivered",
      productIds: ["lamp"],
      reason: "bored",
    });
    const nothing = await container.startReturn.execute({
      orderId: "delivered",
      productIds: [],
      reason: "damaged",
    });

    expect([mixed, notDelivered, badReason, nothing]).toEqual(
      Array.from({ length: 4 }, () => ({ status: "not-returnable" })),
    );
    expect(fakes.orders.storedOrders().every((order) => order.returns.length === 0)).toBe(true);
  });

  it("cannot return another shopper's order", async () => {
    const result = await container.startReturn.execute({
      orderId: "theirs",
      productIds: ["dummyjson-0001"],
      reason: "damaged",
    });

    expect(result).toEqual({ status: "not-found" });
  });
});
