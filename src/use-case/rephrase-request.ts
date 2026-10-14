import {
  CATEGORY_VOCABULARY,
  COLOR_VOCABULARY,
  FEATURE_VOCABULARY,
  interpretQuery,
} from "@/component";
import type { RephraseRequest } from "@/core";

export const ASSISTANT_RULES = {
  maximumTextLength: 200,
} as const;

// Null means the assistant has nothing to add: the text is empty, too long to send,
// or fully understood already.
export function toRephraseRequest(text: string): RephraseRequest | null {
  const trimmed = text.trim();
  if (trimmed === "" || trimmed.length > ASSISTANT_RULES.maximumTextLength) return null;
  const unrecognizedWords = interpretQuery(trimmed).intent.keywords;
  if (unrecognizedWords.length === 0) return null;
  return { text: trimmed, unrecognizedWords, vocabulary: VOCABULARY };
}

const VOCABULARY = {
  categories: CATEGORY_VOCABULARY.map((entry) => entry.label.toLowerCase()),
  features: FEATURE_VOCABULARY.map((entry) => entry.phrase),
  colors: COLOR_VOCABULARY.map((entry) => entry.color),
};
