// Narrows a string to one of a closed list of literals (ADR 0003).
export function isOneOf<Value extends string>(
  values: readonly Value[],
  value: string,
): value is Value {
  return values.some((candidate) => candidate === value);
}
