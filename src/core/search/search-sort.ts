import { isOneOf } from "../literal/is-one-of";
export const SEARCH_SORTS = ["best-match", "lowest-price", "top-rated"] as const;

export type SearchSort = (typeof SEARCH_SORTS)[number];

// What a search is sorted by until the shopper picks another order. The delivery layer may
// not import this value, so it spells out the literal against DefaultSearchSort, and the type
// checker keeps the two the same.
export const DEFAULT_SEARCH_SORT = "best-match" satisfies SearchSort;
export type DefaultSearchSort = typeof DEFAULT_SEARCH_SORT;

export function isSearchSort(value: string): value is SearchSort {
  return isOneOf(SEARCH_SORTS, value);
}
