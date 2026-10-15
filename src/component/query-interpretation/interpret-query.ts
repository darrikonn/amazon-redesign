import type {
  CategoryId,
  Color,
  Interpretation,
  SearchIntent,
  Tag,
  UnderstoodTerm,
  UnderstoodTermKind,
} from "@/core";
import { colorLabel, tagLabel } from "../catalog-vocabulary";
import { wholePhrasePattern } from "../text";
import { formatDollars, parseAmountInCents } from "./money";
import {
  CATEGORY_PHRASES,
  COLOR_PHRASES,
  categoryChipLabel,
  STOP_WORDS,
  TAG_PHRASES,
} from "./vocabulary";

export const INTERPRETATION_RULES = {
  topRatedMinimum: 4.5,
  tomorrowInDays: 1,
  thisWeekInDays: 4,
  minimumKeywordLength: 2,
} as const;

export function interpretQuery(text: string): Interpretation {
  const scanner = new QueryScanner(text);
  const draft = new IntentDraft();
  readRating(scanner, draft);
  readPrice(scanner, draft);
  readDelivery(scanner, draft);
  readLowestPrice(scanner, draft);
  readColor(scanner, draft);
  readTagsAndCategory(scanner, draft);
  readKeywords(scanner, draft);
  return { intent: draft.intent(), terms: inReadingOrder(draft.terms, text) };
}

const UNIT_WORD = "(?:one|two|three|four|five|six|seven|eight|nine)";
const TEEN_WORD =
  "(?:ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)";
const TENS_WORD = `(?:(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[- ]${UNIT_WORD})?)`;
const UNDER_HUNDRED_WORD = `(?:${TENS_WORD}|${TEEN_WORD}|${UNIT_WORD})`;
const LARGE_NUMBER_WORD = String.raw`(?:(?:(?:a|one)\s+)?hundred(?:\s+(?:and\s+)?${UNDER_HUNDRED_WORD})?|${TENS_WORD}|${TEEN_WORD})(?![a-z0-9])`;
const CURRENCY_WORD = String.raw`(?:\s*(?:dollars?|bucks|usd))?`;
// A lone single-digit word is a price only with a currency word after it, so
// "more than one color" stays plain text while "under five bucks" is a price.
const SMALL_NUMBER_WORD = String.raw`${UNIT_WORD}(?=\s*(?:dollars?|bucks|usd)(?![a-z0-9]))`;
// Digits may carry thousands separators: "$1,500" and "$1500" are the same price.
const DIGITS = String.raw`(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?`;
const NUMBER = `(${DIGITS})${CURRENCY_WORD}`;
const AMOUNT = `(${DIGITS}|${LARGE_NUMBER_WORD}|${SMALL_NUMBER_WORD})${CURRENCY_WORD}`;
const RATING_PATTERN =
  /(?:top[- ]rated|best[- ]rated|highly rated|well reviewed|(?:over |at least )?(\d(?:\.\d)?)\+?\s*stars?(?: and up| or more)?)/;
const PRICE_RANGE_PATTERN = new RegExp(
  String.raw`(?:between\s+)?\$?${NUMBER}\s*(?:-|to|and)\s*\$?${NUMBER}`,
);
// Number words need "between" to count as a range, so "one or two lamps" stays plain text.
const WORDED_PRICE_RANGE_PATTERN = new RegExp(
  String.raw`between\s+\$?${AMOUNT}\s*(?:-|to|and)\s*\$?${AMOUNT}`,
);
const MAXIMUM_PRICE_PATTERN = new RegExp(
  String.raw`(?:under|below|less than|cheaper than|up to|max)\s*\$?\s*${AMOUNT}`,
);
const MINIMUM_PRICE_PATTERN = new RegExp(
  String.raw`(?:over|above|more than|at least)\s*\$?\s*${AMOUNT}`,
);
const DELIVERY_PREFIX = String.raw`(?:that\s+)?(?:(?:arrives?|arriving|delivered|delivery|get it|here)\s+)?`;
const TOMORROW_PATTERN = new RegExp(String.raw`${DELIVERY_PREFIX}(?:by\s+)?tomorrow`);
const THIS_WEEK_PATTERN = new RegExp(`${DELIVERY_PREFIX}this week`);
const LOWEST_PRICE_PATTERN = wholePhrasePattern(["cheapest", "lowest price", "cheap"]);
const PHRASE_GROUP = 2;

