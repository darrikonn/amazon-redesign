import { beforeAll, describe, expect, it } from "vitest";
import { interpretQuery, requestAssistance } from "@/component";
import { CATALOG, ClaudeQueryAssistant } from "@/infrastructure";

// Calls the real Messages API with the developer's key. Run with `yarn test:sandbox`.
const apiKey = process.env.ANTHROPIC_API_KEY;

beforeAll(() => {
  if (apiKey === undefined || apiKey === "")
    throw new Error("Set ANTHROPIC_API_KEY to run the sandbox tests");
});

describe("ClaudeQueryAssistant against the Messages API", () => {
  it("rewrites a gift request into words the interpreter understands", async () => {
    // Arrange
    const assistant = new ClaudeQueryAssistant({
      apiKey,
      model: "claude-opus-5-5",
      timeoutInMilliseconds: 30_000,
      maximumRetries: 1,
    });
    const request = requestAssistance(
      CATALOG,
      "something for my dad who loves espresso, max sixty bucks",
    );
    if (request === null) throw new Error("Expected the text to need assistance");

    // Act
    const rewritten = await assistant.rephrase(request);

    // Assert
    expect(rewritten).not.toBeNull();
    const intent = interpretQuery(rewritten ?? "").intent;
    expect(intent.category).toBe("coffee-maker");
    expect(intent.keywords).toEqual([]);
  });
});
