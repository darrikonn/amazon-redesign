import type { CategoryId } from "@/core";
import { CATEGORY_IDS } from "@/core";
import { CATEGORY_MAP, CATEGORY_REFINEMENTS } from "../catalog-vocabulary";
import { containsAnyWord } from "./word-match";

// A word in the title can move an item out of a mixed source category; an unknown source
// category fails loudly so it is mapped, not dropped.
export function mapCategory(sourceCategory: string, title: string): CategoryId {
  const refinement = CATEGORY_REFINEMENTS.find(
    (candidate) =>
      candidate.sourceCategory === sourceCategory && containsAnyWord(title, candidate.titleWords),
  );
  if (refinement !== undefined) return refinement.category;
  const category = CATEGORY_IDS.find((id) =>
    CATEGORY_MAP[id].sourceCategories.includes(sourceCategory),
  );
  if (category === undefined)
    throw new Error(`Unmapped source category "${sourceCategory}" in category-map.ts`);
  return category;
}
