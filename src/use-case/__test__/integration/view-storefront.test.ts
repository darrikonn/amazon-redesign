import { describe, expect, it } from "vitest";
import { STARTER_QUERIES } from "@/component";
import { createLocalContainer, createTestContainer } from "@/composition";
import { aProduct } from "@/test-support";

const watch = { category: "watches" } as const;

describe("ViewStorefront", () => {
  it("offers the starter queries and every department with products, with its sub-groups", async () => {
    // Arrange
    const { container, fakes } = createTestContainer();
    fakes.products.seedProducts([
      aProduct({ ...watch, id: "rolex", tags: ["luxury"] }),
      aProduct({ ...watch, id: "longines", tags: ["luxury", "elegant"] }),
      aProduct({ id: "laptop" }),
    ]);

    // Act
    const storefront = await container.viewStorefront.execute();

    // Assert
    expect(storefront.starterQueries).toEqual(STARTER_QUERIES);
    expect(storefront.departments).toEqual([
      { label: "Laptops", query: "laptops", productCount: 1, groups: [] },
      {
        label: "Watches",
        query: "watches",
        productCount: 2,
        groups: [
          { label: "Luxury", query: "luxury watches", productCount: 2 },
          { label: "Elegant", query: "elegant watches", productCount: 1 },
        ],
      },
    ]);
  });

  it("lists all 21 departments of the bundled catalogue", async () => {
    const storefront = await createLocalContainer().viewStorefront.execute();

    expect(storefront.departments).toHaveLength(21);
  });
});
