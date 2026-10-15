import type { Color } from "@/core";
import { COLORS } from "@/core";
import { COLOR_WORDS } from "../catalog-vocabulary";
import { wholeWordIndex } from "./word-match";

export function extractColor(title: string, description: string): Color | null {
  return firstColorIn(title) ?? firstColorIn(description);
}

// The earliest colour word wins; at the same position the longer word wins, so
// "rose gold" beats "gold".
function firstColorIn(text: string): Color | null {
  const lowered = text.toLowerCase();
  let best: { color: Color; index: number; length: number } | null = null;
  for (const color of COLORS) {
    for (const word of COLOR_WORDS[color]) {
      const index = wholeWordIndex(lowered, word);
      if (index < 0) continue;
      if (
        best === null ||
        index < best.index ||
        (index === best.index && word.length > best.length)
      ) {
        best = { color, index, length: word.length };
      }
    }
  }
  return best === null ? null : best.color;
}
