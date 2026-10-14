import { acceptRewrite, type Rewrite, requestAssistance } from "@/component";
import type { ProductRepository, QueryAssistant, RephraseRequest } from "@/core";

export type AskAssistantRequest = {
  text: string;
};

export type AssistantSuggestion = Rewrite;

export class AskAssistant {
  constructor(
    private readonly assistant: QueryAssistant,
    private readonly products: ProductRepository,
  ) {}

  async execute(request: AskAssistantRequest): Promise<AssistantSuggestion | null> {
    const catalog = await this.products.list();
    const rephraseRequest = requestAssistance(catalog, request.text);
    if (rephraseRequest === null) return null;
    return acceptRewrite(catalog, rephraseRequest, await this.rephraseSafely(rephraseRequest));
  }

  // The assistant is an enhancement: when it fails, the shopper simply gets no suggestion.
  private async rephraseSafely(rephraseRequest: RephraseRequest): Promise<string | null> {
    try {
      return await this.assistant.rephrase(rephraseRequest);
    } catch {
      return null;
    }
  }
}
