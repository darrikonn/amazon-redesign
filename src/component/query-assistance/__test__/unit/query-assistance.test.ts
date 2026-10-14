import { describe, expect, it } from "vitest";
import { ASSISTANCE_RULES, suggestRewrite } from "@/component";
import { aProduct } from "@/test-support";

const catalog = [
  aProduct({
    id: "earbuds",
    name: "Beats Flex Wireless Earphones",
    category: "audio",
    categoryLabel: "audio device",
    categoryPlural: "audio devices",
    tags: ["wireless"],
    priceInCents: 4999,
  }),
  aProduct({ id: "laptop", name: "Lenovo Yoga 920", brand: "Lenovo" }),
];

describe("suggestRewrite", () => {
  it("corrects misspelt words to the closest word the catalogue understands", () => {
    expect(suggestRewrite(catalog, "wireles headphnes")).toEqual({
      text: "wireless headphones",
      understoodLabels: ["Wireless", "Audio devices"],
      resultCount: 1,
    });
  });

  it("drops the words it cannot correct once something was corrected", () => {
    expect(suggestRewrite(catalog, "wireles headphones for grandma")?.text).toBe(
      "wireless headphones",
    );
  });

  it("leaves pure drops to the relaxation suggestions", () => {
    expect(suggestRewrite(catalog, "headphones for grandma")).toBeNull();
  });

  it("does not touch unknown words that still find products", () => {
    expect(suggestRewrite(catalog, "yoga laptop")).toBeNull();
  });

  it("does not correct very short words", () => {
    expect(suggestRewrite(catalog, "bgs")).toBeNull();
  });

  it("drops a correction that still finds nothing", () => {
    expect(suggestRewrite(catalog, "leathr shoes")).toBeNull();
  });

  it("does nothing for empty text or text longer than the limit", () => {
    expect(suggestRewrite(catalog, "   ")).toBeNull();
    expect(
      suggestRewrite(catalog, `headphnes ${"x".repeat(ASSISTANCE_RULES.maximumTextLength)}`),
    ).toBeNull();
  });
});
