import { describe, expect, it } from "vitest";
import { safeReturnPath, signInHref } from "@/app/_ui/sign-in-href";

describe("signInHref", () => {
  it("comes back to the page the shopper was on", () => {
    expect(signInHref("/orders?show=on-the-way")).toBe(
      "/sign-in?next=%2Forders%3Fshow%3Don-the-way",
    );
    expect(signInHref("/")).toBe("/sign-in");
    expect(signInHref("/sign-in?next=%2Fcart")).toBe("/sign-in");
  });
});

describe("safeReturnPath", () => {
  it("follows only paths on this site", () => {
    expect(safeReturnPath("/cart")).toBe("/cart");
    expect(safeReturnPath("https://evil.example")).toBe("/");
    expect(safeReturnPath("//evil.example")).toBe("/");
    expect(safeReturnPath(null)).toBe("/");
  });
});
