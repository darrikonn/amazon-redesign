import type { QueryAssistant, RephraseRequest } from "@/core";

export class HttpQueryAssistant implements QueryAssistant {
  constructor(private readonly endpoint: string) {}

  // The server decides whether the assistant runs; the browser learns it from the storefront.
  isAvailable(): boolean {
    return true;
  }

  async rephrase(request: RephraseRequest): Promise<string | null> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: request.text }),
    });
    if (!response.ok) throw new Error(`Assistant endpoint answered ${response.status}`);
    const reply: unknown = await response.json();
    if (!isReply(reply)) throw new Error("Assistant endpoint answered with an unexpected body");
    return reply.query;
  }
}

function isReply(value: unknown): value is { query: string | null } {
  if (typeof value !== "object" || value === null || !("query" in value)) return false;
  return value.query === null || typeof value.query === "string";
}
