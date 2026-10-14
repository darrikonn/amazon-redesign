import type { CategoryId, Color, Tag } from "@/core";
import { parseCatalogVocabulary } from "./catalog-vocabulary";
import generatedVocabulary from "./vocabulary.json";

// What the current catalogue actually contains. `yarn catalog:build` regenerates vocabulary.json;
// the search bar only offers categories and tags that some product has.
const VOCABULARY = parseCatalogVocabulary(generatedVocabulary);

export const LIVE_CATEGORIES: readonly CategoryId[] = VOCABULARY.categories
  .filter((entry) => entry.productCount > 0)
  .map((entry) => entry.id);

export const LIVE_TAGS: readonly Tag[] = VOCABULARY.tags.map((entry) => entry.id);

export const KNOWN_COLORS: readonly Color[] = VOCABULARY.colors.map((entry) => entry.id);
