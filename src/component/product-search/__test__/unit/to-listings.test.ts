import { describe, expect, it } from "vitest";
import { interpretQuery, type ListingContext, toListings } from "@/component";
import { aProduct } from "@/test-support";

const first = aProduct({
  id: "first",
  priceInCents: 3900,
  color: "black",
  tags: ["leather", "luxury", "durable"],
});
const cheapest = aProduct({ id: "cheapest", priceInCents: 1449, color: "white", tags: ["casual"] });

function context(overrides: Partial<ListingContext> = {}): ListingContext {
  return {
    intent: interpretQuery("laptops").intent,
    sort: "best-match",
    matchCount: 2,
    understoodTermCount: 1,
    isClosestMatch: false,
    ...overrides,
  };
}

describe("toListings", () => {
  it("marks the first result as best match and the cheapest as lowest price", () => {
    const listings = toListings([first, cheapest], context());

    expect(listings.map((listing) => [listing.isBestMatch, listing.highlight])).toEqual([
      [true, "top-rated-pick"],
      [false, "lowest-price"],
    ]);
  });

  it("calls the best match a lowest price pick when sorted by price", () => {
    expect(toListings([cheapest, first], context({ sort: "lowest-price" }))[0]?.highlight).toBe(
      "lowest-price-pick",
    );
  });

  it("highlights nothing for a single result", () => {
    expect(toListings([first], context({ matchCount: 1 }))[0]).toMatchObject({
      isBestMatch: false,
      highlight: null,
    });
  });

  it("highlights nothing among closest matches", () => {
    const listings = toListings(
      [first, cheapest],
      context({ matchCount: 0, isClosestMatch: true }),
    );

    expect(listings.map((listing) => listing.highlight)).toEqual([null, null]);
  });

  it("does not crown a best match when nothing was understood", () => {
    expect(toListings([first, cheapest], context({ understoodTermCount: 0 }))[0]?.isBestMatch).toBe(
      false,
    );
  });

  it("lists the colour and up to two tags the shopper did not ask for", () => {
    const listings = toListings(
      [first],
      context({ intent: interpretQuery("leather laptop").intent }),
    );

    expect(listings[0]?.details).toEqual(["Black", "Luxury", "Durable"]);
  });

  it("falls back to the brand, then the category, when there is no colour or tag", () => {
    const branded = aProduct({ id: "branded", brand: "Apple" });
    const plain = aProduct({ id: "plain" });

    expect(toListings([branded, plain], context()).map((listing) => listing.details)).toEqual([
      ["Apple"],
      ["Laptop"],
    ]);
  });
});
