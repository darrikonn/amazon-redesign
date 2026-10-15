import type { SearchIntent } from "@/core";
import { categoryLabel, categoryPlural, tagInSentence } from "../catalog-vocabulary";
import { formatDollars, INTERPRETATION_RULES } from "../query-interpretation";
import { joinWithAnd } from "../text";

export function describeResults(intent: SearchIntent, resultCount: number): string {
  const count = resultCount === 0 ? "No" : String(resultCount);
  const noun = [intent.color, nounFor(intent, resultCount)].filter(isPresent).join(" ");
  const qualifiers = describeQualifiers(intent);
  if (qualifiers.length === 0) return `${count} ${noun}`;
  const separator = intent.tags.length > 0 ? ": " : " ";
  return `${count} ${noun}${separator}${qualifiers.join(", ")}`;
}

function nounFor(intent: SearchIntent, resultCount: number): string {
  if (intent.category === null) return resultCount === 1 ? "product" : "products";
  return resultCount === 1 ? categoryLabel(intent.category) : categoryPlural(intent.category);
}

function isPresent(value: string | null): value is string {
  return value !== null;
}

function describeQualifiers(intent: SearchIntent): string[] {
  return [
    describeTags(intent),
    describePrice(intent),
    describeDelivery(intent),
    describeRating(intent),
    describeKeywords(intent),
  ].filter(isPresent);
}

function describeTags(intent: SearchIntent): string | null {
  if (intent.tags.length === 0) return null;
  return intent.tags.map(tagInSentence).join(", ");
}

function describePrice(intent: SearchIntent): string | null {
  const { minimumPriceInCents: minimum, maximumPriceInCents: maximum } = intent;
  if (minimum !== null && maximum !== null) {
    return `between ${formatDollars(minimum)} and ${formatDollars(maximum)}`;
  }
  if (maximum !== null) return `under ${formatDollars(maximum)}`;
  if (minimum !== null) return `over ${formatDollars(minimum)}`;
  return null;
}

function describeDelivery(intent: SearchIntent): string | null {
  if (intent.maximumDeliveryDays === null) return null;
  if (intent.maximumDeliveryDays <= INTERPRETATION_RULES.tomorrowInDays) return "arriving tomorrow";
  return "arriving this week";
}

function describeRating(intent: SearchIntent): string | null {
  return intent.minimumRating === null ? null : `rated ${intent.minimumRating} and up`;
}

// Words the interpreter did not understand still filter the results, so the headline says so.
function describeKeywords(intent: SearchIntent): string | null {
  if (intent.keywords.length === 0) return null;
  return `matching ${joinWithAnd(intent.keywords.map((keyword) => `“${keyword}”`))}`;
}
