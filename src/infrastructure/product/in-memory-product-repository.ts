import type { Product, ProductId, ProductRepository } from "@/core";
import { NotFoundError } from "@/core";

export type ProductRepositoryCall = {
  method: "get" | "demand" | "getMany" | "demandMany" | "list";
  ids: readonly ProductId[];
};

export class InMemoryProductRepository implements ProductRepository {
  readonly calls: ProductRepositoryCall[] = [];
  private readonly productsById = new Map<ProductId, Product>();

  seedProduct(product: Product): void {
    this.productsById.set(product.id, product);
  }

  seedProducts(products: readonly Product[]): void {
    for (const product of products) this.seedProduct(product);
  }

  async get(id: ProductId): Promise<Product | null> {
    this.calls.push({ method: "get", ids: [id] });
    return this.productsById.get(id) ?? null;
  }

  async demand(id: ProductId): Promise<Product> {
    this.calls.push({ method: "demand", ids: [id] });
    return this.find(id);
  }

  async getMany(ids: readonly ProductId[]): Promise<Product[]> {
    this.calls.push({ method: "getMany", ids: [...ids] });
    return ids.flatMap((id) => {
      const product = this.productsById.get(id);
      return product === undefined ? [] : [product];
    });
  }

  async demandMany(ids: readonly ProductId[]): Promise<Product[]> {
    this.calls.push({ method: "demandMany", ids: [...ids] });
    return ids.map((id) => this.find(id));
  }

  async list(): Promise<Product[]> {
    this.calls.push({ method: "list", ids: [] });
    return [...this.productsById.values()];
  }

  reset(): void {
    this.calls.length = 0;
    this.productsById.clear();
  }

  private find(id: ProductId): Product {
    const product = this.productsById.get(id);
    if (product === undefined) throw new NotFoundError("product", id);
    return product;
  }
}
