import { describe, expect, it } from "vitest";
import { PRODUCT_FACT_RULES, trimName } from "@/component";

describe("trimName", () => {
  it("keeps short titles and tidies spacing", () => {
    expect(trimName("  Apple   Airpods ")).toBe("Apple Airpods");
  });

  it("cuts long titles at a word boundary", () => {
    const name = trimName(`${"Ultra ".repeat(12)}Lamp`);

    expect(name.length).toBeLessThanOrEqual(PRODUCT_FACT_RULES.maximumNameLength);
    expect(name.endsWith("Ultra")).toBe(true);
  });
});
