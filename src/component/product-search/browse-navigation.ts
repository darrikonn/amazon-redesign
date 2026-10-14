import type { CategoryId, Interpretation, Product, Tag } from "@/core";
import {
  CATEGORY_MAP,
  capitalize,
  RELATED_CATEGORIES,
  tagLabel,
  tagPhrase,
} from "../catalog-vocabulary";
import { appendPhrase } from "../query-interpretation";

export const NAVIGATION_RULES = {
  maximumTagLinks: 8,
  maximumRelatedLinks: 4,
  maximumDepartmentLinks: 8,
} as const;

export type NavigationLink = {
  label: string;
  productCount: number;
  text: string;
  isCurrent: boolean;
  // True when the link adds to the current search instead of going somewhere fixed, so it
  // is only valid for the search it was built from.
  narrowsSearch: boolean;
};

export type BrowseNavigation = {
  heading: NavigationLink | null;
  headingLabel: string;
  links: readonly NavigationLink[];
  related: readonly NavigationLink[];
};

// Department entries browse the department as a whole, like a store directory; narrowing
// the current search is what the "Add a detail" chips are for. Results spread over several
// departments get links that narrow the search to one of them instead.
export function buildBrowseNavigation(
  catalog: readonly Product[],
  text: string,
  interpretation: Interpretation,
  matches: readonly Product[],
): BrowseNavigation | null {
  if (matches.length === 0) return null;
  const category = interpretation.intent.category ?? sharedCategory(matches);
  return category === null
    ? departmentsNavigation(text, matches)
    : categoryNavigation(catalog, interpretation, category);
}

function sharedCategory(matches: readonly Product[]): CategoryId | null {
  const first = matches[0]?.category ?? null;
  return matches.every((product) => product.category === first) ? first : null;
}

function departmentsNavigation(text: string, matches: readonly Product[]): BrowseNavigation {
  const links = countBy(matches.map((product) => product.category))
    .slice(0, NAVIGATION_RULES.maximumDepartmentLinks)
    .map(([category, productCount]) => ({
      label: departmentLabel(category),
      productCount,
      text: appendPhrase(text, CATEGORY_MAP[category].plural),
      isCurrent: false,
      narrowsSearch: true,
    }));
  return { heading: null, headingLabel: "Results by department", links, related: [] };
}

// Most common first; ties keep the order of first appearance, so the result is stable.
function countBy<Key>(keys: readonly Key[]): [Key, number][] {
  const counts = new Map<Key, number>();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  return [...counts.entries()].sort(([, first], [, second]) => second - first);
}

function departmentLabel(category: CategoryId): string {
  return capitalize(CATEGORY_MAP[category].plural);
}

function categoryNavigation(
  catalog: readonly Product[],
  interpretation: Interpretation,
  category: CategoryId,
): BrowseNavigation {
  const inCategory = catalog.filter((product) => product.category === category);
  const plural = CATEGORY_MAP[category].plural;
  return {
    heading: {
      label: departmentLabel(category),
      productCount: inCategory.length,
      text: plural,
      isCurrent: isExactly(interpretation, category, null),
      narrowsSearch: false,
    },
    headingLabel: departmentLabel(category),
    links: tagLinks(inCategory, interpretation, category),
    related: relatedLinks(catalog, category),
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

function tagLinks(
  inCategory: readonly Product[],
  interpretation: Interpretation,
  category: CategoryId,
): NavigationLink[] {
  const plural = CATEGORY_MAP[category].plural;
  return countBy(inCategory.flatMap((product) => product.tags))
    .slice(0, NAVIGATION_RULES.maximumTagLinks)
    .map(([tag, productCount]) => ({
      label: tagLabel(tag),
      productCount,
      text: `${tagPhrase(tag)} ${plural}`,
      isCurrent: isExactly(interpretation, category, tag),
      narrowsSearch: false,
    }));
}

function relatedLinks(catalog: readonly Product[], category: CategoryId): NavigationLink[] {
  return RELATED_CATEGORIES[category]
    .map((related) => ({
      label: departmentLabel(related),
      productCount: catalog.filter((product) => product.category === related).length,
      text: CATEGORY_MAP[related].plural,
      isCurrent: false,
      narrowsSearch: false,
    }))
    .filter((link) => link.productCount > 0)
    .slice(0, NAVIGATION_RULES.maximumRelatedLinks);
}
