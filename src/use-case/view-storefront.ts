import { buildBrowseNavigation, interpretQuery, STARTER_QUERIES } from "@/component";
import type { ProductRepository } from "@/core";
import type { NavigationLinkView } from "./search-catalog";

export type Storefront = {
  starterQueries: readonly string[];
  departments: readonly Department[];
};

export type Department = {
  label: string;
  query: string;
  productCount: number;
  groups: readonly DepartmentGroup[];
};

export type DepartmentGroup = {
  label: string;
  query: string;
  productCount: number;
};

// The menu's departments are the same directory as the results panel (ADR 0028), read
// for no search in particular.
export class ViewStorefront {
  constructor(private readonly products: ProductRepository) {}

  async execute(): Promise<Storefront> {
    const directory = buildBrowseNavigation(await this.products.list(), interpretQuery(""), []);
    return {
      starterQueries: STARTER_QUERIES,
      departments: directory.departments.map((department) => ({
        ...toEntry(department.link),
        groups: department.groups.map(toEntry),
      })),
    };
  }
}

function toEntry(link: NavigationLinkView): DepartmentGroup {
  return { label: link.label, query: link.text, productCount: link.productCount };
}
