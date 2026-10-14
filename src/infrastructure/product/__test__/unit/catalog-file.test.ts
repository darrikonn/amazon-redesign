import { describe, expect, it } from "vitest";
import { parseCatalogFile } from "@/infrastructure";
import { aProduct } from "@/test-support";

describe("parseCatalogFile", () => {
  it("reads products written by the catalogue build", () => {
    const product = aProduct({
      color: "black",
      tags: ["leather"],
      image: "https://cdn.dummyjson.com/x.webp",
      brand: "Heshe",
    });

    expect(parseCatalogFile(JSON.parse(JSON.stringify([product])))).toEqual([product]);
  });

  it("fails loudly on a product the app does not understand", () => {
    expect(() => parseCatalogFile([{ ...aProduct(), category: "garden" }])).toThrow(
      'unknown category "garden"',
    );
    expect(() => parseCatalogFile([{ ...aProduct(), tags: ["sparkly"] }])).toThrow(
      'unknown tag "sparkly"',
    );
    expect(() => parseCatalogFile([{ ...aProduct(), priceInCents: "9.99" }])).toThrow(
      '"priceInCents"',
    );
    expect(() => parseCatalogFile({ products: [] })).toThrow("expected an array");
  });
});
