import { describe, expect, it } from "vitest";
import { STARTER_QUERIES } from "@/component";
import { createTestContainer } from "@/composition";

describe("ViewStorefront", () => {
  it("offers the starter queries and a department for every category the catalogue has", async () => {
    // Arrange
    const { container } = createTestContainer();

    // Act
    const storefront = await container.viewStorefront.execute();

    // Assert
    expect(storefront.starterQueries).toEqual(STARTER_QUERIES);
    expect(storefront.departments).toEqual(
      expect.arrayContaining([
        { label: "Phones", query: "phones" },
        { label: "Audio devices", query: "audio devices" },
        { label: "Sports gear", query: "sports gear" },
      ]),
    );
    expect(storefront.departments.map((department) => department.query)).not.toContain(
      "computer accessories",
    );
    expect(storefront.departments).toHaveLength(21);
  });
});
