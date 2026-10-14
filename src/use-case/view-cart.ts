import type { CartLineRepository, IdentityProvider } from "@/core";
import { type CartSummary, summarizeCart } from "./cart-summary";

export class ViewCart {
  constructor(
    private readonly identity: IdentityProvider,
    private readonly cartLines: CartLineRepository,
  ) {}

  async execute(): Promise<CartSummary> {
    const shopper = await this.identity.currentShopper();
    return summarizeCart(await this.cartLines.listByOwner(shopper.id));
  }
}
