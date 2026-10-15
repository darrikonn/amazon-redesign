import { describe, expect, it } from "vitest";
import { itemCount, lineTotalInCents, totalInCents } from "@/component";

const lines = [
  { priceInCents: 1_000, quantity: 2 },
  { priceInCents: 250, quantity: 1 },
];

describe("line totals", () => {
  it("adds up prices times quantities, and items", () => {
    expect(lineTotalInCents({ priceInCents: 1_000, quantity: 2 })).toBe(2_000);
    expect(totalInCents(lines)).toBe(2_250);
    expect(itemCount(lines)).toBe(3);
  });
});
