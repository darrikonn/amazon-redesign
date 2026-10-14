import type { MouseEvent } from "react";

// A click that should act in place; a middle click or a modified click keeps the browser's
// own link behaviour, such as opening a new tab.
export function isPlainClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}
