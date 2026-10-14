import { describe, expect, it } from "vitest";
import { handleAssistantRequest } from "@/app/api/assistant/handle-assistant-request";
import { createTestContainer } from "@/composition";
import { CATALOG } from "@/infrastructure";

function post(body: string): Request {
  return new Request("http://localhost/api/assistant", { method: "POST", body });
}

describe("handleAssistantRequest", () => {
  it("answers with the rewritten query", async () => {
    // Arrange
    const { container, fakes } = createTestContainer();
    fakes.products.seedProducts(CATALOG);
    fakes.assistant.seedRewrite("gift lamp", "lamp");

    // Act
    const response = await handleAssistantRequest(
      post(JSON.stringify({ text: "gift lamp" })),
      container,
    );

    // Assert
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ query: "lamp" });
  });

  it("rejects a body without text", async () => {
    const { container } = createTestContainer();

    expect((await handleAssistantRequest(post("not json"), container)).status).toBe(400);
    expect(
      (await handleAssistantRequest(post(JSON.stringify({ text: 4 })), container)).status,
    ).toBe(400);
  });

  it("answers no rewrite when the assistant fails", async () => {
    const { container, fakes } = createTestContainer();
    fakes.products.seedProducts(CATALOG);
    fakes.assistant.seedFailure(new Error("model unavailable"));

    const response = await handleAssistantRequest(
      post(JSON.stringify({ text: "gift lamp" })),
      container,
    );

    expect(await response.json()).toEqual({ query: null });
  });
});
