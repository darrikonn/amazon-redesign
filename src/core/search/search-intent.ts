import type { CategoryId } from "../product/category";
import type { Color } from "../product/color";
import type { Feature } from "../product/feature";

export type SearchIntent = {
  category: CategoryId | null;
  minimumPriceInCents: number | null;
  maximumPriceInCents: number | null;
  maximumDeliveryDays: number | null;
  minimumRating: number | null;
  prefersLowestPrice: boolean;
  color: Color | null;
  features: readonly Feature[];
  keywords: readonly string[];
};

export type UnderstoodTermKind =
  | "category"
  | "price"
  | "delivery"
  | "rating"
  | "lowest-price"
  | "color"
  | "feature"
  | "keyword";

export type UnderstoodTerm = {
  kind: UnderstoodTermKind;
  label: string;
  phrase: string;
};

export type Interpretation = {
  intent: SearchIntent;
  terms: readonly UnderstoodTerm[];
};
