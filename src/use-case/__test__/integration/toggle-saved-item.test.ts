import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { aProduct, aSession } from "@/test-support";

let container: Container;
let fakes: TestFakes;

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
  fakes.products.seedProducts([
    aProduct({ id: "lamp", name: "Lamp", discountPercent: 20, priceInCents: 8_000 }),
    aProduct({ id: "bag", name: "Bag", discountPercent: 5 }),
    aProduct({ id: "mug", name: "Mug", discountPercent: 12, priceInCents: 880 }),
  ]);
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
