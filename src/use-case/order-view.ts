import {
  isReturnable,
  isReturned,
  orderItemCount,
  orderTotalInCents,
  returnableUntil,
  type TrackingStage,
  trackOrder,
} from "@/component";
import type { CategoryId, Order, OrderId, ProductId, ReturnReason } from "@/core";
import { RETURN_REASONS } from "@/core";

export type OrderSummaryView = {
  id: OrderId;
  isSample: boolean;
  placedAt: string;
  stage: TrackingStage;
  deliveredAt: string;
  totalInCents: number;
  itemCount: number;
  hasReturns: boolean;
  lines: readonly OrderLineView[];
};

export type OrderLineView = {
  productId: ProductId;
  name: string;
  category: CategoryId;
  image: string | null;
  priceInCents: number;
  quantity: number;
  isReturnable: boolean;
  isReturned: boolean;
  returnableUntil: string | null;
};

export type TrackingStepView = {
  stage: TrackingStage;
  label: string;
  at: string;
  isReached: boolean;
};

export type OrderReturnView = {
  productIds: readonly ProductId[];
  reasonLabel: string;
  requestedAt: string;
};

export type ReturnReasonOption = {
  reason: ReturnReason;
  label: string;
};

export type OrderView = OrderSummaryView & {
  deliveryCity: string | null;
  deliveryPostalCode: string;
  steps: readonly TrackingStepView[];
  returns: readonly OrderReturnView[];
  returnReasons: readonly ReturnReasonOption[];
};

const STAGE_LABELS: Record<TrackingStage, string> = {
  ordered: "Ordered",
  shipped: "Shipped",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
};

const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  "no-longer-needed": "No longer needed",
  damaged: "Arrived damaged",
  "wrong-item": "Wrong item was sent",
  "found-better-price": "Found a better price",
};

export function toOrderView(order: Order, now: Date): OrderView {
  const tracking = trackOrder(order, now);
  return {
    ...toOrderSummaryView(order, now),
    deliveryCity: order.deliveryCity,
    deliveryPostalCode: order.deliveryPostalCode,
    steps: tracking.steps.map((step) => ({
      stage: step.stage,
      label: STAGE_LABELS[step.stage],
      at: step.at.toISOString(),
      isReached: step.isReached,
    })),
    returns: order.returns.map((orderReturn) => ({
      productIds: orderReturn.productIds,
      reasonLabel: RETURN_REASON_LABELS[orderReturn.reason],
      requestedAt: orderReturn.requestedAt,
    })),
    returnReasons: RETURN_REASONS.map((reason) => ({
      reason,
      label: RETURN_REASON_LABELS[reason],
    })),
  };
}

export function toOrderSummaryView(order: Order, now: Date): OrderSummaryView {
  const tracking = trackOrder(order, now);
  return {
    id: order.id,
    isSample: order.isSample,
    placedAt: order.placedAt,
    stage: tracking.stage,
    deliveredAt: tracking.deliveredAt.toISOString(),
    totalInCents: orderTotalInCents(order.lines),
    itemCount: orderItemCount(order.lines),
    hasReturns: order.returns.length > 0,
    lines: order.lines.map((line) => ({
      productId: line.productId,
      name: line.name,
      category: line.category,
      image: line.image,
      priceInCents: line.priceInCents,
      quantity: line.quantity,
      isReturnable: isReturnable(order, line.productId, now),
      isReturned: isReturned(order, line.productId),
      returnableUntil: returnableUntil(order, line, now)?.toISOString() ?? null,
    })),
  };
}

// Newest first, as order histories read.
export function newestFirst(first: Order, second: Order): number {
  return new Date(second.placedAt).getTime() - new Date(first.placedAt).getTime();
}
