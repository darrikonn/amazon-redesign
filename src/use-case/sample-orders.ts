import type { SamplePurchase } from "@/component";
import { addDays, newOrder, orderIdFor, orderItemsFor, pickSamplePurchases } from "@/component";
import type {
  Clock,
  Order,
  OrderRepository,
  ProductDetailsRepository,
  ProductRepository,
  Shopper,
} from "@/core";

// A new shopper starts with three demo orders, picked from the catalogue by their email
// (ADR 0030), so tracking, returns, and buy again have something to show.
export class SampleOrders {
  constructor(
    private readonly orders: OrderRepository,
    private readonly products: ProductRepository,
    private readonly productDetails: ProductDetailsRepository,
    private readonly clock: Clock,
  ) {}

  async addIfNew(shopper: Shopper): Promise<void> {
    if ((await this.orders.listByOwner(shopper.id)).length > 0) return;
    const purchases = pickSamplePurchases(shopper.email, await this.products.list());
    const now = this.clock.now();
    for (const [index, purchase] of purchases.entries()) {
      await this.orders.save(await this.sampleOrder(shopper, purchase, index, now));
    }
  }

  private async sampleOrder(
    shopper: Shopper,
    purchase: SamplePurchase,
    index: number,
    now: Date,
  ): Promise<Order> {
    const placedAt = addDays(now, -purchase.daysAgo);
    const productIds = purchase.items.map((item) => item.productId);
    return newOrder({
      id: orderIdFor(placedAt, index),
      ownerId: shopper.id,
      isSample: true,
      placedAt,
      created: now,
      deliveryPostalCode: shopper.deliveryPostalCode,
      items: orderItemsFor(
        purchase.items,
        await this.products.demandMany(productIds),
        await this.productDetails.getMany(productIds),
      ),
    });
  }
}
