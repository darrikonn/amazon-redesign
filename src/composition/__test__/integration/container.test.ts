import { describe, expect, it } from "vitest";
import { createLocalContainer, createProductionContainer } from "@/composition";

describe.each([
  ["local", createLocalContainer],
  ["production", createProductionContainer],
])("the %s container", (_, create) => {
  it("searches the bundled catalog as the demo shopper with no secrets", async () => {
    // Arrange
    const container = create();

    // Act
    const outcome = await container.searchCatalog.execute({ text: "laptops", sort: "best-match" });
    const storefront = await container.viewStorefront.execute();

    // Assert
    expect(outcome.resultCount).toBe(5);
    expect(storefront.shopper.firstName).toBe("Darri");
  });

  it("keeps a cart for the life of the container", async () => {
    // Arrange
    const container = create();

    // Act
    await container.toggleCartItem.execute({ productId: "dummyjson-0078" });

    // Assert
    expect(await container.viewCart.execute()).toEqual({
      productIds: ["dummyjson-0078"],
      itemCount: 1,
    });
    expect(await create().viewCart.execute()).toEqual({ productIds: [], itemCount: 0 });
  });
});
