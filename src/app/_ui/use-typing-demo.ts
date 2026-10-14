import { useEffect, useRef, useState } from "react";

export type TypingDemo = {
  placeholder: string;
  example: string;
};

export function useTypingDemo(examples: readonly string[], isActive: boolean): TypingDemo {
  const [frame, setFrame] = useState<Frame>(() => fullyTyped(examples, 0));
  const frameRef = useRef(frame);

  useEffect(() => {
    if (!isActive || prefersReducedMotion() || examples.length === 0) return;
    const animation = new TypingAnimation(examples, frameRef.current);
    const timer = window.setInterval(() => {
      const next = animation.tick();
      if (next === null) return;
      frameRef.current = next;
      setFrame(next);
    }, TYPING.tickInMilliseconds);
    return () => window.clearInterval(timer);
  }, [examples, isActive]);

  const example = examples[frame.exampleIndex] ?? "";
  return { placeholder: example.slice(0, frame.typedLength) || FALLBACK_PLACEHOLDER, example };
}

type Frame = {
  exampleIndex: number;
  typedLength: number;
};

const TYPING = {
  tickInMilliseconds: 60,
  holdBeforeFirstDelete: 40,
  holdWhenTyped: 44,
  holdWhenCleared: 8,
  charactersDeletedPerTick: 3,
} as const;

const FALLBACK_PLACEHOLDER = "Describe what you need";

function fullyTyped(examples: readonly string[], exampleIndex: number): Frame {
  return { exampleIndex, typedLength: (examples[exampleIndex] ?? "").length };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

class TypingAnimation {
  private hold: number = TYPING.holdBeforeFirstDelete;
  private isTyping = false;

  constructor(
    private readonly examples: readonly string[],
    private frame: Frame,
  ) {}

  tick(): Frame | null {
    if (this.hold > 0) {
      this.hold -= 1;
      return null;
    }
    this.frame = this.isTyping ? this.typeNextCharacter() : this.deleteCharacters();
    return this.frame;
  }

  private typeNextCharacter(): Frame {
    const fullLength = (this.examples[this.frame.exampleIndex] ?? "").length;
    const typedLength = this.frame.typedLength + 1;
    if (typedLength < fullLength) return { ...this.frame, typedLength };
    this.isTyping = false;
    this.hold = TYPING.holdWhenTyped;
    return { ...this.frame, typedLength: fullLength };
  }

  private deleteCharacters(): Frame {
    const typedLength = this.frame.typedLength - TYPING.charactersDeletedPerTick;
    if (typedLength > 0) return { ...this.frame, typedLength };
    this.isTyping = true;
    this.hold = TYPING.holdWhenCleared;
    return { exampleIndex: (this.frame.exampleIndex + 1) % this.examples.length, typedLength: 0 };
  }
}
