// The removed item's controls are gone, so focus moves to the same control on the next item,
// or the one before it, or to the fallback (the page heading) once none are left.
export function focusAfterRemoval(
  itemIds: readonly string[],
  removedId: string,
  controlIdFor: (itemId: string) => string,
  fallback: HTMLElement | null,
) {
  const index = itemIds.indexOf(removedId);
  const neighbour = itemIds[index + 1] ?? itemIds[index - 1];
  requestAnimationFrame(() => {
    const target =
      neighbour === undefined ? null : document.getElementById(controlIdFor(neighbour));
    (target ?? fallback)?.focus();
  });
}
