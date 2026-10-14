import { describe, expect, it } from "vitest";
import { searchProducts } from "@/component";
import { aProduct } from "@/test-support";

const bag = { category: "bags", categoryLabel: "bag", categoryPlural: "bags" } as const;

const catalog = [
  aProduct({ ...bag, id: "bag-a", priceInCents: 1500, rating: 4.6, tags: ["leather"] }),
  aProduct({ ...bag, id: "bag-b", priceInCents: 2500, rating: 4.2, tags: ["leather", "women"] }),
  aProduct({ id: "laptop", priceInCents: 4500, color: "red" }),
];

describe("searchProducts", () => {
  it("returns nothing and suggests nothing for an empty query", () => {
    const result = searchProducts(catalog, "  ", "best-match");

    expect(result).toMatchObject({
      hasQuery: false,
      matchCount: 0,
      refinements: [],
      relaxations: [],
      listings: [],
    });
  });

  it("filters, sorts and suggests for a query", () => {
    const result = searchProducts(catalog, "leather bags", "best-match");

    expect(result.matchCount).toBe(2);
    expect(result.headline).toBe("2 bags: leather");
    expect(result.listings.map((listing) => listing.product.id)).toEqual(["bag-a", "bag-b"]);
    expect(result.refinements.map((refinement) => refinement.label)).toContain("For women");
  });

  it("switches to lowest price when the shopper asks for the cheapest", () => {
    const result = searchProducts(catalog, "cheapest bag", "top-rated");

    expect(result.sort).toBe("lowest-price");
    expect(result.listings.map((listing) => listing.product.id)).toEqual(["bag-a", "bag-b"]);
  });

  it("offers relaxations and closest matches when nothing matches", () => {
    const result = searchProducts(catalog, "red bag", "best-match");

    expect(result.matchCount).toBe(0);
    expect(result.relaxations.map((relaxation) => relaxation.droppedLabel)).toEqual([
      "Red",
      "Bags",
    ]);
    expect(result.closestMatchesDroppedLabel).toBe("Red");
    expect(result.listings.map((listing) => listing.product.id)).toEqual(["bag-a", "bag-b"]);
  });
});
