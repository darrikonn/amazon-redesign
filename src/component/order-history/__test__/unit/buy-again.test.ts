import { describe, expect, it } from "vitest";
import { BUY_AGAIN_RULES, buyAgainPurchases } from "@/component";
import { anOrder, anOrderLine } from "@/test-support";

const now = new Date("2026-10-14T12:00:00Z");

describe("buyAgainPurchases", () => {
  it("lists kept products from delivered orders, most bought first, then most recent", () => {
    const orders = [
      anOrder({
        id: "old",
        placedAt: "2026-09-01T12:00:00Z",
        lines: [
          anOrderLine({ productId: "coffee", quantity: 3 }),
          anOrderLine({ productId: "lamp" }),
        ],
      }),
      anOrder({
        id: "recent",
        placedAt: "2026-10-01T12:00:00Z",
        lines: [anOrderLine({ productId: "bag" }), anOrderLine({ productId: "mug" })],
        returns: [{ productIds: ["mug"], reason: "damaged", requestedAt: "2026-10-05T12:00:00Z" }],
      }),
      anOrder({
        id: "on-its-way",
        placedAt: "2026-10-14T00:00:00Z",
        deliveryDays: 3,
        lines: [anOrderLine({ productId: "phone" })],
      }),
    ];

    expect(buyAgainPurchases(orders, now)).toEqual([
      { productId: "coffee", timesBought: 3 },
      { productId: "bag", timesBought: 1 },
      { productId: "lamp", timesBought: 1 },
    ]);
  });

  it("caps the list", () => {
    const lines = Array.from({ length: 40 }, (_, index) => anOrderLine({ productId: `p${index}` }));

    expect(buyAgainPurchases([anOrder({ lines })], now)).toHaveLength(
      BUY_AGAIN_RULES.maximumProducts,
    );
  });
});
