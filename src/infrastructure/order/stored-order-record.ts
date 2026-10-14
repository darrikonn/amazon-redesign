import type { Order, OrderLine, OrderReturn } from "@/core";
import {
  isCategoryId,
  isReturnReason,
  optionalString,
  requireArray,
  requireNumber,
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
    deliveryCity: optionalString(record, "deliveryCity", context),
    deliveryPostalCode: requireString(record, "deliveryPostalCode", context),
    lines: requireArray(record.lines, `${context} lines`).map((line, index) =>
      parseLine(line, `${context} line ${index}`),
    ),
    returns: requireArray(record.returns, `${context} returns`).map((orderReturn, index) =>
      parseReturn(orderReturn, `${context} return ${index}`),
    ),
  };
}

function parseLine(value: unknown, context: string): OrderLine {
  const record = requireRecord(value, context);
  const category = requireString(record, "category", context);
  if (!isCategoryId(category)) throw new Error(`${context}: unknown category "${category}"`);
  return {
    productId: requireString(record, "productId", context),
    name: requireString(record, "name", context),
    category,
    image: optionalString(record, "image", context),
    priceInCents: requireNumber(record, "priceInCents", context),
    quantity: requireNumber(record, "quantity", context),
    returnWindowDays: requireNumber(record, "returnWindowDays", context),
  };
}

function parseReturn(value: unknown, context: string): OrderReturn {
  const record = requireRecord(value, context);
  const reason = requireString(record, "reason", context);
  if (!isReturnReason(reason)) throw new Error(`${context}: unknown reason "${reason}"`);
  return {
    productIds: requireStringArray(record, "productIds", context),
    reason,
    requestedAt: requireString(record, "requestedAt", context),
  };
}
