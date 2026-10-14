import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { RephraseRequest } from "@/core";
import { ClaudeQueryAssistant } from "@/infrastructure";
import {
  type LocalServer,
  startLocalServer,
} from "@/infrastructure/assistant/__test__/integration/local-server";

let server: LocalServer;

beforeEach(async () => {
  server = await startLocalServer();
});

afterEach(async () => {
  await server.close();
});

const request: RephraseRequest = {
  text: "gift for a coffee lover under forty bucks",
  unrecognizedWords: ["gift", "lover", "forty"],
  vocabulary: { categories: ["coffee makers"], features: ["compact"], colors: ["red"] },
};

function assistant(): ClaudeQueryAssistant {
  return new ClaudeQueryAssistant({
    apiKey: "test-key",
    model: "claude-opus-5-5",
    timeoutInMilliseconds: 5_000,
    maximumRetries: 0,
    baseUrl: server.url,
  });
}

function messageReply(text: string, stopReason = "end_turn") {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: "claude-opus-5-5",
    content: [{ type: "text", text }],
    stop_reason: stopReason,
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 5 },
  };
}

describe("ClaudeQueryAssistant", () => {
  it("returns the rewritten query from the structured reply", async () => {
    server.respondWith(200, messageReply('{"query": " coffee maker under $40 "}'));

    expect(await assistant().rephrase(request)).toBe("coffee maker under $40");
  });

  it("asks the configured model for JSON at low effort with the default fallback", async () => {
    // Arrange
    server.respondWith(200, messageReply('{"query": "coffee maker under $40"}'));

    // Act
    await assistant().rephrase(request);

    // Assert
    const sent = server.requests[0];
    expect(sent?.path).toBe("/v1/messages?beta=true");
    expect(sent?.headers["x-api-key"]).toBe("test-key");
    expect(sent?.headers["anthropic-beta"]).toBe("server-side-fallback-2026-07-01");
    expect(sent?.body).toMatchObject({
      model: "claude-opus-5-5",
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema" } },
    });
    expect(JSON.stringify(sent?.body)).toContain(
      "<request>gift for a coffee lover under forty bucks</request>",
    );
    expect(JSON.stringify(sent?.body)).toContain("Categories: coffee makers");
  });

  it("treats an empty query, a refusal, and an unreadable reply as no rewrite", async () => {
    server.respondWith(200, messageReply('{"query": ""}'));
    expect(await assistant().rephrase(request)).toBeNull();

    server.respondWith(200, messageReply("", "refusal"));
    expect(await assistant().rephrase(request)).toBeNull();

    server.respondWith(200, messageReply("not json"));
    expect(await assistant().rephrase(request)).toBeNull();
  });

  it("raises the API error so the caller can report it", async () => {
    server.respondWith(401, {
      type: "error",
      error: { type: "authentication_error", message: "invalid x-api-key" },
    });

    await expect(assistant().rephrase(request)).rejects.toThrow("invalid x-api-key");
  });
});
