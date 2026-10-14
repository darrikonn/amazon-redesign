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
};

export type BrowseNavigation = {
  heading: NavigationLink | null;
  headingLabel: string;
  links: readonly NavigationLink[];
  related: readonly NavigationLink[];
};

// The panel beside successful results. When the results sit in one department it shows
// that department and its sub-groups across the whole catalogue, plus related
// departments; otherwise it splits the results by department.
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
    }));
  return { heading: null, headingLabel: "Results by department", links, related: [] };
}

function categoryNavigation(
  catalog: readonly Product[],
  interpretation: Interpretation,
  category: CategoryId,
): BrowseNavigation {
  const inCategory = catalog.filter((product) => product.category === category);
  const plural = CATEGORY_MAP[category].plural;
  const isWholeCategory = interpretation.terms.every((term) => term.kind === "category");
  return {
    heading: {
      label: departmentLabel(category),
      productCount: inCategory.length,
      text: plural,
      isCurrent: isWholeCategory,
    },
    headingLabel: departmentLabel(category),
    links: tagLinks(inCategory, interpretation.intent.tags, plural),
    related: relatedLinks(catalog, category),
  };
}

function tagLinks(
  inCategory: readonly Product[],
  currentTags: readonly Tag[],
  plural: string,
): NavigationLink[] {
  return countBy(inCategory.flatMap((product) => product.tags))
    .slice(0, NAVIGATION_RULES.maximumTagLinks)
    .map(([tag, productCount]) => ({
      label: tagLabel(tag),
      productCount,
      text: `${tagPhrase(tag)} ${plural}`,
      isCurrent: currentTags.length === 1 && currentTags[0] === tag,
    }));
}

function relatedLinks(catalog: readonly Product[], category: CategoryId): NavigationLink[] {
  return RELATED_CATEGORIES[category]
    .map((related) => ({
      label: departmentLabel(related),
      productCount: catalog.filter((product) => product.category === related).length,
      text: CATEGORY_MAP[related].plural,
      isCurrent: false,
    }))
    .filter((link) => link.productCount > 0)
    .slice(0, NAVIGATION_RULES.maximumRelatedLinks);
}

function departmentLabel(category: CategoryId): string {
  return capitalize(CATEGORY_MAP[category].plural);
}

// Most common first; ties keep the order of first appearance, so the result is stable.
function countBy<Key>(keys: readonly Key[]): [Key, number][] {
  const counts = new Map<Key, number>();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  return [...counts.entries()].sort(([, first], [, second]) => second - first);
}
