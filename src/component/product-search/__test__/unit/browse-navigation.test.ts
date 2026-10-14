import { describe, expect, it } from "vitest";
import {
  type BrowseNavigation,
  buildBrowseNavigation,
  filterProducts,
  interpretQuery,
  NAVIGATION_RULES,
} from "@/component";
import type { Product } from "@/core";
import { aProduct } from "@/test-support";

const watch = { category: "watches", categoryLabel: "watch", categoryPlural: "watches" } as const;
const jewellery = {
  category: "jewellery",
  categoryLabel: "piece of jewellery",
  categoryPlural: "jewellery",
} as const;

const catalog: Product[] = [
  aProduct({ ...watch, id: "rolex", tags: ["luxury"] }),
  aProduct({ ...watch, id: "longines", tags: ["luxury", "elegant"] }),
  aProduct({ ...watch, id: "belt", tags: ["leather"] }),
  aProduct({ ...jewellery, id: "earring" }),
  aProduct({ id: "laptop", tags: ["luxury"] }),
];

function navigationFor(text: string, products: readonly Product[] = catalog) {
  const interpretation = interpretQuery(text);
  return buildBrowseNavigation(
    products,
    interpretation,
    filterProducts(products, interpretation.intent),
  );
}

function departmentFor(navigation: BrowseNavigation, label: string) {
  return navigation.departments.find((department) => department.link.label === label);
}

function resultDepartmentLabels(navigation: BrowseNavigation) {
  return navigation.departments
    .filter((department) => department.containsResults)
    .map((department) => department.link.label);
}

describe("buildBrowseNavigation", () => {
  it("lists every department with products in the catalogue's order, with catalogue-wide counts", () => {
    const departments = navigationFor("luxury watches").departments.map((department) => [
      department.link.label,
      department.link.productCount,
    ]);

    expect(departments).toEqual([
      ["Laptops", 1],
      ["Watches", 3],
      ["Jewellery", 1],
    ]);
  });

  it("reads the same on every search, so clicking through it never reshuffles it", () => {
    function directory(text: string) {
      return navigationFor(text).departments.map((department) => ({
        link: [department.link.label, department.link.productCount, department.link.text],
        groups: department.groups.map((group) => [group.label, group.productCount, group.text]),
      }));
    }

    expect(directory("luxury")).toEqual(directory("watches"));
    expect(directory("purple watches")).toEqual(directory("watches"));
    expect(directory("leather")).toEqual(directory("jewellery"));
  });

  it("marks the department the results belong to and lists its sub-groups", () => {
    const navigation = navigationFor("luxury watches");

    expect(resultDepartmentLabels(navigation)).toEqual(["Watches"]);
    expect(departmentFor(navigation, "Watches")).toEqual({
      link: { label: "Watches", productCount: 3, text: "watches", isCurrent: false },
      containsResults: true,
      groups: [
        { label: "Luxury", productCount: 2, text: "luxury watches", isCurrent: true },
        { label: "Elegant", productCount: 1, text: "elegant watches", isCurrent: false },
        { label: "Leather", productCount: 1, text: "leather watches", isCurrent: false },
      ],
    });
  });

  it("marks the department itself as current when nothing else was asked", () => {
    expect(departmentFor(navigationFor("watches"), "Watches")?.link.isCurrent).toBe(true);
  });

  it("marks no entry as current when the search is narrower than any entry", () => {
    const navigation = navigationFor("luxury watches over $100");
    const entries = navigation.departments.flatMap((department) => [
      department.link,
      ...department.groups,
    ]);

    expect(resultDepartmentLabels(navigation)).toEqual(["Watches"]);
    expect(entries.some((entry) => entry.isCurrent)).toBe(false);
  });

  it("uses the department all results share even when the text did not name it", () => {
    expect(resultDepartmentLabels(navigationFor("leather"))).toEqual(["Watches"]);
  });

  it("marks no department when the results span several", () => {
    expect(resultDepartmentLabels(navigationFor("luxury"))).toEqual([]);
  });

  it("still marks the department that was asked for when nothing in it matched", () => {
    expect(resultDepartmentLabels(navigationFor("purple watches"))).toEqual(["Watches"]);
  });

  it("caps the number of sub-group links", () => {
    const tags = [
      "luxury",
      "elegant",
      "leather",
      "steel",
      "durable",
      "smart",
      "casual",
      "women",
      "men",
    ] as const;
    const many = tags.map((tag) => aProduct({ ...watch, id: tag, tags: [tag] }));
    const watches = departmentFor(navigationFor("watches", many), "Watches");

    expect(watches?.groups).toHaveLength(NAVIGATION_RULES.maximumGroupLinks);
  });
});
