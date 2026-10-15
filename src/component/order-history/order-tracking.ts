import type { Order } from "@/core";
import { addMilliseconds, DAY_IN_MILLISECONDS, HOUR_IN_MILLISECONDS } from "../calendar";

const TRACKING_RULES = {
  hoursUntilShipped: 20,
  hoursOutForDeliveryBeforeArrival: 9,
} as const;

const TRACKING_STAGES = ["ordered", "shipped", "out-for-delivery", "delivered"] as const;

export type TrackingStage = (typeof TRACKING_STAGES)[number];

export type TrackingStep = {
  stage: TrackingStage;
  at: Date;
  isReached: boolean;
};

type Delivery = Pick<Order, "placedAt" | "deliveryDays">;

export type OrderTracking = {
  stage: TrackingStage;
  isDelivered: boolean;
  steps: readonly TrackingStep[];
  deliveredAt: Date;
};

export function trackOrder(order: Delivery, now: Date): OrderTracking {
  const times = stageTimes(order);
  const steps = TRACKING_STAGES.map((stage) => step(stage, times[stage], now));
  const stage = steps.filter((entry) => entry.isReached).at(-1)?.stage ?? "ordered";
  return { stage, isDelivered: stage === "delivered", steps, deliveredAt: times.delivered };
}

// An order ships within a day (sooner for overnight delivery), goes out for delivery the
// morning it arrives, and arrives after its delivery estimate.
function stageTimes(order: Delivery): Record<TrackingStage, Date> {
  const ordered = new Date(order.placedAt);
  const delivered = addMilliseconds(ordered, order.deliveryDays * DAY_IN_MILLISECONDS);
  const shipped = addMilliseconds(
    ordered,
    Math.min(
      TRACKING_RULES.hoursUntilShipped * HOUR_IN_MILLISECONDS,
      (delivered.getTime() - ordered.getTime()) / 2,
    ),
  );
  const outForDelivery = new Date(
    Math.max(
      shipped.getTime(),
      delivered.getTime() - TRACKING_RULES.hoursOutForDeliveryBeforeArrival * HOUR_IN_MILLISECONDS,
    ),
  );
  return { ordered, shipped, "out-for-delivery": outForDelivery, delivered };
}

export function isDelivered(order: Delivery, now: Date): boolean {
  return trackOrder(order, now).isDelivered;
}

export function isOnTheWay(order: Delivery, now: Date): boolean {
  return !isDelivered(order, now);
}

function step(stage: TrackingStage, at: Date, now: Date): TrackingStep {
  return { stage, at, isReached: at.getTime() <= now.getTime() };
}
