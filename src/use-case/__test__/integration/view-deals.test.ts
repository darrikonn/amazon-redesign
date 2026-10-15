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
    expect(view.listings.map((listing) => [listing.id, listing.deal])).toEqual([
      ["lamp", { listPriceInCents: 10_000, discountPercent: 20 }],
      ["mug", { listPriceInCents: 1_000, discountPercent: 12 }],
    ]);
  });

  it("shows a fixed number of deals, the same all day, and a different set the next day", async () => {
    // Arrange
    fakes.products.reset();
    fakes.products.seedProducts(
      Array.from({ length: DEAL_RULES.dealsPerDay * 3 }, (_, index) =>
        aProduct({ id: `deal-${index}`, discountPercent: 15 }),
      ),
    );

    // Act
    const today = await container.viewDeals.execute();
    const laterToday = await container.viewDeals.execute();
    fakes.clock.advanceBy(24 * 60 * 60 * 1000);
    const tomorrow = await container.viewDeals.execute();

    // Assert
    const idsOf = (view: typeof today) => view.listings.map((listing) => listing.id);
    expect(idsOf(today)).toHaveLength(DEAL_RULES.dealsPerDay);
    expect(idsOf(laterToday)).toEqual(idsOf(today));
    expect(tomorrow.day).toBe("2026-10-15");
    expect(idsOf(tomorrow)).not.toEqual(idsOf(today));
  });
});
