import type { BrowseNavigation, Highlight, Listing, SearchResult } from "@/component";
import { removePhrase, searchProducts, suggestRewrite } from "@/component";
import type { CategoryId, Product, ProductId, ProductRepository, SearchSort } from "@/core";
import { DEFAULT_SEARCH_SORT, isSearchSort, SEARCH_SORTS } from "@/core";
import { type ProductListing, toProductListing } from "./product-listing";

export type SearchCatalogRequest = {
  text: string;
  sort: string;
};

export type SearchOutcome = {
  text: string;
  requestedSort: SearchSort;
  hasQuery: boolean;
  understood: readonly UnderstoodTermView[];
  assistantSuggestion: SuggestionView | null;
  resultCount: number;
  headline: string;
  sortOptions: readonly SortOptionView[];
  refinements: readonly SuggestionView[];
  relaxations: readonly SuggestionView[];
  emptyMessage: string | null;
  closestMatchesHeading: string | null;
  listings: readonly ProductListing[];
  navigation: NavigationView;
};

export type NavigationView = {
  departments: readonly NavigationDepartmentView[];
};

export type NavigationDepartmentView = {
  link: NavigationLinkView;
  containsResults: boolean;
  groups: readonly NavigationLinkView[];
  popular: readonly ProductTeaserView[];
};

export type ProductTeaserView = {
  id: ProductId;
  name: string;
  category: CategoryId;
  image: string | null;
  priceInCents: number;
  rating: number;
};

export type NavigationLinkView = {
  label: string;
  productCount: number;
  text: string;
  isCurrent: boolean;
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

export class SearchCatalog {
  constructor(private readonly products: ProductRepository) {}

  async execute(request: SearchCatalogRequest): Promise<SearchOutcome> {
    const catalog = await this.products.list();
    const requestedSort = isSearchSort(request.sort) ? request.sort : DEFAULT_SEARCH_SORT;
    const outcome = toOutcome(searchProducts(catalog, request.text, requestedSort), requestedSort);
    const rewrite = suggestRewrite(catalog, request.text);
    return {
      ...outcome,
      assistantSuggestion:
        rewrite === null
          ? null
          : {
              label: `Try “${rewrite.text}”`,
              text: rewrite.text,
              resultCount: rewrite.resultCount,
            },
    };
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

function toOutcome(
  result: SearchResult,
  requestedSort: SearchSort,
): Omit<SearchOutcome, "assistantSuggestion"> {
  return {
    text: result.text,
    requestedSort,
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
    listings: result.listings.map(toSearchListing),
    navigation: toNavigationView(result.navigation),
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

function toSearchListing(listing: Listing): ProductListing {
  return toProductListing(listing.product, {
    details: listing.details,
    isBestMatch: listing.isBestMatch,
    highlightLabel: listing.highlight === null ? null : HIGHLIGHT_LABELS[listing.highlight],
  });
}

function toNavigationView(navigation: BrowseNavigation): NavigationView {
  return {
    departments: navigation.departments.map((department) => ({
      link: department.link,
      containsResults: department.containsResults,
      groups: department.groups,
      popular: department.popular.map(toProductTeaser),
    })),
  };
}

function toProductTeaser(product: Product): ProductTeaserView {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    image: product.image,
    priceInCents: product.priceInCents,
    rating: product.rating,
  };
}
