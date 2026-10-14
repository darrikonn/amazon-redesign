import type { CartLine, CartLineRepository, Clock, ProductId, ShopperId } from "@/core";
import { NotFoundError, optionalString, requireNumber, requireRecord, requireString } from "@/core";
import { type KeyValueStorage, StoredCollection, stampModified } from "../storage";
import { cartLineKey } from "./cart-line-key";

export class StoredCartLineRepository implements CartLineRepository {
  private readonly lines: StoredCollection<CartLine>;

  constructor(
    storage: KeyValueStorage,
    private readonly clock: Clock,
  ) {
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

  // Saving over a record keeps its place, so a changed line does not move in the list.
  async save(line: CartLine): Promise<void> {
    const stored = this.lines.list(line.ownerId);
    const existing = stored.find((candidate) => candidate.productId === line.productId);
    const saved = stampModified(line, existing, this.clock.now());
    const next =
      existing === undefined
        ? [...stored, saved]
        : stored.map((candidate) => (candidate === existing ? saved : candidate));
    this.lines.replace(line.ownerId, next);
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
    created: requireString(record, "created", context),
    modified: optionalString(record, "modified", context),
  };
}
