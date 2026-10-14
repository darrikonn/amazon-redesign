import { requestAssistance } from "@/component";
import type { ProductRepository, QueryAssistant } from "@/core";

export type RephraseQueryRequest = {
  text: string;
};

export type RephrasedQuery = {
  query: string | null;
};

// Runs on the server for the assistant endpoint. It derives the prompt inputs from the
// text itself, so a caller cannot steer what the model is asked.
export class RephraseQuery {
  constructor(
    private readonly assistant: QueryAssistant,
    private readonly products: ProductRepository,
  ) {}

  async execute(request: RephraseQueryRequest): Promise<RephrasedQuery> {
    if (!this.assistant.isAvailable()) return { query: null };
    const rephraseRequest = requestAssistance(await this.products.list(), request.text);
    if (rephraseRequest === null) return { query: null };
    return { query: await this.assistant.rephrase(rephraseRequest) };
  }
}
