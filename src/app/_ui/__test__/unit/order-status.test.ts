import { describe, expect, it } from "vitest";
import { orderStatus } from "@/app/_ui/order-status";

describe("orderStatus", () => {
  it("says when an order arrives, or arrived", () => {
    const deliveredAt = "2026-10-16T12:00:00.000Z";

    expect(orderStatus({ stage: "ordered", deliveredAt })).toBe("Arriving Friday 16 October");
    expect(orderStatus({ stage: "shipped", deliveredAt })).toBe(
      "Shipped, arriving Friday 16 October",
    );
    expect(orderStatus({ stage: "out-for-delivery", deliveredAt })).toBe(
      "Out for delivery, arriving Friday 16 October",
    );
    expect(orderStatus({ stage: "delivered", deliveredAt })).toBe("Delivered Friday 16 October");
  });
});
