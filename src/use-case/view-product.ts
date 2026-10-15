import { canBuy, categoryLabel, colorLabel, tagLabel } from "@/component";
import type {
  CategoryId,
  Color,
  Product,
  ProductDetails,
  ProductDetailsRepository,
  ProductId,
  ProductRepository,
} from "@/core";

export type ViewProductRequest = {
  productId: string;
};

export type ProductView = {
  id: ProductId;
  name: string;
  brand: string | null;
  category: CategoryId;
  categoryLabel: string;
  color: Color | null;
  priceInCents: number;
  rating: number;
  deliveryDays: number;
  features: readonly string[];
  description: string | null;
  images: readonly string[];
  availability: AvailabilityView | null;
  facts: readonly ProductFactView[];
  reviews: readonly ReviewView[];
};

export type AvailabilityView = {
  label: string;
  canBuy: boolean;
};

export type ProductFactView = {
  label: string;
  value: string;
};

export type ReviewView = {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
};

// A product that is not in the catalogue, from an old or edited link, gives null so the
// page simply opens nothing (ADR 0029).
export class ViewProduct {
  constructor(
    private readonly products: ProductRepository,
    private readonly details: ProductDetailsRepository,
  ) {}

  async execute(request: ViewProductRequest): Promise<ProductView | null> {
    const [product, details] = await Promise.all([
      this.products.get(request.productId),
      this.details.get(request.productId),
    ]);
    return product === null ? null : toProductView(product, details);
  }
}

function toProductView(product: Product, details: ProductDetails | null): ProductView {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    categoryLabel: categoryLabel(product.category),
    color: product.color,
    priceInCents: product.priceInCents,
    rating: product.rating,
    deliveryDays: product.deliveryDays,
    features: featuresOf(product),
    description: details?.description ?? null,
    images: imagesOf(product, details),
    availability: details === null ? null : availabilityOf(product, details),
    facts: details === null ? [] : factsOf(details),
    reviews: (details?.reviews ?? []).map((review, index) => ({
      id: `${product.id}-review-${index + 1}`,
      ...review,
    })),
  };
}

function featuresOf(product: Product): string[] {
  const color = product.color === null ? [] : [colorLabel(product.color)];
  return [...color, ...product.tags.map(tagLabel)];
}

function imagesOf(product: Product, details: ProductDetails | null): readonly string[] {
  if (details !== null && details.images.length > 0) return details.images;
  return product.image === null ? [] : [product.image];
}

// Whether it can be bought is the cart's rule (canBuy), so the modal and the cart agree.
function availabilityOf(product: Product, details: ProductDetails): AvailabilityView | null {
  const isBuyable = canBuy(product);
  switch (details.availability) {
    case "in-stock":
      return { label: "In stock", canBuy: isBuyable };
    case "low-stock":
      return { label: lowStockLabel(product.stock), canBuy: isBuyable };
    case "out-of-stock":
      return { label: "Out of stock", canBuy: isBuyable };
    case null:
      return null;
  }
}

function lowStockLabel(stock: number | null): string {
  return stock === null || stock <= 0 ? "Low stock" : `Only ${stock} left`;
}

function factsOf(details: ProductDetails): ProductFactView[] {
  const facts: [string, string | null][] = [
    ["Shipping", details.shipping],
    ["Warranty", details.warranty],
    ["Returns", details.returnPolicy],
  ];
  return facts.flatMap(([label, value]) => (value === null ? [] : [{ label, value }]));
}
