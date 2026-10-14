import { describe, expect, it } from "vitest";
import { appendPhrase, removePhrase } from "@/component";

describe("removePhrase", () => {
  it("removes the phrase and tidies the spacing", () => {
    expect(removePhrase("dimmable desk lamp under $40 that arrives tomorrow", "under $40")).toBe(
      "dimmable desk lamp that arrives tomorrow",
    );
  });

  it("matches the phrase regardless of case", () => {
    expect(removePhrase("Red Lamp", "red")).toBe("Lamp");
  });

  it("removes only a whole-word occurrence", () => {
    expect(removePhrase("shredder in red", "red")).toBe("shredder in");
  });

  it("leaves the text alone when the phrase is absent", () => {
    expect(removePhrase("desk  lamp", "usb")).toBe("desk lamp");
  });
});

describe("appendPhrase", () => {
  it("joins with a single space", () => {
    expect(appendPhrase("  lamp ", "under $30")).toBe("lamp under $30");
  });
});
