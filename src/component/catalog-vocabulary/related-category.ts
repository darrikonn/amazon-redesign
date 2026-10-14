import type { CategoryId } from "@/core";

// Departments a shopper browsing one category tends to want next, in order of relevance.
// The browse panel offers these to encourage a second purchase.
export const RELATED_CATEGORIES: Record<CategoryId, readonly CategoryId[]> = {
  phones: ["phone-accessories", "audio", "tablets", "watches"],
  tablets: ["phone-accessories", "laptops", "audio"],
  laptops: ["computer-accessories", "audio", "tablets", "bags"],
  audio: ["phones", "phone-accessories", "laptops"],
  "phone-accessories": ["phones", "audio", "tablets"],
  "computer-accessories": ["laptops", "audio"],
  watches: ["jewellery", "sunglasses", "bags"],
  fragrances: ["makeup", "skincare", "jewellery"],
  makeup: ["skincare", "fragrances"],
  skincare: ["makeup", "fragrances"],
  groceries: ["kitchenware", "home-decor"],
  kitchenware: ["groceries", "home-decor", "furniture"],
  "home-decor": ["furniture", "kitchenware"],
  furniture: ["home-decor", "kitchenware"],
  clothing: ["shoes", "bags", "jewellery", "sunglasses"],
  shoes: ["clothing", "sports", "bags"],
  bags: ["clothing", "shoes", "jewellery"],
  jewellery: ["watches", "fragrances", "bags"],
  sunglasses: ["clothing", "watches", "bags"],
  sports: ["shoes", "clothing"],
  cars: ["motorcycles"],
  motorcycles: ["cars"],
};
