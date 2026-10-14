import type { CartLine, CartLineRepository, ProductId, ShopperId } from "@/core";
import { NotFoundError, requireNumber, requireRecord, requireString } from "@/core";
import { type KeyValueStorage, StoredCollection } from "../storage";
import { cartLineKey } from "./cart-line-key";

// The cart in the browser's storage (ADR 0030), so it survives moving between pages and
// reloading.
export class StoredCartLineRepository implements CartLineRepository {
  private readonly lines: StoredCollection<CartLine>;

  constructor(storage: KeyValueStorage) {
    this.lines = new StoredCollection(storage, "cart", parseCartLine);
  }

  async get(ownerId: ShopperId, productId: ProductId): Promise<CartLine | null> {
    return this.find(ownerId, productId) ?? null;
  }

  async demand(ownerId: ShopperId, productId: ProductId): Promise<CartLine> {
    const line = this.find(ownerId, productId);
    if (line === undefined) throw new NotFoundError("cart line", cartLineKey(ownerId, productId));
    return line;
  }

  async getMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<CartLine[]> {
    const lines = this.lines.list(ownerId);
    return productIds.flatMap((productId) => lines.filter((line) => line.productId === productId));
  }

  async demandMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<CartLine[]> {
    return Promise.all(productIds.map((productId) => this.demand(ownerId, productId)));
  }

  async listByOwner(ownerId: ShopperId): Promise<CartLine[]> {
    return this.lines.list(ownerId);
  }

  async save(line: CartLine): Promise<void> {
    const others = this.lines
      .list(line.ownerId)
      .filter((stored) => stored.productId !== line.productId);
    this.lines.replace(line.ownerId, [...others, line]);
  }

  async remove(ownerId: ShopperId, productId: ProductId): Promise<void> {
    const kept = this.lines.list(ownerId).filter((line) => line.productId !== productId);
    this.lines.replace(ownerId, kept);
  }

  private find(ownerId: ShopperId, productId: ProductId): CartLine | undefined {
    return this.lines.list(ownerId).find((line) => line.productId === productId);
  }
}

function parseCartLine(value: unknown, context: string): CartLine {
  const record = requireRecord(value, context);
  return {
    ownerId: requireString(record, "ownerId", context),
    productId: requireString(record, "productId", context),
    quantity: requireNumber(record, "quantity", context),
  };
}
