import type { Clock, Order, OrderId, OrderRepository, ShopperId } from "@/core";
import { NotFoundError } from "@/core";
import { FixedClock } from "../clock";
import { stampModified } from "../storage";

export type OrderRepositoryCall = {
  method: "get" | "demand" | "getMany" | "demandMany" | "listByOwner" | "save";
  ownerId: ShopperId;
  orderIds: readonly OrderId[];
};

// Order ids are only unique per shopper, so orders are kept by owner and id together, as
// the stored repository keeps one list per owner.
export class InMemoryOrderRepository implements OrderRepository {
  readonly calls: OrderRepositoryCall[] = [];
  private readonly ordersByKey = new Map<string, Order>();

  constructor(private readonly clock: Clock = new FixedClock()) {}

  seedOrder(order: Order): void {
    this.ordersByKey.set(orderKey(order.ownerId, order.id), order);
  }

  storedOrders(): Order[] {
    return [...this.ordersByKey.values()];
  }

  async get(ownerId: ShopperId, orderId: OrderId): Promise<Order | null> {
    this.record("get", ownerId, [orderId]);
    return this.ordersByKey.get(orderKey(ownerId, orderId)) ?? null;
  }

  async demand(ownerId: ShopperId, orderId: OrderId): Promise<Order> {
    this.record("demand", ownerId, [orderId]);
    return this.require(ownerId, orderId);
  }

  async getMany(ownerId: ShopperId, orderIds: readonly OrderId[]): Promise<Order[]> {
    this.record("getMany", ownerId, orderIds);
    return orderIds.flatMap((orderId) => {
      const order = this.ordersByKey.get(orderKey(ownerId, orderId));
      return order === undefined ? [] : [order];
    });
  }

  async demandMany(ownerId: ShopperId, orderIds: readonly OrderId[]): Promise<Order[]> {
    this.record("demandMany", ownerId, orderIds);
    return orderIds.map((orderId) => this.require(ownerId, orderId));
  }

  async listByOwner(ownerId: ShopperId): Promise<Order[]> {
    this.record("listByOwner", ownerId, []);
    return this.storedOrders().filter((order) => order.ownerId === ownerId);
  }

  async save(order: Order): Promise<void> {
    this.record("save", order.ownerId, [order.id]);
    const key = orderKey(order.ownerId, order.id);
    this.ordersByKey.set(key, stampModified(order, this.ordersByKey.get(key), this.clock.now()));
  }

  reset(): void {
    this.calls.length = 0;
    this.ordersByKey.clear();
  }

  private record(
    method: OrderRepositoryCall["method"],
    ownerId: ShopperId,
    orderIds: readonly OrderId[],
  ): void {
    this.calls.push({ method, ownerId, orderIds: [...orderIds] });
  }

  private require(ownerId: ShopperId, orderId: OrderId): Order {
    const order = this.ordersByKey.get(orderKey(ownerId, orderId));
    if (order === undefined) throw new NotFoundError("order", orderId);
    return order;
  }
}

function orderKey(ownerId: ShopperId, orderId: OrderId): string {
  return JSON.stringify([ownerId, orderId]);
}
