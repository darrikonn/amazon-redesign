import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { aSession } from "@/test-support";

let container: Container;
let fakes: TestFakes;

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
});

describe("ViewSession", () => {
  it("names the signed-in shopper, and is empty when signed out", async () => {
    // Arrange
    const signedOut = await container.viewSession.execute();
    fakes.sessions.seedSession(
      aSession({ email: "mary_jane@example.com", deliveryPostalCode: "12345" }),
    );

    // Act
    const signedIn = await container.viewSession.execute();

    // Assert
    expect(signedOut).toEqual({ shopper: null });
    expect(signedIn).toEqual({
      shopper: {
        email: "mary_jane@example.com",
        firstName: "Mary",
        fullName: "Mary Jane",
        deliveryCity: null,
        deliveryPostalCode: "12345",
      },
    });
  });
});

describe("RememberSession", () => {
  it("keeps a session SignIn could have made, tidied", async () => {
    const result = await container.rememberSession.execute({
      email: " Darri@Example.com ",
      deliveryPostalCode: "10001",
    });

    expect(result).toEqual({ status: "remembered" });
    expect(fakes.sessions.storedSession()).toEqual({
      email: "darri@example.com",
      deliveryPostalCode: "10001",
    });
  });

  it("refuses an email or ZIP code SignIn would not accept", async () => {
    const badEmail = await container.rememberSession.execute({
      email: "darri",
      deliveryPostalCode: "10001",
    });
    const badZip = await container.rememberSession.execute({
      email: "darri@example.com",
      deliveryPostalCode: "x",
    });

    expect([badEmail, badZip]).toEqual([{ status: "invalid" }, { status: "invalid" }]);
    expect(fakes.sessions.storedSession()).toBeNull();
  });
});

describe("SignOut", () => {
  it("ends the session and keeps the shopper's stored cart", async () => {
    // Arrange
    fakes.sessions.seedSession(aSession());
    fakes.cartLines.seedLine({
      ownerId: "shopper:robin.lee@example.com",
      productId: "lamp",
      quantity: 1,
    });

    // Act
    await container.signOut.execute();

    // Assert
    expect(fakes.sessions.storedSession()).toBeNull();
    expect(fakes.cartLines.storedLines()).toHaveLength(1);
  });
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
