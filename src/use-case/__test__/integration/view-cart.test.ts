import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { aCartLine, aProduct, aSession } from "@/test-support";

let container: Container;
let fakes: TestFakes;
const SHOPPER_ID = "shopper:robin.lee@example.com";

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
  fakes.products.seedProducts([
    aProduct({ id: "lamp", name: "Lamp", priceInCents: 2_500, deliveryDays: 3 }),
    aProduct({ id: "bag", name: "Bag", priceInCents: 4_000 }),
  ]);
});

describe("ViewCart", () => {
  it("lists only the signed in shopper's lines, with line totals and a subtotal", async () => {
    // Arrange
    fakes.sessions.seedSession(aSession());
    fakes.cartLines.seedLine(aCartLine({ ownerId: SHOPPER_ID, productId: "lamp", quantity: 2 }));
    fakes.cartLines.seedLine(aCartLine({ ownerId: "someone-else", productId: "bag", quantity: 1 }));

    // Act
    const cart = await container.viewCart.execute();

    // Assert
    expect(cart).toEqual({
      productIds: ["lamp"],
      itemCount: 2,
      subtotalInCents: 5_000,
      isSignedIn: true,
      maximumQuantity: 10,
      lines: [
        {
          productId: "lamp",
          name: "Lamp",
          category: "laptops",
          image: null,
          priceInCents: 2_500,
          deliveryDays: 3,
          quantity: 2,
          lineTotalInCents: 5_000,
        },
      ],
    });
  });

  it("shows a signed-out visitor the guest's cart", async () => {
    // Arrange
    fakes.cartLines.seedLine(aCartLine({ ownerId: "guest", productId: "bag", quantity: 1 }));

    // Act
    const cart = await container.viewCart.execute();

    // Assert
    expect(cart).toMatchObject({ productIds: ["bag"], itemCount: 1, isSignedIn: false });
  });

  it("leaves out a line whose product left the catalogue", async () => {
    // Arrange
    fakes.sessions.seedSession(aSession());
    fakes.cartLines.seedLine(aCartLine({ ownerId: SHOPPER_ID, productId: "ghost", quantity: 1 }));
    fakes.cartLines.seedLine(aCartLine({ ownerId: SHOPPER_ID, productId: "bag", quantity: 1 }));

    // Act
    const cart = await container.viewCart.execute();

    // Assert
    expect(cart.productIds).toEqual(["bag"]);
    expect(cart.subtotalInCents).toBe(4_000);
  });

  it("is empty for a new shopper", async () => {
    fakes.sessions.seedSession(aSession());

    expect(await container.viewCart.execute()).toMatchObject({
      productIds: [],
      itemCount: 0,
      lines: [],
      subtotalInCents: 0,
    });
  });
});
