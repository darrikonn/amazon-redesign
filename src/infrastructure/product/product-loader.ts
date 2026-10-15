import type { CategoryId, Product, ProductId, ProductRepository } from "@/core";
import { createKeyedLoader, DataLoader } from "../data-loader";

export function createProductLoader(
  repository: ProductRepository,
): DataLoader<ProductId, Product | null> {
  return createKeyedLoader(
    (ids) => repository.getMany(ids),
    (product) => product.id,
  );
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
