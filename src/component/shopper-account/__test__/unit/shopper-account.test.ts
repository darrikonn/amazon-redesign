import { describe, expect, it } from "vitest";
import {
  DEFAULT_POSTAL_CODE,
  deliveryCityFor,
  nameFromEmail,
  normaliseEmail,
  normalisePostalCode,
  shopperFromSession,
} from "@/component";

describe("normaliseEmail", () => {
  it("accepts a well-formed address, trimmed and lower-cased", () => {
    expect(normaliseEmail("  Darri.Konn@Gmail.com ")).toBe("darri.konn@gmail.com");
  });

  it("rejects anything that is not an address", () => {
    for (const text of ["", "darri", "darri@", "@gmail.com", "darri@gmail", "dar ri@gmail.com"]) {
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

describe("delivery areas", () => {
  it("accepts five-digit ZIP codes and names the cities it knows", () => {
    expect(normalisePostalCode(" 10001 ")).toBe("10001");
    expect(normalisePostalCode("1000")).toBeNull();
    expect(normalisePostalCode("10001-1234")).toBeNull();
    expect(deliveryCityFor("10001")).toBe("New York");
    expect(deliveryCityFor("12345")).toBeNull();
    expect(deliveryCityFor(DEFAULT_POSTAL_CODE)).toBe("Minneapolis");
  });
});

describe("shopperFromSession", () => {
  it("derives the whole shopper from the email and the ZIP code", () => {
    expect(
      shopperFromSession({ email: "darri.konn@gmail.com", deliveryPostalCode: "94103" }),
    ).toEqual({
      id: "shopper:darri.konn@gmail.com",
      email: "darri.konn@gmail.com",
      firstName: "Darri",
      fullName: "Darri Konn",
      deliveryCity: "San Francisco",
      deliveryPostalCode: "94103",
    });
  });
});
