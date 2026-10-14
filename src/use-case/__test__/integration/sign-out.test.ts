import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { aCartLine, aSession } from "@/test-support";

let container: Container;
let fakes: TestFakes;

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
});

describe("SignOut", () => {
  it("ends the session and keeps the shopper's stored cart", async () => {
    // Arrange
    fakes.sessions.seedSession(aSession());
    fakes.cartLines.seedLine(
      aCartLine({
        ownerId: "shopper:robin.lee@example.com",
        productId: "lamp",
        quantity: 1,
      }),
    );

    // Act
    await container.signOut.execute();

    // Assert
    expect(fakes.sessions.storedSession()).toBeNull();
    expect(fakes.cartLines.storedLines()).toHaveLength(1);
  });
});
