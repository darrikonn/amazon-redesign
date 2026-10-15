import type { Order, OrderId, OrderRepository, ShopperId } from "@/core";
import { createKeyedLoader, createOwnerListLoader, type DataLoader } from "../data-loader";

export function createOrderLoader(
  repository: OrderRepository,
  ownerId: ShopperId,
): DataLoader<OrderId, Order | null> {
  return createKeyedLoader(
    (orderIds) => repository.getMany(ownerId, orderIds),
    (order) => order.id,
  );
}

export function createOrderListLoader(repository: OrderRepository): DataLoader<ShopperId, Order[]> {
  return createOwnerListLoader((ownerId) => repository.listByOwner(ownerId));
}
