import type { Product } from "@/core";
import { countOccurrences } from "../collection";

const RARE_TAG_RULES = {
  // A tag on a single product would offer a chip that leads to one result.
  minimumProductsPerTag: 2,
} as const;

export function dropRareTags(products: readonly Product[]): Product[] {
  const counts = countOccurrences(products.flatMap((product) => product.tags));
  return products.map((product) => ({
    ...product,
    tags: product.tags.filter(
      (tag) => (counts.get(tag) ?? 0) >= RARE_TAG_RULES.minimumProductsPerTag,
    ),
  }));
}
