import { beforeEach, describe, expect, it } from "vitest";
import { DEAL_RULES } from "@/component";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { aProduct } from "@/test-support";

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
