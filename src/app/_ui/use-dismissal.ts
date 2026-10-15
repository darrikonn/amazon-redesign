import { type RefObject, useEffect, useRef } from "react";

// An open menu closes on a click outside it or on Escape.
export function useDismissal(
  isOpen: boolean,
  containerRef: RefObject<HTMLElement | null>,
  dismiss: () => void,
) {
  const dismissRef = useRef(dismiss);

  useEffect(() => {
    dismissRef.current = dismiss;
  });

  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && containerRef.current?.contains(event.target)) return;
      dismissRef.current();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismissRef.current();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, containerRef]);
}
