import { isOneOf } from "../literal/is-one-of";
// Ordered so that "rose gold" is tried before "gold".
export const COLORS = [
  "rose gold",
  "black",
  "white",
  "grey",
  "silver",
  "gold",
  "blue",
  "navy",
  "green",
  "red",
  "pink",
  "purple",
  "brown",
  "beige",
  "yellow",
  "orange",
] as const;

export type Color = (typeof COLORS)[number];

export function isColor(value: string): value is Color {
  return isOneOf(COLORS, value);
}
