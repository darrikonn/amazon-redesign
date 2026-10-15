import { type RefObject, useEffect } from "react";

// While active, everything on the page outside the container is inert and the page does not
// scroll, so a drawer that covers the page behaves like the modal it looks like: Tab and a
// screen reader stay inside it.
export function useInertOutside(containerRef: RefObject<HTMLElement | null>, isActive: boolean) {
  useEffect(() => {
    const container = containerRef.current;
    if (!isActive || container === null) return;
    const madeInert = siblingsUpTheTree(container).filter((element) => !element.inert);
    for (const element of madeInert) element.inert = true;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      for (const element of madeInert) element.inert = false;
      document.body.style.overflow = overflow;
    };
  }, [containerRef, isActive]);
}

function siblingsUpTheTree(element: HTMLElement): HTMLElement[] {
  const siblings: HTMLElement[] = [];
  let current: HTMLElement | null = element;
  while (current !== null && current !== document.body) {
    const parent: HTMLElement | null = current.parentElement;
    for (const sibling of parent?.children ?? []) {
      if (sibling !== current && sibling instanceof HTMLElement) siblings.push(sibling);
    }
    current = parent;
  }
  return siblings;
}
