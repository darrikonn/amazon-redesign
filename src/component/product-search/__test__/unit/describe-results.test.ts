import { describe, expect, it } from "vitest";
import { describeResults, interpretQuery } from "@/component";

function headlineFor(text: string, resultCount: number): string {
  return describeResults(interpretQuery(text).intent, resultCount);
}

describe("describeResults", () => {
  it("lists features after a colon, then price and delivery", () => {
    expect(headlineFor("dimmable desk lamp under $40 that arrives tomorrow", 4)).toBe(
      "4 desk lamps: dimmable, under $40, arriving tomorrow",
    );
  });

  it("names the category alone when nothing else was asked", () => {
    expect(headlineFor("lamp", 8)).toBe("8 desk lamps");
    expect(headlineFor("headphones", 7)).toBe("7 headphones");
  });

  it("says No and keeps the colour when nothing matches", () => {
    expect(headlineFor("red lamp between 10 and 30", 0)).toBe(
      "No red desk lamps between $10 and $30",
    );
  });

  it("uses the singular for one result", () => {
    expect(headlineFor("brass lamp", 1)).toBe("1 brass desk lamp");
    expect(headlineFor("office", 1)).toBe("1 product");
  });

  it("describes minimum price, a week of delivery and a rating floor", () => {
    expect(headlineFor("backpack over $50 arriving this week top rated", 2)).toBe(
      "2 backpacks over $50, arriving this week, rated 4.5 and up",
    );
  });

  it("keeps USB in capitals", () => {
    expect(headlineFor("usb lamp", 4)).toBe("4 desk lamps: USB");
  });
});
