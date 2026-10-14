import { CATEGORY_MAP, capitalize, LIVE_CATEGORIES, STARTER_QUERIES } from "@/component";
import type { CategoryId } from "@/core";

export type Storefront = {
  starterQueries: readonly string[];
  departments: readonly Department[];
};

export type Department = {
  label: string;
  query: string;
};

export class ViewStorefront {
  async execute(): Promise<Storefront> {
    return {
      starterQueries: STARTER_QUERIES,
      departments: LIVE_CATEGORIES.map(toDepartment),
    };
  }
}

function toDepartment(category: CategoryId): Department {
  const plural = CATEGORY_MAP[category].plural;
  return { label: capitalize(plural), query: plural };
}
