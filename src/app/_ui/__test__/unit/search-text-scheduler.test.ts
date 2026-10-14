import { describe, expect, it } from "vitest";
import { ManualTimer } from "@/app/_ui/__test__/unit/manual-timer";
import { SEARCH_PAUSE_IN_MILLISECONDS, SearchTextScheduler } from "@/app/_ui/search-text-scheduler";

function setUp() {
  const timer = new ManualTimer();
  const searched: string[] = [];
  const scheduler = new SearchTextScheduler(timer, (text) => searched.push(text));
  return { timer, searched, scheduler };
}

describe("SearchTextScheduler", () => {
  it("searches once, after the shopper pauses typing", () => {
    // Arrange
    const { timer, searched, scheduler } = setUp();

    // Act
    scheduler.type("w");
    timer.advance(100);
    scheduler.type("wa");
    timer.advance(100);
    scheduler.type("watch");
    timer.advance(SEARCH_PAUSE_IN_MILLISECONDS - 1);
    const beforePause = [...searched];
    timer.advance(1);

    // Assert
    expect(beforePause).toEqual([]);
    expect(searched).toEqual(["watch"]);
  });

  it("searches at once when a chip or suggestion is applied, dropping the pending search", () => {
    const { timer, searched, scheduler } = setUp();

    scheduler.type("watc");
    scheduler.apply("watches");
    timer.advance(SEARCH_PAUSE_IN_MILLISECONDS);

    expect(searched).toEqual(["watches"]);
  });

  it("returns home at once when typing empties the bar", () => {
    const { timer, searched, scheduler } = setUp();

    scheduler.type("w");
    scheduler.type(" ");

    expect(searched).toEqual([" "]);
    expect(timer.pendingCount).toBe(0);
  });

  it("forgets a pending search when disposed", () => {
    const { timer, searched, scheduler } = setUp();

    scheduler.type("watch");
    scheduler.dispose();
    timer.advance(SEARCH_PAUSE_IN_MILLISECONDS);

    expect(searched).toEqual([]);
  });
});
