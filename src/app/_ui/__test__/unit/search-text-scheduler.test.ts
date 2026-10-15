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
    // Arrange
    const { timer, searched, scheduler } = setUp();

    // Act
    scheduler.type("watc");
    scheduler.apply("watches");
    timer.advance(SEARCH_PAUSE_IN_MILLISECONDS);

    // Assert
    expect(searched).toEqual(["watches"]);
  });

  it("keeps the last search while the shopper deletes a query and starts a new one", () => {
    // Arrange
    const { timer, searched, scheduler } = setUp();

    // Act
    scheduler.type("watc");
    timer.advance(100);
    scheduler.type("");
    timer.advance(100);
    scheduler.type("b");
    timer.advance(SEARCH_PAUSE_IN_MILLISECONDS);

    // Assert
    expect(searched).toEqual(["b"]);
  });

  it("returns home once the shopper pauses with the bar empty", () => {
    // Arrange
    const { timer, searched, scheduler } = setUp();

    // Act
    scheduler.type("w");
    scheduler.type("");
    timer.advance(SEARCH_PAUSE_IN_MILLISECONDS);

    // Assert
    expect(searched).toEqual([""]);
  });

  it("forgets a pending search when disposed", () => {
    // Arrange
    const { timer, searched, scheduler } = setUp();

    // Act
    scheduler.type("watch");
    scheduler.dispose();
    timer.advance(SEARCH_PAUSE_IN_MILLISECONDS);

    // Assert
    expect(searched).toEqual([]);
  });
});
