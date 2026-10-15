import type { CartLine, CartLineRepository, Clock } from "@/core";
import { optionalString, requireNumber, requireRecord, requireString } from "@/core";
import { type KeyValueStorage, StoredProductRecords } from "../storage";

export class StoredCartLineRepository
  extends StoredProductRecords<CartLine>
  implements CartLineRepository
{
  constructor(storage: KeyValueStorage, clock: Clock) {
    super(storage, clock, { name: "cart", label: "cart line", parseRecord: parseCartLine });
  }
}

function parseCartLine(value: unknown, context: string): CartLine {
  const record = requireRecord(value, context);
  return {
    ownerId: requireString(record, "ownerId", context),
    productId: requireString(record, "productId", context),
    quantity: requireNumber(record, "quantity", context),
    created: requireString(record, "created", context),
    modified: optionalString(record, "modified", context),
  };
}
