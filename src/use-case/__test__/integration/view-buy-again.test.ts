import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { anOrder, anOrderLine, aProduct, aSession } from "@/test-support";

let container: Container;
let fakes: TestFakes;
const SHOPPER_ID = "shopper:robin.lee@example.com";

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
  fakes.products.seedProducts([
    aProduct({ id: "lamp", name: "Lamp", discountPercent: 20, priceInCents: 8_000 }),
    aProduct({ id: "bag", name: "Bag", discountPercent: 5 }),
    aProduct({ id: "mug", name: "Mug", discountPercent: 12, priceInCents: 880 }),
  ]);
});

describe("ViewBuyAgain", () => {
  it("lists kept products from delivered orders and how often they were ordered", async () => {
    // Arrange
    fakes.sessions.seedSession(aSession());
    fakes.orders.seedOrder(
      anOrder({ id: "a", ownerId: SHOPPER_ID, lines: [anOrderLine({ productId: "lamp" })] }),
    );
    fakes.orders.seedOrder(
      anOrder({
        id: "b",
        ownerId: SHOPPER_ID,
        placedAt: "2026-10-05T12:00:00.000Z",
        lines: [anOrderLine({ productId: "lamp" }), anOrderLine({ productId: "bag" })],
      }),
    );

    // Act
    const view = await container.viewBuyAgain.execute();

    // Assert
    expect(view?.listings.map((listing) => [listing.id, listing.details])).toEqual([
      ["lamp", ["You bought 2"]],
      ["bag", ["You bought 1"]],
    ]);
  });

  it("is null for a signed-out visitor", async () => {
    expect(await container.viewBuyAgain.execute()).toBeNull();
  });
});
