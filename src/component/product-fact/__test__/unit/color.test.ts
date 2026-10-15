import { describe, expect, it } from "vitest";
import { extractColor } from "@/component";

describe("extractColor", () => {
  it("takes the first colour word in the title", () => {
    expect(extractColor("Blue & Black Check Shirt", "")).toBe("blue");
  });

  it("falls back to the description, then to none", () => {
    expect(extractColor("Party Glasses", "Bright red frames.")).toBe("red");
    expect(extractColor("Party Glasses", "Fun for everyone.")).toBeNull();
  });

  it("prefers the longer colour at the same position and reads synonyms", () => {
    expect(extractColor("Rose Gold Plated Ring", "")).toBe("rose gold");
    expect(extractColor("Golden Shoes Woman", "")).toBe("gold");
    expect(extractColor("Space Gray Laptop", "")).toBe("grey");
  });

  it("does not read a colour inside a longer word", () => {
    expect(extractColor("Shredded Paper", "Bluetooth speaker")).toBeNull();
  });
});
