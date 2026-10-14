import type { ProductId, SearchSort } from "@/core";

export type RawSearchParameters = Record<string, string | string[] | undefined>;

export type RequestedSearch = {
  text: string;
  sort: string;
};

export function readSearchParameters(raw: RawSearchParameters): RequestedSearch {
  return { text: firstValue(raw.q) ?? "", sort: firstValue(raw.sort) ?? "" };
}

const DEFAULT_SORT: SearchSort = "best-match";
const PRODUCT_PARAMETER = "product";

type SearchLocation = {
  text: string;
  sort: SearchSort;
  productId?: ProductId | null;
};

export function searchUrl({ text, sort, productId = null }: SearchLocation): string {
  const parameters = new URLSearchParams();
  if (text.trim() !== "") parameters.set("q", text);
  if (sort !== DEFAULT_SORT) parameters.set("sort", sort);
  if (productId !== null) parameters.set(PRODUCT_PARAMETER, productId);
  const query = parameters.toString();
  return query === "" ? "/" : `/?${query}`;
}

// The open product rides along in the address of whatever search is on screen (ADR 0029).
export function withProduct(currentUrl: string, productId: ProductId | null): string {
  const url = new URL(currentUrl, ANY_ORIGIN);
  if (productId === null) url.searchParams.delete(PRODUCT_PARAMETER);
  else url.searchParams.set(PRODUCT_PARAMETER, productId);
  return `${url.pathname}${url.search}`;
}

export function productIdIn(currentUrl: string): ProductId | null {
  return new URL(currentUrl, ANY_ORIGIN).searchParams.get(PRODUCT_PARAMETER);
}

// Only the path and query are read, so any origin serves to parse a relative address.
const ANY_ORIGIN = "http://localhost";

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
