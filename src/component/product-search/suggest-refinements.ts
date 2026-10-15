import type { Interpretation, Product, SearchIntent, Tag } from "@/core";
import { categoryPlural, departmentLabel, tagLabel, tagPhrase } from "../catalog-vocabulary";
import { mostCommonFirst } from "../collection";
import { appendPhrase, formatDollars, INTERPRETATION_RULES } from "../query-interpretation";

import { countResults } from "./count-results";

export const REFINEMENT_RULES = {
  maximumSuggestions: 6,
  maximumTagSuggestions: 4,
  priceStepInCents: 500,
  largePriceStepInCents: 5000,
  largePriceThresholdInCents: 50000,
  minimumMatchesToRefine: 2,
} as const;

export type Refinement = {
  label: string;
  text: string;
  resultCount: number;
};

export function suggestRefinements(
  catalog: readonly Product[],
  text: string,
  interpretation: Interpretation,
  matches: readonly Product[],
): Refinement[] {
  if (matches.length < REFINEMENT_RULES.minimumMatchesToRefine) return [];
  const refinements: Refinement[] = [];
  for (const candidate of candidatesFor(interpretation.intent, matches)) {
    if (refinements.length >= REFINEMENT_RULES.maximumSuggestions) break;
    const next = appendPhrase(text, candidate.phrase);
    const resultCount = countResults(catalog, next);
    if (narrowsResults(resultCount, matches.length)) {
      refinements.push({ label: candidate.label, text: next, resultCount });
    }
  }
  return refinements;
}

type Candidate = {
  label: string;
  phrase: string;
};

function candidatesFor(intent: SearchIntent, matches: readonly Product[]): Candidate[] {
  return [
    ...categoryCandidates(intent, matches),
    ...priceCandidates(intent, matches),
    ...deliveryCandidates(intent),
    ...ratingCandidates(intent),
    ...tagCandidates(intent, matches),
  ];
}

function narrowsResults(resultCount: number, currentCount: number): boolean {
  return resultCount > 0 && resultCount < currentCount;
}

function categoryCandidates(intent: SearchIntent, matches: readonly Product[]): Candidate[] {
  if (intent.category !== null) return [];
  const categories = [...new Set(matches.map((product) => product.category))];
  return categories.map((id) => ({ label: departmentLabel(id), phrase: categoryPlural(id) }));
}

function priceCandidates(intent: SearchIntent, matches: readonly Product[]): Candidate[] {
  if (intent.maximumPriceInCents !== null) return [];
  const ceiling = formatDollars(medianPriceCeilingInCents(matches));
  return [{ label: `Under ${ceiling}`, phrase: `under ${ceiling}` }];
}

function deliveryCandidates(intent: SearchIntent): Candidate[] {
  if (intent.maximumDeliveryDays !== null) return [];
  return [{ label: "Arrives tomorrow", phrase: "arrives tomorrow" }];
}

function ratingCandidates(intent: SearchIntent): Candidate[] {
  if (intent.minimumRating !== null) return [];
  return [{ label: `Rated ${INTERPRETATION_RULES.topRatedMinimum} and up`, phrase: "top rated" }];
}

function tagCandidates(intent: SearchIntent, matches: readonly Product[]): Candidate[] {
  return mostCommonTags(intent, matches)
    .slice(0, REFINEMENT_RULES.maximumTagSuggestions)
    .map((tag) => ({ label: tagLabel(tag), phrase: tagPhrase(tag) }));
}

// The ceiling sits just above the median price, so the suggestion roughly halves the results.
// Above $500 it rounds to the next $50, so a laptop search offers "under $1,050", not "under $1,005".
function medianPriceCeilingInCents(matches: readonly Product[]): number {
  const pricesInCents = matches
    .map((product) => product.priceInCents)
    .sort((first, second) => first - second);
  const medianInCents = pricesInCents[Math.floor((pricesInCents.length - 1) / 2)] ?? 0;
  const stepInCents =
    medianInCents > REFINEMENT_RULES.largePriceThresholdInCents
      ? REFINEMENT_RULES.largePriceStepInCents
      : REFINEMENT_RULES.priceStepInCents;
  return Math.ceil((medianInCents + 1) / stepInCents) * stepInCents;
}

function mostCommonTags(intent: SearchIntent, matches: readonly Product[]): Tag[] {
  const unasked = matches
    .flatMap((product) => product.tags)
    .filter((tag) => !intent.tags.includes(tag));
  return mostCommonFirst(unasked).map(([tag]) => tag);
}
