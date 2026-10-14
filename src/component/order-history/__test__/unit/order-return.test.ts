import { describe, expect, it } from "vitest";
import {
  isReturnable,
  isReturned,
  RETURN_RULES,
  returnableUntil,
  returnWindowDaysFrom,
} from "@/component";
import { anOrder, anOrderLine } from "@/test-support";

const order = anOrder({
  placedAt: "2026-10-01T12:00:00.000Z",
  deliveryDays: 2,
  lines: [
    anOrderLine({ productId: "lamp", returnWindowDays: 7 }),
    anOrderLine({ productId: "mascara", returnWindowDays: 0 }),
  ],
});

describe("returnWindowDaysFrom", () => {
  it("reads the source's return policy wording", () => {
    expect(returnWindowDaysFrom("30 days return policy")).toBe(30);
    expect(returnWindowDaysFrom("7 days return policy")).toBe(7);
    expect(returnWindowDaysFrom("No return policy")).toBe(0);
    expect(returnWindowDaysFrom(null)).toBe(RETURN_RULES.defaultWindowDays);
    expect(returnWindowDaysFrom("Ask the seller")).toBe(RETURN_RULES.defaultWindowDays);
  });
});

describe("isReturnable", () => {
  it("allows a delivered line inside its window, once", () => {
    const now = new Date("2026-10-05T12:00:00Z");
    const returned = {
      ...order,
      returns: [
        { productIds: ["lamp"], reason: "damaged" as const, requestedAt: "2026-10-05T00:00:00Z" },
      ],
    };

    expect(isReturnable(order, "lamp", now)).toBe(true);
    expect(isReturnable(returned, "lamp", now)).toBe(false);
    expect(isReturned(returned, "lamp")).toBe(true);
  });

  it("refuses before delivery, after the window, without a policy, or for another product", () => {
    expect(isReturnable(order, "lamp", new Date("2026-10-02T12:00:00Z"))).toBe(false);
    expect(isReturnable(order, "lamp", new Date("2026-10-10T12:00:01Z"))).toBe(false);
    expect(isReturnable(order, "mascara", new Date("2026-10-05T12:00:00Z"))).toBe(false);
    expect(isReturnable(order, "ghost", new Date("2026-10-05T12:00:00Z"))).toBe(false);
  });
});

describe("returnableUntil", () => {
  it("counts the window from delivery, and is null without one", () => {
    const now = new Date("2026-10-05T12:00:00Z");
    const [lamp, mascara] = order.lines;

    expect(lamp && returnableUntil(order, lamp, now)?.toISOString()).toBe(
      "2026-10-10T12:00:00.000Z",
    );
    expect(mascara && returnableUntil(order, mascara, now)).toBeNull();
  });
});
