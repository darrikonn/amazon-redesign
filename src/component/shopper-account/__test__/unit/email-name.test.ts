import { describe, expect, it } from "vitest";
import { EMAIL_RULES, nameFromEmail, normaliseEmail } from "@/component";

describe("normaliseEmail", () => {
  it("rejects an address longer than mail servers accept", () => {
    const local = "a".repeat(EMAIL_RULES.maximumLength - "@example.com".length);

    expect(normaliseEmail(`${local}@example.com`)).toBe(`${local}@example.com`);
    expect(normaliseEmail(`${local}a@example.com`)).toBeNull();
  });

  it("accepts a well-formed address, trimmed and lower-cased", () => {
    expect(normaliseEmail("  Darri.Konn@Gmail.com ")).toBe("darri.konn@gmail.com");
  });

  it("rejects anything that is not an address", () => {
    for (const text of [
      "",
      "darri",
      "darri@",
      "@gmail.com",
      "darri@gmail",
      "dar ri@gmail.com",
      "a;b@c.co",
    ]) {
      expect(normaliseEmail(text)).toBeNull();
    }
  });
});

describe("nameFromEmail", () => {
  it("capitalises each word before the @", () => {
    expect(nameFromEmail("darri.konn@gmail.com")).toEqual({
      firstName: "Darri",
      fullName: "Darri Konn",
    });
  });

  it("splits on underscores and hyphens, and drops a +tag and digits", () => {
    expect(nameFromEmail("mary_jane-watson+shop@x.com")).toEqual({
      firstName: "Mary",
      fullName: "Mary Jane Watson",
    });
    expect(nameFromEmail("robin2024@x.com").firstName).toBe("Robin");
  });

  it("keeps a single word as it is", () => {
    expect(nameFromEmail("darrikonn@gmail.com")).toEqual({
      firstName: "Darrikonn",
      fullName: "Darrikonn",
    });
  });

  it("falls back to a neutral name when no letters are left", () => {
    expect(nameFromEmail("12345@x.com")).toEqual({ firstName: "Shopper", fullName: "Shopper" });
  });
});
