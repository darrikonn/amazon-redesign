import type { Product, ProductDetails, ProductSource } from "@/core";
import type { CatalogVocabulary } from "../catalog-vocabulary";
import { compareText } from "../text";
import { applyOverrides } from "./apply-override";
import { normaliseProducts } from "./normalise";
import type { CatalogOverrides } from "./override";
import { buildProductDetails } from "./product-details";
import { dropRareTags } from "./rare-tag";
import { parseSource } from "./raw-source";
import { buildVocabulary } from "./vocabulary";

export type Catalog = {
  products: readonly Product[];
  details: readonly ProductDetails[];
  vocabulary: CatalogVocabulary;
};

export function buildCatalog(
  source: ProductSource,
  rawResponse: unknown,
  overrides: CatalogOverrides,
): Catalog {
  const parsed = parseSource(source, rawResponse);
  // Overrides come last so a correction is never undone by a rule; the catalogue test
  // then checks that every tag still sits on at least two products.
  const products = applyOverrides(dropRareTags(normaliseProducts(parsed)), overrides[source]).sort(
    (first, second) => compareText(first.id, second.id),
  );
  return {
    products,
    details: buildProductDetails(parsed),
    vocabulary: buildVocabulary(products),
  };
}
