import { describe, expect, it } from "vitest";
import { filterProducts, interpretQuery, REFINEMENT_RULES, suggestRefinements } from "@/component";
import type { Product } from "@/core";
import { aProduct } from "@/test-support";

const catalog: Product[] = [
  aProduct({
    id: "a",
    priceInCents: 1000,
    rating: 4.8,
    deliveryDays: 1,
    features: ["dimmable", "usb"],
  }),
  aProduct({ id: "b", priceInCents: 2000, rating: 4.2, deliveryDays: 2, features: ["dimmable"] }),
  aProduct({ id: "c", priceInCents: 3000, rating: 4.0, deliveryDays: 3, features: ["clamp"] }),
  aProduct({ id: "d", category: "headphones", priceInCents: 9000, rating: 4.6, deliveryDays: 1 }),
];

function refinementsFor(text: string) {
  const interpretation = interpretQuery(text);
  const matches = filterProducts(catalog, interpretation.intent);
  return suggestRefinements(catalog, text, interpretation, matches);
}

describe("suggestRefinements", () => {
  it("offers a price just above the median, delivery, rating, then common features", () => {
    expect(refinementsFor("lamp")).toEqual([
      { label: "Under $25", text: "lamp under $25", resultCount: 2 },
      { label: "Arrives tomorrow", text: "lamp arrives tomorrow", resultCount: 1 },
      { label: "Rated 4.5 and up", text: "lamp top rated", resultCount: 1 },
      { label: "Dimmable", text: "lamp dimmable", resultCount: 2 },
      { label: "USB", text: "lamp usb", resultCount: 1 },
      { label: "Clamp", text: "lamp clamp", resultCount: 1 },
    ]);
  });

  it("offers categories first when none was named", () => {
    expect(refinementsFor("arrives tomorrow")[0]).toEqual({
      label: "Desk lamp",
      text: "arrives tomorrow desk lamp",
      resultCount: 1,
    });
  });

  it("skips what is already asked for and anything that would not narrow the results", () => {
    const labels = refinementsFor("dimmable lamp under $25").map((refinement) => refinement.label);

    expect(labels).toEqual(["Arrives tomorrow", "Rated 4.5 and up", "USB"]);
  });

  it("offers nothing for a single result", () => {
    expect(refinementsFor("clamp lamp")).toEqual([]);
  });

  it("stops at the maximum number of suggestions", () => {
    const manyFeatures = aProduct({
      id: "e",
      features: ["rechargeable", "foldable", "travel", "compact"],
      priceInCents: 4000,
    });
    const interpretation = interpretQuery("lamp");
    const larger = [...catalog, manyFeatures];

    const refinements = suggestRefinements(
      larger,
      "lamp",
      interpretation,
      filterProducts(larger, interpretation.intent),
    );

    expect(refinements).toHaveLength(REFINEMENT_RULES.maximumSuggestions);
  });
});
