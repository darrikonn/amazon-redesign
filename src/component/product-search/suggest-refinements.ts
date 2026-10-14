import type { Feature, Interpretation, Product, SearchIntent } from "@/core";
import { demandCategory } from "@/core";
import {
  appendPhrase,
  featureLabel,
  featurePhrase,
  formatDollars,
  INTERPRETATION_RULES,
} from "../query-interpretation";
import { countResults } from "./count-results";

export const REFINEMENT_RULES = {
  maximumSuggestions: 6,
  maximumFeatureSuggestions: 4,
  priceStepInCents: 500,
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
    ...featureCandidates(intent, matches),
  ];
}

function narrowsResults(resultCount: number, currentCount: number): boolean {
  return resultCount > 0 && resultCount < currentCount;
}

function categoryCandidates(intent: SearchIntent, matches: readonly Product[]): Candidate[] {
  if (intent.category !== null) return [];
  const categories = [...new Set(matches.map((product) => product.category))];
  return categories.map((id) => {
    const name = demandCategory(id).singularName;
    return { label: capitalize(name), phrase: name };
  });
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

function featureCandidates(intent: SearchIntent, matches: readonly Product[]): Candidate[] {
  return mostCommonFeatures(intent, matches)
    .slice(0, REFINEMENT_RULES.maximumFeatureSuggestions)
    .map((feature) => ({ label: featureLabel(feature), phrase: featurePhrase(feature) }));
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// The ceiling sits just above the median price, so the suggestion roughly halves the results.
function medianPriceCeilingInCents(matches: readonly Product[]): number {
  const pricesInCents = matches
    .map((product) => product.priceInCents)
    .sort((first, second) => first - second);
  const medianInCents = pricesInCents[Math.floor((pricesInCents.length - 1) / 2)] ?? 0;
  const stepInCents = REFINEMENT_RULES.priceStepInCents;
  return Math.ceil((medianInCents + 1) / stepInCents) * stepInCents;
}

function mostCommonFeatures(intent: SearchIntent, matches: readonly Product[]): Feature[] {
  const frequency = new Map<Feature, number>();
  for (const product of matches) {
    for (const feature of product.features) {
      if (intent.features.includes(feature)) continue;
      frequency.set(feature, (frequency.get(feature) ?? 0) + 1);
    }
  }
  return [...frequency.entries()]
    .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
    .map(([feature]) => feature);
}
