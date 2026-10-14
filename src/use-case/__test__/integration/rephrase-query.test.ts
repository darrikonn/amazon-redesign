import { describe, expect, it } from "vitest";
import { createTestContainer } from "@/composition";

describe("RephraseQuery", () => {
  it("asks the assistant with inputs derived from the text alone", async () => {
    // Arrange
    const { container, fakes } = createTestContainer();
    fakes.assistant.seedRewrite("headphones for the gym", "sweatproof headphones");

    // Act
    const reply = await container.rephraseQuery.execute({ text: "headphones for the gym" });

    // Assert
    expect(reply).toEqual({ query: "sweatproof headphones" });
    expect(fakes.assistant.calls[0]?.unrecognizedWords).toEqual(["gym"]);
  });

  it("answers without a model call when there is nothing to rephrase", async () => {
    const { container, fakes } = createTestContainer();

    expect(await container.rephraseQuery.execute({ text: "usb lamp" })).toEqual({ query: null });
    expect(await container.rephraseQuery.execute({ text: "" })).toEqual({ query: null });
    expect(fakes.assistant.calls).toEqual([]);
  });

  it("lets an assistant failure reach the caller", async () => {
    const { container, fakes } = createTestContainer();
    fakes.assistant.seedFailure(new Error("model unavailable"));

    await expect(container.rephraseQuery.execute({ text: "gift lamp" })).rejects.toThrow(
      "model unavailable",
    );
  });
});
