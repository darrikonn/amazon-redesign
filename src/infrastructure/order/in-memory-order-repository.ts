import type { Order, OrderId, OrderRepository, ShopperId } from "@/core";
import { NotFoundError } from "@/core";

export type OrderRepositoryCall = {
  method: "get" | "demand" | "getMany" | "demandMany" | "listByOwner" | "save";
  ownerId: ShopperId;
  orderIds: readonly OrderId[];
};

export class InMemoryOrderRepository implements OrderRepository {
  readonly calls: OrderRepositoryCall[] = [];
  private readonly ordersById = new Map<string, Order>();

  seedOrder(order: Order): void {
    this.ordersById.set(order.id, order);
  }

  storedOrders(): Order[] {
    return [...this.ordersById.values()];
  }

  async get(ownerId: ShopperId, orderId: OrderId): Promise<Order | null> {
    this.record("get", ownerId, [orderId]);
    return this.owned(ownerId, orderId) ?? null;
  }

  async demand(ownerId: ShopperId, orderId: OrderId): Promise<Order> {
    this.record("demand", ownerId, [orderId]);
    return this.require(ownerId, orderId);
  }

  async getMany(ownerId: ShopperId, orderIds: readonly OrderId[]): Promise<Order[]> {
    this.record("getMany", ownerId, orderIds);
    return orderIds.flatMap((orderId) => {
      const order = this.owned(ownerId, orderId);
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
    this.ordersById.set(order.id, order);
  }

  reset(): void {
    this.calls.length = 0;
    this.ordersById.clear();
  }

  private record(
    method: OrderRepositoryCall["method"],
    ownerId: ShopperId,
    orderIds: readonly OrderId[],
  ): void {
    this.calls.push({ method, ownerId, orderIds: [...orderIds] });
  }

  // Another shopper's order is as invisible as one that does not exist.
  private owned(ownerId: ShopperId, orderId: OrderId): Order | undefined {
    const order = this.ordersById.get(orderId);
    return order?.ownerId === ownerId ? order : undefined;
  }

  private require(ownerId: ShopperId, orderId: OrderId): Order {
    const order = this.owned(ownerId, orderId);
    if (order === undefined) throw new NotFoundError("order", orderId);
    return order;
  }
}
