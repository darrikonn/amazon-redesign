import { describe, expect, it } from "vitest";
import { FixedClock, SystemClock } from "@/infrastructure";

describe("SystemClock", () => {
  it("tells the current time", () => {
    const before = Date.now();
    const now = new SystemClock().now().getTime();

    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(Date.now());
  });
});

describe("FixedClock", () => {
  it("stands still until moved, and resets to its starting time", () => {
    // Arrange
    const clock = new FixedClock();
    const start = clock.now().toISOString();

    // Act
    clock.advanceBy(60_000);
    const moved = clock.now().toISOString();
    clock.setNow(new Date("2026-01-01T00:00:00Z"));
    const set = clock.now().toISOString();
    clock.reset();

    // Assert
    expect(start).toBe("2026-10-14T12:00:00.000Z");
    expect(moved).toBe("2026-10-14T12:01:00.000Z");
    expect(set).toBe("2026-01-01T00:00:00.000Z");
    expect(clock.now().toISOString()).toBe(start);
  });
});
