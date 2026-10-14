import { NotFoundError } from "../error/not-found-error";

export type CategoryId = "desk-lamp" | "headphones" | "backpack" | "coffee-maker";

export type Category = {
  id: CategoryId;
  singularName: string;
  pluralName: string;
};

export const CATEGORIES: readonly Category[] = [
  { id: "desk-lamp", singularName: "desk lamp", pluralName: "desk lamps" },
  { id: "headphones", singularName: "headphones", pluralName: "headphones" },
  { id: "backpack", singularName: "backpack", pluralName: "backpacks" },
  { id: "coffee-maker", singularName: "coffee maker", pluralName: "coffee makers" },
];

export function demandCategory(id: CategoryId): Category {
  const category = CATEGORIES.find((candidate) => candidate.id === id);
  if (category === undefined) throw new NotFoundError("category", id);
  return category;
}
