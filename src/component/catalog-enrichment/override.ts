import type { CategoryId, Color, ProductSource, Tag } from "@/core";
import {
  isCategoryId,
  isColor,
  isProductSource,
  isTag,
  requireNumber,
  requireRecord,
  requireString,
  requireStringArray,
} from "@/core";

export type ProductOverride = {
  reason: string;
  name?: string;
  category?: CategoryId;
  color?: Color | null;
  tags?: readonly Tag[];
  deliveryDays?: number;
  brand?: string | null;
};

export type CatalogOverrides = Readonly<
  Record<ProductSource, Readonly<Record<string, ProductOverride>>>
>;

export function parseOverrides(json: unknown): CatalogOverrides {
  const root = requireRecord(json, "overrides");
  const unknownSource = Object.keys(root).find((key) => !isProductSource(key));
  if (unknownSource !== undefined) throw new Error(`overrides: unknown source "${unknownSource}"`);
  return {
    dummyjson: readSourceOverrides(root.dummyjson, "dummyjson"),
    fakestore: readSourceOverrides(root.fakestore, "fakestore"),
  };
}

function readSourceOverrides(
  value: unknown,
  source: ProductSource,
): Record<string, ProductOverride> {
  if (value === undefined) return {};
  const entries = requireRecord(value, `overrides.${source}`);
  return Object.fromEntries(
    Object.entries(entries).map(([sourceId, entry]) => [
      sourceId,
      readOverride(entry, `overrides.${source}.${sourceId}`),
    ]),
  );
}

function readOverride(value: unknown, context: string): ProductOverride {
  const record = requireRecord(value, context);
  const reason = requireString(record, "reason", context);
  if (reason.trim() === "") throw new Error(`${context}: every override needs a reason`);
  return {
    reason,
    ...("name" in record ? { name: requireString(record, "name", context) } : {}),
    ...("category" in record
      ? { category: readCategory(requireString(record, "category", context), context) }
      : {}),
    ...("color" in record ? { color: readColor(record.color, context) } : {}),
    ...("tags" in record
      ? { tags: requireStringArray(record, "tags", context).map((tag) => readTag(tag, context)) }
      : {}),
    ...("deliveryDays" in record
      ? { deliveryDays: requireNumber(record, "deliveryDays", context) }
      : {}),
    ...("brand" in record
      ? { brand: record.brand === null ? null : requireString(record, "brand", context) }
      : {}),
  };
}

function readCategory(value: string, context: string): CategoryId {
  if (!isCategoryId(value)) throw new Error(`${context}: unknown category "${value}"`);
  return value;
}

function readColor(value: unknown, context: string): Color | null {
  if (value === null) return null;
  if (typeof value !== "string" || !isColor(value))
    throw new Error(`${context}: unknown colour "${String(value)}"`);
  return value;
}

function readTag(value: string, context: string): Tag {
  if (!isTag(value)) throw new Error(`${context}: unknown tag "${value}"`);
  return value;
}
