import type { ProductId, ProductSource } from "@/core";

const ID_DIGITS = 4;

export function productIdFor(source: ProductSource, sourceId: number): ProductId {
  return `${source}-${String(sourceId).padStart(ID_DIGITS, "0")}`;
}

export function blankToNull(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

export function compareText(first: string, second: string): number {
  if (first === second) return 0;
  return first < second ? -1 : 1;
}
