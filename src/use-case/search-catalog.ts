import type { Highlight, Listing, SearchResult } from "@/component";
import { removePhrase, searchProducts } from "@/component";
import type { Color, Illustration, ProductRepository, SearchSort } from "@/core";
import { demandCategory, SEARCH_SORTS } from "@/core";

export type SearchCatalogRequest = {
  text: string;
  sort: SearchSort;
};

export type SearchOutcome = {
  text: string;
  hasQuery: boolean;
  understood: readonly UnderstoodTermView[];
  resultCount: number;
  headline: string;
  sortOptions: readonly SortOptionView[];
  refinements: readonly SuggestionView[];
  relaxations: readonly SuggestionView[];
  emptyMessage: string | null;
  closestMatchesHeading: string | null;
  listings: readonly ProductListing[];
};

export type UnderstoodTermView = {
  label: string;
  textWithoutTerm: string;
};

export type SortOptionView = {
  sort: SearchSort;
  label: string;
  isSelected: boolean;
  text: string;
};

export type SuggestionView = {
  label: string;
  text: string;
  resultCount: number;
};

export type ProductListing = {
  id: string;
  title: string;
  categoryName: string;
  color: Color;
  details: readonly string[];
  rating: number;
  reviewCount: number;
  priceInCents: number;
  deliveryDays: number;
  illustration: Illustration;
  isBestMatch: boolean;
  highlightLabel: string | null;
};

export class SearchCatalog {
  constructor(private readonly products: ProductRepository) {}

  async execute(request: SearchCatalogRequest): Promise<SearchOutcome> {
    const catalog = await this.products.list();
    return toOutcome(searchProducts(catalog, request.text, request.sort));
  }
}

const SORT_LABELS: Record<SearchSort, string> = {
  "best-match": "Best match",
  "lowest-price": "Lowest price",
  "top-rated": "Top rated",
};

const HIGHLIGHT_LABELS: Record<Highlight, string> = {
  "top-rated-pick": "Top rated pick",
  "lowest-price-pick": "Lowest price pick",
  "lowest-price": "Lowest price",
};

function toOutcome(result: SearchResult): SearchOutcome {
  return {
    text: result.text,
    hasQuery: result.hasQuery,
    understood: result.interpretation.terms.map((term) => ({
      label: term.label,
      textWithoutTerm: removePhrase(result.text, term.phrase),
    })),
    resultCount: result.matchCount,
    headline: result.headline,
    sortOptions: sortOptionsFor(result),
    refinements: result.refinements,
    relaxations: result.relaxations.map((relaxation) => ({
      label: `Drop ${quoted(relaxation.droppedLabel)}`,
      text: relaxation.text,
      resultCount: relaxation.resultCount,
    })),
    emptyMessage: emptyMessageFor(result),
    closestMatchesHeading:
      result.closestMatchesDroppedLabel === null
        ? null
        : `Closest matches, ignoring ${quoted(result.closestMatchesDroppedLabel)}`,
    listings: result.listings.map(toProductListing),
  };
}

// Picking a sort replaces a spoken preference such as "cheapest", so that phrase leaves the text.
function sortOptionsFor(result: SearchResult): SortOptionView[] {
  const lowestPriceTerm = result.interpretation.terms.find((term) => term.kind === "lowest-price");
  const text =
    lowestPriceTerm === undefined ? result.text : removePhrase(result.text, lowestPriceTerm.phrase);
  return SEARCH_SORTS.map((sort) => ({
    sort,
    label: SORT_LABELS[sort],
    isSelected: sort === result.sort,
    text,
  }));
}

function quoted(label: string): string {
  return label.startsWith("“") ? label : `“${label}”`;
}

function emptyMessageFor(result: SearchResult): string | null {
  if (!result.hasQuery || result.matchCount > 0) return null;
  if (result.relaxations.length > 0) return "Bring results back:";
  return "Nothing matches that yet. Try describing the product a different way.";
}

function toProductListing(listing: Listing): ProductListing {
  const { product } = listing;
  return {
    id: product.id,
    title: product.title,
    categoryName: demandCategory(product.category).singularName,
    color: product.color,
    details: listing.details,
    rating: product.rating,
    reviewCount: product.reviewCount,
    priceInCents: product.priceInCents,
    deliveryDays: product.deliveryDays,
    illustration: product.illustration,
    isBestMatch: listing.isBestMatch,
    highlightLabel: listing.highlight === null ? null : HIGHLIGHT_LABELS[listing.highlight],
  };
}
