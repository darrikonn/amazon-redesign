import type { CategoryId, Color, Product, ProductDetails, ProductSource, Tag } from "@/core";
import { CATEGORY_IDS, COLORS, TAGS } from "@/core";
import {
  CATEGORY_MAP,
  CATEGORY_REFINEMENTS,
  type CatalogVocabulary,
  COLOR_WORDS,
  TAG_RULES,
} from "../catalog-vocabulary";
import { wholePhrasePattern } from "../query-interpretation";
import type { CatalogOverrides, ProductOverride } from "./override";
import { buildProductDetails } from "./product-details";
import {
  parseDummyJsonResponse,
  parseFakeStoreResponse,
  type RawDummyJsonProduct,
  type RawFakeStoreProduct,
} from "./raw-source";
import { blankToNull, compareText, productIdFor } from "./source-text";

export const ENRICHMENT_RULES = {
  maximumNameLength: 60,
  minimumProductsPerTag: 2,
  fakeStoreDeliveryDays: 3,
  unparsedDeliveryDays: 7,
  ratingPrecision: 10,
} as const;

export type Catalog = {
  products: readonly Product[];
  details: readonly ProductDetails[];
  vocabulary: CatalogVocabulary;
};

export function buildCatalog(
  source: ProductSource,
  rawResponse: unknown,
  overrides: CatalogOverrides,
): Catalog {
  const enriched = dropRareTags(normaliseResponse(source, rawResponse));
  // Overrides come last so a correction is never undone by a rule; the catalogue test
  // then checks that every tag still sits on at least two products.
  const products = applyOverrides(enriched, overrides[source]).sort((first, second) =>
    compareText(first.id, second.id),
  );
  return {
    products,
    details: buildProductDetails(source, rawResponse),
    vocabulary: buildVocabulary(products),
  };
}

export function normaliseResponse(source: ProductSource, rawResponse: unknown): Product[] {
  return source === "dummyjson"
    ? parseDummyJsonResponse(rawResponse).map(normaliseDummyJsonProduct)
    : parseFakeStoreResponse(rawResponse).map(normaliseFakeStoreProduct);
}

export function normaliseDummyJsonProduct(raw: RawDummyJsonProduct): Product {
  return productFrom("dummyjson", raw.id, {
    title: raw.title,
    description: raw.description,
    sourceCategory: raw.category,
    sourceTags: raw.tags,
    priceInDollars: raw.priceInDollars,
    rating: raw.rating,
    reviewCount: raw.reviews.length,
    deliveryDays: deliveryDaysFrom(raw.shippingInformation),
    image: raw.thumbnail,
    brand: raw.brand,
  });
}

export function normaliseFakeStoreProduct(raw: RawFakeStoreProduct): Product {
  return productFrom("fakestore", raw.id, {
    title: raw.title,
    description: raw.description,
    sourceCategory: raw.category,
    sourceTags: [],
    priceInDollars: raw.priceInDollars,
    rating: raw.rating,
    reviewCount: raw.reviewCount,
    deliveryDays: ENRICHMENT_RULES.fakeStoreDeliveryDays,
    image: raw.image,
    brand: null,
  });
}

export function mapCategory(sourceCategory: string, title: string): CategoryId {
  const refinement = CATEGORY_REFINEMENTS.find(
    (candidate) =>
      candidate.sourceCategory === sourceCategory && containsAnyWord(title, candidate.titleWords),
  );
  if (refinement !== undefined) return refinement.category;
  const category = CATEGORY_IDS.find((id) =>
    CATEGORY_MAP[id].sourceCategories.includes(sourceCategory),
  );
  if (category === undefined)
    throw new Error(`Unmapped source category "${sourceCategory}" in category-map.ts`);
  return category;
}

export function extractColor(title: string, description: string): Color | null {
  return firstColorIn(title) ?? firstColorIn(description);
}

export function deliveryDaysFrom(shippingInformation: string): number {
  const text = shippingInformation.toLowerCase();
  const match = DELIVERY_RULES.find((rule) => rule.pattern.test(text));
  return match === undefined ? ENRICHMENT_RULES.unparsedDeliveryDays : match.days;
}

export function deriveTags(texts: readonly string[]): Tag[] {
  const searchable = texts.join(" \n ");
  return TAGS.filter((tag) => containsAnyWord(searchable, TAG_RULES[tag].keywords));
}

