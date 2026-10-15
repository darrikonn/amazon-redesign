import { describe, expect, it } from "vitest";
import { shopperFromSession, validSession } from "@/component";

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

describe("validSession", () => {
  it("tidies a session SignIn could have made and refuses anything else", () => {
    expect(validSession({ email: " Darri@Example.com ", deliveryPostalCode: "10001" })).toEqual({
      email: "darri@example.com",
      deliveryPostalCode: "10001",
    });
    expect(validSession({ email: "darri", deliveryPostalCode: "10001" })).toBeNull();
    expect(validSession({ email: "darri@example.com", deliveryPostalCode: "abc" })).toBeNull();
  });
});
