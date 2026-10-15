import { type RefObject, useCallback, useEffect, useId, useRef, useState } from "react";

export type Disclosure = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  panelId: string;
  containerRef: RefObject<HTMLDivElement | null>;
  toggleRef: RefObject<HTMLButtonElement | null>;
};

// A menu opened by a toggle button. A click outside it, or Escape, closes it and hands
// focus back to the toggle, so the keyboard is never left on something hidden.
export function useDisclosure(): Disclosure {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const toggle = useCallback(() => setIsOpen((open) => !open), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    function dismiss() {
      setIsOpen(false);
      toggleRef.current?.focus();
    }
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && containerRef.current?.contains(event.target)) return;
      dismiss();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return { isOpen, toggle, close, panelId, containerRef, toggleRef };
}
