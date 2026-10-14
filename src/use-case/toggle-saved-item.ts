import type {
  Clock,
  ProductId,
  ProductRepository,
  SavedItemRepository,
  SessionStore,
} from "@/core";
import { currentShopper } from "./session-shopper";

export type ToggleSavedItemRequest = {
  productId: ProductId;
};

export type SavedListSummary = {
  productIds: readonly ProductId[];
};

export type ToggleSavedItemResult =
  | { status: "saved" | "removed"; list: SavedListSummary }
  | { status: "signed-out" };

export class ToggleSavedItem {
  constructor(
    private readonly sessions: SessionStore,
    private readonly savedItems: SavedItemRepository,
    private readonly products: ProductRepository,
    private readonly clock: Clock,
  ) {}

  async execute(request: ToggleSavedItemRequest): Promise<ToggleSavedItemResult> {
    const shopper = await currentShopper(this.sessions);
    if (shopper === null) return { status: "signed-out" };
    const product = await this.products.demand(request.productId);
    const existing = await this.savedItems.get(shopper.id, product.id);
    if (existing === null) {
      await this.savedItems.save({
        ownerId: shopper.id,
        productId: product.id,
        created: this.clock.now().toISOString(),
        modified: null,
      });
    } else {
      await this.savedItems.remove(shopper.id, product.id);
    }
    const items = await this.savedItems.listByOwner(shopper.id);
    return {
      status: existing === null ? "saved" : "removed",
      list: { productIds: items.map((item) => item.productId) },
    };
  }
}
