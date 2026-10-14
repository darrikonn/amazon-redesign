import type { Interpretation, Product, SearchSort } from "@/core";
import { interpretQuery } from "../query-interpretation";
import { type BrowseNavigation, buildBrowseNavigation } from "./browse-navigation";
import { describeResults } from "./describe-results";
import { filterProducts } from "./filter-products";
import { sortProducts } from "./sort-products";
import { type Refinement, suggestRefinements } from "./suggest-refinements";
import { findClosestMatches, type Relaxation, suggestRelaxations } from "./suggest-relaxations";
import { type Listing, toListings } from "./to-listings";

export type SearchResult = {
  text: string;
  hasQuery: boolean;
  interpretation: Interpretation;
  sort: SearchSort;
  matchCount: number;
  headline: string;
  refinements: readonly Refinement[];
  relaxations: readonly Relaxation[];
  closestMatchesDroppedLabel: string | null;
  listings: readonly Listing[];
  navigation: BrowseNavigation | null;
};

export function searchProducts(
  catalog: readonly Product[],
  text: string,
  requestedSort: SearchSort,
): SearchResult {
  const interpretation = interpretQuery(text);
  const hasQuery = text.trim().length > 0;
  const sort = interpretation.intent.prefersLowestPrice ? "lowest-price" : requestedSort;
  const matches = hasQuery
    ? sortProducts(filterProducts(catalog, interpretation.intent), sort)
    : [];
  const relaxations =
    hasQuery && matches.length === 0 ? suggestRelaxations(catalog, text, interpretation) : [];
  const closestMatches = findClosestMatches(catalog, relaxations);
  const listings = toListings(closestMatches?.products ?? matches, {
    intent: interpretation.intent,
    sort,
    matchCount: matches.length,
    understoodTermCount: interpretation.terms.length,
    isClosestMatch: closestMatches !== null,
  });
  return {
    text,
    hasQuery,
    interpretation,
    sort,
    matchCount: matches.length,
    headline: describeResults(interpretation.intent, matches.length),
    refinements: suggestRefinements(catalog, text, interpretation, matches),
    relaxations,
    closestMatchesDroppedLabel: closestMatches?.droppedLabel ?? null,
    listings,
    navigation: buildBrowseNavigation(catalog, text, interpretation, matches),
  };
}
