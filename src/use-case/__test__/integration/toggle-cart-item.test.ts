import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { NotFoundError } from "@/core";
import { aProduct, aShopper } from "@/test-support";

let container: Container;
let fakes: TestFakes;
const shopper = aShopper({ id: "shopper-1" });

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
  fakes.identity.seedSignedInShopper(shopper);
  fakes.products.seedProducts([
    aProduct({ id: "lamp" }),
    aProduct({ id: "bag", category: "backpack" }),
  ]);
});

describe("ToggleCartItem", () => {
  it("adds a product that is not in the cart", async () => {
    // Act
    const cart = await container.toggleCartItem.execute({ productId: "lamp" });

    // Assert
    expect(cart).toEqual({ productIds: ["lamp"], itemCount: 1 });
    expect(fakes.cartLines.storedLines()).toEqual([{ ownerId: "shopper-1", productId: "lamp" }]);
  });

  it("removes a product that is already in the cart", async () => {
    // Arrange
    fakes.cartLines.seedLine({ ownerId: "shopper-1", productId: "lamp" });
    fakes.cartLines.seedLine({ ownerId: "shopper-1", productId: "bag" });

    // Act
    const cart = await container.toggleCartItem.execute({ productId: "lamp" });

    // Assert
    expect(cart).toEqual({ productIds: ["bag"], itemCount: 1 });
  });

  it("never touches another shopper's cart", async () => {
    // Arrange
    fakes.cartLines.seedLine({ ownerId: "someone-else", productId: "lamp" });

    // Act
    const cart = await container.toggleCartItem.execute({ productId: "lamp" });

    // Assert
    expect(cart.productIds).toEqual(["lamp"]);
    expect(fakes.cartLines.storedLines()).toEqual([
      { ownerId: "someone-else", productId: "lamp" },
      { ownerId: "shopper-1", productId: "lamp" },
    ]);
    expect(fakes.cartLines.calls.every((call) => call.ownerId === "shopper-1")).toBe(true);
  });

  it("rejects a product that does not exist", async () => {
    await expect(container.toggleCartItem.execute({ productId: "ghost" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(fakes.cartLines.storedLines()).toEqual([]);
  });
});
