export type SearchSort = "best-match" | "lowest-price" | "top-rated";

export const SEARCH_SORTS: readonly SearchSort[] = ["best-match", "lowest-price", "top-rated"];

export function isSearchSort(value: string): value is SearchSort {
  return SEARCH_SORTS.some((sort) => sort === value);
}
