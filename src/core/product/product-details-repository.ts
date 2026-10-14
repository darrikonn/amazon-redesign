import type { ProductId } from "./product";
import type { ProductDetails } from "./product-details";

export interface ProductDetailsRepository {
  get(productId: ProductId): Promise<ProductDetails | null>;
  demand(productId: ProductId): Promise<ProductDetails>;
  getMany(productIds: readonly ProductId[]): Promise<ProductDetails[]>;
  demandMany(productIds: readonly ProductId[]): Promise<ProductDetails[]>;
}
