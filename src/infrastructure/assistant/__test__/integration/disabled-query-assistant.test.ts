import { describe, expect, it } from "vitest";
import { DisabledQueryAssistant } from "@/infrastructure";

describe("DisabledQueryAssistant", () => {
  it("is unavailable and never suggests anything", async () => {
    const assistant = new DisabledQueryAssistant();

    expect(assistant.isAvailable()).toBe(false);
    expect(await assistant.rephrase()).toBeNull();
  });
});
