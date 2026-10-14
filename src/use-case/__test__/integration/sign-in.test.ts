import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { anOrder, aProduct, aProductDetails, aSession } from "@/test-support";

let container: Container;
let fakes: TestFakes;
const SHOPPER_ID = "shopper:darri.konn@gmail.com";

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
  fakes.products.seedProducts(
    Array.from({ length: 8 }, (_, index) =>
      aProduct({ id: `product-${index}`, deliveryDays: (index % 4) + 1 }),
    ),
  );
  fakes.productDetails.seedDetails(aProductDetails({ productId: "product-0" }));
});

describe("SignIn", () => {
  it("signs in with any well-formed email and names the shopper from it", async () => {
    // Act
    const result = await container.signIn.execute({ email: " Darri.Konn@Gmail.com " });

    // Assert
    expect(result).toEqual({
      status: "signed-in",
      shopper: {
        email: "darri.konn@gmail.com",
        firstName: "Darri",
        fullName: "Darri Konn",
        deliveryCity: "Minneapolis",
        deliveryPostalCode: "55401",
      },
    });
    expect(fakes.sessions.storedSession()).toEqual({
      email: "darri.konn@gmail.com",
      deliveryPostalCode: "55401",
    });
  });

  it("refuses something that is not an email, and changes nothing", async () => {
    expect(await container.signIn.execute({ email: "darri" })).toEqual({ status: "invalid-email" });
    expect(fakes.sessions.storedSession()).toBeNull();
    expect(fakes.orders.storedOrders()).toEqual([]);
  });

  it("keeps the delivery ZIP code of the session it replaces", async () => {
    fakes.sessions.seedSession(aSession({ email: "old@example.com", deliveryPostalCode: "10001" }));

    const result = await container.signIn.execute({ email: "darri.konn@gmail.com" });

    expect(result).toMatchObject({
      shopper: { deliveryCity: "New York", deliveryPostalCode: "10001" },
    });
  });

  it("moves the guest's cart into the shopper's, adding up shared products", async () => {
    // Arrange
    fakes.cartLines.seedLine({ ownerId: "guest", productId: "product-1", quantity: 2 });
    fakes.cartLines.seedLine({ ownerId: SHOPPER_ID, productId: "product-1", quantity: 1 });
    fakes.cartLines.seedLine({ ownerId: "guest", productId: "product-2", quantity: 1 });

    // Act
    await container.signIn.execute({ email: "darri.konn@gmail.com" });

    // Assert
    expect(fakes.cartLines.storedLines()).toEqual([
      { ownerId: SHOPPER_ID, productId: "product-1", quantity: 3 },
      { ownerId: SHOPPER_ID, productId: "product-2", quantity: 1 },
    ]);
  });

  it("gives a new shopper three sample orders, placed in the past", async () => {
    // Act
    await container.signIn.execute({ email: "darri.konn@gmail.com" });

    // Assert
    const orders = fakes.orders.storedOrders();
    expect(orders).toHaveLength(3);
    expect(orders.every((order) => order.isSample && order.ownerId === SHOPPER_ID)).toBe(true);
    expect(orders.map((order) => order.placedAt)).toEqual([
      "2026-09-20T12:00:00.000Z",
      "2026-10-08T12:00:00.000Z",
      "2026-10-13T12:00:00.000Z",
    ]);
    expect(orders.flatMap((order) => order.lines)).toHaveLength(5);
  });

  it("leaves a returning shopper's orders alone", async () => {
    fakes.orders.seedOrder(anOrder({ id: "mine", ownerId: SHOPPER_ID }));

    await container.signIn.execute({ email: "darri.konn@gmail.com" });

    expect(fakes.orders.storedOrders().map((order) => order.id)).toEqual(["mine"]);
  });
});
