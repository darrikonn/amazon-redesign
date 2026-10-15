import { describe, expect, it } from "vitest";
import { ratingFrom } from "@/component";

describe("ratingFrom", () => {
  it("is the average of the reviews, to one decimal, so 5, 4, and 1 are 3.3", () => {
    expect(ratingFrom([{ rating: 5 }, { rating: 4 }, { rating: 1 }], 4.8)).toBe(3.3);
  });

  it("keeps the source's own rating when there are no reviews", () => {
    expect(ratingFrom([], 4.19)).toBe(4.2);
  });
});
