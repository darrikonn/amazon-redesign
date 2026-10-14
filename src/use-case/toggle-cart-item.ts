import type { CartLineRepository, IdentityProvider, ProductId, ProductRepository } from "@/core";
import { type CartSummary, summarizeCart } from "./cart-summary";

export type ToggleCartItemRequest = {
  productId: ProductId;
};

export class ToggleCartItem {
  constructor(
    private readonly identity: IdentityProvider,
    private readonly cartLines: CartLineRepository,
    private readonly products: ProductRepository,
  ) {}

  async execute(request: ToggleCartItemRequest): Promise<CartSummary> {
    const shopper = await this.identity.currentShopper();
    const product = await this.products.demand(request.productId);
    const existing = await this.cartLines.get(shopper.id, product.id);
    if (existing === null) {
      await this.cartLines.save({ ownerId: shopper.id, productId: product.id });
    } else {
      await this.cartLines.remove(shopper.id, product.id);
    }
    return summarizeCart(await this.cartLines.listByOwner(shopper.id));
  }
}
