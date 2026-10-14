export const CATEGORY_IDS = [
  "phones",
  "tablets",
  "laptops",
  "audio",
  "phone-accessories",
  "computer-accessories",
  "watches",
  "fragrances",
  "makeup",
  "skincare",
  "groceries",
  "kitchenware",
  "home-decor",
  "furniture",
  "clothing",
  "shoes",
  "bags",
  "jewellery",
  "sunglasses",
  "sports",
  "cars",
  "motorcycles",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export function isCategoryId(value: string): value is CategoryId {
  return CATEGORY_IDS.some((id) => id === value);
}
