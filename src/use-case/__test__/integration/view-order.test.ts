import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { anOrder, anOrderLine, aProduct, aSession } from "@/test-support";

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

  it("shows each line's photo from the catalogue and the city of the order's ZIP code", async () => {
    // Arrange
    fakes.products.seedProduct(
      aProduct({ id: "lamp", image: "https://cdn.dummyjson.com/lamp.webp" }),
    );
    fakes.orders.seedOrder({ ...delivered, deliveryPostalCode: "98101" });

    // Act
    const order = await container.viewOrder.execute({ orderId: "delivered" });

    // Assert
    expect(order?.deliveryCity).toBe("Seattle");
    expect(order?.lines.map((line) => line.image)).toEqual([
      "https://cdn.dummyjson.com/lamp.webp",
      null,
    ]);
  });

  it("does not show another shopper's order, or any order when signed out", async () => {
    const theirs = await container.viewOrder.execute({ orderId: "theirs" });
    fakes.sessions.reset();

    expect(theirs).toBeNull();
    expect(await container.viewOrder.execute({ orderId: "delivered" })).toBeNull();
  });
});
