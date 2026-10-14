import { describe, expect, it } from "vitest";
import { parseCatalogVocabulary } from "@/component";

describe("parseCatalogVocabulary", () => {
  it("reads categories, tags, and colours with their product counts", () => {
    const vocabulary = parseCatalogVocabulary({
      categories: [{ id: "laptops", productCount: 5 }],
      tags: [{ id: "leather", productCount: 6 }],
      colors: [{ id: "black", productCount: 9 }],
    });

    expect(vocabulary).toEqual({
      categories: [{ id: "laptops", productCount: 5 }],
      tags: [{ id: "leather", productCount: 6 }],
      colors: [{ id: "black", productCount: 9 }],
    });
  });

  it("rejects an id the app does not know", () => {
    expect(() =>
      parseCatalogVocabulary({
        categories: [{ id: "garden", productCount: 1 }],
        tags: [],
        colors: [],
      }),
    ).toThrow('unknown id "garden"');
  });

  it("rejects a count that is not a number", () => {
    expect(() =>
      parseCatalogVocabulary({
        categories: [],
        tags: [{ id: "leather", productCount: "6" }],
        colors: [],
      }),
    ).toThrow('"productCount"');
  });

  it("rejects a file without the three lists", () => {
    expect(() => parseCatalogVocabulary({ categories: [] })).toThrow("tags: expected an array");
  });
});
