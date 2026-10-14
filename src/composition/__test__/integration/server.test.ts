import { describe, expect, it } from "vitest";
import { createServerContainer } from "@/composition/server";

describe("createServerContainer", () => {
  it("works locally without an API key and turns the assistant off", async () => {
    // Arrange
    const container = createServerContainer({ NODE_ENV: "development" });

    // Act
    const storefront = await container.viewStorefront.execute();
    const reply = await container.rephraseQuery.execute({ text: "gift lamp" });
    const outcome = await container.searchCatalog.execute({ text: "lamp", sort: "best-match" });

    // Assert
    expect(storefront.isAssistantAvailable).toBe(false);
    expect(reply).toEqual({ query: null });
    expect(outcome.resultCount).toBe(8);
  });

  it("turns the assistant on when a key is configured, without calling the model", async () => {
    const local = createServerContainer({ NODE_ENV: "development", ANTHROPIC_API_KEY: "test-key" });
    const production = createServerContainer({
      NODE_ENV: "production",
      ANTHROPIC_API_KEY: "test-key",
    });

    expect((await local.viewStorefront.execute()).isAssistantAvailable).toBe(true);
    expect((await production.viewStorefront.execute()).isAssistantAvailable).toBe(true);
  });

  it("keeps the assistant off in production when the key is missing", async () => {
    const container = createServerContainer({ NODE_ENV: "production" });

    expect((await container.viewStorefront.execute()).isAssistantAvailable).toBe(false);
    expect(await container.rephraseQuery.execute({ text: "gift lamp" })).toEqual({ query: null });
  });
});
