import { describe, expect, it } from "vitest";
import { interpretQuery } from "@/component";

function labelsOf(text: string): string[] {
  return interpretQuery(text).terms.map((term) => term.label);
}

describe("interpretQuery", () => {
  it("understands the first example sentence in reading order", () => {
    // Act
    const interpretation = interpretQuery("wireless headphones under $150 that arrives tomorrow");

    // Assert
    expect(interpretation.terms.map((term) => term.label)).toEqual([
      "Wireless",
      "Audio devices",
      "Under $150",
      "Arrives tomorrow",
    ]);
    expect(interpretation.intent).toEqual({
      category: "audio",
      minimumPriceInCents: null,
      maximumPriceInCents: 15000,
      maximumDeliveryDays: 1,
      minimumRating: null,
      prefersLowestPrice: false,
      color: null,
      tags: ["wireless"],
      keywords: [],
    });
  });

  it("keeps the exact phrase each term came from so it can be removed again", () => {
    // Act
    const terms = interpretQuery("Wireless headphones under $150 that arrives tomorrow").terms;

    // Assert
    expect(terms.map((term) => term.phrase)).toEqual([
      "wireless",
      "headphones",
      "under $150",
      "that arrives tomorrow",
    ]);
  });

  it("reads a synonym as its category", () => {
    expect(labelsOf("laptop")).toEqual(["Laptops"]);
    expect(labelsOf("earbuds")).toEqual(["Audio devices"]);
    expect(labelsOf("sneakers")).toEqual(["Shoes"]);
    expect(labelsOf("perfume")).toEqual(["Fragrances"]);
  });

  it("prefers the longest matching category phrase", () => {
    expect(interpretQuery("phone case").intent.category).toBe("phone-accessories");
    expect(interpretQuery("phone").intent.category).toBe("phones");
  });

  it("reads a price range written with plain numbers", () => {
    // Act
    const interpretation = interpretQuery("red shoes between 10 and 30");

    // Assert
    expect(interpretation.terms.map((term) => term.label)).toEqual(["Red", "Shoes", "$10 to $30"]);
    expect(interpretation.intent).toMatchObject({
      minimumPriceInCents: 1000,
      maximumPriceInCents: 3000,
      color: "red",
    });
  });

  it("orders a reversed price range from low to high", () => {
    const intent = interpretQuery("laptop $1500 - $1000").intent;

    expect(intent.minimumPriceInCents).toBe(100000);
    expect(intent.maximumPriceInCents).toBe(150000);
  });

  it("reads thousands separators", () => {
    expect(interpretQuery("laptop under $1,500").intent.maximumPriceInCents).toBe(150000);
    expect(interpretQuery("watch between 1,000 and 10,000").intent).toMatchObject({
      minimumPriceInCents: 100000,
      maximumPriceInCents: 1000000,
    });
  });

  it("keeps cents in a price limit", () => {
    expect(interpretQuery("bag under $39.99").intent.maximumPriceInCents).toBe(3999);
    expect(labelsOf("bag under $39.99")).toEqual(["Bags", "Under $39.99"]);
  });

  it("reads amounts written with a currency word", () => {
    expect(labelsOf("leather bag under 100 dollars")).toEqual(["Leather", "Bags", "Under $100"]);
    expect(interpretQuery("shoes 20 to 50 bucks").intent).toMatchObject({
      minimumPriceInCents: 2000,
      maximumPriceInCents: 5000,
      keywords: [],
    });
  });

  it("reads prices written as words", () => {
    expect(interpretQuery("bag under forty bucks").intent).toMatchObject({
      maximumPriceInCents: 4000,
      keywords: [],
    });
    expect(interpretQuery("watch over a hundred dollars").intent.minimumPriceInCents).toBe(10000);
    expect(interpretQuery("shoes under twenty-five").intent.maximumPriceInCents).toBe(2500);
    expect(interpretQuery("shoes between ten and thirty").intent).toMatchObject({
      minimumPriceInCents: 1000,
      maximumPriceInCents: 3000,
    });
  });

  it("reads a hundred and more written as words", () => {
    expect(interpretQuery("headphones under one hundred fifty").intent).toMatchObject({
      maximumPriceInCents: 15000,
      keywords: [],
    });
    expect(interpretQuery("bag under a hundred and twenty bucks").intent.maximumPriceInCents).toBe(
      12000,
    );
  });

  it("reads a single-digit word as a price only with a currency word", () => {
    expect(labelsOf("shoes in more than one shade")).toEqual(["Shoes", "“shade”"]);
    expect(interpretQuery("groceries at least two").intent.minimumPriceInCents).toBeNull();
    expect(interpretQuery("groceries under five bucks").intent.maximumPriceInCents).toBe(500);
  });

  it("does not read number words without a price word in front", () => {
    expect(interpretQuery("one or two bags").intent).toMatchObject({
      minimumPriceInCents: null,
      maximumPriceInCents: null,
    });
    expect(interpretQuery("bag under tent").intent.maximumPriceInCents).toBeNull();
  });

  it("reads a minimum price", () => {
    const interpretation = interpretQuery("watches over 1000");

    expect(interpretation.intent.minimumPriceInCents).toBe(100000);
    expect(interpretation.terms.map((term) => term.label)).toEqual(["Watches", "Over $1,000"]);
  });

  it("reads top rated as a 4.5 star floor", () => {
    const interpretation = interpretQuery("luxury watches, top rated");

    expect(interpretation.intent.minimumRating).toBe(4.5);
    expect(interpretation.terms.map((term) => term.label)).toEqual([
      "Luxury",
      "Watches",
      "Rated 4.5 and up",
    ]);
  });

  it("reads an explicit star count as that floor", () => {
    expect(interpretQuery("bag 4 stars and up").intent.minimumRating).toBe(4);
    expect(labelsOf("bag 4+ stars")).toEqual(["Bags", "Rated 4 and up"]);
  });

  it("reads delivery this week as a four day window", () => {
    const interpretation = interpretQuery("groceries delivered this week");

    expect(interpretation.intent.maximumDeliveryDays).toBe(4);
    expect(interpretation.terms.map((term) => term.label)).toEqual([
      "Groceries",
      "Arrives this week",
    ]);
  });

  it("reads cheapest as a preference for the lowest price", () => {
    const interpretation = interpretQuery("cheapest leather bag");

    expect(interpretation.intent.prefersLowestPrice).toBe(true);
    expect(interpretation.terms.map((term) => term.label)).toEqual([
      "Cheapest first",
      "Leather",
      "Bags",
    ]);
  });

  it("reads several tags and tag synonyms", () => {
    expect(interpretQuery("bluetooth earbuds for women").intent.tags).toEqual([
      "wireless",
      "women",
    ]);
  });

  it("normalizes colour synonyms", () => {
    expect(interpretQuery("gray laptop").intent.color).toBe("grey");
    expect(interpretQuery("golden shoes").intent.color).toBe("gold");
  });

  it("does not read a colour inside a longer word", () => {
    expect(interpretQuery("shredder").intent.color).toBeNull();
  });

  it("keeps unknown words as quoted keywords and drops filler words", () => {
    // Act
    const interpretation = interpretQuery("I need a black bag for my office");

    // Assert
    expect(interpretation.intent.keywords).toEqual(["office"]);
    expect(interpretation.terms.map((term) => term.label)).toEqual(["Black", "Bags", "“office”"]);
  });

  it("understands a repeated keyword once", () => {
    expect(labelsOf("office bag for the office")).toEqual(["“office”", "Bags"]);
  });

  it("ignores bare numbers and single letters", () => {
    expect(interpretQuery("bag 3 x").intent.keywords).toEqual([]);
  });

  it("understands nothing in an empty query", () => {
    expect(interpretQuery("   ").terms).toEqual([]);
  });
});
