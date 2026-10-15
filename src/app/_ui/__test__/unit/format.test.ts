import { describe, expect, it } from "vitest";
import {
  deliveryLabel,
  deliveryLocationLabel,
  formatDayAndDate,
  formatOrderDate,
  formatRating,
  formatReviewDate,
  resultCountLabel,
  splitPrice,
  typeset,
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
    expect(formatReviewDate("2025-04-30")).toBe("Apr 30, 2025");
    expect(formatReviewDate("2026-01-01")).toBe("Jan 1, 2026");
  });

  it("writes order moments as dates, in UTC", () => {
    expect(formatOrderDate("2026-10-14T23:30:00.000Z")).toBe("Oct 14, 2026");
    expect(formatDayAndDate("2026-10-16T12:00:00.000Z")).toBe("Friday, October 16");
  });

  it("says tomorrow for next day delivery", () => {
    expect(deliveryLabel(1)).toBe("Tomorrow");
    expect(deliveryLabel(3)).toBe("in 3 days");
  });

  it("names the delivery location by city and ZIP code, or the ZIP code alone", () => {
    expect(deliveryLocationLabel({ deliveryCity: "Seattle", deliveryPostalCode: "98101" })).toBe(
      "Seattle 98101",
    );
    expect(deliveryLocationLabel({ deliveryCity: null, deliveryPostalCode: "00501" })).toBe(
      "00501",
    );
  });

  it("formats ratings with one decimal", () => {
    expect(formatRating(4)).toBe("4.0");
  });

  it("separates thousands in the dollar part", () => {
    expect(splitPrice(3_699_999)).toEqual({ dollars: "36,999", cents: "99", spoken: "$36,999.99" });
  });

  it("sets catalogue apostrophes the way the shop's own copy does", () => {
    expect(typeset("Women's Wrist Watch")).toBe("Women’s Wrist Watch");
    expect(typeset("'Quoted' text")).toBe("'Quoted' text");
  });
});
