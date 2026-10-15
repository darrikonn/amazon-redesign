import { describe, expect, it } from "vitest";
import { filterProducts, interpretQuery } from "@/component";
import { aProduct } from "@/test-support";

const leatherBag = aProduct({
  id: "bag",
  name: "Heshe Women's Leather Bag",
  category: "bags",
  tags: ["leather", "women"],
  priceInCents: 12999,
  brand: "Heshe",
});
const blackWatch = aProduct({
  id: "watch",
  name: "Rolex Cellini Date Black Dial",
  category: "watches",
  color: "black",
  tags: ["luxury"],
  priceInCents: 899900,
  rating: 4.7,
  brand: "Rolex",
});
const earbuds = aProduct({
  id: "earbuds",
  name: "Beats Flex Wireless Earphones",
  category: "audio",
  tags: ["wireless"],
  deliveryDays: 1,
  priceInCents: 4999,
});

function idsMatching(text: string): string[] {
  return filterProducts([leatherBag, blackWatch, earbuds], interpretQuery(text).intent).map(
    (product) => product.id,
  );
}

describe("filterProducts", () => {
  it("keeps every product for an empty intent", () => {
    expect(idsMatching("")).toEqual(["bag", "watch", "earbuds"]);
  });

  it("filters by category", () => {
    expect(idsMatching("watches")).toEqual(["watch"]);
  });

  it("requires every requested tag", () => {
    expect(idsMatching("leather bag for women")).toEqual(["bag"]);
    expect(idsMatching("wireless bag")).toEqual([]);
  });

  it("treats price limits as inclusive", () => {
    expect(idsMatching("bag under $129.99")).toEqual(["bag"]);
    expect(idsMatching("over $8999")).toEqual(["watch"]);
  });

  it("filters by delivery window, rating and colour", () => {
    expect(idsMatching("arrives tomorrow")).toEqual(["earbuds"]);
    expect(idsMatching("4.5 stars")).toEqual(["watch"]);
    expect(idsMatching("black")).toEqual(["watch"]);
  });

  it("matches unknown words against the name, the brand and the category", () => {
    expect(idsMatching("cellini")).toEqual(["watch"]);
    expect(idsMatching("heshe")).toEqual(["bag"]);
    expect(idsMatching("office")).toEqual([]);
  });
});
