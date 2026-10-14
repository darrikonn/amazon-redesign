import { describe, expect, it } from "vitest";
import { searchProducts } from "@/component";
import { aProduct } from "@/test-support";

const catalog = [
  aProduct({ id: "lamp-a", priceInCents: 1500, rating: 4.6, features: ["dimmable"] }),
  aProduct({ id: "lamp-b", priceInCents: 2500, rating: 4.2, features: ["dimmable", "usb"] }),
  aProduct({ id: "bag", category: "backpack", priceInCents: 4500, color: "red" }),
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
    const result = searchProducts(catalog, "dimmable lamp", "best-match");

    expect(result.matchCount).toBe(2);
    expect(result.headline).toBe("2 desk lamps: dimmable");
    expect(result.listings.map((listing) => listing.product.id)).toEqual(["lamp-a", "lamp-b"]);
    expect(result.refinements.map((refinement) => refinement.label)).toContain("USB");
  });

  it("switches to lowest price when the shopper asks for the cheapest", () => {
    const result = searchProducts(catalog, "cheapest lamp", "top-rated");

    expect(result.sort).toBe("lowest-price");
    expect(result.listings.map((listing) => listing.product.id)).toEqual(["lamp-a", "lamp-b"]);
  });

  it("offers relaxations and closest matches when nothing matches", () => {
    const result = searchProducts(catalog, "red lamp", "best-match");

    expect(result.matchCount).toBe(0);
    expect(result.relaxations.map((relaxation) => relaxation.droppedLabel)).toEqual([
      "Red",
      "Desk lamps",
    ]);
    expect(result.closestMatchesDroppedLabel).toBe("Red");
    expect(result.listings.map((listing) => listing.product.id)).toEqual(["lamp-a", "lamp-b"]);
  });
});
