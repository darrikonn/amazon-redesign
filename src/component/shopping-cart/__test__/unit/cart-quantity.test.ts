import { describe, expect, it } from "vitest";
import { CART_RULES, clampQuantity, mergeIntoCart } from "@/component";
import { aCartLine } from "@/test-support";

const now = new Date("2026-10-14T15:00:00.000Z");

describe("clampQuantity", () => {
  it("keeps whole quantities between zero and the limit", () => {
    expect(clampQuantity(3)).toBe(3);
    expect(clampQuantity(2.7)).toBe(2);
    expect(clampQuantity(-1)).toBe(0);
    expect(clampQuantity(99)).toBe(CART_RULES.maximumQuantity);
  });
});

describe("mergeIntoCart", () => {
  it("moves the guest's lines to the shopper and adds up a product in both", () => {
    const shopperLamp = aCartLine({ ownerId: "robin", productId: "lamp", quantity: 2 });

    const merged = mergeIntoCart(
      [shopperLamp],
      [
        aCartLine({ ownerId: "guest", productId: "lamp", quantity: 1 }),
        aCartLine({ ownerId: "guest", productId: "bag", quantity: 9 }),
      ],
      "robin",
      now,
    );

    expect(merged).toEqual([
      { ...shopperLamp, quantity: 3 },
      {
        ownerId: "robin",
        productId: "bag",
        quantity: 9,
        created: "2026-10-14T15:00:00.000Z",
        modified: null,
      },
    ]);
  });

  it("holds a merged quantity at the limit", () => {
    const merged = mergeIntoCart(
      [aCartLine({ ownerId: "robin", productId: "lamp", quantity: 8 })],
      [aCartLine({ ownerId: "guest", productId: "lamp", quantity: 8 })],
      "robin",
      now,
    );

    expect(merged[0]?.quantity).toBe(CART_RULES.maximumQuantity);
  });
});
