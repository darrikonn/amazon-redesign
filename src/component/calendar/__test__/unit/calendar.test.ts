import { describe, expect, it } from "vitest";
import { addDays, dayNumber } from "@/component";

describe("addDays", () => {
  it("moves a moment by whole days, forwards or back", () => {
    const moment = new Date("2026-10-14T12:00:00.000Z");

    expect(addDays(moment, 2).toISOString()).toBe("2026-10-16T12:00:00.000Z");
    expect(addDays(moment, -24).toISOString()).toBe("2026-09-20T12:00:00.000Z");
  });
});

describe("dayNumber", () => {
  it("is the same all day in UTC and one more the next day", () => {
    expect(dayNumber(new Date("2026-10-14T00:00:00Z"))).toBe(
      dayNumber(new Date("2026-10-14T23:59:59Z")),
    );
    expect(dayNumber(new Date("2026-10-15T00:00:00Z"))).toBe(
      dayNumber(new Date("2026-10-14T00:00:00Z")) + 1,
    );
  });
});
