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
  it("matches the reference results screen for the example sentence", async () => {
    // Act
    const outcome = await container.searchCatalog.execute({
      text: "dimmable desk lamp under $40 that arrives tomorrow",
      sort: "best-match",
    });

    // Assert
    expect(outcome.understood.map((term) => term.label)).toEqual([
      "Dimmable",
      "Desk lamps",
      "Under $40",
      "Arrives tomorrow",
    ]);
    expect(outcome.resultCount).toBe(4);
    expect(outcome.headline).toBe("4 desk lamps: dimmable, under $40, arriving tomorrow");
    expect(
      outcome.refinements.map((refinement) => [refinement.label, refinement.resultCount]),
    ).toEqual([
      ["Rated 4.5 and up", 1],
      ["USB", 2],
      ["Clamp", 1],
      ["Rechargeable", 1],
      ["Foldable", 1],
    ]);
    expect(outcome.listings.map((listing) => listing.title)).toEqual([
      "LED desk lamp with dimmer",
      "Swing-arm architect lamp",
      "Foldable rechargeable reading lamp",
      "Desk lamp with wireless charging base",
    ]);
    expect(outcome.listings[0]).toMatchObject({
      isBestMatch: true,
      highlightLabel: "Top rated pick",
      details: ["Black", "USB"],
      reviewCount: 180,
      priceInCents: 2499,
    });
    expect(outcome.listings[2]?.highlightLabel).toBe("Lowest price");
  });

  it("matches the reference screen for a one word lamp search", async () => {
    // Act
    const outcome = await container.searchCatalog.execute({ text: "lamp", sort: "best-match" });

    // Assert
    expect(outcome.headline).toBe("8 desk lamps");
    expect(
      outcome.refinements.map((refinement) => [refinement.label, refinement.resultCount]),
    ).toEqual([
      ["Under $30", 4],
      ["Arrives tomorrow", 4],
      ["Rated 4.5 and up", 4],
      ["Dimmable", 5],
      ["USB", 4],
      ["Clamp", 2],
    ]);
    expect(outcome.listings.map((listing) => listing.title)).toEqual([
      "Monitor light bar with touch control",
      "LED desk lamp with dimmer",
      "Wooden tripod desk lamp",
      "Brass banker’s lamp",
      "Swing-arm architect lamp",
      "Foldable rechargeable reading lamp",
      "Desk lamp with wireless charging base",
      "Gooseneck clip-on lamp",
    ]);
    expect(outcome.listings.at(-1)?.highlightLabel).toBe("Lowest price");
  });

  it("matches the reference screen for headphones", async () => {
    // Act
    const outcome = await container.searchCatalog.execute({
      text: "headphones",
      sort: "best-match",
    });

    // Assert
    expect(outcome.headline).toBe("7 headphones");
    expect(
      outcome.refinements.map((refinement) => [refinement.label, refinement.resultCount]),
    ).toEqual([
      ["Under $90", 4],
      ["Arrives tomorrow", 3],
      ["Rated 4.5 and up", 4],
      ["Wireless", 6],
      ["Over-ear", 4],
      ["Microphone", 4],
    ]);
    expect(outcome.listings[0]).toMatchObject({
      title: "Travel headphones, foldable",
      isBestMatch: true,
    });
    expect(outcome.listings.at(-1)).toMatchObject({
      title: "Budget over-ear wireless headphones",
      highlightLabel: "Lowest price",
    });
  });

  it("matches the reference screen when nothing matches", async () => {
    // Act
    const outcome = await container.searchCatalog.execute({
      text: "red lamp between 10 and 30",
      sort: "best-match",
    });

    // Assert
    expect(outcome.resultCount).toBe(0);
    expect(outcome.headline).toBe("No red desk lamps between $10 and $30");
    expect(outcome.emptyMessage).toBe("Bring results back:");
    expect(outcome.relaxations).toEqual([
      { label: "Drop “Red”", text: "lamp between 10 and 30", resultCount: 4 },
      { label: "Drop “Desk lamps”", text: "red between 10 and 30", resultCount: 1 },
    ]);
    expect(outcome.closestMatchesHeading).toBe("Closest matches, ignoring “Red”");
    expect(outcome.listings.map((listing) => [listing.title, listing.highlightLabel])).toEqual([
      ["LED desk lamp with dimmer", null],
      ["Foldable rechargeable reading lamp", null],
      ["Desk lamp with wireless charging base", null],
      ["Gooseneck clip-on lamp", null],
    ]);
  });

  it("explains when nothing can bring results back", async () => {
    const outcome = await container.searchCatalog.execute({ text: "purple", sort: "best-match" });

    expect(outcome.emptyMessage).toBe(
      "Nothing matches that yet. Try describing the product a different way.",
    );
    expect(outcome.relaxations).toEqual([]);
    expect(outcome.listings).toEqual([]);
  });

  it("finds a way back from several unknown words", async () => {
    const outcome = await container.searchCatalog.execute({
      text: "gift for a coffee lover",
      sort: "best-match",
    });

    expect(outcome.relaxations).toEqual([
      { label: "Drop “gift” and “lover”", text: "for a coffee", resultCount: 5 },
    ]);
    expect(outcome.closestMatchesHeading).toBe("Closest matches, ignoring “gift” and “lover”");
  });

  it("keeps a worded price while dropping the unknown words", async () => {
    const outcome = await container.searchCatalog.execute({
      text: "gift for a coffee lover under forty bucks",
      sort: "best-match",
    });

    expect(outcome.understood.map((term) => term.label)).toEqual([
      "“gift”",
      "Coffee makers",
      "“lover”",
      "Under $40",
    ]);
    expect(outcome.relaxations).toEqual([
      { label: "Drop “gift” and “lover”", text: "for a coffee under forty bucks", resultCount: 2 },
    ]);
  });

  it("does not double quote a dropped keyword", async () => {
    const outcome = await container.searchCatalog.execute({
      text: "office lamp",
      sort: "best-match",
    });

    expect(outcome.relaxations.map((relaxation) => relaxation.label)).toEqual(["Drop “office”"]);
  });

  it("tells each understood term what the text becomes without it", async () => {
    const outcome = await container.searchCatalog.execute({
      text: "Dimmable lamp under $40",
      sort: "best-match",
    });

    expect(outcome.understood).toEqual([
      { label: "Dimmable", textWithoutTerm: "lamp under $40" },
      { label: "Desk lamps", textWithoutTerm: "Dimmable under $40" },
      { label: "Under $40", textWithoutTerm: "Dimmable lamp" },
    ]);
  });

  it("selects lowest price for cheapest and drops the word when another sort is picked", async () => {
    // Act
    const outcome = await container.searchCatalog.execute({
      text: "cheapest compact coffee maker",
      sort: "best-match",
    });

    // Assert
    expect(outcome.sortOptions).toEqual([
      { sort: "best-match", label: "Best match", isSelected: false, text: "compact coffee maker" },
      {
        sort: "lowest-price",
        label: "Lowest price",
        isSelected: true,
        text: "compact coffee maker",
      },
      { sort: "top-rated", label: "Top rated", isSelected: false, text: "compact coffee maker" },
    ]);
    expect(outcome.listings.map((listing) => listing.title)).toEqual([
      "Pour-over coffee set",
      "Compact drip coffee maker",
      "Single-serve coffee maker",
    ]);
    expect(outcome.listings[0]?.highlightLabel).toBe("Lowest price pick");
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

  it("falls back to best match for an unknown sort", async () => {
    const outcome = await container.searchCatalog.execute({ text: "lamp", sort: "random" });

    expect(outcome.requestedSort).toBe("best-match");
    expect(outcome.sortOptions.find((option) => option.isSelected)?.sort).toBe("best-match");
  });

  it("keeps a requested sort that the text does not override", async () => {
    const outcome = await container.searchCatalog.execute({ text: "lamp", sort: "top-rated" });

    expect(outcome.requestedSort).toBe("top-rated");
    expect(outcome.listings[0]?.title).toBe("Monitor light bar with touch control");
  });
});