export function trimName(title: string): string {
  const name = title.trim().replace(/\s+/g, " ");
  if (name.length <= ENRICHMENT_RULES.maximumNameLength) return name;
  const cut = name.slice(0, ENRICHMENT_RULES.maximumNameLength + 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (
    lastSpace > 0 ? cut.slice(0, lastSpace) : cut.slice(0, ENRICHMENT_RULES.maximumNameLength)
  ).trimEnd();
}

export function applyOverrides(
  products: readonly Product[],
  overrides: Readonly<Record<string, ProductOverride>>,
): Product[] {
  return products.map((product) => {
    const override = overrides[String(product.sourceId)];
    return override === undefined ? product : withOverride(product, override);
  });
}

export function dropRareTags(products: readonly Product[]): Product[] {
  const counts = countTags(products);
  return products.map((product) => ({
    ...product,
    tags: product.tags.filter(
      (tag) => (counts.get(tag) ?? 0) >= ENRICHMENT_RULES.minimumProductsPerTag,
    ),
  }));
}

export function buildVocabulary(products: readonly Product[]): CatalogVocabulary {
  const tagCounts = countTags(products);
  return {
    categories: CATEGORY_IDS.map((id) => ({
      id,
      productCount: products.filter((product) => product.category === id).length,
    })),
    tags: TAGS.filter((tag) => (tagCounts.get(tag) ?? 0) > 0).map((tag) => ({
      id: tag,
      productCount: tagCounts.get(tag) ?? 0,
    })),
    colors: COLORS.map((color) => ({
      id: color,
      productCount: products.filter((product) => product.color === color).length,
    })),
  };
}

type SourceFacts = {
  title: string;
  description: string;
  sourceCategory: string;
  sourceTags: readonly string[];
  priceInDollars: number;
  rating: number;
  reviewCount: number;
  deliveryDays: number;
  image: string | null;
  brand: string | null;
};

const CENTS_PER_DOLLAR = 100;

function productFrom(source: ProductSource, sourceId: number, facts: SourceFacts): Product {
  const category = mapCategory(facts.sourceCategory, facts.title);
  return {
    id: productIdFor(source, sourceId),
    source,
    sourceId,
    name: trimName(facts.title),
    category,
    categoryLabel: CATEGORY_MAP[category].label,
    categoryPlural: CATEGORY_MAP[category].plural,
    priceInCents: Math.round(facts.priceInDollars * CENTS_PER_DOLLAR),
    rating:
      Math.round(facts.rating * ENRICHMENT_RULES.ratingPrecision) /
      ENRICHMENT_RULES.ratingPrecision,
    reviewCount: facts.reviewCount,
    deliveryDays: facts.deliveryDays,
    color: extractColor(facts.title, facts.description),
    tags: deriveTags([...facts.sourceTags, facts.title, facts.description]),
    image: blankToNull(facts.image),
    brand: blankToNull(facts.brand),
  };
}

function containsAnyWord(text: string, words: readonly string[]): boolean {
  const lowered = text.toLowerCase();
  return words.some((word) => wholeWordIndex(lowered, word) >= 0);
}

function wholeWordIndex(loweredText: string, word: string): number {
  const match = wholePhrasePattern([word]).exec(loweredText);
  return match === null ? -1 : match.index + (match[1] ?? "").length;
}

// The earliest colour word wins; at the same position the longer word wins, so
// "rose gold" beats "gold".
function firstColorIn(text: string): Color | null {
  const lowered = text.toLowerCase();
  let best: { color: Color; index: number; length: number } | null = null;
  for (const color of COLORS) {
    for (const word of COLOR_WORDS[color]) {
      const index = wholeWordIndex(lowered, word);
      if (index < 0) continue;
      if (
        best === null ||
        index < best.index ||
        (index === best.index && word.length > best.length)
      ) {
        best = { color, index, length: word.length };
      }
    }
  }
  return best === null ? null : best.color;
}

const DELIVERY_RULES: readonly { pattern: RegExp; days: number }[] = [
  { pattern: /overnight/, days: 1 },
  { pattern: /in 1-2 business days/, days: 2 },
  { pattern: /in 3-5 business days/, days: 4 },
  { pattern: /in 1 week/, days: 7 },
  { pattern: /in 2 weeks/, days: 14 },
  { pattern: /in 1 month/, days: 30 },
];

function withOverride(product: Product, override: ProductOverride): Product {
  const category = override.category ?? product.category;
  return {
    ...product,
    ...(override.name === undefined ? {} : { name: override.name }),
    ...(override.color === undefined ? {} : { color: override.color }),
    ...(override.tags === undefined ? {} : { tags: override.tags }),
    ...(override.deliveryDays === undefined ? {} : { deliveryDays: override.deliveryDays }),
    ...(override.brand === undefined ? {} : { brand: override.brand }),
    category,
    categoryLabel: CATEGORY_MAP[category].label,
    categoryPlural: CATEGORY_MAP[category].plural,
  };
}

function countTags(products: readonly Product[]): Map<Tag, number> {
  const counts = new Map<Tag, number>();
  for (const product of products) {
    for (const tag of product.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return counts;
}
