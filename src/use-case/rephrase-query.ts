import type { QueryAssistant } from "@/core";
import { toRephraseRequest } from "./rephrase-request";

export type RephraseQueryRequest = {
  text: string;
};

export type RephrasedQuery = {
  query: string | null;
};

// Runs on the server for the assistant endpoint. It derives the prompt inputs from the
// text itself, so a caller cannot steer what the model is asked.
export class RephraseQuery {
  constructor(private readonly assistant: QueryAssistant) {}

  async execute(request: RephraseQueryRequest): Promise<RephrasedQuery> {
    const rephraseRequest = toRephraseRequest(request.text);
    if (rephraseRequest === null) return { query: null };
    return { query: await this.assistant.rephrase(rephraseRequest) };
  }
}
