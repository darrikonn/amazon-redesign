export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// "a", "a and b", "a, b and c".
export function joinWithAnd(items: readonly string[]): string {
  const last = items.at(-1) ?? "";
  return items.length < 2 ? last : `${items.slice(0, -1).join(", ")} and ${last}`;
}

// By code unit, not locale, so the order is the same on every machine.
export function compareText(first: string, second: string): number {
  if (first === second) return 0;
  return first < second ? -1 : 1;
}

// Matches any of the phrases as whole words, so "red" never matches inside "shredder".
// Group 1 is the leading boundary character, group 2 the phrase itself.
export function wholePhrasePattern(phrases: readonly string[]): RegExp {
  const alternatives = phrases.map(escapeForPattern).join("|");
  return new RegExp(`(^|[^a-z0-9])(${alternatives})(?![a-z0-9])`);
}

export function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function escapeForPattern(phrase: string): string {
  return phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
