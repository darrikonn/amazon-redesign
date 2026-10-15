import { wholePhrasePattern } from "../text";

export function containsAnyWord(text: string, words: readonly string[]): boolean {
  const lowered = text.toLowerCase();
  return words.some((word) => wholeWordIndex(lowered, word) >= 0);
}

// Where the word starts as a whole word in already lowered text, or -1.
export function wholeWordIndex(loweredText: string, word: string): number {
  const match = wholePhrasePattern([word]).exec(loweredText);
  return match === null ? -1 : match.index + (match[1] ?? "").length;
}
