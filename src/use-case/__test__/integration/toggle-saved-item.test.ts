import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { aProduct, aSavedItem, aSession } from "@/test-support";

let container: Container;
let fakes: TestFakes;
const SHOPPER_ID = "shopper:robin.lee@example.com";

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
  fakes.products.seedProducts([aProduct({ id: "lamp" }), aProduct({ id: "mug" })]);
});

describe("ToggleSavedItem", () => {
  it("saves a product with the moment it was saved, then unsaves it", async () => {
    // Arrange
    fakes.sessions.seedSession(aSession());

    // Act
    const saved = await container.toggleSavedItem.execute({ productId: "lamp" });
    const storedAfterSave = fakes.savedItems.storedItems();
    const removed = await container.toggleSavedItem.execute({ productId: "lamp" });

    // Assert
    expect(saved).toEqual({ status: "saved", list: { productIds: ["lamp"] } });
    expect(storedAfterSave).toEqual([aSavedItem({ ownerId: SHOPPER_ID, productId: "lamp" })]);
    expect(removed).toEqual({ status: "removed", list: { productIds: [] } });
  });

  it("needs a signed-in shopper", async () => {
    expect(await container.toggleSavedItem.execute({ productId: "lamp" })).toEqual({
      status: "signed-out",
    });
    expect(fakes.savedItems.storedItems()).toEqual([]);
  });
});
