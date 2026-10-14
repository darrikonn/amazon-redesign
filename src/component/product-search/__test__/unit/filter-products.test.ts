import { describe, expect, it } from "vitest";
import { filterProducts, interpretQuery } from "@/component";
import { aProduct } from "@/test-support";

const dimmableLamp = aProduct({
  id: "dimmable",
  features: ["dimmable", "usb"],
  priceInCents: 2499,
});
const plainLamp = aProduct({
  id: "plain",
  title: "Brass banker’s lamp",
  color: "brass",
  priceInCents: 4675,
});
const headphones = aProduct({
  id: "headphones",
  category: "headphones",
  features: ["wireless"],
  deliveryDays: 1,
});

function idsMatching(text: string): string[] {
  return filterProducts([dimmableLamp, plainLamp, headphones], interpretQuery(text).intent).map(
    (product) => product.id,
  );
}

describe("filterProducts", () => {
  it("keeps every product for an empty intent", () => {
    expect(idsMatching("")).toEqual(["dimmable", "plain", "headphones"]);
  });

  it("filters by category", () => {
    expect(idsMatching("lamp")).toEqual(["dimmable", "plain"]);
  });

  it("requires every requested feature", () => {
    expect(idsMatching("dimmable usb lamp")).toEqual(["dimmable"]);
    expect(idsMatching("dimmable clamp lamp")).toEqual([]);
  });

  it("treats price limits as inclusive", () => {
    expect(idsMatching("lamp under $24.99")).toEqual(["dimmable"]);
    expect(idsMatching("lamp over $46.75")).toEqual(["plain"]);
  });

  it("filters by delivery window, rating and colour", () => {
    expect(idsMatching("arrives tomorrow")).toEqual(["headphones"]);
    expect(idsMatching("4.5 stars")).toEqual([]);
    expect(idsMatching("brass")).toEqual(["plain"]);
  });

  it("matches keywords against the title and the category name", () => {
    expect(idsMatching("banker")).toEqual(["plain"]);
    expect(idsMatching("office")).toEqual([]);
  });
});
