import { describe, expect, it } from "vitest";
import { deliveryDaysFrom, PRODUCT_FACT_RULES } from "@/component";

describe("deliveryDaysFrom", () => {
  it("turns shipping text into days", () => {
    expect(deliveryDaysFrom("Ships overnight")).toBe(1);
    expect(deliveryDaysFrom("Ships in 1-2 business days")).toBe(2);
    expect(deliveryDaysFrom("Ships in 3-5 business days")).toBe(4);
    expect(deliveryDaysFrom("Ships in 1 week")).toBe(7);
    expect(deliveryDaysFrom("Ships in 2 weeks")).toBe(14);
    expect(deliveryDaysFrom("Ships in 1 month")).toBe(30);
  });

  it("falls back to a week for text it cannot read", () => {
    expect(deliveryDaysFrom("Ships when ready")).toBe(PRODUCT_FACT_RULES.unparsedDeliveryDays);
  });
});
