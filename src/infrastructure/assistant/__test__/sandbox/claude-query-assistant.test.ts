import { beforeAll, describe, expect, it } from "vitest";
import { ClaudeQueryAssistant } from "@/infrastructure";

// Calls the real Messages API with the developer's key. Run with `yarn test:sandbox`.
const apiKey = process.env.ANTHROPIC_API_KEY;

beforeAll(() => {
  if (apiKey === undefined || apiKey === "")
    throw new Error("Set ANTHROPIC_API_KEY to run the sandbox tests");
});

describe("ClaudeQueryAssistant against the Messages API", () => {
  it("rewrites a gift request into the shop's vocabulary", async () => {
    // Arrange
    const assistant = new ClaudeQueryAssistant({
      apiKey,
      model: "claude-opus-5-5",
      timeoutInMilliseconds: 30_000,
      maximumRetries: 1,
    });

    // Act
    const rewritten = await assistant.rephrase({
      text: "something for my dad who loves espresso, max sixty bucks",
      unrecognizedWords: ["something", "dad", "loves"],
      vocabulary: {
        categories: ["desk lamps", "headphones", "backpacks", "coffee makers"],
        features: ["espresso", "drip", "grinder", "compact", "programmable"],
        colors: ["black", "white", "red"],
      },
    });

    // Assert
    expect(rewritten?.toLowerCase()).toMatch(/coffee|espresso/);
    expect(rewritten).toMatch(/\$60/);
    expect(rewritten?.toLowerCase()).not.toContain("dad");
  });
});
