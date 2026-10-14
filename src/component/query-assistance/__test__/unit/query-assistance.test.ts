import { describe, expect, it } from "vitest";
import { ASSISTANCE_RULES, acceptRewrite, requestAssistance } from "@/component";
import { aProduct } from "@/test-support";

const catalog = [
  aProduct({
    id: "touch-lamp",
    title: "Monitor light bar with touch control",
    features: ["dimmable"],
  }),
  aProduct({
    id: "coffee",
    category: "coffee-maker",
    title: "Pour-over coffee set",
    priceInCents: 2800,
  }),
];

describe("requestAssistance", () => {
  it("asks about unknown words that leave nothing to show", () => {
    expect(requestAssistance(catalog, "  gift for a coffee lover ")).toMatchObject({
      text: "gift for a coffee lover",
      unrecognizedWords: ["gift", "lover"],
    });
  });

  it("describes the vocabulary the interpreter understands", () => {
    const vocabulary = requestAssistance(catalog, "gift lamp")?.vocabulary;

    expect(vocabulary?.categories).toEqual([
      "desk lamps",
      "headphones",
      "backpacks",
      "coffee makers",
    ]);
    expect(vocabulary?.features).toContain("noise cancelling");
    expect(vocabulary?.colors).toContain("navy");
  });

  it("does not ask when an unknown word still finds products", () => {
    expect(requestAssistance(catalog, "lamp with touch")).toBeNull();
  });

  it("does not ask when every word was understood", () => {
    expect(requestAssistance(catalog, "headphones")).toBeNull();
  });

  it("does not ask about empty text", () => {
    expect(requestAssistance(catalog, "   ")).toBeNull();
  });

  it("does not send text longer than the limit", () => {
    expect(
      requestAssistance(catalog, `gift ${"x".repeat(ASSISTANCE_RULES.maximumTextLength)}`),
    ).toBeNull();
  });
});

describe("acceptRewrite", () => {
  const request = {
    text: "gift for a coffee lover",
    unrecognizedWords: ["gift", "lover"],
    vocabulary: { categories: [], features: [], colors: [] },
  };

  it("keeps a rewrite that is better understood and finds products", () => {
    expect(acceptRewrite(catalog, request, " coffee maker under $30 ")).toEqual({
      text: "coffee maker under $30",
      understoodLabels: ["Coffee makers", "Under $30"],
      resultCount: 1,
    });
  });

  it("drops a missing rewrite", () => {
    expect(acceptRewrite(catalog, request, null)).toBeNull();
  });

  it("drops a rewrite that only repeats the text", () => {
    expect(acceptRewrite(catalog, request, "Gift for a coffee lover")).toBeNull();
  });

  it("drops a rewrite that understands no more than the original", () => {
    expect(acceptRewrite(catalog, request, "coffee for a friend lover")).toBeNull();
  });

  it("drops a rewrite that finds nothing", () => {
    expect(acceptRewrite(catalog, request, "red coffee maker")).toBeNull();
  });
});