class QueryScanner {
  private remaining: string;

  constructor(text: string) {
    this.remaining = ` ${text.toLowerCase()} `;
  }

  take(pattern: RegExp, phraseGroup = 0): ScannedPhrase | null {
    const match = pattern.exec(this.remaining);
    if (match === null) return null;
    const phrase = match[phraseGroup] ?? match[0];
    const start = match.index + match[0].indexOf(phrase);
    this.remaining = `${this.remaining.slice(0, start)} ${this.remaining.slice(start + phrase.length)}`;
    return { phrase: phrase.trim(), groups: match };
  }

  leftoverWords(): string[] {
    return this.remaining.split(/[^a-z0-9]+/).filter((word) => word.length > 0);
  }
}

type ScannedPhrase = {
  phrase: string;
  groups: RegExpExecArray;
};

class IntentDraft {
  readonly terms: UnderstoodTerm[] = [];
  category: CategoryId | null = null;
  minimumPriceInCents: number | null = null;
  maximumPriceInCents: number | null = null;
  maximumDeliveryDays: number | null = null;
  minimumRating: number | null = null;
  prefersLowestPrice = false;
  color: Color | null = null;
  readonly tags: Tag[] = [];
  readonly keywords: string[] = [];

  understand(kind: UnderstoodTermKind, label: string, phrase: string): void {
    this.terms.push({ kind, label, phrase });
  }

  intent(): SearchIntent {
    return {
      category: this.category,
      minimumPriceInCents: this.minimumPriceInCents,
      maximumPriceInCents: this.maximumPriceInCents,
      maximumDeliveryDays: this.maximumDeliveryDays,
      minimumRating: this.minimumRating,
      prefersLowestPrice: this.prefersLowestPrice,
      color: this.color,
      tags: [...this.tags],
      keywords: [...this.keywords],
    };
  }
}

function readRating(scanner: QueryScanner, draft: IntentDraft): void {
  const scanned = scanner.take(RATING_PATTERN);
  if (scanned === null) return;
  const stars = scanned.groups[1];
  draft.minimumRating = stars === undefined ? INTERPRETATION_RULES.topRatedMinimum : Number(stars);
  draft.understand("rating", `Rated ${draft.minimumRating} and up`, scanned.phrase);
}

function readPrice(scanner: QueryScanner, draft: IntentDraft): void {
  if (readPriceRange(scanner, draft)) return;
  readMaximumPrice(scanner, draft);
  readMinimumPrice(scanner, draft);
}

function readPriceRange(scanner: QueryScanner, draft: IntentDraft): boolean {
  const scanned = scanner.take(PRICE_RANGE_PATTERN) ?? scanner.take(WORDED_PRICE_RANGE_PATTERN);
  if (scanned === null) return false;
  const firstInCents = parseAmountInCents(scanned.groups[1]);
  const secondInCents = parseAmountInCents(scanned.groups[2]);
  draft.minimumPriceInCents = Math.min(firstInCents, secondInCents);
  draft.maximumPriceInCents = Math.max(firstInCents, secondInCents);
  const label = `${formatDollars(draft.minimumPriceInCents)} to ${formatDollars(draft.maximumPriceInCents)}`;
  draft.understand("price", label, scanned.phrase);
  return true;
}

function readMaximumPrice(scanner: QueryScanner, draft: IntentDraft): void {
  const scanned = scanner.take(MAXIMUM_PRICE_PATTERN);
  if (scanned === null) return;
  draft.maximumPriceInCents = parseAmountInCents(scanned.groups[1]);
  draft.understand("price", `Under ${formatDollars(draft.maximumPriceInCents)}`, scanned.phrase);
}

