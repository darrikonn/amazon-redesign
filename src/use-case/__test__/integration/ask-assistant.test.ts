import { beforeEach, describe, expect, it } from "vitest";
import { ASSISTANCE_RULES } from "@/component";
import { type Container, createTestContainer, type TestFakes } from "@/composition";
import { CATALOG } from "@/infrastructure";

let container: Container;
let fakes: TestFakes;

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
  fakes.products.seedProducts(CATALOG);
});

describe("AskAssistant", () => {
  it("suggests a rewrite that the interpreter understands and that finds products", async () => {
    // Arrange
    fakes.assistant.seedRewrite(
      "gift for a coffee lover under forty bucks",
      "coffee maker under $40",
    );

    // Act
    const suggestion = await container.askAssistant.execute({
      text: "gift for a coffee lover under forty bucks",
    });

    // Assert
    expect(suggestion).toEqual({
      text: "coffee maker under $40",
      understoodLabels: ["Coffee makers", "Under $40"],
      resultCount: 2,
    });
  });

  it("tells the assistant which words were not understood and what the filter knows", async () => {
    await container.askAssistant.execute({ text: "  gift for a coffee lover  " });

    expect(fakes.assistant.calls).toHaveLength(1);
    expect(fakes.assistant.calls[0]).toMatchObject({
      text: "gift for a coffee lover",
      unrecognizedWords: ["gift", "lover"],
    });
    expect(fakes.assistant.calls[0]?.vocabulary.categories).toContain("coffee makers");
    expect(fakes.assistant.calls[0]?.vocabulary.features).toContain("noise cancelling");
  });

  it("does not ask when the unknown words still find products", async () => {
    const suggestion = await container.askAssistant.execute({ text: "lamp with touch" });

    expect(suggestion).toBeNull();
    expect(fakes.assistant.calls).toEqual([]);
  });

  it("does not ask when every word was understood", async () => {
    const suggestion = await container.askAssistant.execute({ text: "dimmable lamp under $40" });

    expect(suggestion).toBeNull();
    expect(fakes.assistant.calls).toEqual([]);
  });

  it("does not send text longer than the limit", async () => {
    const text = `gift ${"x".repeat(ASSISTANCE_RULES.maximumTextLength)}`;

    expect(await container.askAssistant.execute({ text })).toBeNull();
    expect(fakes.assistant.calls).toEqual([]);
  });

  it("drops a rewrite that finds nothing", async () => {
    fakes.assistant.seedRewrite("purple gift", "purple lamp");

    expect(await container.askAssistant.execute({ text: "purple gift" })).toBeNull();
  });

  it("drops a rewrite that understands no more than the original", async () => {
    fakes.assistant.seedRewrite("lamp for my studio", "lamp for my workshop");

    expect(await container.askAssistant.execute({ text: "lamp for my studio" })).toBeNull();
  });

  it("drops a rewrite that only repeats the text", async () => {
    fakes.assistant.seedRewrite("gift lamp", "Gift lamp ");

    expect(await container.askAssistant.execute({ text: "gift lamp" })).toBeNull();
  });

  it("offers nothing when the assistant has nothing or fails", async () => {
    expect(await container.askAssistant.execute({ text: "gift lamp" })).toBeNull();

    fakes.assistant.seedFailure(new Error("model unavailable"));

    expect(await container.askAssistant.execute({ text: "gift lamp" })).toBeNull();
  });
});
