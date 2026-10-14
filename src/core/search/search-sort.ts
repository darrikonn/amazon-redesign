export const SEARCH_SORTS = ["best-match", "lowest-price", "top-rated"] as const;

export type SearchSort = (typeof SEARCH_SORTS)[number];

export function isSearchSort(value: string): value is SearchSort {
  return SEARCH_SORTS.some((sort) => sort === value);
}
