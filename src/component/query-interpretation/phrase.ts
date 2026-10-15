import { collapseWhitespace, wholePhrasePattern } from "../text";

export function appendPhrase(text: string, phrase: string): string {
  return collapseWhitespace(`${text} ${phrase}`);
}

export function removePhrase(text: string, phrase: string): string {
  return replacePhrase(text, phrase, " ");
}

export function replacePhrase(text: string, phrase: string, replacement: string): string {
  const match = wholePhrasePattern([phrase]).exec(text.toLowerCase());
  if (match === null) return collapseWhitespace(text);
  const start = match.index + (match[1] ?? "").length;
  return collapseWhitespace(
    `${text.slice(0, start)}${replacement}${text.slice(start + phrase.length)}`,
  );
}
