import type { Order, OrderId, OrderRepository, ShopperId } from "@/core";
import { DataLoader } from "../data-loader";

export function createOrderLoader(
  repository: OrderRepository,
  ownerId: ShopperId,
): DataLoader<OrderId, Order | null> {
  return new DataLoader(async (orderIds) => {
    const ordersById = new Map(
      (await repository.getMany(ownerId, orderIds)).map((order) => [order.id, order]),
    );
    return orderIds.map((orderId) => ordersById.get(orderId) ?? null);
  });
}

export function createOrderListLoader(repository: OrderRepository): DataLoader<ShopperId, Order[]> {
  return new DataLoader((ownerIds) =>
    Promise.all(ownerIds.map((ownerId) => repository.listByOwner(ownerId))),
  );
}
