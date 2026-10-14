import { describe, expect, it } from "vitest";
import { interpretQuery } from "@/component";

function labelsOf(text: string): string[] {
  return interpretQuery(text).terms.map((term) => term.label);
}

describe("interpretQuery", () => {
  it("understands the reference sentence in reading order", () => {
    // Act
    const interpretation = interpretQuery("dimmable desk lamp under $40 that arrives tomorrow");

    // Assert
    expect(interpretation.terms.map((term) => term.label)).toEqual([
      "Dimmable",
      "Desk lamps",
      "Under $40",
      "Arrives tomorrow",
    ]);
    expect(interpretation.intent).toEqual({
      category: "desk-lamp",
      minimumPriceInCents: null,
      maximumPriceInCents: 4000,
      maximumDeliveryDays: 1,
      minimumRating: null,
      prefersLowestPrice: false,
      color: null,
      features: ["dimmable"],
      keywords: [],
    });
  });

  it("keeps the exact phrase each term came from so it can be removed again", () => {
    // Act
    const terms = interpretQuery("Dimmable desk lamp under $40 that arrives tomorrow").terms;

    // Assert
    expect(terms.map((term) => term.phrase)).toEqual([
      "dimmable",
      "desk lamp",
      "under $40",
      "that arrives tomorrow",
    ]);
  });

  it("reads a single word as its category", () => {
    expect(labelsOf("lamp")).toEqual(["Desk lamps"]);
    expect(labelsOf("headphones")).toEqual(["Headphones"]);
    expect(labelsOf("rucksack")).toEqual(["Backpacks"]);
  });

  it("reads a feature named inside a category name as both", () => {
    expect(interpretQuery("espresso machine").intent).toMatchObject({
      category: "coffee-maker",
      features: ["espresso"],
      keywords: [],
    });
    expect(interpretQuery("filter coffee maker").intent).toMatchObject({
      category: "coffee-maker",
      features: ["drip"],
      keywords: [],
    });
  });

  it("reads a price range written with plain numbers", () => {
    // Act
    const interpretation = interpretQuery("red lamp between 10 and 30");

    // Assert
    expect(interpretation.terms.map((term) => term.label)).toEqual([
      "Red",
      "Desk lamps",
      "$10 to $30",
    ]);
    expect(interpretation.intent.minimumPriceInCents).toBe(1000);
    expect(interpretation.intent.maximumPriceInCents).toBe(3000);
    expect(interpretation.intent.color).toBe("red");
  });

  it("orders a reversed price range from low to high", () => {
    const intent = interpretQuery("lamp $50 - $20").intent;

    expect(intent.minimumPriceInCents).toBe(2000);
    expect(intent.maximumPriceInCents).toBe(5000);
  });

  it("keeps cents in a price limit", () => {
    // Act
    const interpretation = interpretQuery("lamp under $39.99");

    // Assert
    expect(interpretation.intent.maximumPriceInCents).toBe(3999);
    expect(labelsOf("lamp under $39.99")).toEqual(["Desk lamps", "Under $39.99"]);
  });

  it("reads amounts written with a currency word", () => {
    expect(labelsOf("noise canceling headphones under 100 dollars")).toEqual([
      "Noise cancelling",
      "Headphones",
      "Under $100",
    ]);
    expect(interpretQuery("backpack 20 to 50 bucks").intent).toMatchObject({
      minimumPriceInCents: 2000,
      maximumPriceInCents: 5000,
      keywords: [],
    });
  });

  it("reads prices written as words", () => {
    expect(interpretQuery("lamp under forty bucks").intent).toMatchObject({
      maximumPriceInCents: 4000,
      keywords: [],
    });
    expect(interpretQuery("headphones over a hundred dollars").intent.minimumPriceInCents).toBe(
      10000,
    );
    expect(interpretQuery("backpack under twenty-five").intent.maximumPriceInCents).toBe(2500);
    expect(interpretQuery("lamp between ten and thirty").intent).toMatchObject({
      minimumPriceInCents: 1000,
      maximumPriceInCents: 3000,
    });
  });

  it("reads a hundred and more written as words", () => {
    expect(interpretQuery("headphones under one hundred fifty").intent).toMatchObject({
      maximumPriceInCents: 15000,
      keywords: [],
    });
    expect(
      interpretQuery("backpack under a hundred and twenty bucks").intent.maximumPriceInCents,
    ).toBe(12000);
  });

  it("reads a single-digit word as a price only with a currency word", () => {
    expect(labelsOf("lamp in more than one color")).toEqual(["Desk lamps", "“color”"]);
    expect(interpretQuery("coffee at least two").intent.minimumPriceInCents).toBeNull();
    expect(interpretQuery("coffee under five bucks").intent.maximumPriceInCents).toBe(500);
  });

  it("does not read number words without a price word in front", () => {
    expect(interpretQuery("one or two lamps").intent).toMatchObject({
      minimumPriceInCents: null,
      maximumPriceInCents: null,
    });
    expect(interpretQuery("lamp under tent").intent.maximumPriceInCents).toBeNull();
  });

  it("reads a minimum price", () => {
    const interpretation = interpretQuery("headphones over 100");

    expect(interpretation.intent.minimumPriceInCents).toBe(10000);
    expect(interpretation.terms.map((term) => term.label)).toEqual(["Headphones", "Over $100"]);
  });

  it("reads top rated as a 4.5 star floor", () => {
    const interpretation = interpretQuery("wireless noise cancelling headphones, top rated");

    expect(interpretation.intent.minimumRating).toBe(4.5);
    expect(interpretation.terms.map((term) => term.label)).toEqual([
      "Wireless",
      "Noise cancelling",
      "Headphones",
      "Rated 4.5 and up",
    ]);
  });

  it("reads an explicit star count as that floor", () => {
    expect(interpretQuery("backpack 4 stars and up").intent.minimumRating).toBe(4);
    expect(labelsOf("backpack 4+ stars")).toEqual(["Backpacks", "Rated 4 and up"]);
  });

  it("reads delivery this week as a four day window", () => {
    const interpretation = interpretQuery("coffee maker delivered this week");

    expect(interpretation.intent.maximumDeliveryDays).toBe(4);
    expect(interpretation.terms.map((term) => term.label)).toEqual([
      "Coffee makers",
      "Arrives this week",
    ]);
  });

  it("reads cheapest as a preference for the lowest price", () => {
    const interpretation = interpretQuery("cheapest compact coffee maker");

    expect(interpretation.intent.prefersLowestPrice).toBe(true);
    expect(interpretation.terms.map((term) => term.label)).toEqual([
      "Cheapest first",
      "Compact",
      "Coffee makers",
    ]);
  });

  it("does not mistake a charging base for wireless audio", () => {
    expect(interpretQuery("lamp with wireless charging").intent.features).toEqual([
      "wireless-charging",
    ]);
  });

  it("normalizes colour synonyms", () => {
    expect(interpretQuery("gray backpack").intent.color).toBe("grey");
    expect(interpretQuery("wooden lamp").intent.color).toBe("wood");
  });

  it("does not read a colour inside a longer word", () => {
    expect(interpretQuery("shredder").intent.color).toBeNull();
  });

  it("keeps unknown words as quoted keywords and drops filler words", () => {
    // Act
    const interpretation = interpretQuery("I need a brass lamp for my office");

    // Assert
    expect(interpretation.intent.keywords).toEqual(["office"]);
    expect(interpretation.terms.map((term) => term.label)).toEqual([
      "Brass",
      "Desk lamps",
      "“office”",
    ]);
  });

  it("understands a repeated keyword once", () => {
    expect(labelsOf("office lamp for the office")).toEqual(["“office”", "Desk lamps"]);
  });

  it("ignores bare numbers and single letters", () => {
    expect(interpretQuery("lamp 3 x").intent.keywords).toEqual([]);
  });

  it("understands nothing in an empty query", () => {
    expect(interpretQuery("   ").terms).toEqual([]);
  });
});
