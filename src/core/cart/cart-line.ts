import type { ProductId } from "../product/product";
import type { ShopperId } from "../shopper/shopper";

export type CartLine = {
  ownerId: ShopperId;
  productId: ProductId;
  quantity: number;
  created: string;
  // Null until the line is first changed, then set by the repository (ADR 0007).
  modified: string | null;
};
