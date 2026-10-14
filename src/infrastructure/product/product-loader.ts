import type { CategoryId, Product, ProductId, ProductRepository } from "@/core";
import { DataLoader } from "../data-loader";

export function createProductLoader(
  repository: ProductRepository,
): DataLoader<ProductId, Product | null> {
  return new DataLoader(async (ids) => {
    const productsById = new Map(
      (await repository.getMany(ids)).map((product) => [product.id, product]),
    );
    return ids.map((id) => productsById.get(id) ?? null);
  });
}

export function createProductListLoader(
  repository: ProductRepository,
): DataLoader<CategoryId, Product[]> {
  return new DataLoader(async (categories) => {
    const products = await repository.list();
    return categories.map((category) =>
      products.filter((product) => product.category === category),
    );
  });
}
