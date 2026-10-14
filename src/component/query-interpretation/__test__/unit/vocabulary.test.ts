import { describe, expect, it } from "vitest";
import {
  CATEGORY_MAP,
  CATEGORY_PHRASES,
  COLOR_PHRASES,
  interpretQuery,
  LIVE_CATEGORIES,
  LIVE_TAGS,
  TAG_PHRASES,
  TAG_RULES,
  tagPhrase,
} from "@/component";

describe("search vocabulary", () => {
  it("is ordered longest phrase first", () => {
    for (const phrases of [CATEGORY_PHRASES, TAG_PHRASES, COLOR_PHRASES]) {
      const lengths = phrases.map((entry) => entry.phrase.length);
      expect(lengths).toEqual([...lengths].sort((first, second) => second - first));
    }
  });

  it("reads every live category's label and plural back as that category", () => {
    for (const category of LIVE_CATEGORIES) {
      expect(interpretQuery(CATEGORY_MAP[category].label).intent.category).toBe(category);
      expect(interpretQuery(CATEGORY_MAP[category].plural).intent.category).toBe(category);
    }
  });

  it("reads every live tag's suggestion phrase back as that tag", () => {
    for (const tag of LIVE_TAGS) {
      expect(interpretQuery(tagPhrase(tag)).intent.tags).toEqual([tag]);
    }
  });

  it("never lets a tag keyword shadow a category synonym or a colour word", () => {
    const tagKeywords = new Set(Object.values(TAG_RULES).flatMap((rule) => rule.keywords));
    const shadowed = [...CATEGORY_PHRASES, ...COLOR_PHRASES].filter((entry) =>
      tagKeywords.has(entry.phrase),
    );

    expect(shadowed).toEqual([]);
  });

  it("gives each category phrase to one category only", () => {
    const phrases = CATEGORY_PHRASES.map((entry) => entry.phrase);

    expect(new Set(phrases).size).toBe(phrases.length);
  });
});
