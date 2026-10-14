import type { Product, SearchIntent } from "@/core";
import { demandCategory } from "@/core";
import { featurePhrase } from "../query-interpretation";

export function filterProducts(products: readonly Product[], intent: SearchIntent): Product[] {
  return products.filter((product) => matchesIntent(product, intent));
}

function matchesIntent(product: Product, intent: SearchIntent): boolean {
  return (
    matchesCategory(product, intent) &&
    matchesPrice(product, intent) &&
    matchesDelivery(product, intent) &&
    matchesRating(product, intent) &&
    matchesColor(product, intent) &&
    hasEveryFeature(product, intent) &&
    containsEveryKeyword(product, intent)
  );
}

function matchesCategory(product: Product, intent: SearchIntent): boolean {
  return intent.category === null || product.category === intent.category;
}

function matchesPrice(product: Product, intent: SearchIntent): boolean {
  const aboveMinimum =
    intent.minimumPriceInCents === null || product.priceInCents >= intent.minimumPriceInCents;
  const belowMaximum =
    intent.maximumPriceInCents === null || product.priceInCents <= intent.maximumPriceInCents;
  return aboveMinimum && belowMaximum;
}

function matchesDelivery(product: Product, intent: SearchIntent): boolean {
  return intent.maximumDeliveryDays === null || product.deliveryDays <= intent.maximumDeliveryDays;
}

function matchesRating(product: Product, intent: SearchIntent): boolean {
  return intent.minimumRating === null || product.rating >= intent.minimumRating;
}

function matchesColor(product: Product, intent: SearchIntent): boolean {
  return intent.color === null || product.color === intent.color;
}

function hasEveryFeature(product: Product, intent: SearchIntent): boolean {
  return intent.features.every((feature) => product.features.includes(feature));
}

function containsEveryKeyword(product: Product, intent: SearchIntent): boolean {
  if (intent.keywords.length === 0) return true;
  const searchableText = describeForKeywords(product);
  return intent.keywords.every((keyword) => searchableText.includes(keyword));
}

function describeForKeywords(product: Product): string {
  const features = product.features.map(featurePhrase).join(" ");
  const category = demandCategory(product.category).pluralName;
  return `${product.title} ${features} ${product.color} ${category}`.toLowerCase();
}
