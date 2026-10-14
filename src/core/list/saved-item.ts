import type { ProductId } from "../product/product";
import type { ShopperId } from "../shopper/shopper";

export type SavedItem = {
  ownerId: ShopperId;
  productId: ProductId;
  created: string;
  // Null until the item is first changed, then set by the repository (ADR 0007).
  modified: string | null;
};
