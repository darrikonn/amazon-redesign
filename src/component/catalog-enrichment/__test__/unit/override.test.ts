import { describe, expect, it } from "vitest";
import { parseOverrides } from "@/component";

describe("parseOverrides", () => {
  it("refuses an override without a reason or with an unknown value", () => {
    expect(() => parseOverrides({ dummyjson: { "1": { color: "red" } } })).toThrow('"reason"');
    expect(() =>
      parseOverrides({ dummyjson: { "1": { reason: "x", tags: ["sparkly"] } } }),
    ).toThrow('unknown tag "sparkly"');
    expect(() => parseOverrides({ amazon: {} })).toThrow('unknown source "amazon"');
  });
});
