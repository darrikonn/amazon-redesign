import type { Product } from "@/core";
import { filterProducts } from "../product-search";
import {
  CATEGORY_PHRASES,
  COLOR_PHRASES,
  interpretQuery,
  removePhrase,
  replacePhrase,
  TAG_PHRASES,
} from "../query-interpretation";

export const ASSISTANCE_RULES = {
  maximumTextLength: 200,
  minimumWordLengthToCorrect: 4,
  longWordLength: 8,
  maximumEditsForShortWord: 1,
  maximumEditsForLongWord: 2,
} as const;

export type Rewrite = {
  text: string;
  understoodLabels: readonly string[];
  resultCount: number;
};

// The assistant is simulated: no model is involved. When unknown words leave nothing to
// show, it maps each one to the closest word the catalogue understands, by spelling, and
// drops the rest. A rewrite that only drops words is left to the "Drop" suggestions.
export function suggestRewrite(catalog: readonly Product[], text: string): Rewrite | null {
  const trimmed = text.trim();
  if (trimmed === "" || trimmed.length > ASSISTANCE_RULES.maximumTextLength) return null;
  const { intent } = interpretQuery(trimmed);
  if (intent.keywords.length === 0 || filterProducts(catalog, intent).length > 0) return null;
  const corrections = intent.keywords.map((word) => ({
    word,
    replacement: closestKnownPhrase(word),
  }));
  if (corrections.every((correction) => correction.replacement === null)) return null;
  const rewritten = corrections.reduce(
    (current, { word, replacement }) =>
      replacement === null
        ? removePhrase(current, word)
        : replacePhrase(current, word, replacement),
    trimmed,
  );
  return acceptRewrite(catalog, rewritten, intent.keywords.length);
}

type KnownPhrase = {
  phrase: string;
  edits: number;
};

const SINGLE_WORD_PHRASES: readonly string[] = [
  ...CATEGORY_PHRASES,
  ...TAG_PHRASES,
  ...COLOR_PHRASES,
]
  .map((entry) => entry.phrase)
  .filter((phrase) => !/\s/.test(phrase));

function closestKnownPhrase(word: string): string | null {
  if (word.length < ASSISTANCE_RULES.minimumWordLengthToCorrect) return null;
  const allowedEdits =
    word.length >= ASSISTANCE_RULES.longWordLength
      ? ASSISTANCE_RULES.maximumEditsForLongWord
      : ASSISTANCE_RULES.maximumEditsForShortWord;
  let closest: KnownPhrase | null = null;
  for (const phrase of SINGLE_WORD_PHRASES) {
    const edits = editDistance(word, phrase, allowedEdits);
    if (edits <= allowedEdits && (closest === null || edits < closest.edits))
      closest = { phrase, edits };
  }
  return closest?.phrase ?? null;
}

// The suggestion is rebuilt from the understood phrases alone, so filler such as a
// trailing "for" disappears along with the words that were dropped.
function acceptRewrite(
  catalog: readonly Product[],
  rewritten: string,
  originalUnknownCount: number,
): Rewrite | null {
  const text = interpretQuery(rewritten)
    .terms.map((term) => term.phrase)
    .join(" ");
  const interpretation = interpretQuery(text);
  if (text === "" || interpretation.intent.keywords.length >= originalUnknownCount) return null;
  const resultCount = filterProducts(catalog, interpretation.intent).length;
  if (resultCount === 0) return null;
  return { text, understoodLabels: interpretation.terms.map((term) => term.label), resultCount };
}

// Levenshtein distance that gives up once it is certain to exceed `limit`.
function editDistance(first: string, second: string, limit: number): number {
  if (Math.abs(first.length - second.length) > limit) return limit + 1;
  let previous = Array.from({ length: second.length + 1 }, (_, i) => i);
  for (let row = 1; row <= first.length; row += 1) {
    const current = [row];
    let rowMinimum = row;
    for (let column = 1; column <= second.length; column += 1) {
      const substitution =
        (previous[column - 1] ?? 0) + (first[row - 1] === second[column - 1] ? 0 : 1);
      const value = Math.min(
        (previous[column] ?? 0) + 1,
        (current[column - 1] ?? 0) + 1,
        substitution,
      );
      current.push(value);
      rowMinimum = Math.min(rowMinimum, value);
    }
    if (rowMinimum > limit) return limit + 1;
    previous = current;
  }
  return previous[second.length] ?? limit + 1;
}
