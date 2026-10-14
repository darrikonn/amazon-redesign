import type { CategoryId } from "../product/category";
import type { Color } from "../product/color";
import type { Tag } from "../product/tag";

export type SearchIntent = {
  category: CategoryId | null;
  minimumPriceInCents: number | null;
  maximumPriceInCents: number | null;
  maximumDeliveryDays: number | null;
  minimumRating: number | null;
  prefersLowestPrice: boolean;
  color: Color | null;
  tags: readonly Tag[];
  keywords: readonly string[];
};

export type UnderstoodTermKind =
  | "category"
  | "price"
  | "delivery"
  | "rating"
  | "lowest-price"
  | "color"
  | "tag"
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
