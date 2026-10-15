import type { CategoryId, Color, Tag } from "@/core";
import { capitalize } from "../text";
import { CATEGORY_MAP } from "./category-map";
import { TAG_RULES } from "./tag-rules";

export function categoryLabel(category: CategoryId): string {
  return CATEGORY_MAP[category].label;
}

export function categoryPlural(category: CategoryId): string {
  return CATEGORY_MAP[category].plural;
}

// "Audio devices": the plural as a department or chip names it.
export function departmentLabel(category: CategoryId): string {
  return capitalize(categoryPlural(category));
}

export function tagLabel(tag: Tag): string {
  return TAG_RULES[tag].label;
}

export function tagInSentence(tag: Tag): string {
  return TAG_RULES[tag].inSentence;
}

export function tagPhrase(tag: Tag): string {
  return TAG_RULES[tag].keywords[0] ?? tag;
}

export function colorLabel(color: Color): string {
  return capitalize(color);
}
