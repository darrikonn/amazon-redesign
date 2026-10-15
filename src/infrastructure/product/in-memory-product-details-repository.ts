import type { ProductDetails, ProductDetailsRepository, ProductId } from "@/core";
import { KeyedRecords } from "../keyed-record";

export type ProductDetailsRepositoryCall = {
  method: "get" | "demand" | "getMany" | "demandMany";
  productIds: readonly ProductId[];
};

export class InMemoryProductDetailsRepository implements ProductDetailsRepository {
  readonly calls: ProductDetailsRepositoryCall[] = [];
  private readonly detailsById = new Map<ProductId, ProductDetails>();
  private readonly details = new KeyedRecords("product details", this.detailsById);

  seedDetails(details: ProductDetails): void {
    this.detailsById.set(details.productId, details);
  }

  seedManyDetails(manyDetails: readonly ProductDetails[]): void {
    for (const details of manyDetails) this.seedDetails(details);
  }

  async get(productId: ProductId): Promise<ProductDetails | null> {
    this.calls.push({ method: "get", productIds: [productId] });
    return this.details.get(productId);
  }

  async demand(productId: ProductId): Promise<ProductDetails> {
    this.calls.push({ method: "demand", productIds: [productId] });
    return this.details.demand(productId);
  }

  async getMany(productIds: readonly ProductId[]): Promise<ProductDetails[]> {
    this.calls.push({ method: "getMany", productIds: [...productIds] });
    return this.details.getMany(productIds);
  }

  async demandMany(productIds: readonly ProductId[]): Promise<ProductDetails[]> {
    this.calls.push({ method: "demandMany", productIds: [...productIds] });
    return this.details.demandMany(productIds);
  }

  reset(): void {
    this.calls.length = 0;
    this.detailsById.clear();
  }
}
