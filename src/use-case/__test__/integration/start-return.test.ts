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
