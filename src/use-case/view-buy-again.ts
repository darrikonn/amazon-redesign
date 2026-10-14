import { buyAgainProductIds } from "@/component";
import type {
  Clock,
  Order,
  OrderRepository,
  ProductId,
  ProductRepository,
  SessionStore,
} from "@/core";
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
    const orders = await this.orders.listByOwner(shopper.id);
    const productIds = buyAgainProductIds(orders, this.clock.now());
    const products = await this.products.getMany(productIds);
    return {
      listings: products.map((product) =>
        toShelfListing(product, [timesOrderedLabel(orders, product.id)]),
      ),
    };
  }
}

function timesOrderedLabel(orders: readonly Order[], productId: ProductId): string {
  const times = orders.filter((order) =>
    order.lines.some((line) => line.productId === productId),
  ).length;
  return times === 1 ? "Ordered once" : `Ordered ${times} times`;
}
