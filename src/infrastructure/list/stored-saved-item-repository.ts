import type { Clock, SavedItem, SavedItemRepository } from "@/core";
import { optionalString, requireRecord, requireString } from "@/core";
import { type KeyValueStorage, StoredProductRecords } from "../storage";

export class StoredSavedItemRepository
  extends StoredProductRecords<SavedItem>
  implements SavedItemRepository
{
  constructor(storage: KeyValueStorage, clock: Clock) {
    super(storage, clock, { name: "saved", label: "saved item", parseRecord: parseSavedItem });
  }
}

function parseSavedItem(value: unknown, context: string): SavedItem {
  const record = requireRecord(value, context);
  return {
    ownerId: requireString(record, "ownerId", context),
    productId: requireString(record, "productId", context),
    created: requireString(record, "created", context),
    modified: optionalString(record, "modified", context),
  };
}
