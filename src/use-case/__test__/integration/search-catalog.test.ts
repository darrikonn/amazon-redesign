import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { CATALOG } from "@/infrastructure";

let container: Container;
let fakes: TestFakes;

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
  fakes.products.seedProducts(CATALOG);
});

describe("SearchCatalog", () => {
  it("answers the first example sentence", async () => {
    // Act
    const outcome = await container.searchCatalog.execute({
      text: "wireless headphones under $150",
      sort: "best-match",
    });

    // Assert
    expect(outcome.understood.map((term) => term.label)).toEqual([
      "Wireless",
      "Audio devices",
      "Under $150",
    ]);
    expect(outcome.resultCount).toBe(2);
    expect(outcome.headline).toBe("2 audio devices: wireless, under $150");
    expect(outcome.refinements).toEqual([
      { label: "Portable", text: "wireless headphones under $150 portable", resultCount: 1 },
    ]);
    expect(
      outcome.listings.map((listing) => [listing.name, listing.details, listing.highlightLabel]),
    ).toEqual([
      ["Beats Flex Wireless Earphones", ["Beats"], "Top rated pick"],
      ["Apple Airpods", ["Portable"], null],
    ]);
    expect(outcome.listings[0]).toMatchObject({
      isBestMatch: true,
      category: "audio",
      priceInCents: 4999,
      image: expect.stringContaining("cdn.dummyjson.com"),
    });
  });

  it("answers a one word category search with suggestions drawn from the results", async () => {
    // Act
    const outcome = await container.searchCatalog.execute({
      text: "headphones",
      sort: "best-match",
    });

    // Assert
    expect(outcome.headline).toBe("5 audio devices");
    expect(
      outcome.refinements.map((refinement) => [refinement.label, refinement.resultCount]),
    ).toEqual([
      ["Under $100", 3],
      ["Rated 4.5 and up", 2],
      ["Wireless", 3],
      ["Smart", 2],
      ["Compact", 1],
      ["Portable", 1],
    ]);
    expect(outcome.listings.map((listing) => listing.name)).toEqual([
      "Amazon Echo Plus",
      "Apple HomePod Mini Cosmic Grey",
      "Beats Flex Wireless Earphones",
      "Apple Airpods",
      "Apple AirPods Max Silver",
    ]);
    expect(outcome.listings[2]?.highlightLabel).toBe("Lowest price");
  });

  it("rounds the price suggestion to $50 for expensive results", async () => {
    const outcome = await container.searchCatalog.execute({ text: "laptops", sort: "best-match" });

    expect(outcome.refinements[0]).toEqual({
      label: "Under $1,500",
      text: "laptops under $1,500",
      resultCount: 3,
    });
  });

  it("offers a way back when nothing matches", async () => {
    // Act
    const outcome = await container.searchCatalog.execute({
      text: "red laptop under $1500",
      sort: "best-match",
    });

    // Assert
    expect(outcome.resultCount).toBe(0);
    expect(outcome.headline).toBe("No red laptops under $1,500");
    expect(outcome.emptyMessage).toBe("Bring results back:");
    expect(outcome.relaxations).toEqual([
      { label: "Drop “Red”", text: "laptop under $1500", resultCount: 3 },
      { label: "Drop “Laptops”", text: "red under $1500", resultCount: 7 },
    ]);
    expect(outcome.closestMatchesHeading).toBe("Closest matches, ignoring “Laptops”");
    expect(outcome.listings).toHaveLength(4);
    expect(
      outcome.listings.every(
        (listing) => listing.color === "red" && listing.highlightLabel === null,
      ),
    ).toBe(true);
  });

  it("explains when nothing can bring results back", async () => {
    const outcome = await container.searchCatalog.execute({ text: "navy", sort: "best-match" });

    expect(outcome.emptyMessage).toBe(
      "Nothing matches that yet. Try describing the product a different way.",
    );
    expect(outcome.relaxations).toEqual([]);
    expect(outcome.listings).toEqual([]);
  });

  it("finds a way back from several unknown words", async () => {
    const outcome = await container.searchCatalog.execute({
      text: "gift for a watch lover",
      sort: "best-match",
    });

    expect(outcome.relaxations).toEqual([
      { label: "Drop “gift” and “lover”", text: "for a watch", resultCount: 12 },
    ]);
    expect(outcome.closestMatchesHeading).toBe("Closest matches, ignoring “gift” and “lover”");
  });

  it("keeps a worded price while dropping the unknown words", async () => {
    const outcome = await container.searchCatalog.execute({
      text: "gift for a watch lover under a hundred bucks",
      sort: "best-match",
    });

    expect(outcome.understood.map((term) => term.label)).toEqual([
      "“gift”",
      "Watches",
      "“lover”",
      "Under $100",
    ]);
    expect(outcome.relaxations[0]?.text).toBe("for a watch under a hundred bucks");
  });

  it("does not double quote a dropped keyword", async () => {
    const outcome = await container.searchCatalog.execute({
      text: "watch gift",
      sort: "best-match",
    });

    expect(outcome.relaxations.map((relaxation) => relaxation.label)).toEqual(["Drop “gift”"]);
  });

  it("tells each understood term what the text becomes without it", async () => {
    const outcome = await container.searchCatalog.execute({
      text: "Leather bag under $150",
      sort: "best-match",
    });

    expect(outcome.understood).toEqual([
      { label: "Leather", textWithoutTerm: "bag under $150" },
      { label: "Bags", textWithoutTerm: "Leather under $150" },
      { label: "Under $150", textWithoutTerm: "Leather bag" },
    ]);
  });

  it("selects lowest price for cheapest and drops the word when another sort is picked", async () => {
    // Act
    const outcome = await container.searchCatalog.execute({
      text: "cheapest leather bag",
      sort: "best-match",
    });

    // Assert
    expect(outcome.sortOptions).toEqual([
      { sort: "best-match", label: "Best match", isSelected: false, text: "leather bag" },
      { sort: "lowest-price", label: "Lowest price", isSelected: true, text: "leather bag" },
      { sort: "top-rated", label: "Top rated", isSelected: false, text: "leather bag" },
    ]);
    expect(outcome.listings.map((listing) => listing.name)).toEqual([
      "White Faux Leather Backpack",
      "Heshe Women's Leather Bag",
    ]);
    expect(outcome.listings[0]?.highlightLabel).toBe("Lowest price pick");
  });

  it("falls back to best match for an unknown sort", async () => {
    const outcome = await container.searchCatalog.execute({ text: "laptops", sort: "random" });

    expect(outcome.requestedSort).toBe("best-match");
    expect(outcome.sortOptions.find((option) => option.isSelected)?.sort).toBe("best-match");
  });

  it("keeps a requested sort that the text does not override", async () => {
    const outcome = await container.searchCatalog.execute({
      text: "laptops",
      sort: "lowest-price",
    });

    expect(outcome.requestedSort).toBe("lowest-price");
    expect(outcome.listings[0]?.name).toBe("Lenovo Yoga 920");
  });

  it("suggests a corrected spelling through the simulated assistant", async () => {
    const outcome = await container.searchCatalog.execute({
      text: "wireles headphnes",
      sort: "best-match",
    });

    expect(outcome.assistantSuggestion).toEqual({
      label: "Try “wireless headphones”",
      text: "wireless headphones",
      resultCount: 3,
    });
  });

  it("offers no assistant suggestion when the words already find products", async () => {
    const outcome = await container.searchCatalog.execute({
      text: "yoga laptop",
      sort: "best-match",
    });

    expect(outcome.resultCount).toBe(1);
    expect(outcome.assistantSuggestion).toBeNull();
  });

  it("offers the department directory with the results' department marked and opened", async () => {
    const outcome = await container.searchCatalog.execute({
      text: "luxury watches that arrive this week",
      sort: "best-match",
    });
    const watches = outcome.navigation.departments.find((department) => department.containsResults);

    expect(outcome.navigation.departments).toHaveLength(21);
    expect(watches?.link).toEqual({
      label: "Watches",
      productCount: 12,
      text: "watches",
      isCurrent: false,
    });
    expect(watches?.groups[0]).toEqual({
      label: "Luxury",
      productCount: 9,
      text: "luxury watches",
      isCurrent: false,
    });
    expect(watches?.popular).toHaveLength(3);
    expect(Object.keys(watches?.popular[0] ?? {})).toEqual([
      "id",
      "name",
      "category",
      "image",
      "priceInCents",
      "rating",
    ]);
  });

  it("keeps the department directory when nothing matched", async () => {
    const outcome = await container.searchCatalog.execute({
      text: "red laptop under $1500",
      sort: "best-match",
    });
    const marked = outcome.navigation.departments.filter(
      (department) => department.containsResults,
    );

    expect(outcome.navigation.departments).toHaveLength(21);
    expect(marked.map((department) => department.link.label)).toEqual(["Laptops"]);
  });

  it("returns an empty outcome for an empty query", async () => {
    const outcome = await container.searchCatalog.execute({ text: "", sort: "best-match" });

    expect(outcome).toMatchObject({
      hasQuery: false,
      resultCount: 0,
      listings: [],
      refinements: [],
      emptyMessage: null,
    });
  });
});
