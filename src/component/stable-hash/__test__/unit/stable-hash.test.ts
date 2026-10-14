import { describe, expect, it } from "vitest";
import { stableHash } from "@/component";

describe("stableHash", () => {
  it("gives the same unsigned number for the same text, every time", () => {
    expect(stableHash("watches")).toBe(stableHash("watches"));
    expect(stableHash("")).toBe(0x811c9dc5);
    expect(stableHash("a")).toBe(0xe40c292c);
  });

  it("spreads similar texts apart", () => {
    expect(stableHash("deal:1")).not.toBe(stableHash("deal:2"));
  });
});
