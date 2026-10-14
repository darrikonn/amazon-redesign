import { describe, expect, it } from "vitest";
import { InMemoryQueryAssistant } from "@/infrastructure";

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

  it("reports the seeded availability", () => {
    const assistant = new InMemoryQueryAssistant();
    assistant.seedAvailability(false);

    expect(assistant.isAvailable()).toBe(false);
  });

  it("fails on demand", async () => {
    const assistant = new InMemoryQueryAssistant();
    assistant.seedFailure(new Error("down"));

    await expect(assistant.rephrase(request)).rejects.toThrow("down");
  });
});
