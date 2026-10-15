import { isOneOf } from "../literal/is-one-of";
import type { CategoryId } from "../product/category";
import type { ProductId } from "../product/product";
import type { ShopperId } from "../shopper/shopper";

export type OrderId = string;

export const RETURN_REASONS = [
  "no-longer-needed",
  "damaged",
  "wrong-item",
  "found-better-price",
] as const;

export type ReturnReason = (typeof RETURN_REASONS)[number];

// A snapshot taken when the order is placed, so later catalogue changes never rewrite
// what was bought (ADR 0030). The photo is not part of it: it is looked up when shown.
export type OrderLine = {
  productId: ProductId;
  name: string;
  category: CategoryId;
  priceInCents: number;
  quantity: number;
  returnWindowDays: number;
};

export type OrderReturn = {
  productIds: readonly ProductId[];
  reason: ReturnReason;
  requestedAt: string;
};

export type Order = {
  id: OrderId;
  ownerId: ShopperId;
  isSample: boolean;
  placedAt: string;
  deliveryDays: number;
  deliveryPostalCode: string;
  lines: readonly OrderLine[];
  returns: readonly OrderReturn[];
  created: string;
  // Null until the order is first changed, then set by the repository (ADR 0007).
  modified: string | null;
};

export function isReturnReason(value: string): value is ReturnReason {
  return isOneOf(RETURN_REASONS, value);
}
