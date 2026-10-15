import type { Product, ProductSource } from "@/core";
import { dollarsToCents } from "../money";
import {
  deliveryDaysFrom,
  deriveTags,
  extractColor,
  mapCategory,
  ratingFrom,
  trimName,
} from "../product-fact";
import type { ParsedSource, RawDummyJsonProduct, RawFakeStoreProduct } from "./raw-source";
import { blankToNull, productIdFor } from "./source-text";

export const NORMALISATION_RULES = {
  // FakeStore states no shipping, so its products get a typical estimate.
  fakeStoreDeliveryDays: 3,
} as const;

export function normaliseProducts(parsed: ParsedSource): Product[] {
  return parsed.source === "dummyjson"
    ? parsed.products.map(normaliseDummyJsonProduct)
    : parsed.products.map(normaliseFakeStoreProduct);
}

function normaliseDummyJsonProduct(raw: RawDummyJsonProduct): Product {
  return productFrom("dummyjson", raw.id, {
    title: raw.title,
    description: raw.description,
    sourceCategory: raw.category,
    sourceTags: raw.tags,
    priceInDollars: raw.priceInDollars,
    discountPercent: Math.round(raw.discountPercentage),
    rating: ratingFrom(raw.reviews, raw.rating),
    reviewCount: raw.reviews.length,
    deliveryDays: deliveryDaysFrom(raw.shippingInformation),
    image: raw.thumbnail,
    brand: raw.brand,
    stock: raw.stock,
  });
}

function normaliseFakeStoreProduct(raw: RawFakeStoreProduct): Product {
  return productFrom("fakestore", raw.id, {
    title: raw.title,
    description: raw.description,
    sourceCategory: raw.category,
    sourceTags: [],
    priceInDollars: raw.priceInDollars,
    discountPercent: 0,
    rating: ratingFrom([], raw.rating),
    reviewCount: raw.reviewCount,
    deliveryDays: NORMALISATION_RULES.fakeStoreDeliveryDays,
    image: raw.image,
    brand: null,
    stock: null,
  });
}

type SourceFacts = {
  title: string;
  description: string;
  sourceCategory: string;
  sourceTags: readonly string[];
  priceInDollars: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  deliveryDays: number;
  image: string | null;
  brand: string | null;
  stock: number | null;
};

function productFrom(source: ProductSource, sourceId: number, facts: SourceFacts): Product {
  return {
    id: productIdFor(source, sourceId),
    source,
    sourceId,
    name: trimName(facts.title),
    category: mapCategory(facts.sourceCategory, facts.title),
    priceInCents: dollarsToCents(facts.priceInDollars),
    discountPercent: facts.discountPercent,
    rating: facts.rating,
    reviewCount: facts.reviewCount,
    deliveryDays: facts.deliveryDays,
    color: extractColor(facts.title, facts.description),
    tags: deriveTags([...facts.sourceTags, facts.title, facts.description]),
    image: blankToNull(facts.image),
    brand: blankToNull(facts.brand),
    stock: facts.stock,
  };
}
