import type { CartLine, CartLineRepository, Clock } from "@/core";
import { InMemoryProductRecords } from "../storage";

export class InMemoryCartLineRepository
  extends InMemoryProductRecords<CartLine>
  implements CartLineRepository
{
  constructor(clock?: Clock) {
    super("cart line", clock);
  }

  seedLine(line: CartLine): void {
    this.seedRecord(line);
  }

  storedLines(): CartLine[] {
    return this.storedRecords();
  }
}
