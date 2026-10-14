import type { CartLine, ProductId } from "@/core";

export type CartSummary = {
  productIds: readonly ProductId[];
  itemCount: number;
};

export function summarizeCart(lines: readonly CartLine[]): CartSummary {
  return {
    productIds: lines.map((line) => line.productId),
    itemCount: lines.reduce((count, line) => count + line.quantity, 0),
  };
}
