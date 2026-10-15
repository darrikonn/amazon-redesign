import type { Order, OrderLine, ProductId } from "@/core";
import { addDays } from "../calendar";
import { isDelivered, trackOrder } from "./order-tracking";

export const RETURN_RULES = {
  // For products whose source states no policy at all.
  defaultWindowDays: 30,
} as const;

// Reads the source's wording: "30 days return policy" is 30 days, "No return policy" is 0.
export function returnWindowDaysFrom(returnPolicy: string | null): number {
  if (returnPolicy === null) return RETURN_RULES.defaultWindowDays;
  if (/^\s*no\b/i.test(returnPolicy)) return 0;
  const days = /(\d+)\s*days?/i.exec(returnPolicy)?.[1];
  return days === undefined ? RETURN_RULES.defaultWindowDays : Number(days);
}

// The last moment a delivered line can be returned, or null if it never can.
export function returnableUntil(order: Order, line: OrderLine, now: Date): Date | null {
  if (line.returnWindowDays <= 0) return null;
  const { deliveredAt } = trackOrder(order, now);
  return addDays(deliveredAt, line.returnWindowDays);
}

export function isReturned(order: Order, productId: ProductId): boolean {
  return order.returns.some((orderReturn) => orderReturn.productIds.includes(productId));
}

export function isReturnable(order: Order, productId: ProductId, now: Date): boolean {
  const line = order.lines.find((candidate) => candidate.productId === productId);
  if (line === undefined || isReturned(order, productId)) return false;
  if (!isDelivered(order, now)) return false;
  const until = returnableUntil(order, line, now);
  return until !== null && now.getTime() <= until.getTime();
}

export type ReturnState =
  | "returned"
  | "never-returnable"
  | "returnable-once-delivered"
  | "returnable"
  | "window-closed";

// Where one line of an order stands on returns, read in the order a shopper would ask.
export function returnStateOf(order: Order, line: OrderLine, now: Date): ReturnState {
  if (isReturned(order, line.productId)) return "returned";
  if (line.returnWindowDays <= 0) return "never-returnable";
  if (!isDelivered(order, now)) return "returnable-once-delivered";
  return isReturnable(order, line.productId, now) ? "returnable" : "window-closed";
}
