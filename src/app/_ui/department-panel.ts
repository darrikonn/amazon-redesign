import type { NavigationDepartmentView, NavigationView, ProductTeaserView } from "@/use-case";

// What the department panel remembers between searches (ADR 0028). Departments open and
// nothing closes or shrinks by itself: the department the results move into opens, the one
// they left stays open with its popular products, and only the shopper's toggle closes one.
export type DepartmentPanel = {
  openByDepartment: ReadonlyMap<string, boolean>;
  markedText: string | null;
  popularByDepartment: ReadonlyMap<string, readonly ProductTeaserView[]>;
};

export const DEPARTMENT_PANEL_RULES = {
  // The rest wait behind "See all departments", so a short result list is not dwarfed by
  // a long panel; departments that are open or hold the results always show.
  collapsedDepartmentCount: 8,
} as const;

export function startPanel(navigation: NavigationView): DepartmentPanel {
  return followNavigation(
    {
      openByDepartment: new Map(),
      markedText: markedTextOf(navigation),
      popularByDepartment: new Map(),
    },
    navigation,
  );
}

// Returns the same panel when the navigation changes nothing, so it can be compared.
export function followNavigation(
  panel: DepartmentPanel,
  navigation: NavigationView,
): DepartmentPanel {
  const withMarked = followMarkedDepartment(panel, navigation);
  return keepPopularProducts(withMarked, navigation);
}

export function toggleDepartment(
  panel: DepartmentPanel,
  department: NavigationDepartmentView,
): DepartmentPanel {
  const openByDepartment = new Map(panel.openByDepartment).set(
    department.link.text,
    !isDepartmentOpen(panel, department),
  );
  return { ...panel, openByDepartment };
}

export function isDepartmentOpen(
  panel: DepartmentPanel,
  department: NavigationDepartmentView,
): boolean {
  return panel.openByDepartment.get(department.link.text) ?? department.containsResults;
}

export function popularFor(
  panel: DepartmentPanel,
  department: NavigationDepartmentView,
): readonly ProductTeaserView[] {
  if (department.popular.length > 0) return department.popular;
  return panel.popularByDepartment.get(department.link.text) ?? [];
}

export function shownDepartments(
  panel: DepartmentPanel,
  navigation: NavigationView,
  isShowingAll: boolean,
): readonly NavigationDepartmentView[] {
  if (isShowingAll) return navigation.departments;
  return navigation.departments.filter(
    (department, index) =>
      index < DEPARTMENT_PANEL_RULES.collapsedDepartmentCount ||
      department.containsResults ||
      isDepartmentOpen(panel, department),
  );
}

function markedTextOf(navigation: NavigationView): string | null {
  return navigation.departments.find((department) => department.containsResults)?.link.text ?? null;
}

function followMarkedDepartment(
  panel: DepartmentPanel,
  navigation: NavigationView,
): DepartmentPanel {
  const markedText = markedTextOf(navigation);
  if (markedText === panel.markedText) return panel;
  const openByDepartment = new Map(panel.openByDepartment);
  for (const text of [panel.markedText, markedText])
    if (text !== null) openByDepartment.set(text, true);
  return { ...panel, openByDepartment, markedText };
}

function keepPopularProducts(panel: DepartmentPanel, navigation: NavigationView): DepartmentPanel {
  const marked = navigation.departments.find((department) => department.containsResults);
  if (marked === undefined || marked.popular.length === 0) return panel;
  if (panel.popularByDepartment.get(marked.link.text) === marked.popular) return panel;
  const popularByDepartment = new Map(panel.popularByDepartment).set(
    marked.link.text,
    marked.popular,
  );
  return { ...panel, popularByDepartment };
}
