import type { SearchSort } from "@/core";
import { isSearchSort } from "@/core";

export type SearchParameters = {
  text: string;
  sort: SearchSort;
};

export type RawSearchParameters = Record<string, string | string[] | undefined>;

const DEFAULT_SORT: SearchSort = "best-match";

export function readSearchParameters(raw: RawSearchParameters): SearchParameters {
  const sort = firstValue(raw.sort);
  return {
    text: firstValue(raw.q) ?? "",
    sort: sort !== undefined && isSearchSort(sort) ? sort : DEFAULT_SORT,
  };
}

export function searchUrl({ text, sort }: SearchParameters): string {
  const parameters = new URLSearchParams();
  if (text.trim() !== "") parameters.set("q", text);
  if (sort !== DEFAULT_SORT) parameters.set("sort", sort);
  const query = parameters.toString();
  return query === "" ? "/" : `/?${query}`;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
