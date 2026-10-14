import { describe, expect, it } from "vitest";
import { STARTER_QUERIES } from "@/component";
import { createTestContainer } from "@/composition";
import { aShopper } from "@/test-support";

describe("ViewStorefront", () => {
  it("greets the signed in shopper and offers the starter queries", async () => {
    // Arrange
    const { container, fakes } = createTestContainer();
    fakes.identity.seedSignedInShopper(aShopper({ firstName: "Robin", deliveryPostalCode: "101" }));

    // Act
    const storefront = await container.viewStorefront.execute();

    // Assert
    expect(storefront).toEqual({
      shopper: { firstName: "Robin", deliveryCity: "Reykjavik", deliveryPostalCode: "101" },
      starterQueries: STARTER_QUERIES,
      departments: expect.arrayContaining([
        { label: "Phones", query: "phones" },
        { label: "Audio devices", query: "audio devices" },
        { label: "Sports gear", query: "sports gear" },
      ]),
    });
  });

  it("lists a department for every category the catalogue has", async () => {
    const { container, fakes } = createTestContainer();
    fakes.identity.seedSignedInShopper(aShopper());

    const storefront = await container.viewStorefront.execute();

    expect(storefront.departments.map((department) => department.query)).not.toContain(
      "computer accessories",
    );
    expect(storefront.departments).toHaveLength(21);
  });

  it("fails when nobody is signed in", async () => {
    const { container } = createTestContainer();

    await expect(container.viewStorefront.execute()).rejects.toThrow("No shopper is signed in");
  });
});
