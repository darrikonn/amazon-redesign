import type {
  CategoryId,
  Color,
  Feature,
  Interpretation,
  SearchIntent,
  UnderstoodTerm,
  UnderstoodTermKind,
} from "@/core";
import { formatDollars, parseCents } from "./money";
import { wholePhrasePattern } from "./phrase";
import {
  CATEGORY_VOCABULARY,
  COLOR_VOCABULARY,
  FEATURE_VOCABULARY,
  STOP_WORDS,
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
  readFeatures(scanner, draft);
  readCategory(scanner, draft);
  readKeywords(scanner, draft);
  return { intent: draft.intent(), terms: inReadingOrder(draft.terms, text) };
}

const NUMBER = String.raw`(\d+(?:\.\d{1,2})?)`;
const RATING_PATTERN =
  /(?:top[- ]rated|best[- ]rated|highly rated|well reviewed|(?:over |at least )?(\d(?:\.\d)?)\+?\s*stars?(?: and up| or more)?)/;
const PRICE_RANGE_PATTERN = new RegExp(
  String.raw`(?:between\s+)?\$?${NUMBER}\s*(?:-|to|and)\s*\$?${NUMBER}`,
);
const MAXIMUM_PRICE_PATTERN = new RegExp(
  String.raw`(?:under|below|less than|cheaper than|up to|max)\s*\$?\s*${NUMBER}`,
);
const MINIMUM_PRICE_PATTERN = new RegExp(
  String.raw`(?:over|above|more than|at least)\s*\$?\s*${NUMBER}`,
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
  readonly features: Feature[] = [];
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
      features: [...this.features],
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
  const scanned = scanner.take(PRICE_RANGE_PATTERN);
  if (scanned === null) return false;
  const first = parseCents(scanned.groups[1]);
  const second = parseCents(scanned.groups[2]);
  draft.minimumPriceInCents = Math.min(first, second);
  draft.maximumPriceInCents = Math.max(first, second);
  const label = `${formatDollars(draft.minimumPriceInCents)} to ${formatDollars(draft.maximumPriceInCents)}`;
  draft.understand("price", label, scanned.phrase);
  return true;
}

function readMaximumPrice(scanner: QueryScanner, draft: IntentDraft): void {
  const scanned = scanner.take(MAXIMUM_PRICE_PATTERN);
  if (scanned === null) return;
  draft.maximumPriceInCents = parseCents(scanned.groups[1]);
  draft.understand("price", `Under ${formatDollars(draft.maximumPriceInCents)}`, scanned.phrase);
}

function readMinimumPrice(scanner: QueryScanner, draft: IntentDraft): void {
  const scanned = scanner.take(MINIMUM_PRICE_PATTERN);
  if (scanned === null) return;
  draft.minimumPriceInCents = parseCents(scanned.groups[1]);
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
  for (const entry of COLOR_VOCABULARY) {
    const scanned = scanner.take(wholePhrasePattern(entry.synonyms), PHRASE_GROUP);
    if (scanned === null) continue;
    draft.color = entry.color;
    draft.understand("color", entry.label, scanned.phrase);
    return;
  }
}

function readFeatures(scanner: QueryScanner, draft: IntentDraft): void {
  for (const entry of FEATURE_VOCABULARY) {
    const scanned = scanner.take(wholePhrasePattern(entry.synonyms), PHRASE_GROUP);
    if (scanned === null) continue;
    draft.features.push(entry.feature);
    draft.understand("feature", entry.label, scanned.phrase);
  }
}

function readCategory(scanner: QueryScanner, draft: IntentDraft): void {
  for (const entry of CATEGORY_VOCABULARY) {
    const scanned = scanner.take(wholePhrasePattern(entry.synonyms), PHRASE_GROUP);
    if (scanned === null) continue;
    draft.category = entry.category;
    draft.understand("category", entry.label, scanned.phrase);
    return;
  }
}

function readKeywords(scanner: QueryScanner, draft: IntentDraft): void {
  for (const word of scanner.leftoverWords()) {
    if (!isKeyword(word)) continue;
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
