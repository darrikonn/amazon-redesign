import { describe, expect, it } from "vitest";
import { isOnTheWay, trackOrder } from "@/component";

const order = { placedAt: "2026-10-10T12:00:00.000Z", deliveryDays: 4 };

describe("trackOrder", () => {
  it("ships within a day, goes out the morning it arrives, and arrives on its estimate", () => {
    const tracking = trackOrder(order, new Date("2026-10-10T13:00:00Z"));

    expect(tracking.steps.map((step) => [step.stage, step.at.toISOString()])).toEqual([
      ["ordered", "2026-10-10T12:00:00.000Z"],
      ["shipped", "2026-10-11T08:00:00.000Z"],
      ["out-for-delivery", "2026-10-14T03:00:00.000Z"],
      ["delivered", "2026-10-14T12:00:00.000Z"],
    ]);
    expect(tracking.deliveredAt.toISOString()).toBe("2026-10-14T12:00:00.000Z");
  });

  it("moves through the stages as time passes", () => {
    const stageAt = (now: string) => trackOrder(order, new Date(now)).stage;

    expect(stageAt("2026-10-10T13:00:00Z")).toBe("ordered");
    expect(stageAt("2026-10-12T00:00:00Z")).toBe("shipped");
    expect(stageAt("2026-10-14T06:00:00Z")).toBe("out-for-delivery");
    expect(stageAt("2026-10-14T12:00:00Z")).toBe("delivered");
  });

  it("ships overnight orders in time to arrive the next day", () => {
    const tracking = trackOrder({ ...order, deliveryDays: 1 }, new Date("2026-10-10T12:00:00Z"));

    expect(tracking.steps[1]?.at.toISOString()).toBe("2026-10-11T00:00:00.000Z");
    expect(tracking.steps[2]?.at.toISOString()).toBe("2026-10-11T03:00:00.000Z");
  });
});

describe("isOnTheWay", () => {
  it("is true until the order is delivered", () => {
    expect(isOnTheWay(order, new Date("2026-10-13T00:00:00Z"))).toBe(true);
    expect(isOnTheWay(order, new Date("2026-10-15T00:00:00Z"))).toBe(false);
  });
});
