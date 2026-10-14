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

  it("counts a session SignIn could not have made as signed out", async () => {
    for (const session of [
      aSession({ email: "not-an-email" }),
      aSession({ deliveryPostalCode: "abc" }),
    ]) {
      fakes.sessions.seedSession(session);

      expect(await container.viewSession.execute()).toEqual({ shopper: null });
    }
  });
});
