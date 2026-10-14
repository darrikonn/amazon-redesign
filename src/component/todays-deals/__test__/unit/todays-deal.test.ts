import { describe, expect, it } from "vitest";
import { DEAL_RULES, listPriceInCents, todaysDeals } from "@/component";
import { aProduct } from "@/test-support";

const catalog = Array.from({ length: 30 }, (_, index) =>
  aProduct({ id: `product-${index}`, discountPercent: index, priceInCents: 1_000 }),
);

describe("todaysDeals", () => {
  it("offers only well discounted products, biggest discount first, capped per day", () => {
    const deals = todaysDeals(catalog, new Date("2026-10-14T09:00:00Z"));
    const discounts = deals.map((deal) => deal.product.discountPercent);

    expect(deals).toHaveLength(DEAL_RULES.dealsPerDay);
    expect(discounts.every((discount) => discount >= DEAL_RULES.minimumDiscountPercent)).toBe(true);
    expect(discounts).toEqual([...discounts].sort((first, second) => second - first));
  });

  it("is the same all day and changes the next day", () => {
    const ids = (date: string) =>
      todaysDeals(catalog, new Date(date)).map((deal) => deal.product.id);

    expect(ids("2026-10-14T01:00:00Z")).toEqual(ids("2026-10-14T23:00:00Z"));
    expect(ids("2026-10-15T01:00:00Z")).not.toEqual(ids("2026-10-14T01:00:00Z"));
  });
});

describe("listPriceInCents", () => {
  it("is the price before the discount", () => {
    expect(listPriceInCents(aProduct({ priceInCents: 8_000, discountPercent: 20 }))).toBe(10_000);
    expect(listPriceInCents(aProduct({ priceInCents: 999, discountPercent: 0 }))).toBe(999);
  });
});
