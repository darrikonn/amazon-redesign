import { describe, expect, it } from "vitest";
import { newOrder, orderIdFor, orderItemCount, orderLineFor, orderTotalInCents } from "@/component";
import { anOrderLine, aProduct, aProductDetails } from "@/test-support";

describe("newOrder", () => {
  it("arrives with its slowest item, starts with no returns, and is unchanged so far", () => {
    const fast = aProduct({ id: "fast", deliveryDays: 1 });
    const slow = aProduct({ id: "slow", deliveryDays: 5 });

    const order = newOrder({
      id: "order-1",
      ownerId: "robin",
      isSample: false,
      placedAt: new Date("2026-10-14T12:00:00Z"),
      created: new Date("2026-10-14T12:00:01Z"),
      deliveryPostalCode: "10001",
      items: [
        { product: fast, details: null, quantity: 2 },
        { product: slow, details: null, quantity: 1 },
      ],
    });

    expect(order).toMatchObject({
      placedAt: "2026-10-14T12:00:00.000Z",
      created: "2026-10-14T12:00:01.000Z",
      modified: null,
      deliveryDays: 5,
      deliveryPostalCode: "10001",
      returns: [],
    });
    expect(order.lines.map((line) => [line.productId, line.quantity])).toEqual([
      ["fast", 2],
      ["slow", 1],
    ]);
  });
});

describe("orderLineFor", () => {
  it("snapshots the product and reads its return window from the details", () => {
    const product = aProduct({ id: "lamp", name: "Lamp", priceInCents: 2_500, image: "lamp.webp" });

    expect(
      orderLineFor(product, aProductDetails({ returnPolicy: "7 days return policy" }), 2),
    ).toEqual({
      productId: "lamp",
      name: "Lamp",
      category: "laptops",
      priceInCents: 2_500,
      quantity: 2,
      returnWindowDays: 7,
    });
    expect(orderLineFor(product, null, 1).returnWindowDays).toBe(30);
  });
});

describe("order totals", () => {
  it("adds up prices times quantities, and items", () => {
    const lines = [
      anOrderLine({ priceInCents: 1_000, quantity: 2 }),
      anOrderLine({ priceInCents: 250, quantity: 1 }),
    ];

    expect(orderTotalInCents(lines)).toBe(2_250);
    expect(orderItemCount(lines)).toBe(3);
  });
});

describe("orderIdFor", () => {
  it("differs for each order a shopper places", () => {
    const placedAt = new Date("2026-10-14T12:00:00Z");

    expect(orderIdFor(placedAt, 0)).not.toBe(orderIdFor(placedAt, 1));
    expect(orderIdFor(placedAt, 0)).toMatch(/^order-[0-9a-z]+-1$/);
  });
});
