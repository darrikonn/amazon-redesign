import type { Product, ProductId, ProductRepository } from "@/core";
import { NotFoundError } from "@/core";
import { CATALOG } from "./catalog";

export class CatalogProductRepository implements ProductRepository {
  private readonly productsById: ReadonlyMap<ProductId, Product>;

  constructor(products: readonly Product[] = CATALOG) {
    this.productsById = new Map(products.map((product) => [product.id, product]));
  }

  async get(id: ProductId): Promise<Product | null> {
    return this.productsById.get(id) ?? null;
  }

  async demand(id: ProductId): Promise<Product> {
    const product = this.productsById.get(id);
    if (product === undefined) throw new NotFoundError("product", id);
    return product;
  }

  async getMany(ids: readonly ProductId[]): Promise<Product[]> {
    return ids.flatMap((id) => {
      const product = this.productsById.get(id);
      return product === undefined ? [] : [product];
    });
  }

  async demandMany(ids: readonly ProductId[]): Promise<Product[]> {
    return Promise.all(ids.map((id) => this.demand(id)));
  }

  async list(): Promise<Product[]> {
    return [...this.productsById.values()];
  }
}
