import { buyAgainPurchases } from "@/component";
import type { Clock, OrderRepository, ProductRepository, SessionStore } from "@/core";
import type { ProductListing } from "./search-catalog";
import { currentShopper } from "./session-shopper";
import { toShelfListing } from "./shelf-listing";

export type BuyAgainView = {
  listings: readonly ProductListing[];
};

// Null for a signed-out visitor.
export class ViewBuyAgain {
  constructor(
    private readonly sessions: SessionStore,
    private readonly orders: OrderRepository,
    private readonly products: ProductRepository,
    private readonly clock: Clock,
  ) {}

  async execute(): Promise<BuyAgainView | null> {
    const shopper = await currentShopper(this.sessions);
    if (shopper === null) return null;
    const purchases = buyAgainPurchases(
      await this.orders.listByOwner(shopper.id),
      this.clock.now(),
    );
    const products = await this.products.getMany(purchases.map((purchase) => purchase.productId));
    return {
      listings: products.map((product) => {
        const timesBought =
          purchases.find((purchase) => purchase.productId === product.id)?.timesBought ?? 0;
        return toShelfListing(product, { details: [`You bought ${timesBought}`] });
      }),
    };
  }
}
