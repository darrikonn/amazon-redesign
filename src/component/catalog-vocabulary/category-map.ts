import type { CategoryId } from "@/core";

export type CategoryDefinition = {
  label: string;
  plural: string;
  synonyms: readonly string[];
  sourceCategories: readonly string[];
};

export type CategoryRefinement = {
  sourceCategory: string;
  titleWords: readonly string[];
  category: CategoryId;
};

// Shopper-facing groups. `synonyms` is what the search bar understands; it always
// includes the plural and the label so suggestions read back as the same group.
export const CATEGORY_MAP: Record<CategoryId, CategoryDefinition> = {
  phones: {
    label: "phone",
    plural: "phones",
    synonyms: [
      "phones",
      "phone",
      "smartphones",
      "smartphone",
      "mobile phones",
      "mobile phone",
      "cell phone",
    ],
    sourceCategories: ["smartphones"],
  },
  tablets: {
    label: "tablet",
    plural: "tablets",
    synonyms: ["tablets", "tablet", "ipads", "ipad"],
    sourceCategories: ["tablets"],
  },
  laptops: {
    label: "laptop",
    plural: "laptops",
    synonyms: ["laptops", "laptop", "notebooks", "notebook", "macbook"],
    sourceCategories: ["laptops"],
  },
  audio: {
    label: "audio device",
    plural: "audio devices",
    synonyms: [
      "audio devices",
      "audio device",
      "audio",
      "headphones",
      "headphone",
      "earphones",
      "earbuds",
      "airpods",
      "speakers",
      "speaker",
    ],
    sourceCategories: [],
  },
  "phone-accessories": {
    label: "phone accessory",
    plural: "phone accessories",
    synonyms: [
      "phone accessories",
      "phone accessory",
      "phone cases",
      "phone case",
      "accessories",
      "chargers",
      "charger",
      "power bank",
      "selfie stick",
    ],
    sourceCategories: ["mobile-accessories"],
  },
  "computer-accessories": {
    label: "computer accessory",
    plural: "computer accessories",
    synonyms: [
      "computer accessories",
      "computer accessory",
      "monitors",
      "monitor",
      "hard drives",
      "hard drive",
    ],
    sourceCategories: ["electronics"],
  },
  watches: {
    label: "watch",
    plural: "watches",
    synonyms: ["watches", "watch", "smartwatches", "smartwatch", "timepieces"],
    sourceCategories: ["mens-watches", "womens-watches"],
  },
  fragrances: {
    label: "fragrance",
    plural: "fragrances",
    synonyms: ["fragrances", "fragrance", "perfumes", "perfume", "cologne", "scent"],
    sourceCategories: ["fragrances"],
  },
  makeup: {
    label: "makeup product",
    plural: "makeup products",
    synonyms: [
      "makeup products",
      "makeup product",
      "makeup",
      "make-up",
      "cosmetics",
      "lipstick",
      "mascara",
      "nail polish",
    ],
    sourceCategories: ["beauty"],
  },
  skincare: {
    label: "skincare product",
    plural: "skincare products",
    synonyms: [
      "skincare products",
      "skincare product",
      "skincare",
      "skin care",
      "lotion",
      "body wash",
      "soap",
    ],
    sourceCategories: ["skin-care"],
  },
  groceries: {
    label: "grocery",
    plural: "groceries",
    synonyms: ["groceries", "grocery", "food"],
    sourceCategories: ["groceries"],
  },
  kitchenware: {
    label: "kitchen item",
    plural: "kitchen items",
    synonyms: ["kitchen items", "kitchen item", "kitchenware", "kitchen", "cookware", "utensils"],
    sourceCategories: ["kitchen-accessories"],
  },
  "home-decor": {
    label: "home decor piece",
    plural: "home decor pieces",
    synonyms: [
      "home decor pieces",
      "home decor piece",
      "home decor",
      "decorations",
      "decoration",
      "decor",
    ],
    sourceCategories: ["home-decoration"],
  },
  furniture: {
    label: "piece of furniture",
    plural: "furniture",
    synonyms: ["piece of furniture", "furniture", "sofa", "chairs", "chair"],
    sourceCategories: ["furniture"],
  },
  clothing: {
    label: "clothing item",
    plural: "clothing",
    synonyms: [
      "clothing item",
      "clothing",
      "clothes",
      "apparel",
      "shirts",
      "shirt",
      "t-shirts",
      "dresses",
      "dress",
      "jackets",
    ],
    sourceCategories: [
      "mens-shirts",
      "tops",
      "womens-dresses",
      "men's clothing",
      "women's clothing",
    ],
  },
  shoes: {
    label: "pair of shoes",
    plural: "shoes",
    synonyms: [
      "pair of shoes",
      "shoes",
      "shoe",
      "sneakers",
      "trainers",
      "footwear",
      "heels",
      "slippers",
    ],
    sourceCategories: ["mens-shoes", "womens-shoes"],
  },
  bags: {
    label: "bag",
    plural: "bags",
    synonyms: ["bags", "bag", "handbags", "handbag", "purses", "purse", "backpacks", "backpack"],
    sourceCategories: ["womens-bags"],
  },
  jewellery: {
    label: "piece of jewellery",
    plural: "jewellery",
    synonyms: [
      "piece of jewellery",
      "jewellery",
      "jewelry",
      "earrings",
      "earring",
      "necklace",
      "bracelet",
      "rings",
    ],
    sourceCategories: ["womens-jewellery", "jewelery"],
  },
  sunglasses: {
    label: "pair of sunglasses",
    plural: "sunglasses",
    synonyms: ["pair of sunglasses", "sunglasses", "sun glasses", "shades", "eyewear"],
    sourceCategories: ["sunglasses"],
  },
  sports: {
    label: "sports item",
    plural: "sports gear",
    synonyms: ["sports item", "sports gear", "sports equipment", "sporting goods", "equipment"],
    sourceCategories: ["sports-accessories"],
  },
  cars: {
    label: "car",
    plural: "cars",
    synonyms: ["cars", "car", "suv"],
    sourceCategories: ["vehicle"],
  },
  motorcycles: {
    label: "motorcycle",
    plural: "motorcycles",
    synonyms: ["motorcycles", "motorcycle", "motorbikes", "motorbike", "scooters", "scooter"],
    sourceCategories: ["motorcycle"],
  },
};

// Some source categories mix several kinds of product. A word in the title moves an
// item to a better group; the first matching refinement wins.
export const CATEGORY_REFINEMENTS: readonly CategoryRefinement[] = [
  {
    sourceCategory: "mobile-accessories",
    titleWords: ["airpods", "earphones", "headphones", "echo", "homepod", "speaker"],
    category: "audio",
  },
  { sourceCategory: "mobile-accessories", titleWords: ["watch"], category: "watches" },
  { sourceCategory: "men's clothing", titleWords: ["backpack"], category: "bags" },
];
