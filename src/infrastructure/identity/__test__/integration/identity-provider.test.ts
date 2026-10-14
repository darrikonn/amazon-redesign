import { describe, expect, it } from "vitest";
import { DEMO_SHOPPER, DemoIdentityProvider, InMemoryIdentityProvider } from "@/infrastructure";
import { aShopper } from "@/test-support";

describe("DemoIdentityProvider", () => {
  it("is always signed in as the demo shopper", async () => {
    expect(await new DemoIdentityProvider().currentShopper()).toEqual(DEMO_SHOPPER);
  });
});

describe("InMemoryIdentityProvider", () => {
  it("returns the seeded shopper and records the call", async () => {
    // Arrange
    const provider = new InMemoryIdentityProvider();
    provider.seedSignedInShopper(aShopper({ id: "shopper-7" }));

    // Act
    const shopper = await provider.currentShopper();

    // Assert
    expect(shopper.id).toBe("shopper-7");
    expect(provider.calls).toEqual(["currentShopper"]);
  });

  it("signs out and forgets calls on reset", async () => {
    const provider = new InMemoryIdentityProvider();
    provider.seedSignedInShopper(aShopper());
    await provider.currentShopper();

    provider.reset();

    expect(provider.calls).toEqual([]);
    await expect(provider.currentShopper()).rejects.toThrow("No shopper is signed in");
  });
});
