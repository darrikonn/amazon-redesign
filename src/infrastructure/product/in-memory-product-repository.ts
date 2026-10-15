import type { Product, ProductId, ProductRepository } from "@/core";
import { KeyedRecords } from "../keyed-record";

export type ProductRepositoryCall = {
  method: "get" | "demand" | "getMany" | "demandMany" | "list";
  ids: readonly ProductId[];
};

export class InMemoryProductRepository implements ProductRepository {
  readonly calls: ProductRepositoryCall[] = [];
  private readonly productsById = new Map<ProductId, Product>();
  private readonly products = new KeyedRecords("product", this.productsById);

  seedProduct(product: Product): void {
    this.productsById.set(product.id, product);
  }

  seedProducts(products: readonly Product[]): void {
    for (const product of products) this.seedProduct(product);
  }

  async get(id: ProductId): Promise<Product | null> {
    this.calls.push({ method: "get", ids: [id] });
    return this.products.get(id);
  }

  async demand(id: ProductId): Promise<Product> {
    this.calls.push({ method: "demand", ids: [id] });
    return this.products.demand(id);
  }

  async getMany(ids: readonly ProductId[]): Promise<Product[]> {
    this.calls.push({ method: "getMany", ids: [...ids] });
    return this.products.getMany(ids);
  }

  async demandMany(ids: readonly ProductId[]): Promise<Product[]> {
    this.calls.push({ method: "demandMany", ids: [...ids] });
    return this.products.demandMany(ids);
  }

  async list(): Promise<Product[]> {
    this.calls.push({ method: "list", ids: [] });
    return this.products.values();
  }

  reset(): void {
    this.calls.length = 0;
    this.productsById.clear();
  }
}
