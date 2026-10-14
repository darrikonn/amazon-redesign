import type { Interpretation, Product } from "@/core";
import { interpretQuery, removePhrase } from "../query-interpretation";
import { countResults } from "./count-results";
import { filterProducts } from "./filter-products";
import { sortProducts } from "./sort-products";

export const RELAXATION_RULES = {
  maximumClosestMatches: 4,
  minimumKeywordsToDropTogether: 2,
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
  const candidates = [
    ...singleTermCandidates(interpretation),
    ...unknownWordsCandidate(interpretation),
  ];
  return candidates.flatMap((candidate) => {
    const next = candidate.phrases.reduce(removePhrase, text);
    if (next === "") return [];
    const resultCount = countResults(catalog, next);
    return resultCount > 0 ? [{ droppedLabel: candidate.label, text: next, resultCount }] : [];
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

type RelaxationCandidate = {
  label: string;
  phrases: readonly string[];
};

function singleTermCandidates(interpretation: Interpretation): RelaxationCandidate[] {
  return interpretation.terms.map((term) => ({ label: term.label, phrases: [term.phrase] }));
}

// Dropping one unknown word rarely helps when the shopper typed several, so offer them together.
function unknownWordsCandidate(interpretation: Interpretation): RelaxationCandidate[] {
  const keywords = interpretation.terms.filter((term) => term.kind === "keyword");
  if (keywords.length < RELAXATION_RULES.minimumKeywordsToDropTogether) return [];
  return [
    {
      label: joinLabels(keywords.map((term) => term.label)),
      phrases: keywords.map((term) => term.phrase),
    },
  ];
}

function joinLabels(labels: readonly string[]): string {
  const last = labels.at(-1) ?? "";
  return labels.length < 2 ? last : `${labels.slice(0, -1).join(", ")} and ${last}`;
}

function widestRelaxation(relaxations: readonly Relaxation[]): Relaxation | null {
  let widest: Relaxation | null = null;
  for (const relaxation of relaxations) {
    if (widest === null || relaxation.resultCount > widest.resultCount) widest = relaxation;
  }
  return widest;
}
