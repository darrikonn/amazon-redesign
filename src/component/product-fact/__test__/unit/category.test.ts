import { describe, expect, it } from "vitest";
import { mapCategory } from "@/component";

describe("mapCategory", () => {
  it("maps a source category onto its shopper group", () => {
    expect(mapCategory("smartphones", "iPhone X")).toBe("phones");
    expect(mapCategory("womens-watches", "Rolex Datejust Women")).toBe("watches");
  });

  it("moves an item out of a mixed source category by a word in its title", () => {
    expect(mapCategory("mobile-accessories", "Beats Flex Wireless Earphones")).toBe("audio");
    expect(mapCategory("mobile-accessories", "Apple Watch Series 4 Gold")).toBe("watches");
    expect(mapCategory("mobile-accessories", "Selfie Stick Monopod")).toBe("phone-accessories");
  });

  it("fails loudly on a source category the map does not know", () => {
    expect(() => mapCategory("garden-tools", "Rake")).toThrow(
      'Unmapped source category "garden-tools"',
    );
  });
});
