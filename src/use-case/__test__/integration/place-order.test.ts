import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { aProduct, aProductDetails, aSession } from "@/test-support";

let container: Container;
let fakes: TestFakes;
const SHOPPER_ID = "shopper:robin.lee@example.com";

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
  fakes.products.seedProducts([
    aProduct({ id: "lamp", name: "Lamp", priceInCents: 2_000, deliveryDays: 2 }),
    aProduct({ id: "bag", name: "Bag", priceInCents: 5_000, deliveryDays: 5 }),
  ]);
  fakes.productDetails.seedDetails(
    aProductDetails({ productId: "bag", returnPolicy: "No return policy" }),
  );
});

describe("PlaceOrder", () => {
  it("turns the cart into an order delivered to the shopper's location, and empties the cart", async () => {
    // Arrange
    fakes.sessions.seedSession(aSession({ deliveryPostalCode: "10001" }));
    fakes.cartLines.seedLine({ ownerId: SHOPPER_ID, productId: "lamp", quantity: 2 });
    fakes.cartLines.seedLine({ ownerId: SHOPPER_ID, productId: "bag", quantity: 1 });

    // Act
    const result = await container.placeOrder.execute();

    // Assert
    const [order] = fakes.orders.storedOrders();
    expect(result).toEqual({ status: "placed", orderId: order?.id });
    expect(order).toMatchObject({
      ownerId: SHOPPER_ID,
      isSample: false,
      placedAt: "2026-10-14T12:00:00.000Z",
      deliveryDays: 5,
      deliveryCity: "New York",
      deliveryPostalCode: "10001",
      returns: [],
    });
    expect(
      order?.lines.map((line) => [line.productId, line.quantity, line.returnWindowDays]),
    ).toEqual([
      ["lamp", 2, 30],
      ["bag", 1, 0],
    ]);
    expect(fakes.cartLines.storedLines()).toEqual([]);
  });

  it("needs a signed-in shopper and something in the cart", async () => {
    fakes.cartLines.seedLine({ ownerId: "guest", productId: "lamp", quantity: 1 });
    const signedOut = await container.placeOrder.execute();
    fakes.sessions.seedSession(aSession());

    const empty = await container.placeOrder.execute();

    expect(signedOut).toEqual({ status: "signed-out" });
    expect(empty).toEqual({ status: "empty-cart" });
    expect(fakes.orders.storedOrders()).toEqual([]);
  });

  it("gives each order its own id", async () => {
    fakes.sessions.seedSession(aSession());
    fakes.cartLines.seedLine({ ownerId: SHOPPER_ID, productId: "lamp", quantity: 1 });
    const first = await container.placeOrder.execute();
    fakes.cartLines.seedLine({ ownerId: SHOPPER_ID, productId: "lamp", quantity: 1 });

    const second = await container.placeOrder.execute();

    expect(first).not.toEqual(second);
    expect(fakes.orders.storedOrders()).toHaveLength(2);
  });
});
