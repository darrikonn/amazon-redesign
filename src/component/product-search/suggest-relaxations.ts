import type { Interpretation, Product } from "@/core";
import { interpretQuery, removePhrase } from "../query-interpretation";
import { joinWithAnd } from "../text";
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
  keepsCategory: boolean;
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
    if (resultCount === 0) return [];
    return [
      {
        droppedLabel: candidate.label,
        text: next,
        resultCount,
        keepsCategory: !candidate.dropsCategory,
      },
    ];
  });
}

// Closest matches must still be about something: a search left with only a price ("under
// forty bucks") would show whatever is cheap, which answers nothing the shopper asked.
// A shopper who asked for a laptop wants laptops, so a relaxation that keeps the category
// wins over a wider one that drops it (red lipstick is no answer to "red laptop").
export function findClosestMatches(
  catalog: readonly Product[],
  relaxations: readonly Relaxation[],
): ClosestMatches | null {
  const naming = relaxations.filter((relaxation) => namesAThing(relaxation.text));
  const keepingCategory = naming.filter((relaxation) => relaxation.keepsCategory);
  const widest = widestRelaxation(keepingCategory.length > 0 ? keepingCategory : naming);
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

function namesAThing(text: string): boolean {
  const { intent } = interpretQuery(text);
  return (
    intent.category !== null ||
    intent.color !== null ||
    intent.tags.length > 0 ||
    intent.keywords.length > 0
  );
}

type RelaxationCandidate = {
  label: string;
  phrases: readonly string[];
  dropsCategory: boolean;
};

function singleTermCandidates(interpretation: Interpretation): RelaxationCandidate[] {
  return interpretation.terms.map((term) => ({
    label: term.label,
    phrases: [term.phrase],
    dropsCategory: term.kind === "category",
  }));
}

// Dropping one unknown word rarely helps when the shopper typed several, so offer them together.
function unknownWordsCandidate(interpretation: Interpretation): RelaxationCandidate[] {
  const keywords = interpretation.terms.filter((term) => term.kind === "keyword");
  if (keywords.length < RELAXATION_RULES.minimumKeywordsToDropTogether) return [];
  return [
    {
      label: joinWithAnd(keywords.map((term) => term.label)),
      phrases: keywords.map((term) => term.phrase),
      dropsCategory: false,
    },
  ];
}

function widestRelaxation(relaxations: readonly Relaxation[]): Relaxation | null {
  let widest: Relaxation | null = null;
  for (const relaxation of relaxations) {
    if (widest === null || relaxation.resultCount > widest.resultCount) widest = relaxation;
  }
  return widest;
}
