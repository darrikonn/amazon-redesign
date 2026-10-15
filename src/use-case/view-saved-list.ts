import type { ProductRepository, SavedItemRepository, SessionStore } from "@/core";
import type { ProductListing } from "./product-listing";
import { toProductListing } from "./product-listing";
import { type SavedListSummary, summarizeSavedList } from "./saved-list-summary";
import { currentShopper } from "./session-shopper";

export type SavedListView = SavedListSummary & {
  listings: readonly ProductListing[];
};

// The most recently saved first; null for a signed-out visitor.
export class ViewSavedList {
  constructor(
    private readonly sessions: SessionStore,
    private readonly savedItems: SavedItemRepository,
    private readonly products: ProductRepository,
  ) {}

  async execute(): Promise<SavedListView | null> {
    const shopper = await currentShopper(this.sessions);
    if (shopper === null) return null;
    const items = (await this.savedItems.listByOwner(shopper.id)).sort((first, second) =>
      second.created.localeCompare(first.created),
    );
    const products = await this.products.getMany(items.map((item) => item.productId));
    return {
      ...summarizeSavedList(products.map((product) => ({ productId: product.id }))),
      listings: products.map((product) => toProductListing(product)),
    };
  }
}
