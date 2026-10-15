export const NAME_FACT_RULES = {
  maximumLength: 60,
} as const;

export function trimName(title: string): string {
  const name = title.trim().replace(/\s+/g, " ");
  if (name.length <= NAME_FACT_RULES.maximumLength) return name;
  const cut = name.slice(0, NAME_FACT_RULES.maximumLength + 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (
    lastSpace > 0 ? cut.slice(0, lastSpace) : cut.slice(0, NAME_FACT_RULES.maximumLength)
  ).trimEnd();
}
