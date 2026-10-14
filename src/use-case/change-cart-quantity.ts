import { clampQuantity, newCartLine } from "@/component";
import type { CartLineRepository, Clock, ProductId, ProductRepository, SessionStore } from "@/core";
import { cartOwnerOf, currentShopper } from "./session-shopper";
import { type CartView, toCartView } from "./view-cart";

export type ChangeCartQuantityRequest = {
  productId: ProductId;
  quantity: number;
};

// Zero removes the product; more than the limit is held at the limit (CART_RULES).
export class ChangeCartQuantity {
  constructor(
    private readonly sessions: SessionStore,
    private readonly cartLines: CartLineRepository,
    private readonly products: ProductRepository,
    private readonly clock: Clock,
  ) {}

  async execute(request: ChangeCartQuantityRequest): Promise<CartView> {
    const shopper = await currentShopper(this.sessions);
    const ownerId = cartOwnerOf(shopper);
    const product = await this.products.demand(request.productId);
    const quantity = clampQuantity(request.quantity);
    const existing = await this.cartLines.get(ownerId, product.id);
    if (quantity === 0) await this.cartLines.remove(ownerId, product.id);
    else if (existing === null) {
      await this.cartLines.save(newCartLine(ownerId, product.id, quantity, this.clock.now()));
    } else if (existing.quantity !== quantity) {
      await this.cartLines.save({ ...existing, quantity });
    }
    return toCartView(await this.cartLines.listByOwner(ownerId), this.products, shopper !== null);
  }
}
