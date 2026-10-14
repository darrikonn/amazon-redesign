import { NotFoundError } from "../error/not-found-error";

export const CATEGORIES = [
  { id: "desk-lamp", singularName: "desk lamp", pluralName: "desk lamps" },
  { id: "headphones", singularName: "headphones", pluralName: "headphones" },
  { id: "backpack", singularName: "backpack", pluralName: "backpacks" },
  { id: "coffee-maker", singularName: "coffee maker", pluralName: "coffee makers" },
] as const satisfies readonly CategoryShape[];

export type Category = (typeof CATEGORIES)[number];

export type CategoryId = Category["id"];

type CategoryShape = {
  id: string;
  singularName: string;
  pluralName: string;
};

export function demandCategory(id: CategoryId): Category {
  const category = CATEGORIES.find((candidate) => candidate.id === id);
  if (category === undefined) throw new NotFoundError("category", id);
  return category;
}
