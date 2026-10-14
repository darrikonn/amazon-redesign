import { describe, expect, it } from "vitest";
import { CART_RULES, clampQuantity, mergeIntoCart } from "@/component";

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
    const merged = mergeIntoCart(
      [{ ownerId: "robin", productId: "lamp", quantity: 2 }],
      [
        { ownerId: "guest", productId: "lamp", quantity: 1 },
        { ownerId: "guest", productId: "bag", quantity: 9 },
      ],
      "robin",
    );

    expect(merged).toEqual([
      { ownerId: "robin", productId: "lamp", quantity: 3 },
      { ownerId: "robin", productId: "bag", quantity: 9 },
    ]);
  });

  it("holds a merged quantity at the limit", () => {
    const merged = mergeIntoCart(
      [{ ownerId: "robin", productId: "lamp", quantity: 8 }],
      [{ ownerId: "guest", productId: "lamp", quantity: 8 }],
      "robin",
    );

    expect(merged[0]?.quantity).toBe(CART_RULES.maximumQuantity);
  });
});
