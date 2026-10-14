import type { ProductDetails, ProductDetailsRepository, ProductId } from "@/core";
import { NotFoundError } from "@/core";

export type ProductDetailsRepositoryCall = {
  method: "get" | "demand" | "getMany" | "demandMany";
  productIds: readonly ProductId[];
};

export class InMemoryProductDetailsRepository implements ProductDetailsRepository {
  readonly calls: ProductDetailsRepositoryCall[] = [];
  private readonly detailsById = new Map<ProductId, ProductDetails>();

  seedDetails(details: ProductDetails): void {
    this.detailsById.set(details.productId, details);
  }

  seedManyDetails(manyDetails: readonly ProductDetails[]): void {
    for (const details of manyDetails) this.seedDetails(details);
  }

  async get(productId: ProductId): Promise<ProductDetails | null> {
    this.calls.push({ method: "get", productIds: [productId] });
    return this.detailsById.get(productId) ?? null;
  }

  async demand(productId: ProductId): Promise<ProductDetails> {
    this.calls.push({ method: "demand", productIds: [productId] });
    return this.find(productId);
  }

  async getMany(productIds: readonly ProductId[]): Promise<ProductDetails[]> {
    this.calls.push({ method: "getMany", productIds: [...productIds] });
    return productIds.flatMap((productId) => {
      const details = this.detailsById.get(productId);
      return details === undefined ? [] : [details];
    });
  }

  async demandMany(productIds: readonly ProductId[]): Promise<ProductDetails[]> {
    this.calls.push({ method: "demandMany", productIds: [...productIds] });
    return productIds.map((productId) => this.find(productId));
  }

  reset(): void {
    this.calls.length = 0;
    this.detailsById.clear();
  }

  private find(productId: ProductId): ProductDetails {
    const details = this.detailsById.get(productId);
    if (details === undefined) throw new NotFoundError("product details", productId);
    return details;
  }
}
