import type { ShopperId } from "../shopper/shopper";
import type { Order, OrderId } from "./order";

export interface OrderRepository {
  get(ownerId: ShopperId, orderId: OrderId): Promise<Order | null>;
  demand(ownerId: ShopperId, orderId: OrderId): Promise<Order>;
  getMany(ownerId: ShopperId, orderIds: readonly OrderId[]): Promise<Order[]>;
  demandMany(ownerId: ShopperId, orderIds: readonly OrderId[]): Promise<Order[]>;
  listByOwner(ownerId: ShopperId): Promise<Order[]>;
  save(order: Order): Promise<void>;
}
