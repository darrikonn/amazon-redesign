import { describe, expect, it } from "vitest";
import { ManualTimer } from "@/app/_ui/__test__/unit/manual-timer";
import { IdleTracker } from "@/app/_ui/idle-tracker";

const DELAY = 4000;

function setUp() {
  const timer = new ManualTimer();
  const changes: boolean[] = [];
  const tracker = new IdleTracker(timer, DELAY, (isIdle) => changes.push(isIdle));
  return { timer, changes, tracker };
}

describe("IdleTracker", () => {
  it("becomes idle after the delay without activity", () => {
    const { timer, changes } = setUp();

    timer.advance(DELAY - 1);
    expect(changes).toEqual([]);
    timer.advance(1);

    expect(changes).toEqual([true]);
  });

  it("stays busy while activity keeps arriving", () => {
    // Arrange
    const { timer, changes, tracker } = setUp();

    // Act
    for (let i = 0; i < 10; i += 1) {
      timer.advance(DELAY / 2);
      tracker.activity();
    }

    // Assert
    expect(changes).toEqual([]);
  });

  it("reports busy once on the first activity after idling, then idles again", () => {
    // Arrange
    const { timer, changes, tracker } = setUp();
    timer.advance(DELAY);

    // Act
    tracker.activity();
    tracker.activity();
    timer.advance(DELAY);

    // Assert
    expect(changes).toEqual([true, false, true]);
  });

  it("stops counting when disposed", () => {
    const { timer, changes, tracker } = setUp();

    tracker.dispose();
    timer.advance(DELAY);

    expect(changes).toEqual([]);
  });
});
