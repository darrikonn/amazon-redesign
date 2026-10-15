import { newSavedItem } from "@/component";
import type {
  Clock,
  ProductId,
  ProductRepository,
  SavedItemRepository,
  SessionStore,
} from "@/core";
import { type SavedListSummary, summarizeSavedList } from "./saved-list-summary";
import { currentShopper } from "./session-shopper";

export type ToggleSavedItemRequest = {
  productId: ProductId;
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
      await this.savedItems.save(newSavedItem(shopper.id, product.id, this.clock.now()));
    } else {
      await this.savedItems.remove(shopper.id, product.id);
    }
    const items = await this.savedItems.listByOwner(shopper.id);
    return {
      status: existing === null ? "saved" : "removed",
      list: summarizeSavedList(items),
    };
  }
}
