import { describe, expect, it } from "vitest";
import { countResults } from "@/component";
import { aProduct } from "@/test-support";

const catalog = [
  aProduct({ id: "laptop", tags: ["compact"] }),
  aProduct({ id: "bag", category: "bags" }),
];

describe("countResults", () => {
  it("counts the products the text would match", () => {
    expect(countResults(catalog, "laptop")).toBe(1);
    expect(countResults(catalog, "compact")).toBe(1);
    expect(countResults(catalog, "")).toBe(2);
    expect(countResults(catalog, "watches")).toBe(0);
  });
});
