import { describe, expect, it } from "vitest";
import { NAME_FACT_RULES, trimName } from "@/component";

describe("trimName", () => {
  it("keeps short titles and tidies spacing", () => {
    expect(trimName("  Apple   Airpods ")).toBe("Apple Airpods");
  });

  it("cuts long titles at a word boundary", () => {
    const name = trimName(`${"Ultra ".repeat(12)}Lamp`);

    expect(name.length).toBeLessThanOrEqual(NAME_FACT_RULES.maximumLength);
    expect(name.endsWith("Ultra")).toBe(true);
  });
});
