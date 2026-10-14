import Anthropic from "@anthropic-ai/sdk";
import type { AssistantVocabulary, QueryAssistant, RephraseRequest } from "@/core";

export type ClaudeQueryAssistantSettings = {
  apiKey: string | undefined;
  model: string;
  timeoutInMilliseconds: number;
  maximumRetries: number;
  baseUrl?: string;
};

export class ClaudeQueryAssistant implements QueryAssistant {
  private client: Anthropic | null = null;

  constructor(private readonly settings: ClaudeQueryAssistantSettings) {}

  isAvailable(): boolean {
    return this.settings.apiKey !== undefined && this.settings.apiKey !== "";
  }

  async rephrase(request: RephraseRequest): Promise<string | null> {
    const response = await this.anthropic().beta.messages.create({
      model: this.settings.model,
      max_tokens: MAXIMUM_OUTPUT_TOKENS,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: REPLY_SCHEMA } },
      system: systemPrompt(request.vocabulary),
      messages: [{ role: "user", content: userPrompt(request) }],
    });
    // A refusal from the whole fallback chain, or a cut-off answer, is not a rewrite.
    if (response.stop_reason !== "end_turn") return null;
    const text = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("");
    return parseReply(text);
  }

  // Built on first use so a missing key fails one request instead of the whole container.
  private anthropic(): Anthropic {
    if (this.client === null) {
      this.client = new Anthropic({
        apiKey: this.settings.apiKey ?? null,
        timeout: this.settings.timeoutInMilliseconds,
        maxRetries: this.settings.maximumRetries,
        ...(this.settings.baseUrl === undefined ? {} : { baseURL: this.settings.baseUrl }),
      });
    }
    return this.client;
  }
}

// The rewrite is a single short line; the rest of the budget is room for adaptive thinking.
const MAXIMUM_OUTPUT_TOKENS = 2048;

const REPLY_SCHEMA = {
  type: "object",
  properties: { query: { type: "string" } },
  required: ["query"],
  additionalProperties: false,
};

function systemPrompt(vocabulary: AssistantVocabulary): string {
  return [
    "You turn a shopper's request into a short search query for an online shop's filter.",
    "The filter understands only these words and phrases:",
    `- Categories: ${vocabulary.categories.join(", ")}`,
    `- Features: ${vocabulary.features.join(", ")}`,
    `- Colours: ${vocabulary.colors.join(", ")}`,
    '- Prices: "under $40", "over $40", "$10 to $30"',
    '- Delivery: "arrives tomorrow", "arrives this week"',
    '- Rating: "top rated"',
    '- Order: "cheapest"',
    "Rewrite the request using only those words. Keep every wish the shopper expressed that one of those words can carry, including numbers written as words, so forty dollars becomes $40. Leave out anything the words cannot express, such as who the product is for.",
    "If none of the request can be expressed, answer with an empty query.",
    'Answer as JSON: {"query": "<rewritten query>"}.',
  ].join("\n");
}

function userPrompt(request: RephraseRequest): string {
  return [
    `<request>${request.text}</request>`,
    `Words the filter did not understand: ${request.unrecognizedWords.join(", ")}`,
  ].join("\n");
}

function parseReply(text: string): string | null {
  const reply = parseJson(text);
  if (!isReply(reply)) return null;
  const query = reply.query.trim();
  return query === "" ? null : query;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isReply(value: unknown): value is { query: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "query" in value &&
    typeof value.query === "string"
  );
}
