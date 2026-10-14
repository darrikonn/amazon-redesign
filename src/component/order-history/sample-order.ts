import type { Product, ProductId } from "@/core";
import { stableHash } from "../stable-hash";

export type SamplePurchase = {
  daysAgo: number;
  items: readonly { productId: ProductId; quantity: number }[];
};

// The same email always gets the same products, and no product appears twice.
export function pickSamplePurchases(seed: string, catalog: readonly Product[]): SamplePurchase[] {
  const used = new Set<ProductId>();
  return SAMPLE_PLANS.map((plan, planIndex) => {
    const candidates = catalog
      .filter((product) => plan.fits(product) && !used.has(product.id))
      .sort((first, second) => rank(seed, planIndex, first) - rank(seed, planIndex, second))
      .slice(0, plan.productCount);
    for (const product of candidates) used.add(product.id);
    return {
      daysAgo: plan.daysAgo,
      items: candidates.map((product, index) => ({
        productId: product.id,
        quantity: plan.quantities[index] ?? 1,
      })),
    };
  }).filter((purchase) => purchase.items.length > 0);
}

// Three orders for a new shopper (ADR 0030): one delivered weeks ago, one delivered a few
// days ago and still returnable, and one still on its way. Each plan says how long ago it
// was placed and which delivery estimates fit that story.
const SAMPLE_PLANS = [
  {
    daysAgo: 24,
    productCount: 2,
    quantities: [1, 2],
    fits: (product: Product) => product.deliveryDays <= 14,
  },
  {
    daysAgo: 6,
    productCount: 1,
    quantities: [1],
    fits: (product: Product) => product.deliveryDays <= 4,
  },
  {
    daysAgo: 1,
    productCount: 2,
    quantities: [1, 2],
    fits: (product: Product) => product.deliveryDays >= 3 && product.deliveryDays <= 7,
  },
] as const;

function rank(seed: string, planIndex: number, product: Product): number {
  return stableHash(`${seed}:${planIndex}:${product.id}`);
}
