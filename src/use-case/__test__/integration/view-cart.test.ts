import { describe, expect, it } from "vitest";
import { createTestContainer } from "@/composition";
import { aShopper } from "@/test-support";

describe("ViewCart", () => {
  it("summarizes only the signed in shopper's cart", async () => {
    // Arrange
    const { container, fakes } = createTestContainer();
    fakes.identity.seedSignedInShopper(aShopper({ id: "shopper-1" }));
    fakes.cartLines.seedLine({ ownerId: "shopper-1", productId: "lamp" });
    fakes.cartLines.seedLine({ ownerId: "someone-else", productId: "bag" });

    // Act
    const cart = await container.viewCart.execute();

    // Assert
    expect(cart).toEqual({ productIds: ["lamp"], itemCount: 1 });
  });

  it("is empty for a new shopper", async () => {
    const { container, fakes } = createTestContainer();
    fakes.identity.seedSignedInShopper(aShopper());

    expect(await container.viewCart.execute()).toEqual({ productIds: [], itemCount: 0 });
  });
});
