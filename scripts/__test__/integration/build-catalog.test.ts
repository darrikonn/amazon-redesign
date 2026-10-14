import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildCatalog,
  CATALOG_OVERRIDES,
  filterProducts,
  interpretQuery,
  mapCategory,
  parseCatalogVocabulary,
  STARTER_QUERIES,
} from "@/component";
import { isCategoryId, requireArray, requireRecord, requireString } from "@/core";
import { CATALOG } from "@/infrastructure";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const rawResponse: unknown = readJson("src/infrastructure/product/data/raw/dummyjson.json");
const committedVocabulary = parseCatalogVocabulary(
  readJson("src/component/catalog-vocabulary/vocabulary.json"),
);

describe("the committed catalogue", () => {
  it("gives every product a category group, a price, a rating, and a delivery estimate", () => {
    for (const product of CATALOG) {
      expect(isCategoryId(product.category)).toBe(true);
      expect(product.priceInCents).toBeGreaterThan(0);
      expect(product.rating).toBeGreaterThanOrEqual(0);
      expect(product.rating).toBeLessThanOrEqual(5);
      expect(product.deliveryDays).toBeGreaterThan(0);
    }
  });

  it("maps every category in the raw response", () => {
    const products = requireArray(requireRecord(rawResponse, "raw").products, "raw products");
    const pairs = products.map((item) => {
      const record = requireRecord(item, "raw product");
      return [
        requireString(record, "category", "raw product"),
        requireString(record, "title", "raw product"),
      ];
    });

    for (const [category, title] of pairs)
      expect(() => mapCategory(category ?? "", title ?? "")).not.toThrow();
  });

  it("lists only tags that at least two products carry, with true counts", () => {
    for (const entry of committedVocabulary.tags) {
      const carriers = CATALOG.filter((product) => product.tags.includes(entry.id)).length;
      expect(entry.productCount).toBeGreaterThanOrEqual(2);
      expect(carriers).toBe(entry.productCount);
    }
  });

  it("is what the build produces from the committed raw data, every time", () => {
    // Act
    const first = buildCatalog("dummyjson", rawResponse, CATALOG_OVERRIDES);
    const second = buildCatalog("dummyjson", rawResponse, CATALOG_OVERRIDES);

    // Assert
    expect(second).toEqual(first);
    expect(first.products).toEqual(CATALOG);
    expect(first.vocabulary).toEqual(committedVocabulary);
  });
});

describe.each(STARTER_QUERIES)("the example sentence %j", (sentence) => {
  const { intent, terms } = interpretQuery(sentence);

  it("names a category and at least two other filters", () => {
    const filters = terms.filter((term) =>
      ["tag", "color", "price", "delivery", "rating"].includes(term.kind),
    );

    expect(intent.category).not.toBeNull();
    expect(intent.keywords).toEqual([]);
    expect(filters.length).toBeGreaterThanOrEqual(2);
  });

  it("finds between 2 and 12 products", () => {
    const count = filterProducts(CATALOG, intent).length;

    expect(count).toBeGreaterThanOrEqual(2);
    expect(count).toBeLessThanOrEqual(12);
  });
});

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(path.join(ROOT, relativePath), "utf8"));
}
