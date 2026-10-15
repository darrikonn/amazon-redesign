import { isOnTheWay } from "@/component";
import type { Clock, OrderRepository, ProductRepository, SessionStore } from "@/core";
import { isOneOf } from "@/core";
import {
  catalogueFactsFor,
  newestFirst,
  type OrderSummaryView,
  toOrderSummaryView,
} from "./order-view";
import { currentShopper } from "./session-shopper";

export const ORDER_FILTERS = ["all", "on-the-way"] as const;

export type OrderFilter = (typeof ORDER_FILTERS)[number];

export type ListOrdersRequest = {
  show: string;
};

export type OrderListView = {
  show: OrderFilter;
  orders: readonly OrderSummaryView[];
};

// Null for a signed-out visitor.
export class ListOrders {
  constructor(
    private readonly sessions: SessionStore,
    private readonly orders: OrderRepository,
    private readonly products: ProductRepository,
    private readonly clock: Clock,
  ) {}

  async execute(request: ListOrdersRequest): Promise<OrderListView | null> {
    const shopper = await currentShopper(this.sessions);
    if (shopper === null) return null;
    const show = isOrderFilter(request.show) ? request.show : "all";
    const now = this.clock.now();
    const orders = (await this.orders.listByOwner(shopper.id))
      .filter((order) => show === "all" || isOnTheWay(order, now))
      .sort(newestFirst);
    const facts = await catalogueFactsFor(this.products, orders);
    return { show, orders: orders.map((order) => toOrderSummaryView(order, now, facts)) };
  }
}

export function isOrderFilter(value: string): value is OrderFilter {
  return isOneOf(ORDER_FILTERS, value);
}
