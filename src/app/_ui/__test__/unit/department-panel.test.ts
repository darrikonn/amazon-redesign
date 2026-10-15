import { describe, expect, it } from "vitest";
import {
  DEPARTMENT_PANEL_RULES,
  followNavigation,
  isDepartmentOpen,
  popularFor,
  shownDepartments,
  startPanel,
  toggleDepartment,
} from "@/app/_ui/department-panel";
import type { NavigationDepartmentView, NavigationView, ProductTeaserView } from "@/use-case";

const watchTeaser: ProductTeaserView = {
  id: "watch",
  name: "Watch",
  category: "watches",
  image: null,
  priceInCents: 10_000,
  rating: 4.5,
};

function aDepartment(text: string, overrides: Partial<NavigationDepartmentView> = {}) {
  return {
    link: { label: text, productCount: 3, text, isCurrent: false },
    containsResults: false,
    groups: [],
    popular: [],
    ...overrides,
  } satisfies NavigationDepartmentView;
}

function navigationWithResultsIn(text: string | null): NavigationView {
  return {
    departments: ["phones", "watches", "bags"].map((name) =>
      aDepartment(name, name === text ? { containsResults: true, popular: [watchTeaser] } : {}),
    ),
  };
}

function department(navigation: NavigationView, text: string): NavigationDepartmentView {
  const found = navigation.departments.find((candidate) => candidate.link.text === text);
  if (found === undefined) throw new Error(`no ${text} department`);
  return found;
}

describe("department panel", () => {
  it("opens the department that holds the results", () => {
    const navigation = navigationWithResultsIn("watches");
    const panel = startPanel(navigation);

    expect(isDepartmentOpen(panel, department(navigation, "watches"))).toBe(true);
    expect(isDepartmentOpen(panel, department(navigation, "phones"))).toBe(false);
  });

  it("keeps the department the results left open, with its popular products", () => {
    // Arrange
    const panel = startPanel(navigationWithResultsIn("watches"));

    // Act
    const moved = navigationWithResultsIn("bags");
    const followed = followNavigation(panel, moved);

    // Assert
    expect(isDepartmentOpen(followed, department(moved, "watches"))).toBe(true);
    expect(isDepartmentOpen(followed, department(moved, "bags"))).toBe(true);
    expect(popularFor(followed, department(moved, "watches"))).toEqual([watchTeaser]);
  });

  it("changes nothing when the navigation moves nowhere", () => {
    const navigation = navigationWithResultsIn("watches");
    const panel = startPanel(navigation);

    expect(followNavigation(panel, navigation)).toBe(panel);
  });

  it("closes a department only when the shopper toggles it", () => {
    const navigation = navigationWithResultsIn("watches");
    const closed = toggleDepartment(startPanel(navigation), department(navigation, "watches"));

    expect(isDepartmentOpen(closed, department(navigation, "watches"))).toBe(false);
    expect(
      isDepartmentOpen(followNavigation(closed, navigation), department(navigation, "watches")),
    ).toBe(false);
  });

  it("shows the first departments, and always the open ones and the one with results", () => {
    // Arrange
    const count = DEPARTMENT_PANEL_RULES.collapsedDepartmentCount;
    const departments = Array.from({ length: count + 3 }, (_, index) =>
      aDepartment(`d${index}`, { containsResults: index === count + 1 }),
    );
    const navigation: NavigationView = { departments };
    const panel = toggleDepartment(startPanel(navigation), department(navigation, `d${count + 2}`));

    // Act
    const shown = shownDepartments(panel, navigation, false);

    // Assert
    expect(shown.map((entry) => entry.link.text)).toEqual([
      ...departments.slice(0, count).map((entry) => entry.link.text),
      `d${count + 1}`,
      `d${count + 2}`,
    ]);
    expect(shownDepartments(panel, navigation, true)).toHaveLength(count + 3);
  });
});
