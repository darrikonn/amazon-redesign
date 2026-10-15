import { describe, expect, it } from "vitest";
import { centsToDollars, dollarsToCents } from "@/component";

describe("money", () => {
  it("rounds dollars to whole cents", () => {
    expect(dollarsToCents(19.99)).toBe(1999);
    expect(dollarsToCents(0.105)).toBe(11);
  });

  it("turns cents back into dollars", () => {
    expect(centsToDollars(1999)).toBe(19.99);
  });
});
