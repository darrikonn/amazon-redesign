import type { SearchSort } from "@/core";

export type RawSearchParameters = Record<string, string | string[] | undefined>;

export type RequestedSearch = {
  text: string;
  sort: string;
};

export function readSearchParameters(raw: RawSearchParameters): RequestedSearch {
  return { text: firstValue(raw.q) ?? "", sort: firstValue(raw.sort) ?? "" };
}

const DEFAULT_SORT: SearchSort = "best-match";

export function searchUrl({ text, sort }: { text: string; sort: SearchSort }): string {
  const parameters = new URLSearchParams();
  if (text.trim() !== "") parameters.set("q", text);
  if (sort !== DEFAULT_SORT) parameters.set("sort", sort);
  const query = parameters.toString();
  return query === "" ? "/" : `/?${query}`;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
