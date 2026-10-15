import { describe, expect, it } from "vitest";
import {
  findClosestMatches,
  interpretQuery,
  RELAXATION_RULES,
  suggestRelaxations,
} from "@/component";
import type { Product } from "@/core";
import { aProduct } from "@/test-support";

const bag = { category: "bags" } as const;

const catalog: Product[] = [
  aProduct({ ...bag, id: "white-bag", color: "white", priceInCents: 1500, rating: 4.1 }),
  aProduct({ ...bag, id: "black-bag", color: "black", priceInCents: 2500, rating: 4.6 }),
  aProduct({ id: "red-laptop", color: "red", priceInCents: 1999 }),
];

describe("suggestRelaxations", () => {
  it("offers to drop each term that would bring results back", () => {
    const text = "red bag between 10 and 30";

    expect(suggestRelaxations(catalog, text, interpretQuery(text))).toEqual([
      { droppedLabel: "Red", text: "bag between 10 and 30", resultCount: 2 },
      { droppedLabel: "Bags", text: "red between 10 and 30", resultCount: 1 },
    ]);
  });

  it("offers to drop every unknown word at once when there are several", () => {
    const text = "gift bag for a lover";

    expect(suggestRelaxations(catalog, text, interpretQuery(text))).toEqual([
      { droppedLabel: "“gift” and “lover”", text: "bag for a", resultCount: 2 },
    ]);
  });

  it("never offers to drop the only term", () => {
    expect(suggestRelaxations(catalog, "purple", interpretQuery("purple"))).toEqual([]);
  });
});

describe("findClosestMatches", () => {
  it("uses the relaxation that brings back the most results, best rated first", () => {
    const relaxations = suggestRelaxations(catalog, "red bag", interpretQuery("red bag"));

    expect(findClosestMatches(catalog, relaxations)).toEqual({
      droppedLabel: "Red",
      products: [catalog[1], catalog[0]],
    });
  });

  it("returns nothing without relaxations", () => {
    expect(findClosestMatches(catalog, [])).toBeNull();
  });

  it("shows at most the maximum number of closest matches", () => {
    const many = Array.from({ length: 6 }, (_, i) => aProduct({ ...bag, id: `bag-${i}` }));
    const relaxations = suggestRelaxations(many, "red bag", interpretQuery("red bag"));

    expect(findClosestMatches(many, relaxations)?.products).toHaveLength(
      RELAXATION_RULES.maximumClosestMatches,
    );
  });
});
