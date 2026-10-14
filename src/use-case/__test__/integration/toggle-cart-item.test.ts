import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { NotFoundError } from "@/core";
import { aProduct, aSession } from "@/test-support";

let container: Container;
let fakes: TestFakes;
const SHOPPER_ID = "shopper:robin.lee@example.com";

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
  fakes.sessions.seedSession(aSession({ email: "robin.lee@example.com" }));
  fakes.products.seedProducts([
    aProduct({ id: "lamp" }),
    aProduct({ id: "bag", category: "bags", categoryLabel: "bag", categoryPlural: "bags" }),
  ]);
});

describe("ToggleCartItem", () => {
  it("adds a product that is not in the cart", async () => {
    // Act
    const cart = await container.toggleCartItem.execute({ productId: "lamp" });

    // Assert
    expect(cart).toEqual({ productIds: ["lamp"], itemCount: 1 });
    expect(fakes.cartLines.storedLines()).toEqual([
      { ownerId: SHOPPER_ID, productId: "lamp", quantity: 1 },
    ]);
  });

  it("removes a product that is already in the cart", async () => {
    // Arrange
    fakes.cartLines.seedLine({ ownerId: SHOPPER_ID, productId: "lamp", quantity: 1 });
    fakes.cartLines.seedLine({ ownerId: SHOPPER_ID, productId: "bag", quantity: 1 });

    // Act
    const cart = await container.toggleCartItem.execute({ productId: "lamp" });

    // Assert
    expect(cart).toEqual({ productIds: ["bag"], itemCount: 1 });
  });

  it("never touches another shopper's cart", async () => {
    // Arrange
    fakes.cartLines.seedLine({ ownerId: "someone-else", productId: "lamp", quantity: 1 });

    // Act
    const cart = await container.toggleCartItem.execute({ productId: "lamp" });

    // Assert
    expect(cart.productIds).toEqual(["lamp"]);
    expect(fakes.cartLines.storedLines()).toEqual([
      { ownerId: "someone-else", productId: "lamp", quantity: 1 },
      { ownerId: SHOPPER_ID, productId: "lamp", quantity: 1 },
    ]);
    expect(fakes.cartLines.calls.every((call) => call.ownerId === SHOPPER_ID)).toBe(true);
  });

  it("keeps a signed-out visitor's cart as the guest's", async () => {
    // Arrange
    fakes.sessions.reset();

    // Act
    const cart = await container.toggleCartItem.execute({ productId: "bag" });

    // Assert
    expect(cart).toEqual({ productIds: ["bag"], itemCount: 1 });
    expect(fakes.cartLines.storedLines()).toEqual([
      { ownerId: "guest", productId: "bag", quantity: 1 },
    ]);
  });

  it("rejects a product that does not exist", async () => {
    await expect(container.toggleCartItem.execute({ productId: "ghost" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(fakes.cartLines.storedLines()).toEqual([]);
  });
});
