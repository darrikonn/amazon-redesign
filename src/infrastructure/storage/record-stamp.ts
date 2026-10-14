type Stamped = {
  created: string;
  modified: string | null;
};

// The repository's half of ADR 0007: a new record keeps modified null; saving over an
// existing one keeps its created and sets modified to now.
export function stampModified<Item extends Stamped>(
  record: Item,
  existing: Stamped | undefined,
  now: Date,
): Item {
  if (existing === undefined) return { ...record, modified: null };
  return { ...record, created: existing.created, modified: now.toISOString() };
}
