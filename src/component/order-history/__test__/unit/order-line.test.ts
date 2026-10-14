import { describe, expect, it } from "vitest";
import { orderIdFor, orderItemCount, orderLineFor, orderTotalInCents } from "@/component";
import { anOrderLine, aProduct, aProductDetails } from "@/test-support";

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
