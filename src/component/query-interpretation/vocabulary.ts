import type { CategoryId, Color, Tag } from "@/core";
import {
  CATEGORY_MAP,
  COLOR_WORDS,
  capitalize,
  KNOWN_COLORS,
  LIVE_CATEGORIES,
  LIVE_TAGS,
  TAG_RULES,
} from "../catalog-vocabulary";

export type VocabularyPhrase<Id> = {
  id: Id;
  phrase: string;
};

// Every phrase is tried longest first across the whole list, so "phone case" wins over
// "phone" and "noise cancelling" is taken before anything shorter can split it.
export const CATEGORY_PHRASES: readonly VocabularyPhrase<CategoryId>[] = longestFirst(
  LIVE_CATEGORIES.flatMap((id) => CATEGORY_MAP[id].synonyms.map((phrase) => ({ id, phrase }))),
);

export const TAG_PHRASES: readonly VocabularyPhrase<Tag>[] = longestFirst(
  LIVE_TAGS.flatMap((id) => TAG_RULES[id].keywords.map((phrase) => ({ id, phrase }))),
);

export const COLOR_PHRASES: readonly VocabularyPhrase<Color>[] = longestFirst(
  KNOWN_COLORS.flatMap((id) => COLOR_WORDS[id].map((phrase) => ({ id, phrase }))),
);

export const STOP_WORDS: ReadonlySet<string> = new Set([
  "a",
  "an",
  "the",
  "with",
  "that",
  "and",
  "for",
  "in",
  "of",
  "is",
  "are",
  "me",
  "i",
  "need",
  "want",
  "looking",
  "find",
  "show",
  "some",
  "good",
  "nice",
  "to",
  "my",
  "which",
  "can",
  "it",
  "be",
  "on",
  "or",
  "please",
  "something",
  "under",
  "below",
  "over",
  "above",
  "between",
  "than",
  "less",
  "more",
  "arrives",
  "arrive",
  "arriving",
  "by",
  "stars",
  "star",
  "rated",
  "top",
  "best",
  "up",
  "max",
  "at",
  "least",
  "get",
  "here",
  "delivered",
  "delivery",
  "have",
  "has",
  "one",
  "ones",
  "new",
  "buy",
  "do",
  "you",
  "any",
]);

export function categoryChipLabel(category: CategoryId): string {
  return capitalize(CATEGORY_MAP[category].plural);
}

function longestFirst<Id>(phrases: readonly VocabularyPhrase<Id>[]): VocabularyPhrase<Id>[] {
  return [...phrases].sort((first, second) => second.phrase.length - first.phrase.length);
}
