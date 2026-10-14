import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { aSession } from "@/test-support";

let container: Container;
let fakes: TestFakes;

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
});

describe("ChangeDeliveryLocation", () => {
  it("changes the ZIP code and the city it names", async () => {
    fakes.sessions.seedSession(aSession());

    const result = await container.changeDeliveryLocation.execute({ postalCode: " 98101 " });

    expect(result).toMatchObject({
      status: "changed",
      shopper: { deliveryCity: "Seattle", deliveryPostalCode: "98101" },
    });
    expect(fakes.sessions.storedSession()?.deliveryPostalCode).toBe("98101");
  });

  it("refuses a ZIP code that is not five digits, and a signed-out visitor", async () => {
    const signedOut = await container.changeDeliveryLocation.execute({ postalCode: "98101" });
    fakes.sessions.seedSession(aSession());

    const invalid = await container.changeDeliveryLocation.execute({ postalCode: "981" });

    expect(signedOut).toEqual({ status: "signed-out" });
    expect(invalid).toEqual({ status: "invalid-postal-code" });
    expect(fakes.sessions.storedSession()?.deliveryPostalCode).toBe("55401");
  });
});
