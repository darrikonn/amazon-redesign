import {
  deliveryCityFor,
  itemCount,
  type OrderTracking,
  type ReturnState,
  returnableUntil,
  returnStateOf,
  type TrackingStage,
  totalInCents,
  trackOrder,
} from "@/component";
import type {
  CategoryId,
  Order,
  OrderId,
  ProductId,
  ProductRepository,
  ReturnReason,
} from "@/core";
import { RETURN_REASONS } from "@/core";

export type OrderSummaryView = {
  id: OrderId;
  isSample: boolean;
  placedAt: string;
  stage: TrackingStage;
  isOnTheWay: boolean;
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
  returnState: ReturnState;
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
  defaultReturnReason: ReturnReason;
};

const STAGE_LABELS: Record<TrackingStage, string> = {
  ordered: "Ordered",
  shipped: "Shipped",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
};

// The reason a return form starts on, the most common one.
const DEFAULT_RETURN_REASON: ReturnReason = "no-longer-needed";

const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  "no-longer-needed": "No longer needed",
  damaged: "Arrived damaged",
  "wrong-item": "Wrong item was sent",
  "found-better-price": "Found a better price",
};

// Photos are not part of an order's snapshot; they come from the catalogue when shown, and
// a product that has left it is drawn with its category glyph.
export type OrderPhotos = ReadonlyMap<ProductId, string | null>;

export async function photosFor(
  products: ProductRepository,
  orders: readonly Order[],
): Promise<OrderPhotos> {
  const productIds = [
    ...new Set(orders.flatMap((order) => order.lines.map((line) => line.productId))),
  ];
  const found = await products.getMany(productIds);
  return new Map(found.map((product) => [product.id, product.image]));
}

export function toOrderView(order: Order, now: Date, photos: OrderPhotos): OrderView {
  const tracking = trackOrder(order, now);
  return {
    ...summaryOf(order, tracking, now, photos),
    deliveryCity: deliveryCityFor(order.deliveryPostalCode),
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
    defaultReturnReason: DEFAULT_RETURN_REASON,
  };
}

export function toOrderSummaryView(order: Order, now: Date, photos: OrderPhotos): OrderSummaryView {
  return summaryOf(order, trackOrder(order, now), now, photos);
}

function summaryOf(
  order: Order,
  tracking: OrderTracking,
  now: Date,
  photos: OrderPhotos,
): OrderSummaryView {
  return {
    id: order.id,
    isSample: order.isSample,
    placedAt: order.placedAt,
    stage: tracking.stage,
    isOnTheWay: !tracking.isDelivered,
    deliveredAt: tracking.deliveredAt.toISOString(),
    totalInCents: totalInCents(order.lines),
    itemCount: itemCount(order.lines),
    hasReturns: order.returns.length > 0,
    lines: order.lines.map((line) => ({
      productId: line.productId,
      name: line.name,
      category: line.category,
      image: photos.get(line.productId) ?? null,
      priceInCents: line.priceInCents,
      quantity: line.quantity,
      returnState: returnStateOf(order, line, now),
      returnableUntil: returnableUntil(order, line, now)?.toISOString() ?? null,
    })),
  };
}

// Newest first, as order histories read.
export function newestFirst(first: Order, second: Order): number {
  return new Date(second.placedAt).getTime() - new Date(first.placedAt).getTime();
}
