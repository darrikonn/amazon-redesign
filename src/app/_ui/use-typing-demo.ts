import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./motion";
import { fullyTyped, TYPING, TypingAnimation, type TypingFrame } from "./typing-animation";

export type TypingDemo = {
  placeholder: string;
  example: string;
};

// Animates only while `isActive`; otherwise the current example stays fully written,
// so the placeholder never moves while the shopper is busy.
export function useTypingDemo(examples: readonly string[], isActive: boolean): TypingDemo {
  const [frame, setFrame] = useState<TypingFrame>(() => fullyTyped(examples, 0));
  const exampleIndexRef = useRef(frame.exampleIndex);

  useEffect(() => {
    if (!isActive || prefersReducedMotion() || examples.length === 0) return;
    const animation = new TypingAnimation(examples, exampleIndexRef.current);
    const interval = window.setInterval(() => {
      const next = animation.tick();
      if (next === null) return;
      exampleIndexRef.current = next.exampleIndex;
      setFrame(next);
    }, TYPING.tickInMilliseconds);
    return () => {
      window.clearInterval(interval);
      // The next animation starts from a fully written example, so the interrupted,
      // half-typed frame must not be shown again while it holds.
      setFrame(fullyTyped(examples, exampleIndexRef.current));
    };
  }, [examples, isActive]);

  const example = examples[frame.exampleIndex] ?? "";
  const shown = isActive ? example.slice(0, frame.typedLength) : example;
  return { placeholder: shown || FALLBACK_PLACEHOLDER, example };
}

const FALLBACK_PLACEHOLDER = "Describe what you need";
