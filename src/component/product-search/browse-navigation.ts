import type { CategoryId, Interpretation, Product, Tag } from "@/core";
import { CATEGORY_IDS } from "@/core";
import { CATEGORY_MAP, capitalize, tagLabel, tagPhrase } from "../catalog-vocabulary";

export const NAVIGATION_RULES = {
  maximumGroupLinks: 8,
  maximumPopularProducts: 3,
} as const;

export type NavigationLink = {
  label: string;
  productCount: number;
  text: string;
  isCurrent: boolean;
};

export type NavigationDepartment = {
  link: NavigationLink;
  containsResults: boolean;
  groups: readonly NavigationLink[];
  popular: readonly Product[];
};

export type BrowseNavigation = {
  departments: readonly NavigationDepartment[];
};

// A store directory: every department that has products, in a fixed order, with
// catalogue-wide counts, so the panel reads the same on every search and clicking through
// it never reshuffles it. Only the markers move: the department the results belong to,
// and the entry that is exactly the current search. The department holding the results
// also lists its best-rated products.
export function buildBrowseNavigation(
  catalog: readonly Product[],
  interpretation: Interpretation,
  matches: readonly Product[],
): BrowseNavigation {
  const resultCategory = interpretation.intent.category ?? sharedCategory(matches);
  const departments = CATEGORY_IDS.map((category) =>
    departmentEntry(catalog, interpretation, matches, category, resultCategory),
  ).filter((department) => department.link.productCount > 0);
  return { departments };
}

function sharedCategory(matches: readonly Product[]): CategoryId | null {
  const first = matches[0]?.category ?? null;
  return matches.every((product) => product.category === first) ? first : null;
}

function departmentEntry(
  catalog: readonly Product[],
  interpretation: Interpretation,
  matches: readonly Product[],
  category: CategoryId,
  resultCategory: CategoryId | null,
): NavigationDepartment {
  const inCategory = catalog.filter((product) => product.category === category);
  return {
    link: {
      label: capitalize(CATEGORY_MAP[category].plural),
      productCount: inCategory.length,
      text: CATEGORY_MAP[category].plural,
      isCurrent: isExactly(interpretation, category, null),
    },
    containsResults: category === resultCategory,
    groups: groupLinks(inCategory, interpretation, category),
    popular: category === resultCategory ? popularProducts(inCategory, matches) : [],
  };
}

// An entry is current only when the search is exactly that entry, so a narrower search
// (with a price, say) never claims to be the plain department page.
function isExactly(interpretation: Interpretation, category: CategoryId, tag: Tag | null): boolean {
  const { intent, terms } = interpretation;
  const expectedTerms = tag === null ? 1 : 2;
  const tagsMatch =
    tag === null ? intent.tags.length === 0 : intent.tags.length === 1 && intent.tags[0] === tag;
  return intent.category === category && tagsMatch && terms.length === expectedTerms;
}

function groupLinks(
  inCategory: readonly Product[],
  interpretation: Interpretation,
  category: CategoryId,
): NavigationLink[] {
  const plural = CATEGORY_MAP[category].plural;
  return countBy(inCategory.flatMap((product) => product.tags))
    .slice(0, NAVIGATION_RULES.maximumGroupLinks)
    .map(([tag, productCount]) => ({
      label: tagLabel(tag),
      productCount,
      text: `${tagPhrase(tag)} ${plural}`,
      isCurrent: isExactly(interpretation, category, tag),
    }));
}

// Most common first; ties keep the order of first appearance, so the result is stable.
function countBy<Key>(keys: readonly Key[]): [Key, number][] {
  const counts = new Map<Key, number>();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  return [...counts.entries()].sort(([, first], [, second]) => second - first);
}

// Best rated first, preferring products the results are not already showing, so the panel
// offers something new to look at.
function popularProducts(inCategory: readonly Product[], matches: readonly Product[]): Product[] {
  const shown = new Set(matches.map((product) => product.id));
  return [...inCategory]
    .sort(
      (first, second) =>
        Number(shown.has(first.id)) - Number(shown.has(second.id)) ||
        second.rating - first.rating ||
        compareIds(first, second),
    )
    .slice(0, NAVIGATION_RULES.maximumPopularProducts);
}

function compareIds(first: Product, second: Product): number {
  if (first.id === second.id) return 0;
  return first.id < second.id ? -1 : 1;
}
