import type { CartLine, CartLineRepository, ProductId, ShopperId } from "@/core";
import { NotFoundError } from "@/core";
import { cartLineKey } from "./cart-line-key";

export class SessionCartLineRepository implements CartLineRepository {
  private readonly linesByKey = new Map<string, CartLine>();

  async get(ownerId: ShopperId, productId: ProductId): Promise<CartLine | null> {
    return this.linesByKey.get(cartLineKey(ownerId, productId)) ?? null;
  }

  async demand(ownerId: ShopperId, productId: ProductId): Promise<CartLine> {
    const line = this.linesByKey.get(cartLineKey(ownerId, productId));
    if (line === undefined) throw new NotFoundError("cart line", cartLineKey(ownerId, productId));
    return line;
  }

  async getMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<CartLine[]> {
    return productIds.flatMap((productId) => {
      const line = this.linesByKey.get(cartLineKey(ownerId, productId));
      return line === undefined ? [] : [line];
    });
  }

  async demandMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<CartLine[]> {
    return Promise.all(productIds.map((productId) => this.demand(ownerId, productId)));
  }

  async listByOwner(ownerId: ShopperId): Promise<CartLine[]> {
    return [...this.linesByKey.values()].filter((line) => line.ownerId === ownerId);
  }

  async save(line: CartLine): Promise<void> {
    this.linesByKey.set(cartLineKey(line.ownerId, line.productId), line);
  }

  async remove(ownerId: ShopperId, productId: ProductId): Promise<void> {
    this.linesByKey.delete(cartLineKey(ownerId, productId));
  }
}
