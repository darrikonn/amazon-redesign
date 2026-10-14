import type { CartLineRepository, Clock, ProductId, ProductRepository, SessionStore } from "@/core";
import { type CartSummary, summarizeCart } from "./cart-summary";
import { cartOwnerOf, currentShopper } from "./session-shopper";

export type ToggleCartItemRequest = {
  productId: ProductId;
};

// The card's one-tap button: adds one, or takes the product out of the cart entirely.
export class ToggleCartItem {
  constructor(
    private readonly sessions: SessionStore,
    private readonly cartLines: CartLineRepository,
    private readonly products: ProductRepository,
    private readonly clock: Clock,
  ) {}

  async execute(request: ToggleCartItemRequest): Promise<CartSummary> {
    const ownerId = cartOwnerOf(await currentShopper(this.sessions));
    const product = await this.products.demand(request.productId);
    const existing = await this.cartLines.get(ownerId, product.id);
    if (existing === null) {
      await this.cartLines.save({
        ownerId,
        productId: product.id,
        quantity: 1,
        created: this.clock.now().toISOString(),
        modified: null,
      });
    } else {
      await this.cartLines.remove(ownerId, product.id);
    }
    return summarizeCart(await this.cartLines.listByOwner(ownerId));
  }
}
