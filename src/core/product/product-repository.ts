import type { Product, ProductId } from "./product";

export interface ProductRepository {
  get(id: ProductId): Promise<Product | null>;
  demand(id: ProductId): Promise<Product>;
  getMany(ids: readonly ProductId[]): Promise<Product[]>;
  demandMany(ids: readonly ProductId[]): Promise<Product[]>;
  list(): Promise<Product[]>;
}
