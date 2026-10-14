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

  // Saving over a record keeps its place, so a changed line does not move in the list.
  async save(order: Order): Promise<void> {
    const stored = this.orders.list(order.ownerId);
    const existing = stored.find((candidate) => candidate.id === order.id);
    const saved = stampModified(order, existing, this.clock.now());
    const next =
      existing === undefined
        ? [...stored, saved]
        : stored.map((candidate) => (candidate === existing ? saved : candidate));
    this.orders.replace(order.ownerId, next);
  }

  private find(ownerId: ShopperId, orderId: OrderId): Order | undefined {
    return this.orders.list(ownerId).find((order) => order.id === orderId);
  }
}
