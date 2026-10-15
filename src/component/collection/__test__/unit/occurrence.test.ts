import { describe, expect, it } from "vitest";
import { countOccurrences, mostCommonFirst } from "@/component";

describe("occurrence", () => {
  it("counts how often each key appears", () => {
    expect(countOccurrences(["a", "b", "a"])).toEqual(
      new Map([
        ["a", 2],
        ["b", 1],
      ]),
    );
  });

  it("lists the most common first, ties in order of first appearance", () => {
    expect(mostCommonFirst(["c", "b", "a", "b", "a"])).toEqual([
      ["b", 2],
      ["a", 2],
      ["c", 1],
    ]);
  });
});
