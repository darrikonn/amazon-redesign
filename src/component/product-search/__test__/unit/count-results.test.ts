import { describe, expect, it } from "vitest";
import { countResults } from "@/component";
import { aProduct } from "@/test-support";

const catalog = [
  aProduct({ id: "lamp", features: ["dimmable"] }),
  aProduct({ id: "bag", category: "backpack" }),
];

describe("countResults", () => {
  it("counts the products the text would match", () => {
    expect(countResults(catalog, "lamp")).toBe(1);
    expect(countResults(catalog, "dimmable")).toBe(1);
    expect(countResults(catalog, "")).toBe(2);
    expect(countResults(catalog, "headphones")).toBe(0);
  });
});
