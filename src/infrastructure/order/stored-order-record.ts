import type { Order, OrderLine, OrderReturn } from "@/core";
import {
  isCategoryId,
  isReturnReason,
  optionalString,
  requireArray,
  requireNumber,
  requireOneOf,
  requireRecord,
  requireString,
  requireStringArray,
} from "@/core";

// Orders read back from the browser are checked field by field, like the generated files.
export function parseStoredOrder(value: unknown, context: string): Order {
  const record = requireRecord(value, context);
  if (typeof record.isSample !== "boolean") throw new Error(`${context}: expected "isSample"`);
  return {
    id: requireString(record, "id", context),
    ownerId: requireString(record, "ownerId", context),
    isSample: record.isSample,
    placedAt: requireString(record, "placedAt", context),
    deliveryDays: requireNumber(record, "deliveryDays", context),
    deliveryPostalCode: requireString(record, "deliveryPostalCode", context),
    lines: requireArray(record.lines, `${context} lines`).map((line, index) =>
      parseLine(line, `${context} line ${index}`),
    ),
    returns: requireArray(record.returns, `${context} returns`).map((orderReturn, index) =>
      parseReturn(orderReturn, `${context} return ${index}`),
    ),
    created: requireString(record, "created", context),
    modified: optionalString(record, "modified", context),
  };
}

function parseLine(value: unknown, context: string): OrderLine {
  const record = requireRecord(value, context);
  return {
    productId: requireString(record, "productId", context),
    name: requireString(record, "name", context),
    category: requireOneOf(
      requireString(record, "category", context),
      isCategoryId,
      "category",
      context,
    ),
    priceInCents: requireNumber(record, "priceInCents", context),
    quantity: requireNumber(record, "quantity", context),
    returnWindowDays: requireNumber(record, "returnWindowDays", context),
  };
}

function parseReturn(value: unknown, context: string): OrderReturn {
  const record = requireRecord(value, context);
  return {
    productIds: requireStringArray(record, "productIds", context),
    reason: requireOneOf(
      requireString(record, "reason", context),
      isReturnReason,
      "reason",
      context,
    ),
    requestedAt: requireString(record, "requestedAt", context),
  };
}
