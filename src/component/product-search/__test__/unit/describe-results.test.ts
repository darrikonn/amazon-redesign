import { describe, expect, it } from "vitest";
import { describeResults, interpretQuery } from "@/component";

function headlineFor(text: string, resultCount: number): string {
  return describeResults(interpretQuery(text).intent, resultCount);
}

describe("describeResults", () => {
  it("lists tags after a colon, then price and delivery", () => {
    expect(headlineFor("wireless headphones under $150 that arrives tomorrow", 2)).toBe(
      "2 audio devices: wireless, under $150, arriving tomorrow",
    );
  });

  it("names the category alone when nothing else was asked", () => {
    expect(headlineFor("laptops", 5)).toBe("5 laptops");
    expect(headlineFor("watch", 12)).toBe("12 watches");
  });

  it("says No and keeps the colour when nothing matches", () => {
    expect(headlineFor("red laptop between 10 and 30", 0)).toBe(
      "No red laptops between $10 and $30",
    );
  });

  it("uses the singular for one result", () => {
    expect(headlineFor("black watch", 1)).toBe("1 black watch");
  });

  it("describes minimum price, a week of delivery and a rating floor", () => {
    expect(headlineFor("bags over $50 arriving this week top rated", 2)).toBe(
      "2 bags over $50, arriving this week, rated 4.5 and up",
    );
  });

  it("names the words it could not place, so the headline matches the filter", () => {
    expect(headlineFor("watch gift", 0)).toBe("No watches matching “gift”");
    expect(headlineFor("gift for a watch lover under 40", 0)).toBe(
      "No watches under $40, matching “gift” and “lover”",
    );
    expect(headlineFor("office", 1)).toBe("1 product matching “office”");
  });

  it("keeps a tag's own capitals", () => {
    expect(headlineFor("magsafe accessories", 2)).toBe("2 phone accessories: MagSafe");
  });
});
