import type { ProductDetails, ProductDetailsRepository, ProductId, ProductReview } from "@/core";
import { DataLoader } from "../data-loader";

export function createProductDetailsLoader(
  repository: ProductDetailsRepository,
): DataLoader<ProductId, ProductDetails | null> {
  return new DataLoader(async (productIds) => {
    const detailsById = await detailsByProductId(repository, productIds);
    return productIds.map((productId) => detailsById.get(productId) ?? null);
  });
}

export function createProductReviewListLoader(
  repository: ProductDetailsRepository,
): DataLoader<ProductId, readonly ProductReview[]> {
  return new DataLoader(async (productIds) => {
    const detailsById = await detailsByProductId(repository, productIds);
    return productIds.map((productId) => detailsById.get(productId)?.reviews ?? []);
  });
}

async function detailsByProductId(
  repository: ProductDetailsRepository,
  productIds: readonly ProductId[],
): Promise<ReadonlyMap<ProductId, ProductDetails>> {
  const found = await repository.getMany(productIds);
  return new Map(found.map((details) => [details.productId, details]));
}
