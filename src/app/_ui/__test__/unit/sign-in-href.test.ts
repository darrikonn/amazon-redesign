import { describe, expect, it } from "vitest";
import { safeReturnPath, signInHref } from "@/app/_ui/sign-in-href";

describe("signInHref", () => {
  it("comes back to the page the shopper was on", () => {
    expect(signInHref("/orders?show=on-the-way")).toBe(
      "/sign-in?next=%2Forders%3Fshow%3Don-the-way",
    );
    expect(signInHref("/")).toBe("/sign-in");
    expect(signInHref("/sign-in?next=%2Fcart")).toBe("/sign-in?next=%2Fcart");
  });
});

describe("safeReturnPath", () => {
  it("follows paths on this site, with their query", () => {
    expect(safeReturnPath("/cart")).toBe("/cart");
    expect(safeReturnPath("/orders?show=on-the-way")).toBe("/orders?show=on-the-way");
    expect(safeReturnPath(null)).toBe("/");
  });

  it("never leaves the site, however the address is disguised", () => {
    const offSite = [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "/\t/evil.example",
      "/\n/evil.example",
      "\\evil.example",
      "javascript:alert(1)",
      "/.//evil.example",
      "/..//evil.example",
      "/%2e//evil.example",
      "/x/..//evil.example",
      "/./\\evil.example",
      "/.\\/evil.example",
    ];

    for (const next of offSite) expect(safeReturnPath(next)).toBe("/");
    expect(safeReturnPath("/\tcart")).toBe("/cart");
  });
});
