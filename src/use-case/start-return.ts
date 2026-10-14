import { isReturnable } from "@/component";
import type { Clock, OrderRepository, ProductRepository, SessionStore } from "@/core";
import { isReturnReason } from "@/core";
import { type OrderView, photosFor, toOrderView } from "./order-view";
import { currentShopper } from "./session-shopper";

export type StartReturnRequest = {
  orderId: string;
  productIds: readonly string[];
  reason: string;
};

export type StartReturnResult =
  | { status: "started"; order: OrderView }
  | { status: "not-returnable" }
  | { status: "not-found" };

// Every chosen line must still be returnable; one that is not stops the whole return so
// the shopper is never told a return started for part of what they picked.
export class StartReturn {
  constructor(
    private readonly sessions: SessionStore,
    private readonly orders: OrderRepository,
    private readonly products: ProductRepository,
    private readonly clock: Clock,
  ) {}

  async execute(request: StartReturnRequest): Promise<StartReturnResult> {
    const shopper = await currentShopper(this.sessions);
    if (shopper === null) return { status: "not-found" };
    const order = await this.orders.get(shopper.id, request.orderId);
    if (order === null) return { status: "not-found" };
    const now = this.clock.now();
    const productIds = [...new Set(request.productIds)];
    const { reason } = request;
    const allReturnable = productIds.every((productId) => isReturnable(order, productId, now));
    if (!isReturnReason(reason) || productIds.length === 0 || !allReturnable) {
      return { status: "not-returnable" };
    }
    const updated = {
      ...order,
      returns: [...order.returns, { productIds, reason, requestedAt: now.toISOString() }],
    };
    await this.orders.save(updated);
    const saved = await this.orders.demand(shopper.id, updated.id);
    return {
      status: "started",
      order: toOrderView(saved, now, await photosFor(this.products, [saved])),
    };
  }
}
