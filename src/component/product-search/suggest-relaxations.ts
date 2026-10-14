import type { Interpretation, Product } from "@/core";
import { interpretQuery, removePhrase } from "../query-interpretation";
import { countResults } from "./count-results";
import { filterProducts } from "./filter-products";
import { sortProducts } from "./sort-products";

export const RELAXATION_RULES = {
  maximumClosestMatches: 4,
} as const;

export type Relaxation = {
  droppedLabel: string;
  text: string;
  resultCount: number;
};

export type ClosestMatches = {
  droppedLabel: string;
  products: Product[];
};

export function suggestRelaxations(
  catalog: readonly Product[],
  text: string,
  interpretation: Interpretation,
): Relaxation[] {
  return interpretation.terms.flatMap((term) => {
    const next = removePhrase(text, term.phrase);
    if (next === "") return [];
    const resultCount = countResults(catalog, next);
    return resultCount > 0 ? [{ droppedLabel: term.label, text: next, resultCount }] : [];
  });
}

export function findClosestMatches(
  catalog: readonly Product[],
  relaxations: readonly Relaxation[],
): ClosestMatches | null {
  const widest = widestRelaxation(relaxations);
  if (widest === null) return null;
  const products = sortProducts(
    filterProducts(catalog, interpretQuery(widest.text).intent),
    "top-rated",
  );
  return {
    droppedLabel: widest.droppedLabel,
    products: products.slice(0, RELAXATION_RULES.maximumClosestMatches),
  };
}

function widestRelaxation(relaxations: readonly Relaxation[]): Relaxation | null {
  let widest: Relaxation | null = null;
  for (const relaxation of relaxations) {
    if (widest === null || relaxation.resultCount > widest.resultCount) widest = relaxation;
  }
  return widest;
}
