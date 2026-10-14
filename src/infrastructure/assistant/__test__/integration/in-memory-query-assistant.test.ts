import { describe, expect, it } from "vitest";
import { DisabledQueryAssistant, InMemoryQueryAssistant } from "@/infrastructure";

const request = {
  text: "gift lamp",
  unrecognizedWords: ["gift"],
  vocabulary: { categories: [], features: [], colors: [] },
};

describe("InMemoryQueryAssistant", () => {
  it("answers seeded rewrites, records calls, and forgets everything on reset", async () => {
    // Arrange
    const assistant = new InMemoryQueryAssistant();
    assistant.seedRewrite("gift lamp", "lamp");

    // Act
    const rewritten = await assistant.rephrase(request);
    const recorded = [...assistant.calls];
    assistant.reset();

    // Assert
    expect(rewritten).toBe("lamp");
    expect(recorded).toEqual([request]);
    expect(await assistant.rephrase(request)).toBeNull();
  });

  it("fails on demand", async () => {
    const assistant = new InMemoryQueryAssistant();
    assistant.seedFailure(new Error("down"));

    await expect(assistant.rephrase(request)).rejects.toThrow("down");
  });
});

describe("DisabledQueryAssistant", () => {
  it("never suggests anything", async () => {
    expect(await new DisabledQueryAssistant().rephrase()).toBeNull();
  });
});
