import { describe, expect, it } from "vitest";
import { deriveTags, TAG_RULES } from "@/component";

describe("deriveTags", () => {
  it("only produces tags from the dictionary, matched as whole words", () => {
    const tags = deriveTags([
      "Wireless Leather Bluetooth thing",
      "made of steelwork and sportswear",
    ]);

    expect(tags).toEqual(["wireless", "leather"]);
    expect(tags.every((tag) => tag in TAG_RULES)).toBe(true);
  });

  it("reads source tags as well as text", () => {
    expect(deriveTags(["beverages", "Nescafe Coffee"])).toEqual(["drinks"]);
  });
});
