import type { Clock, Order, OrderId, OrderRepository, ShopperId } from "@/core";
import { NotFoundError } from "@/core";
import { type KeyValueStorage, StoredCollection, stampModified } from "../storage";
import { parseStoredOrder } from "./stored-order-record";

export class StoredOrderRepository implements OrderRepository {
  private readonly orders: StoredCollection<Order>;

  constructor(
    storage: KeyValueStorage,
    private readonly clock: Clock,
  ) {
    this.orders = new StoredCollection(storage, "orders", parseStoredOrder);
  }

  async get(ownerId: ShopperId, orderId: OrderId): Promise<Order | null> {
    return this.find(ownerId, orderId) ?? null;
  }

  async demand(ownerId: ShopperId, orderId: OrderId): Promise<Order> {
    const order = this.find(ownerId, orderId);
    if (order === undefined) throw new NotFoundError("order", orderId);
    return order;
  }

  async getMany(ownerId: ShopperId, orderIds: readonly OrderId[]): Promise<Order[]> {
    const orders = this.orders.list(ownerId);
    return orderIds.flatMap((orderId) => orders.filter((order) => order.id === orderId));
  }

  async demandMany(ownerId: ShopperId, orderIds: readonly OrderId[]): Promise<Order[]> {
    return Promise.all(orderIds.map((orderId) => this.demand(ownerId, orderId)));
  }

  async listByOwner(ownerId: ShopperId): Promise<Order[]> {
    return this.orders.list(ownerId);
  }

  async save(order: Order): Promise<void> {
    this.orders.upsert(
      order,
      (stored) => stored.id === order.id,
      (existing) => stampModified(order, existing, this.clock.now()),
    );
  }

  private find(ownerId: ShopperId, orderId: OrderId): Order | undefined {
    return this.orders.list(ownerId).find((order) => order.id === orderId);
  }
}
