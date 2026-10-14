import { describe, expect, it } from "vitest";
import { formatDollars } from "@/component";

describe("formatDollars", () => {
  it("drops cents from whole dollar amounts", () => {
    expect(formatDollars(4000)).toBe("$40");
  });

  it("shows two decimals otherwise", () => {
    expect(formatDollars(3999)).toBe("$39.99");
    expect(formatDollars(3250)).toBe("$32.50");
  });
});
