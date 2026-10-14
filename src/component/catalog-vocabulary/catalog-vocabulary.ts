import type { CategoryId, Color, Tag } from "@/core";
import {
  isCategoryId,
  isColor,
  isTag,
  requireArray,
  requireNumber,
  requireRecord,
  requireString,
} from "@/core";

export type VocabularyEntry<Id> = {
  id: Id;
  productCount: number;
};

export type CatalogVocabulary = {
  categories: readonly VocabularyEntry<CategoryId>[];
  tags: readonly VocabularyEntry<Tag>[];
  colors: readonly VocabularyEntry<Color>[];
};

export function parseCatalogVocabulary(json: unknown): CatalogVocabulary {
  const root = requireRecord(json, "vocabulary");
  return {
    categories: readEntries(root.categories, "categories", isCategoryId),
    tags: readEntries(root.tags, "tags", isTag),
    colors: readEntries(root.colors, "colors", isColor),
  };
}

function readEntries<Id extends string>(
  value: unknown,
  context: string,
  isId: (candidate: string) => candidate is Id,
): VocabularyEntry<Id>[] {
  return requireArray(value, context).map((item, index) => {
    const record = requireRecord(item, `${context}[${index}]`);
    const id = requireString(record, "id", `${context}[${index}]`);
    if (!isId(id)) throw new Error(`${context}[${index}]: unknown id "${id}"`);
    return { id, productCount: requireNumber(record, "productCount", `${context}[${index}]`) };
  });
}
