export function appendPhrase(text: string, phrase: string): string {
  return collapseWhitespace(`${text} ${phrase}`);
}

export function removePhrase(text: string, phrase: string): string {
  const match = wholePhrasePattern([phrase]).exec(text.toLowerCase());
  if (match === null) return collapseWhitespace(text);
  const start = match.index + (match[1] ?? "").length;
  return collapseWhitespace(`${text.slice(0, start)} ${text.slice(start + phrase.length)}`);
}

export function replacePhrase(text: string, phrase: string, replacement: string): string {
  const match = wholePhrasePattern([phrase]).exec(text.toLowerCase());
  if (match === null) return collapseWhitespace(text);
  const start = match.index + (match[1] ?? "").length;
  return collapseWhitespace(
    `${text.slice(0, start)}${replacement}${text.slice(start + phrase.length)}`,
  );
}

// Matches any of the phrases as whole words, so "red" never matches inside "shredder".
// Group 1 is the leading boundary character, group 2 the phrase itself.
export function wholePhrasePattern(phrases: readonly string[]): RegExp {
  const alternatives = phrases.map(escapeForPattern).join("|");
  return new RegExp(`(^|[^a-z0-9])(${alternatives})(?![a-z0-9])`);
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function escapeForPattern(phrase: string): string {
  return phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
