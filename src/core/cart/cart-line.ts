import type { ProductId } from "../product/product";
import type { ShopperId } from "../shopper/shopper";

export type CartLine = {
  ownerId: ShopperId;
  productId: ProductId;
  quantity: number;
};
