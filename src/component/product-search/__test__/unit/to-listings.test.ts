import { describe, expect, it } from "vitest";
import { interpretQuery, type ListingContext, toListings } from "@/component";
import { aProduct } from "@/test-support";

const first = aProduct({
  id: "first",
  priceInCents: 3900,
  color: "black",
  features: ["dimmable", "usb", "clamp"],
});
const cheapest = aProduct({
  id: "cheapest",
  priceInCents: 1449,
  color: "white",
  features: ["clamp"],
});

function context(overrides: Partial<ListingContext> = {}): ListingContext {
  return {
    intent: interpretQuery("lamp").intent,
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
    const listings = toListings([cheapest, first], context({ sort: "lowest-price" }));

    expect(listings[0]?.highlight).toBe("lowest-price-pick");
  });

  it("highlights nothing for a single result or for closest matches", () => {
    expect(toListings([first], context({ matchCount: 1 }))[0]).toMatchObject({
      isBestMatch: false,
      highlight: null,
    });
    expect(
      toListings([first, cheapest], context({ matchCount: 0, isClosestMatch: true })).map(
        (listing) => listing.highlight,
      ),
    ).toEqual([null, null]);
  });

  it("does not crown a best match when nothing was understood", () => {
    expect(toListings([first, cheapest], context({ understoodTermCount: 0 }))[0]?.isBestMatch).toBe(
      false,
    );
  });

  it("lists the colour and up to two features the shopper did not ask for", () => {
    const listings = toListings(
      [first],
      context({ intent: interpretQuery("dimmable lamp").intent }),
    );

    expect(listings[0]?.details).toEqual(["Black", "USB", "Clamp"]);
  });
});
