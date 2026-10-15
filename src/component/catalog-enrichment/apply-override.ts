import type { Product } from "@/core";
import type { ProductOverride } from "./override";

export function applyOverrides(
  products: readonly Product[],
  overrides: Readonly<Record<string, ProductOverride>>,
): Product[] {
  return products.map((product) => {
    const override = overrides[String(product.sourceId)];
    return override === undefined ? product : withOverride(product, override);
  });
}

function withOverride(product: Product, override: ProductOverride): Product {
  return {
    ...product,
    ...(override.name === undefined ? {} : { name: override.name }),
    ...(override.category === undefined ? {} : { category: override.category }),
    ...(override.color === undefined ? {} : { color: override.color }),
    ...(override.tags === undefined ? {} : { tags: override.tags }),
    ...(override.deliveryDays === undefined ? {} : { deliveryDays: override.deliveryDays }),
    ...(override.brand === undefined ? {} : { brand: override.brand }),
  };
}
