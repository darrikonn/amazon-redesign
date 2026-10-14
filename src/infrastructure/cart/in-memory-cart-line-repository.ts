import type { CartLine, CartLineRepository, Clock, ProductId, ShopperId } from "@/core";
import { NotFoundError } from "@/core";
import { FixedClock } from "../clock";
import { stampModified } from "../storage";
import { cartLineKey } from "./cart-line-key";

export type CartLineRepositoryCall = {
  method: "get" | "demand" | "getMany" | "demandMany" | "listByOwner" | "save" | "remove";
  ownerId: ShopperId;
  productIds: readonly ProductId[];
};

export class InMemoryCartLineRepository implements CartLineRepository {
  readonly calls: CartLineRepositoryCall[] = [];
  private readonly linesByKey = new Map<string, CartLine>();

  constructor(private readonly clock: Clock = new FixedClock()) {}

  seedLine(line: CartLine): void {
    this.linesByKey.set(cartLineKey(line.ownerId, line.productId), line);
  }

  storedLines(): CartLine[] {
    return [...this.linesByKey.values()];
  }

  async get(ownerId: ShopperId, productId: ProductId): Promise<CartLine | null> {
    this.record("get", ownerId, [productId]);
    return this.linesByKey.get(cartLineKey(ownerId, productId)) ?? null;
  }

  async demand(ownerId: ShopperId, productId: ProductId): Promise<CartLine> {
    this.record("demand", ownerId, [productId]);
    return this.find(ownerId, productId);
  }

  async getMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<CartLine[]> {
    this.record("getMany", ownerId, productIds);
    return productIds.flatMap((productId) => {
      const line = this.linesByKey.get(cartLineKey(ownerId, productId));
      return line === undefined ? [] : [line];
    });
  }

  async demandMany(ownerId: ShopperId, productIds: readonly ProductId[]): Promise<CartLine[]> {
    this.record("demandMany", ownerId, productIds);
    return productIds.map((productId) => this.find(ownerId, productId));
  }

  async listByOwner(ownerId: ShopperId): Promise<CartLine[]> {
    this.record("listByOwner", ownerId, []);
    return [...this.linesByKey.values()].filter((line) => line.ownerId === ownerId);
  }

  async save(line: CartLine): Promise<void> {
    this.record("save", line.ownerId, [line.productId]);
    const key = cartLineKey(line.ownerId, line.productId);
    this.linesByKey.set(key, stampModified(line, this.linesByKey.get(key), this.clock.now()));
  }

  async remove(ownerId: ShopperId, productId: ProductId): Promise<void> {
    this.record("remove", ownerId, [productId]);
    this.linesByKey.delete(cartLineKey(ownerId, productId));
  }

  reset(): void {
    this.calls.length = 0;
    this.linesByKey.clear();
  }

  private record(
    method: CartLineRepositoryCall["method"],
    ownerId: ShopperId,
    productIds: readonly ProductId[],
  ): void {
    this.calls.push({ method, ownerId, productIds: [...productIds] });
  }

  private find(ownerId: ShopperId, productId: ProductId): CartLine {
    const line = this.linesByKey.get(cartLineKey(ownerId, productId));
    if (line === undefined) throw new NotFoundError("cart line", cartLineKey(ownerId, productId));
    return line;
  }
}
