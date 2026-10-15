export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function requireRecord(value: unknown, context: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${context}: expected an object`);
  return value;
}

export function requireArray(value: unknown, context: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${context}: expected an array`);
  return value;
}

export function requireString(
  record: Record<string, unknown>,
  key: string,
  context: string,
): string {
  const value = record[key];
  if (typeof value !== "string") throw new Error(`${context}: expected "${key}" to be a string`);
  return value;
}

export function requireNumber(
  record: Record<string, unknown>,
  key: string,
  context: string,
): number {
  const value = record[key];
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${context}: expected "${key}" to be a number`);
  }
  return value;
}

export function optionalNumber(
  record: Record<string, unknown>,
  key: string,
  context: string,
): number | null {
  const value = record[key];
  if (value === undefined || value === null) return null;
  return requireNumber(record, key, context);
}

export function optionalString(
  record: Record<string, unknown>,
  key: string,
  context: string,
): string | null {
  const value = record[key];
  if (value === undefined || value === null) return null;
  return requireString(record, key, context);
}

export function requireStringArray(
  record: Record<string, unknown>,
  key: string,
  context: string,
): string[] {
  return requireArray(record[key], `${context} "${key}"`).map((item, index) => {
    if (typeof item !== "string") throw new Error(`${context}: "${key}[${index}]" is not a string`);
    return item;
  });
}

type Guard<Value extends string> = (value: string) => value is Value;

// One of a closed list of literals (ADR 0003); `noun` names the list in the error.
export function requireOneOf<Value extends string>(
  value: string,
  isValue: Guard<Value>,
  noun: string,
  context: string,
): Value {
  if (!isValue(value)) throw new Error(`${context}: unknown ${noun} "${value}"`);
  return value;
}

export function optionalOneOf<Value extends string>(
  value: string | null,
  isValue: Guard<Value>,
  noun: string,
  context: string,
): Value | null {
  return value === null ? null : requireOneOf(value, isValue, noun, context);
}
