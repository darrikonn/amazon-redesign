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
