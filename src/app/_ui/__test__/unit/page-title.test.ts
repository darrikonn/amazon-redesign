import { describe, expect, it } from "vitest";
import { shopTitle } from "@/app/_ui/page-title";

describe("shopTitle", () => {
  it("names the page, then the shop", () => {
    expect(shopTitle("12 watches")).toBe("12 watches | Amazon");
  });
});
