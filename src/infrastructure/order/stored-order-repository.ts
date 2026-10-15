import type { Clock, Order, OrderRepository } from "@/core";
import { type KeyValueStorage, StoredOwnedRecords } from "../storage";
import { parseStoredOrder } from "./stored-order-record";

export class StoredOrderRepository extends StoredOwnedRecords<Order> implements OrderRepository {
  constructor(storage: KeyValueStorage, clock: Clock) {
    super(storage, clock, {
      name: "orders",
      label: "order",
      keyOf: (order) => order.id,
      parseRecord: parseStoredOrder,
    });
  }
}
