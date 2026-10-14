import type { Tag } from "@/core";

export type TagRule = {
  label: string;
  inSentence: string;
  keywords: readonly string[];
};

// Keywords are matched as whole words against a product's source tags, title, and
// description, and are also what the search bar understands. The first keyword is
// the phrase a suggestion adds to the query.
export const TAG_RULES: Record<Tag, TagRule> = {
  wireless: rule("Wireless", ["wireless", "bluetooth", "cordless"]),
  "noise-cancelling": rule("Noise cancelling", [
    "noise cancelling",
    "noise canceling",
    "noise-cancelling",
    "active noise",
  ]),
  "fast-charging": rule("Fast charging", ["fast charging", "fast-charging", "quick charge"]),
  waterproof: rule("Waterproof", ["waterproof", "water resistant", "water-resistant"]),
  leather: rule("Leather", ["leather"]),
  cotton: rule("Cotton", ["cotton"]),
  organic: rule("Organic", ["organic"]),
  vegan: rule("Vegan", ["vegan"]),
  steel: rule("Steel", ["steel", "stainless steel"]),
  gaming: rule("Gaming", ["gaming"]),
  "4k": { label: "4K", inSentence: "4K", keywords: ["4k"] },
  ssd: { label: "SSD", inSentence: "SSD", keywords: ["ssd"] },
  oled: { label: "OLED", inSentence: "OLED", keywords: ["oled"] },
  slim: rule("Slim", ["slim"]),
  portable: rule("Portable", ["portable", "on-the-go"]),
  unisex: rule("Unisex", ["unisex"]),
  "long-lasting": rule("Long-lasting", ["long-lasting", "long lasting"]),
  wooden: rule("Wooden", ["wooden", "wood", "bamboo"]),
  glass: rule("Glass", ["glass"]),
  luxury: rule("Luxury", ["luxury", "luxurious"]),
  compact: rule("Compact", ["compact"]),
  lightweight: rule("Lightweight", ["lightweight", "light weight"]),
  ergonomic: rule("Ergonomic", ["ergonomic"]),
  fresh: rule("Fresh", ["fresh"]),
  smart: rule("Smart", ["smart"]),
  floral: rule("Floral", ["floral"]),
  elegant: rule("Elegant", ["elegant"]),
  casual: rule("Casual", ["casual"]),
  durable: rule("Durable", ["durable"]),
  camera: rule("Camera", ["camera"]),
  magsafe: { label: "MagSafe", inSentence: "MagSafe", keywords: ["magsafe"] },
  retina: rule("Retina display", ["retina"]),
  fruit: rule("Fruit", ["fruit", "fruits"]),
  vegetables: rule("Vegetables", ["vegetables", "vegetable"]),
  drinks: rule("Drinks", ["drinks", "drink", "beverages", "beverage"]),
  dairy: rule("Dairy", ["dairy"]),
  meat: rule("Meat", ["meat", "beef", "chicken"]),
  "pet-food": rule("Pet food", ["pet food", "pet supplies", "cat food", "dog food"]),
  women: rule("For women", ["women", "women's", "women’s", "womens", "woman", "ladies"]),
  men: rule("For men", ["men", "men's", "men’s", "mens"]),
  sport: rule("Sport", ["sport", "sports", "athletic"]),
  cricket: rule("Cricket", ["cricket"]),
  baseball: rule("Baseball", ["baseball"]),
  basketball: rule("Basketball", ["basketball"]),
  tennis: rule("Tennis", ["tennis"]),
  golf: rule("Golf", ["golf"]),
};

function rule(label: string, keywords: readonly string[]): TagRule {
  return { label, inSentence: label.toLowerCase(), keywords };
}
