import { describe, expect, it } from "vitest";
import {
  deliveryLabel,
  formatDayAndDate,
  formatOrderDate,
  formatRating,
  formatReviewDate,
  resultCountLabel,
  splitPrice,
} from "@/app/_ui/format";

describe("format", () => {
  it("pluralizes result counts", () => {
    expect(resultCountLabel(1)).toBe("1 result");
    expect(resultCountLabel(0)).toBe("0 results");
    expect(resultCountLabel(4)).toBe("4 results");
  });

  it("splits a price into dollars and padded cents", () => {
    expect(splitPrice(2499)).toEqual({ dollars: "24", cents: "99", spoken: "$24.99" });
    expect(splitPrice(3900)).toEqual({ dollars: "39", cents: "00", spoken: "$39.00" });
    expect(splitPrice(3250)).toEqual({ dollars: "32", cents: "50", spoken: "$32.50" });
  });

  it("writes a review's calendar date the same in every time zone", () => {
    expect(formatReviewDate("2025-04-30")).toBe("30 Apr 2025");
    expect(formatReviewDate("2026-01-01")).toBe("1 Jan 2026");
  });

  it("writes order moments as dates, in UTC", () => {
    expect(formatOrderDate("2026-10-14T23:30:00.000Z")).toBe("14 Oct 2026");
    expect(formatDayAndDate("2026-10-16T12:00:00.000Z")).toBe("Friday 16 October");
  });

  it("says tomorrow for next day delivery", () => {
    expect(deliveryLabel(1)).toBe("Tomorrow");
    expect(deliveryLabel(3)).toBe("in 3 days");
  });

  it("formats ratings with one decimal", () => {
    expect(formatRating(4)).toBe("4.0");
  });

  it("separates thousands in the dollar part", () => {
    expect(splitPrice(3_699_999)).toEqual({ dollars: "36,999", cents: "99", spoken: "$36,999.99" });
  });
});
