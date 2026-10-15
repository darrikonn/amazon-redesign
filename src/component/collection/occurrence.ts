export function countOccurrences<Key>(keys: Iterable<Key>): Map<Key, number> {
  const counts = new Map<Key, number>();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  return counts;
}

// Most common first; ties keep the order of first appearance, so the result is stable.
export function mostCommonFirst<Key>(keys: Iterable<Key>): [Key, number][] {
  return [...countOccurrences(keys).entries()].sort(([, first], [, second]) => second - first);
}
