import type { ProductId } from "../product/product";
import type { ShopperId } from "../shopper/shopper";
import type { CartLine } from "./cart-line";

export interface CartLineRepository {
  get(ownerId: ShopperId, productId: ProductId): Promise<CartLine | null>;
  demand(ownerId: ShopperId, productId: ProductId): Promise<CartLine>;
  getMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<CartLine[]>;
  demandMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<CartLine[]>;
  listByOwner(ownerId: ShopperId): Promise<CartLine[]>;
  save(line: CartLine): Promise<void>;
  remove(ownerId: ShopperId, productId: ProductId): Promise<void>;
}
