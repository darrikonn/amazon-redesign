import { describe, expect, it } from "vitest";
import {
  CART_RULES,
  canBuy,
  clampQuantity,
  mergeIntoCart,
  newCartLine,
  quantityLimitFor,
} from "@/component";
import { aCartLine } from "@/test-support";

const now = new Date("2026-10-14T15:00:00.000Z");

describe("newCartLine", () => {
  it("is created now and unchanged so far", () => {
    expect(newCartLine("robin", "lamp", 2, now)).toEqual({
      ownerId: "robin",
      productId: "lamp",
      quantity: 2,
      created: "2026-10-14T15:00:00.000Z",
      modified: null,
    });
  });
});

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
    // Arrange
    const shopperLamp = aCartLine({ ownerId: "robin", productId: "lamp", quantity: 2 });

    // Act
    const merged = mergeIntoCart(
      [shopperLamp],
      [
        aCartLine({ ownerId: "guest", productId: "lamp", quantity: 1 }),
        aCartLine({ ownerId: "guest", productId: "bag", quantity: 9 }),
      ],
      "robin",
      now,
    );

    // Assert
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

describe("quantityLimitFor", () => {
  it("is the cart's limit, or what is left in stock if that is less", () => {
    expect(quantityLimitFor({ stock: null })).toBe(CART_RULES.maximumQuantity);
    expect(quantityLimitFor({ stock: 50 })).toBe(CART_RULES.maximumQuantity);
    expect(quantityLimitFor({ stock: 3 })).toBe(3);
    expect(clampQuantity(5, quantityLimitFor({ stock: 3 }))).toBe(3);
  });

  it("allows none of a sold-out product", () => {
    expect(quantityLimitFor({ stock: 0 })).toBe(0);
    expect(canBuy({ stock: 0 })).toBe(false);
    expect(canBuy({ stock: 1 })).toBe(true);
  });
});
