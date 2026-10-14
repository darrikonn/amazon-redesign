export type TypingFrame = {
  exampleIndex: number;
  typedLength: number;
};

export const TYPING = {
  tickInMilliseconds: 80,
  holdBeforeFirstDelete: 25,
  holdWhenTyped: 40,
  holdWhenCleared: 8,
  charactersDeletedPerTick: 2,
} as const;

// Holds are counted in ticks rather than time so the whole rhythm scales with the tick.
export class TypingAnimation {
  private hold: number = TYPING.holdBeforeFirstDelete;
  private isTyping = false;
  private frame: TypingFrame;

  constructor(
    private readonly examples: readonly string[],
    exampleIndex: number,
  ) {
    this.frame = fullyTyped(examples, exampleIndex);
  }

  tick(): TypingFrame | null {
    if (this.hold > 0) {
      this.hold -= 1;
      return null;
    }
    this.frame = this.isTyping ? this.typeNextCharacter() : this.deleteCharacters();
    return this.frame;
  }

  private typeNextCharacter(): TypingFrame {
    const fullLength = (this.examples[this.frame.exampleIndex] ?? "").length;
    const typedLength = this.frame.typedLength + 1;
    if (typedLength < fullLength) return { ...this.frame, typedLength };
    this.isTyping = false;
    this.hold = TYPING.holdWhenTyped;
    return { ...this.frame, typedLength: fullLength };
  }

  private deleteCharacters(): TypingFrame {
    const typedLength = this.frame.typedLength - TYPING.charactersDeletedPerTick;
    if (typedLength > 0) return { ...this.frame, typedLength };
    this.isTyping = true;
    this.hold = TYPING.holdWhenCleared;
    return { exampleIndex: (this.frame.exampleIndex + 1) % this.examples.length, typedLength: 0 };
  }
}

export function fullyTyped(examples: readonly string[], exampleIndex: number): TypingFrame {
  return { exampleIndex, typedLength: (examples[exampleIndex] ?? "").length };
}
