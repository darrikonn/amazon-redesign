import { describe, expect, it } from "vitest";
import { fullyTyped, TYPING, TypingAnimation } from "@/app/_ui/typing-animation";

const examples = ["abcd", "xy"];

function ticks(animation: TypingAnimation, count: number) {
  return Array.from({ length: count }, () => animation.tick());
}

describe("TypingAnimation", () => {
  it("starts from the full example and holds before deleting", () => {
    const animation = new TypingAnimation(examples, 0);

    expect(ticks(animation, TYPING.holdBeforeFirstDelete).every((frame) => frame === null)).toBe(
      true,
    );
    expect(animation.tick()).toEqual({
      exampleIndex: 0,
      typedLength: 4 - TYPING.charactersDeletedPerTick,
    });
  });

  it("moves to the next example once the current one is deleted, then types it out", () => {
    // Arrange
    const animation = new TypingAnimation(examples, 0);
    ticks(animation, TYPING.holdBeforeFirstDelete);

    // Act
    const frames = ticks(animation, 2 + TYPING.holdWhenCleared + 2).filter(
      (frame) => frame !== null,
    );

    // Assert
    expect(frames).toEqual([
      { exampleIndex: 0, typedLength: 2 },
      { exampleIndex: 1, typedLength: 0 },
      { exampleIndex: 1, typedLength: 1 },
      { exampleIndex: 1, typedLength: 2 },
    ]);
  });

  it("wraps around to the first example", () => {
    const animation = new TypingAnimation(examples, 1);
    ticks(animation, TYPING.holdBeforeFirstDelete);

    expect(animation.tick()).toEqual({ exampleIndex: 0, typedLength: 0 });
  });
});

describe("fullyTyped", () => {
  it("shows the whole example", () => {
    expect(fullyTyped(examples, 1)).toEqual({ exampleIndex: 1, typedLength: 2 });
  });
});
