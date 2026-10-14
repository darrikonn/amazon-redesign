import { describe, expect, it } from "vitest";
import { sortProducts } from "@/component";
import { aProduct } from "@/test-support";

const quickAndGood = aProduct({ id: "quick", rating: 4.6, deliveryDays: 1, priceInCents: 2499 });
const slowAndGood = aProduct({ id: "slow", rating: 4.6, deliveryDays: 4, priceInCents: 5400 });
const best = aProduct({ id: "best", rating: 4.7, deliveryDays: 2, priceInCents: 3900 });
const cheap = aProduct({ id: "cheap", rating: 4.1, deliveryDays: 2, priceInCents: 1449 });
const products = [cheap, slowAndGood, quickAndGood, best];

function idsSortedBy(sort: Parameters<typeof sortProducts>[1]): string[] {
  return sortProducts(products, sort).map((product) => product.id);
}

describe("sortProducts", () => {
  it("ranks best match by rating, then faster delivery, then price", () => {
    expect(idsSortedBy("best-match")).toEqual(["best", "quick", "slow", "cheap"]);
  });

  it("ranks lowest price first", () => {
    expect(idsSortedBy("lowest-price")).toEqual(["cheap", "quick", "best", "slow"]);
  });

  it("ranks top rated by rating, then price", () => {
    expect(idsSortedBy("top-rated")).toEqual(["best", "quick", "slow", "cheap"]);
  });

  it("does not reorder the input", () => {
    sortProducts(products, "lowest-price");

    expect(products.map((product) => product.id)).toEqual(["cheap", "slow", "quick", "best"]);
  });
});