function readMinimumPrice(scanner: QueryScanner, draft: IntentDraft): void {
  const scanned = scanner.take(MINIMUM_PRICE_PATTERN);
  if (scanned === null) return;
  draft.minimumPriceInCents = parseAmountInCents(scanned.groups[1]);
  draft.understand("price", `Over ${formatDollars(draft.minimumPriceInCents)}`, scanned.phrase);
}

function readDelivery(scanner: QueryScanner, draft: IntentDraft): void {
  const tomorrow = scanner.take(TOMORROW_PATTERN);
  if (tomorrow !== null) {
    draft.maximumDeliveryDays = INTERPRETATION_RULES.tomorrowInDays;
    draft.understand("delivery", "Arrives tomorrow", tomorrow.phrase);
    return;
  }
  const thisWeek = scanner.take(THIS_WEEK_PATTERN);
  if (thisWeek === null) return;
  draft.maximumDeliveryDays = INTERPRETATION_RULES.thisWeekInDays;
  draft.understand("delivery", "Arrives this week", thisWeek.phrase);
}

function readLowestPrice(scanner: QueryScanner, draft: IntentDraft): void {
  const scanned = scanner.take(LOWEST_PRICE_PATTERN, PHRASE_GROUP);
  if (scanned === null) return;
  draft.prefersLowestPrice = true;
  draft.understand("lowest-price", "Cheapest first", scanned.phrase);
}

function readColor(scanner: QueryScanner, draft: IntentDraft): void {
  for (const entry of COLOR_PHRASES) {
    const scanned = scanner.take(wholePhrasePattern([entry.phrase]), PHRASE_GROUP);
    if (scanned === null) continue;
    draft.color = entry.id;
    draft.understand("color", colorLabel(entry.id), scanned.phrase);
    return;
  }
}

// Tags and categories share one longest-first pass, so the category "sports gear" is
// read before the tag "sports" can take half of it.
function readTagsAndCategory(scanner: QueryScanner, draft: IntentDraft): void {
  for (const entry of TAG_AND_CATEGORY_PHRASES) {
    if (entry.kind === "tag" ? draft.tags.includes(entry.id) : draft.category !== null) continue;
    const scanned = scanner.take(wholePhrasePattern([entry.phrase]), PHRASE_GROUP);
    if (scanned === null) continue;
    if (entry.kind === "tag") {
      draft.tags.push(entry.id);
      draft.understand("tag", tagLabel(entry.id), scanned.phrase);
    } else {
      draft.category = entry.id;
      draft.understand("category", categoryChipLabel(entry.id), scanned.phrase);
    }
  }
}

type TagOrCategoryPhrase =
  | { kind: "tag"; id: Tag; phrase: string }
  | { kind: "category"; id: CategoryId; phrase: string };

const TAG_AND_CATEGORY_PHRASES: readonly TagOrCategoryPhrase[] = [
  ...TAG_PHRASES.map((entry): TagOrCategoryPhrase => ({ kind: "tag", ...entry })),
  ...CATEGORY_PHRASES.map((entry): TagOrCategoryPhrase => ({ kind: "category", ...entry })),
].sort((first, second) => second.phrase.length - first.phrase.length);

function readKeywords(scanner: QueryScanner, draft: IntentDraft): void {
  for (const word of scanner.leftoverWords()) {
    if (!isKeyword(word) || draft.keywords.includes(word)) continue;
    draft.keywords.push(word);
    draft.understand("keyword", `“${word}”`, word);
  }
}

function isKeyword(word: string): boolean {
  if (word.length < INTERPRETATION_RULES.minimumKeywordLength) return false;
  if (/^\d+$/.test(word)) return false;
  return !STOP_WORDS.has(word);
}

function inReadingOrder(terms: readonly UnderstoodTerm[], text: string): UnderstoodTerm[] {
  const lowered = text.toLowerCase();
  return [...terms].sort(
    (first, second) => lowered.indexOf(first.phrase) - lowered.indexOf(second.phrase),
  );
}
