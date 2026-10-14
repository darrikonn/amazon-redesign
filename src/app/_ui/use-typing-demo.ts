import { useEffect, useRef, useState } from "react";
import { fullyTyped, TYPING, TypingAnimation, type TypingFrame } from "./typing-animation";

export type TypingDemo = {
  placeholder: string;
  example: string;
};

// Animates only while `isActive`; otherwise the current example stays fully written,
// so the placeholder never moves while the shopper is busy.
export function useTypingDemo(examples: readonly string[], isActive: boolean): TypingDemo {
  const [frame, setFrame] = useState<TypingFrame>(() => fullyTyped(examples, 0));
  const exampleIndex = useRef(frame.exampleIndex);

  useEffect(() => {
    if (!isActive || prefersReducedMotion() || examples.length === 0) return;
    const animation = new TypingAnimation(examples, exampleIndex.current);
    const interval = window.setInterval(() => {
      const next = animation.tick();
      if (next === null) return;
      exampleIndex.current = next.exampleIndex;
      setFrame(next);
    }, TYPING.tickInMilliseconds);
    return () => window.clearInterval(interval);
  }, [examples, isActive]);

  const example = examples[frame.exampleIndex] ?? "";
  const shown = isActive ? example.slice(0, frame.typedLength) : example;
  return { placeholder: shown || FALLBACK_PLACEHOLDER, example };
}

const FALLBACK_PLACEHOLDER = "Describe what you need";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
