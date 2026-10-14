import type { CategoryId } from "./category";
import type { Color } from "./color";
import type { Feature } from "./feature";
import type { Illustration } from "./illustration";

export type ProductId = string;

export type Product = {
  id: ProductId;
  title: string;
  category: CategoryId;
  priceInCents: number;
  rating: number;
  reviewCount: number;
  deliveryDays: number;
  color: Color;
  features: readonly Feature[];
  illustration: Illustration;
};
