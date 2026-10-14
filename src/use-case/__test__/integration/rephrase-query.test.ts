import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { CATALOG } from "@/infrastructure";

let container: Container;
let fakes: TestFakes;

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
  fakes.products.seedProducts(CATALOG);
});

describe("RephraseQuery", () => {
  it("asks the assistant with inputs derived from the text alone", async () => {
    // Arrange
    fakes.assistant.seedRewrite("headphones for the gym", "sweatproof headphones");

    // Act
    const reply = await container.rephraseQuery.execute({ text: "headphones for the gym" });

    // Assert
    expect(reply).toEqual({ query: "sweatproof headphones" });
    expect(fakes.assistant.calls[0]?.unrecognizedWords).toEqual(["gym"]);
  });

  it("answers without a model call when there is nothing to rephrase", async () => {
    expect(await container.rephraseQuery.execute({ text: "usb lamp" })).toEqual({ query: null });
    expect(await container.rephraseQuery.execute({ text: "lamp with touch" })).toEqual({
      query: null,
    });
    expect(await container.rephraseQuery.execute({ text: "" })).toEqual({ query: null });
    expect(fakes.assistant.calls).toEqual([]);
  });

  it("answers without a model call when the assistant is unavailable", async () => {
    fakes.assistant.seedAvailability(false);

    expect(await container.rephraseQuery.execute({ text: "headphones for the gym" })).toEqual({
      query: null,
    });
    expect(fakes.assistant.calls).toEqual([]);
  });

  it("lets an assistant failure reach the caller", async () => {
    fakes.assistant.seedFailure(new Error("model unavailable"));

    await expect(container.rephraseQuery.execute({ text: "gift lamp" })).rejects.toThrow(
      "model unavailable",
    );
  });
});
