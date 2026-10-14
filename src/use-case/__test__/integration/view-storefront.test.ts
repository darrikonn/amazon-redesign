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
      departments: [
        { label: "Desk lamps", query: "desk lamps" },
        { label: "Headphones", query: "headphones" },
        { label: "Backpacks", query: "backpacks" },
        { label: "Coffee makers", query: "coffee makers" },
      ],
      isAssistantAvailable: true,
    });
  });

  it("says when the assistant is unavailable", async () => {
    const { container, fakes } = createTestContainer();
    fakes.identity.seedSignedInShopper(aShopper());
    fakes.assistant.seedAvailability(false);

    expect((await container.viewStorefront.execute()).isAssistantAvailable).toBe(false);
  });

  it("fails when nobody is signed in", async () => {
    const { container } = createTestContainer();

    await expect(container.viewStorefront.execute()).rejects.toThrow("No shopper is signed in");
  });
});
