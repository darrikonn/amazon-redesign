import type { Clock, Order, OrderRepository } from "@/core";
import { InMemoryOwnedRecords } from "../storage";

// Order ids are only unique per shopper, so orders are kept by owner and id together, as
// the stored repository keeps one list per owner.
export class InMemoryOrderRepository
  extends InMemoryOwnedRecords<Order>
  implements OrderRepository
{
  constructor(clock?: Clock) {
    super("order", (order) => order.id, clock);
  }

  seedOrder(order: Order): void {
    this.seedRecord(order);
  }

  storedOrders(): Order[] {
    return this.storedRecords();
  }
}
