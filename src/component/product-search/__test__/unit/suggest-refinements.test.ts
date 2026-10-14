import { describe, expect, it } from "vitest";
import { filterProducts, interpretQuery, REFINEMENT_RULES, suggestRefinements } from "@/component";
import type { Product } from "@/core";
import { aProduct } from "@/test-support";

const bag = { category: "bags", categoryLabel: "bag", categoryPlural: "bags" } as const;

const catalog: Product[] = [
  aProduct({
    ...bag,
    id: "a",
    priceInCents: 1000,
    rating: 4.8,
    deliveryDays: 1,
    tags: ["leather", "women"],
  }),
  aProduct({
    ...bag,
    id: "b",
    priceInCents: 2000,
    rating: 4.2,
    deliveryDays: 2,
    tags: ["leather"],
  }),
  aProduct({ ...bag, id: "c", priceInCents: 3000, rating: 4.0, deliveryDays: 3, tags: ["casual"] }),
  aProduct({ id: "d", priceInCents: 9000, rating: 4.6, deliveryDays: 1 }),
];

function refinementsFor(text: string, products: readonly Product[] = catalog) {
  const interpretation = interpretQuery(text);
  const matches = filterProducts(products, interpretation.intent);
  return suggestRefinements(products, text, interpretation, matches);
}

describe("suggestRefinements", () => {
  it("offers a price just above the median, delivery, rating, then common tags", () => {
    expect(refinementsFor("bags")).toEqual([
      { label: "Under $25", text: "bags under $25", resultCount: 2 },
      { label: "Arrives tomorrow", text: "bags arrives tomorrow", resultCount: 1 },
      { label: "Rated 4.5 and up", text: "bags top rated", resultCount: 1 },
      { label: "Leather", text: "bags leather", resultCount: 2 },
      { label: "For women", text: "bags women", resultCount: 1 },
      { label: "Casual", text: "bags casual", resultCount: 1 },
    ]);
  });

  it("offers categories first when none was named", () => {
    expect(refinementsFor("arrives tomorrow")[0]).toEqual({
      label: "Bags",
      text: "arrives tomorrow bags",
      resultCount: 1,
    });
  });

  it("rounds the price suggestion to $50 steps above $500", () => {
    const laptops = [
      aProduct({ id: "one", priceInCents: 99_999 }),
      aProduct({ id: "two", priceInCents: 139_999 }),
      aProduct({ id: "three", priceInCents: 179_999 }),
    ];

    expect(refinementsFor("laptops", laptops)[0]).toMatchObject({
      label: "Under $1,400",
      resultCount: 2,
    });
  });

  it("skips what is already asked for and anything that would not narrow the results", () => {
    const labels = refinementsFor("leather bags under $25").map((refinement) => refinement.label);

    expect(labels).toEqual(["Arrives tomorrow", "Rated 4.5 and up", "For women"]);
  });

  it("offers nothing for a single result", () => {
    expect(refinementsFor("casual bags")).toEqual([]);
  });

  it("stops at the maximum number of suggestions", () => {
    const larger = [
      ...catalog,
      aProduct({ ...bag, id: "e", tags: ["luxury", "durable", "portable"], priceInCents: 4000 }),
    ];

    expect(refinementsFor("bags", larger)).toHaveLength(REFINEMENT_RULES.maximumSuggestions);
  });
});
