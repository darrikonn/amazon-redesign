import type { Order } from "@/core";
import { DAY_IN_MILLISECONDS, HOUR_IN_MILLISECONDS } from "../calendar";

export const TRACKING_RULES = {
  hoursUntilShipped: 20,
  hoursOutForDeliveryBeforeArrival: 9,
} as const;

export const TRACKING_STAGES = ["ordered", "shipped", "out-for-delivery", "delivered"] as const;

export type TrackingStage = (typeof TRACKING_STAGES)[number];

export type TrackingStep = {
  stage: TrackingStage;
  at: Date;
  isReached: boolean;
};

export type OrderTracking = {
  stage: TrackingStage;
  steps: readonly TrackingStep[];
  deliveredAt: Date;
};

// An order ships within a day (sooner for overnight delivery), goes out for delivery the
// morning it arrives, and arrives after its delivery estimate.
export function trackOrder(
  order: Pick<Order, "placedAt" | "deliveryDays">,
  now: Date,
): OrderTracking {
  const placedAt = new Date(order.placedAt);
  const deliveredAt = later(placedAt, order.deliveryDays * DAY_IN_MILLISECONDS);
  const shippedAt = later(
    placedAt,
    Math.min(
      TRACKING_RULES.hoursUntilShipped * HOUR_IN_MILLISECONDS,
      (deliveredAt.getTime() - placedAt.getTime()) / 2,
    ),
  );
  const outForDeliveryAt = new Date(
    Math.max(
      shippedAt.getTime(),
      deliveredAt.getTime() -
        TRACKING_RULES.hoursOutForDeliveryBeforeArrival * HOUR_IN_MILLISECONDS,
    ),
  );
  const steps = [
    step("ordered", placedAt, now),
    step("shipped", shippedAt, now),
    step("out-for-delivery", outForDeliveryAt, now),
    step("delivered", deliveredAt, now),
  ];
  const reached = steps.filter((entry) => entry.isReached);
  return { stage: reached.at(-1)?.stage ?? "ordered", steps, deliveredAt };
}

export function isOnTheWay(order: Pick<Order, "placedAt" | "deliveryDays">, now: Date): boolean {
  return trackOrder(order, now).stage !== "delivered";
}

function later(date: Date, milliseconds: number): Date {
  return new Date(date.getTime() + milliseconds);
}

function step(stage: TrackingStage, at: Date, now: Date): TrackingStep {
  return { stage, at, isReached: at.getTime() <= now.getTime() };
}
