import type { Product, ProductId, ProductRepository } from "@/core";
import { KeyedRecords } from "../keyed-record";
import { CATALOG } from "./catalog";

export class CatalogProductRepository implements ProductRepository {
  private readonly products: KeyedRecords<ProductId, Product>;

  constructor(products: readonly Product[] = CATALOG) {
    this.products = new KeyedRecords(
      "product",
      new Map(products.map((product) => [product.id, product])),
    );
  }

  async get(id: ProductId): Promise<Product | null> {
    return this.products.get(id);
  }

  async demand(id: ProductId): Promise<Product> {
    return this.products.demand(id);
  }

  async getMany(ids: readonly ProductId[]): Promise<Product[]> {
    return this.products.getMany(ids);
  }

  async demandMany(ids: readonly ProductId[]): Promise<Product[]> {
    return this.products.demandMany(ids);
  }

  async list(): Promise<Product[]> {
    return this.products.values();
  }
}
