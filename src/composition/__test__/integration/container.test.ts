import { describe, expect, it } from "vitest";
import { createLocalContainer, createProductionContainer } from "@/composition";

describe.each([
  ["local", createLocalContainer],
  ["production", createProductionContainer],
])("the %s container", (_, create) => {
  it("searches the bundled catalog with no secrets", async () => {
    // Arrange
    const container = create();

    // Act
    const outcome = await container.searchCatalog.execute({ text: "laptops", sort: "best-match" });

    // Assert
    expect(outcome.resultCount).toBe(5);
  });

  it("reads the session from the request's cookie on the server", async () => {
    // Arrange
    const value = JSON.stringify({ email: "darri.konn@gmail.com", deliveryPostalCode: "10001" });
    const container = create({
      get: (name) => (name === "shop-session" ? { value } : undefined),
      set: () => undefined,
      delete: () => undefined,
    });

    // Act
    const session = await container.viewSession.execute();

    // Assert
    expect(session.shopper).toEqual({
      email: "darri.konn@gmail.com",
      firstName: "Darri",
      fullName: "Darri Konn",
      deliveryCity: "New York",
      deliveryPostalCode: "10001",
    });
  });

  it("is signed out without a session cookie, and keeps a guest cart for the life of the container", async () => {
    // Arrange
    const container = create();

    // Act
    await container.toggleCartItem.execute({ productId: "dummyjson-0078" });

    // Assert
    expect((await container.viewSession.execute()).shopper).toBeNull();
    expect(await container.viewCart.execute()).toMatchObject({
      productIds: ["dummyjson-0078"],
      itemCount: 1,
    });
    expect(await create().viewCart.execute()).toMatchObject({ productIds: [], itemCount: 0 });
  });
});
