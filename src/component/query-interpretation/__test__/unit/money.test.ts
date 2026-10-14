import { describe, expect, it } from "vitest";
import { formatDollars, parseAmountInCents } from "@/component";

describe("formatDollars", () => {
  it("drops cents from whole dollar amounts", () => {
    expect(formatDollars(4000)).toBe("$40");
  });

  it("separates thousands", () => {
    expect(formatDollars(150000)).toBe("$1,500");
    expect(formatDollars(3699999)).toBe("$36,999.99");
  });

  it("shows two decimals otherwise", () => {
    expect(formatDollars(3999)).toBe("$39.99");
    expect(formatDollars(3250)).toBe("$32.50");
  });
});

describe("parseAmountInCents", () => {
  it("reads digits and number words", () => {
    expect(parseAmountInCents("39.99")).toBe(3999);
    expect(parseAmountInCents("1,499.99")).toBe(149999);
    expect(parseAmountInCents("forty")).toBe(4000);
    expect(parseAmountInCents("forty five")).toBe(4500);
    expect(parseAmountInCents("a hundred")).toBe(10000);
    expect(parseAmountInCents("one hundred and fifty")).toBe(15000);
    expect(parseAmountInCents(undefined)).toBe(0);
  });
});
