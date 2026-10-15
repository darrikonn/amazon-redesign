import { todaysDeals } from "@/component";
import type { Clock, ProductRepository } from "@/core";
import type { ProductListing } from "./product-listing";
import { toProductListing } from "./product-listing";

export type DealsView = {
  day: string;
  listings: readonly ProductListing[];
};

export class ViewDeals {
  constructor(
    private readonly products: ProductRepository,
    private readonly clock: Clock,
  ) {}

  async execute(): Promise<DealsView> {
    const today = this.clock.now();
    const deals = todaysDeals(await this.products.list(), today);
    return {
      day: today.toISOString().slice(0, 10),
      listings: deals.map((deal) =>
        toProductListing(deal.product, {
          deal: {
            listPriceInCents: deal.listPriceInCents,
            discountPercent: deal.product.discountPercent,
          },
        }),
      ),
    };
  }
}
