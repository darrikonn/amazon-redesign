import { beforeEach, describe, expect, it } from "vitest";
import { DEAL_RULES } from "@/component";
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
      ["lamp", ["Ordered 2 times"]],
      ["bag", ["Ordered once"]],
    ]);
  });

  it("is null for a signed-out visitor", async () => {
    expect(await container.viewBuyAgain.execute()).toBeNull();
  });
});

describe("ViewDeals", () => {
  it("lists today's discounted products with their list price", async () => {
    const view = await container.viewDeals.execute();

    expect(view.day).toBe("2026-10-14");
    expect(view.listings.length).toBeLessThanOrEqual(DEAL_RULES.dealsPerDay);
    expect(view.listings.map((listing) => [listing.id, listing.deal])).toEqual([
      ["lamp", { listPriceInCents: 10_000, discountPercent: 20 }],
      ["mug", { listPriceInCents: 1_000, discountPercent: 12 }],
    ]);
  });
});

describe("ToggleSavedItem and ViewSavedList", () => {
  it("saves and unsaves products, newest first", async () => {
    // Arrange
    fakes.sessions.seedSession(aSession());

    // Act
    const savedLamp = await container.toggleSavedItem.execute({ productId: "lamp" });
    fakes.clock.advanceBy(60_000);
    await container.toggleSavedItem.execute({ productId: "mug" });
    const list = await container.viewSavedList.execute();
    const removed = await container.toggleSavedItem.execute({ productId: "lamp" });

    // Assert
    expect(savedLamp).toEqual({ status: "saved", list: { productIds: ["lamp"] } });
    expect(list?.productIds).toEqual(["mug", "lamp"]);
    expect(list?.listings[0]?.details).toEqual(["Laptop"]);
    expect(removed).toEqual({ status: "removed", list: { productIds: ["mug"] } });
  });

  it("needs a signed-in shopper", async () => {
    expect(await container.toggleSavedItem.execute({ productId: "lamp" })).toEqual({
      status: "signed-out",
    });
    expect(await container.viewSavedList.execute()).toBeNull();
    expect(fakes.savedItems.storedItems()).toEqual([]);
  });
});
