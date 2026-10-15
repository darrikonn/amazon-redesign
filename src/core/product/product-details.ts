import { isOneOf } from "../literal/is-one-of";
import type { ProductId } from "./product";

export const AVAILABILITIES = ["in-stock", "low-stock", "out-of-stock"] as const;

export type Availability = (typeof AVAILABILITIES)[number];

export type ProductReview = {
  reviewerName: string;
  rating: number;
  comment: string;
  // A calendar date, YYYY-MM-DD.
  date: string;
};

// What a shopper reads about one product; kept apart from Product so search never
// downloads it (ADR 0029). Facts the source does not have are null.
export type ProductDetails = {
  productId: ProductId;
  description: string;
  images: readonly string[];
  availability: Availability | null;
  stock: number | null;
  shipping: string | null;
  warranty: string | null;
  returnPolicy: string | null;
  reviews: readonly ProductReview[];
};

export function isAvailability(value: string): value is Availability {
  return isOneOf(AVAILABILITIES, value);
}
