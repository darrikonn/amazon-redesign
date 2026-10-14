import type { CartLine } from "@/core";

export type CartSummary = {
  productIds: readonly string[];
  itemCount: number;
};

export function summarizeCart(lines: readonly CartLine[]): CartSummary {
  return { productIds: lines.map((line) => line.productId), itemCount: lines.length };
}
