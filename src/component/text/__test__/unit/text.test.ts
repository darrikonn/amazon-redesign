import { describe, expect, it } from "vitest";
import { capitalize, compareText, joinWithAnd } from "@/component";

describe("text", () => {
  it("capitalizes the first letter only", () => {
    expect(capitalize("rose gold")).toBe("Rose gold");
    expect(capitalize("")).toBe("");
  });

  it("joins a list the way a sentence does", () => {
    expect(joinWithAnd([])).toBe("");
    expect(joinWithAnd(["red"])).toBe("red");
    expect(joinWithAnd(["red", "blue"])).toBe("red and blue");
    expect(joinWithAnd(["red", "blue", "green"])).toBe("red, blue and green");
  });

  it("orders text the same way on every machine", () => {
    expect(["b", "B", "a"].sort(compareText)).toEqual(["B", "a", "b"]);
    expect(compareText("same", "same")).toBe(0);
  });
});
