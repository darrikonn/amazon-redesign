import type { Product } from "@/core";
import { CATEGORY_IDS, COLORS, TAGS } from "@/core";
import type { CatalogVocabulary } from "../catalog-vocabulary";
import { countOccurrences } from "../collection";

// How many products carry each category, tag, and colour, so the interpreter only offers
// what the catalogue can answer.
export function buildVocabulary(products: readonly Product[]): CatalogVocabulary {
  const tagCounts = countOccurrences(products.flatMap((product) => product.tags));
  return {
    categories: CATEGORY_IDS.map((id) => ({
      id,
      productCount: products.filter((product) => product.category === id).length,
    })),
    tags: TAGS.filter((tag) => (tagCounts.get(tag) ?? 0) > 0).map((tag) => ({
      id: tag,
      productCount: tagCounts.get(tag) ?? 0,
    })),
    colors: COLORS.map((color) => ({
      id: color,
      productCount: products.filter((product) => product.color === color).length,
    })),
  };
}
