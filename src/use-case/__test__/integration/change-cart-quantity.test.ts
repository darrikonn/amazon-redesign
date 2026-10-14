import { beforeEach, describe, expect, it } from "vitest";
import { CART_RULES } from "@/component";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { NotFoundError } from "@/core";
import { aCartLine, aProduct, aSession } from "@/test-support";

let container: Container;
let fakes: TestFakes;
const SHOPPER_ID = "shopper:robin.lee@example.com";

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
  fakes.sessions.seedSession(aSession());
  fakes.products.seedProduct(aProduct({ id: "lamp", priceInCents: 2_000 }));
  fakes.cartLines.seedLine(
    aCartLine({
      ownerId: SHOPPER_ID,
      productId: "lamp",
      quantity: 1,
      created: "2026-10-01T00:00:00.000Z",
    }),
  );
});

describe("ChangeCartQuantity", () => {
  it("sets the quantity and returns the updated cart", async () => {
    const cart = await container.changeCartQuantity.execute({ productId: "lamp", quantity: 3 });

    expect(cart).toMatchObject({ itemCount: 3, subtotalInCents: 6_000 });
    expect(fakes.cartLines.storedLines()).toEqual([
      aCartLine({
        ownerId: SHOPPER_ID,
        productId: "lamp",
        quantity: 3,
        created: "2026-10-01T00:00:00.000Z",
        modified: "2026-10-14T12:00:00.000Z",
      }),
    ]);
  });

  it("removes the product at zero and holds a large quantity at the limit", async () => {
    await container.changeCartQuantity.execute({ productId: "lamp", quantity: 99 });
    const held = fakes.cartLines.storedLines()[0]?.quantity;

    const emptied = await container.changeCartQuantity.execute({ productId: "lamp", quantity: 0 });

    expect(held).toBe(CART_RULES.maximumQuantity);
    expect(emptied).toMatchObject({ itemCount: 0, lines: [] });
  });

  it("leaves the line untouched when the quantity does not change", async () => {
    await container.changeCartQuantity.execute({ productId: "lamp", quantity: 1 });

    expect(fakes.cartLines.storedLines()[0]?.modified).toBeNull();
  });

  it("rejects a product that does not exist", async () => {
    await expect(
      container.changeCartQuantity.execute({ productId: "ghost", quantity: 1 }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
