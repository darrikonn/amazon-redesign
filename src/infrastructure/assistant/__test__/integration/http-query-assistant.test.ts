import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HttpQueryAssistant } from "@/infrastructure";
import { type LocalServer, startLocalServer } from "@/test-support";

let server: LocalServer;

beforeEach(async () => {
  server = await startLocalServer();
});

afterEach(async () => {
  await server.close();
});

const request = {
  text: "gift lamp",
  unrecognizedWords: ["gift"],
  vocabulary: { categories: [], features: [], colors: [] },
};

describe("HttpQueryAssistant", () => {
  it("posts only the text and returns the endpoint's query", async () => {
    // Arrange
    server.respondWith(200, { query: "lamp" });

    // Act
    const rewritten = await new HttpQueryAssistant(`${server.url}/api/assistant`).rephrase(request);

    // Assert
    expect(rewritten).toBe("lamp");
    expect(server.requests).toEqual([
      expect.objectContaining({
        method: "POST",
        path: "/api/assistant",
        body: { text: "gift lamp" },
      }),
    ]);
  });

  it("passes through a null query", async () => {
    server.respondWith(200, { query: null });

    expect(await new HttpQueryAssistant(server.url).rephrase(request)).toBeNull();
  });

  it("raises on an error status or an unexpected body", async () => {
    server.respondWith(500, { error: "boom" });
    await expect(new HttpQueryAssistant(server.url).rephrase(request)).rejects.toThrow(
      "answered 500",
    );

    server.respondWith(200, { rewritten: "lamp" });
    await expect(new HttpQueryAssistant(server.url).rephrase(request)).rejects.toThrow(
      "unexpected body",
    );
  });
});
