import type { Tag } from "@/core";
import { TAGS } from "@/core";
import { TAG_RULES } from "../catalog-vocabulary";
import { containsAnyWord } from "./word-match";

export function deriveTags(texts: readonly string[]): Tag[] {
  const searchable = texts.join(" \n ");
  return TAGS.filter((tag) => containsAnyWord(searchable, TAG_RULES[tag].keywords));
}
