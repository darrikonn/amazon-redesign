import type { Clock, OrderRepository, SessionStore } from "@/core";
import { type OrderView, toOrderView } from "./order-view";
import { currentShopper } from "./session-shopper";

export type ViewOrderRequest = {
  orderId: string;
};

// Null when signed out or when the order is not the shopper's own.
export class ViewOrder {
  constructor(
    private readonly sessions: SessionStore,
    private readonly orders: OrderRepository,
    private readonly clock: Clock,
  ) {}

  async execute(request: ViewOrderRequest): Promise<OrderView | null> {
    const shopper = await currentShopper(this.sessions);
    if (shopper === null) return null;
    const order = await this.orders.get(shopper.id, request.orderId);
    return order === null ? null : toOrderView(order, this.clock.now());
  }
}
