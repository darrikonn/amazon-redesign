import type { Clock, SavedItem, SavedItemRepository } from "@/core";
import { InMemoryProductRecords } from "../storage";

export class InMemorySavedItemRepository
  extends InMemoryProductRecords<SavedItem>
  implements SavedItemRepository
{
  constructor(clock?: Clock) {
    super("saved item", clock);
  }

  seedItem(item: SavedItem): void {
    this.seedRecord(item);
  }

  storedItems(): SavedItem[] {
    return this.storedRecords();
  }
}
