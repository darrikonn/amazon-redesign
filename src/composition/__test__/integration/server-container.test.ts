import { describe, expect, it } from "vitest";
import { createServerContainer } from "@/composition/server";

describe("createServerContainer", () => {
  it("works locally without an API key and suggests nothing", async () => {
    // Arrange
    const container = createServerContainer();

    // Act
    const reply = await container.rephraseQuery.execute({ text: "gift lamp" });
    const outcome = await container.searchCatalog.execute({ text: "lamp", sort: "best-match" });

    // Assert
    expect(reply).toEqual({ query: null });
    expect(outcome.resultCount).toBe(8);
  });
});
