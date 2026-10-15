import { describe, expect, it } from "vitest";
import { shopperFromSession } from "@/component";

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
