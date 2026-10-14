import type { Product, RephraseRequest } from "@/core";
import { filterProducts } from "../product-search";
import {
  CATEGORY_VOCABULARY,
  COLOR_VOCABULARY,
  FEATURE_VOCABULARY,
  interpretQuery,
} from "../query-interpretation";

export const ASSISTANCE_RULES = {
  maximumTextLength: 200,
} as const;

export type Rewrite = {
  text: string;
  understoodLabels: readonly string[];
  resultCount: number;
};

export function requestAssistance(
  catalog: readonly Product[],
  text: string,
): RephraseRequest | null {
  const trimmed = text.trim();
  if (trimmed === "" || trimmed.length > ASSISTANCE_RULES.maximumTextLength) return null;
  const { intent } = interpretQuery(trimmed);
  if (intent.keywords.length === 0) return null;
  // Unknown words that still find products are doing their job; a rewrite would only widen the search.
  if (filterProducts(catalog, intent).length > 0) return null;
  return { text: trimmed, unrecognizedWords: intent.keywords, vocabulary: ASSISTANT_VOCABULARY };
}

export function acceptRewrite(
  catalog: readonly Product[],
  request: RephraseRequest,
  rewritten: string | null,
): Rewrite | null {
  const text = rewritten?.trim() ?? "";
  if (text === "" || text.toLowerCase() === request.text.toLowerCase()) return null;
  const interpretation = interpretQuery(text);
  if (interpretation.intent.keywords.length >= request.unrecognizedWords.length) return null;
  const resultCount = filterProducts(catalog, interpretation.intent).length;
  if (resultCount === 0) return null;
  return { text, understoodLabels: interpretation.terms.map((term) => term.label), resultCount };
}

const ASSISTANT_VOCABULARY = {
  categories: CATEGORY_VOCABULARY.map((entry) => entry.label.toLowerCase()),
  features: FEATURE_VOCABULARY.map((entry) => entry.phrase),
  colors: COLOR_VOCABULARY.map((entry) => entry.color),
};
