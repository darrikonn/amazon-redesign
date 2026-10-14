import type { OrderSummaryView } from "@/use-case";
import { formatDayAndDate } from "./format";

// One line a shopper reads first: where the order is, and when it arrives or arrived.
export function orderStatus(order: Pick<OrderSummaryView, "stage" | "deliveredAt">): string {
  if (order.stage === "delivered") return `Delivered ${formatDayAndDate(order.deliveredAt)}`;
  return `${ARRIVING_PREFIX[order.stage]}${formatDayAndDate(order.deliveredAt)}`;
}

const ARRIVING_PREFIX = {
  ordered: "Arriving ",
  shipped: "Shipped, arriving ",
  "out-for-delivery": "Out for delivery, arriving ",
} as const;
