// The tab's name with nothing more specific to say, and the pattern for a page that has.
export const HOME_TITLE = "Amazon: just say what you need";
export const TITLE_TEMPLATE = "%s | Amazon";

export function shopTitle(name: string): string {
  return TITLE_TEMPLATE.replace("%s", name);
}
