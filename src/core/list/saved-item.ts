import type { ProductId } from "../product/product";
import type { ShopperId } from "../shopper/shopper";

export type SavedItem = {
  ownerId: ShopperId;
  productId: ProductId;
  savedAt: string;
};
