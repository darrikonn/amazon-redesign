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

describe("ViewSavedList", () => {
  it("lists the shopper's saved products, most recently saved first, as search cards show them", async () => {
    // Arrange
    fakes.sessions.seedSession(aSession());
    fakes.savedItems.seedItem(
      aSavedItem({ ownerId: SHOPPER_ID, productId: "lamp", created: "2026-10-01T00:00:00Z" }),
    );
    fakes.savedItems.seedItem(
      aSavedItem({ ownerId: SHOPPER_ID, productId: "mug", created: "2026-10-05T00:00:00Z" }),
    );
    fakes.savedItems.seedItem(aSavedItem({ ownerId: "someone-else", productId: "lamp" }));

    // Act
    const list = await container.viewSavedList.execute();

    // Assert
    expect(list?.productIds).toEqual(["mug", "lamp"]);
    expect(list?.listings[0]?.details).toEqual(["Laptop"]);
  });

  it("is null for a signed-out visitor", async () => {
    expect(await container.viewSavedList.execute()).toBeNull();
  });
});
