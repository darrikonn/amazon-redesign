import { describe, expect, it } from "vitest";
import { pickSamplePurchases } from "@/component";
import { aProduct } from "@/test-support";

const catalog = Array.from({ length: 12 }, (_, index) =>
  aProduct({ id: `product-${index}`, deliveryDays: (index % 6) + 1 }),
);

describe("pickSamplePurchases", () => {
  it("plans three orders whose delivery estimates fit how long ago they were placed", () => {
    const purchases = pickSamplePurchases("robin@example.com", catalog);
    const deliveryDaysOf = (productId: string) =>
      catalog.find((product) => product.id === productId)?.deliveryDays ?? 0;

    expect(purchases.map((purchase) => [purchase.daysAgo, purchase.items.length])).toEqual([
      [24, 2],
      [6, 1],
      [1, 2],
    ]);
    expect(purchases[1]?.items.every((item) => deliveryDaysOf(item.productId) <= 4)).toBe(true);
    expect(
      purchases[2]?.items.every((item) => {
        const days = deliveryDaysOf(item.productId);
        return days >= 3 && days <= 7;
      }),
    ).toBe(true);
  });

  it("is the same for the same email, never repeats a product, and differs between emails", () => {
    const productIds = (seed: string) =>
      pickSamplePurchases(seed, catalog).flatMap((purchase) =>
        purchase.items.map((item) => item.productId),
      );

    expect(productIds("robin@example.com")).toEqual(productIds("robin@example.com"));
    expect(new Set(productIds("robin@example.com")).size).toBe(5);
    expect(productIds("sam@example.com")).not.toEqual(productIds("robin@example.com"));
  });

  it("leaves out a plan nothing in the catalogue fits", () => {
    const quick = ["a", "b", "c"].map((id) => aProduct({ id, deliveryDays: 1 }));

    expect(
      pickSamplePurchases("robin@example.com", quick).map((purchase) => purchase.daysAgo),
    ).toEqual([24, 6]);
  });
});
