import { PRODUCT_FACT_RULES } from "./product-fact-rule";

export function trimName(title: string): string {
  const name = title.trim().replace(/\s+/g, " ");
  if (name.length <= PRODUCT_FACT_RULES.maximumNameLength) return name;
  const cut = name.slice(0, PRODUCT_FACT_RULES.maximumNameLength + 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (
    lastSpace > 0 ? cut.slice(0, lastSpace) : cut.slice(0, PRODUCT_FACT_RULES.maximumNameLength)
  ).trimEnd();
}
