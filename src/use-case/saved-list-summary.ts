import type { ProductId, SavedItem } from "@/core";

export type SavedListSummary = {
  productIds: readonly ProductId[];
};

export function summarizeSavedList(
  items: readonly Pick<SavedItem, "productId">[],
): SavedListSummary {
  return { productIds: items.map((item) => item.productId) };
}
