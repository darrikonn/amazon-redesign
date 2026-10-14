import type { Product } from "@/core";
import { interpretQuery } from "../query-interpretation";
import { filterProducts } from "./filter-products";

export function countResults(catalog: readonly Product[], text: string): number {
  return filterProducts(catalog, interpretQuery(text).intent).length;
}
