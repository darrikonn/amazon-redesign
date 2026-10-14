import { countResults, interpretQuery } from "@/component";
import type { ProductRepository, QueryAssistant, RephraseRequest } from "@/core";
import { toRephraseRequest } from "./rephrase-request";

export type AskAssistantRequest = {
  text: string;
};

export type AssistantSuggestion = {
  text: string;
  understoodLabels: readonly string[];
  resultCount: number;
};

export class AskAssistant {
  constructor(
    private readonly assistant: QueryAssistant,
    private readonly products: ProductRepository,
  ) {}

  async execute(request: AskAssistantRequest): Promise<AssistantSuggestion | null> {
    const rephraseRequest = toRephraseRequest(request.text);
    if (rephraseRequest === null) return null;
    const rewritten = await this.rephraseSafely(rephraseRequest);
    if (rewritten === null || isSameQuery(rewritten, rephraseRequest.text)) return null;
    const rewrittenInterpretation = interpretQuery(rewritten);
    if (rewrittenInterpretation.intent.keywords.length >= rephraseRequest.unrecognizedWords.length)
      return null;
    const resultCount = countResults(await this.products.list(), rewritten);
    if (resultCount === 0) return null;
    return {
      text: rewritten,
      understoodLabels: rewrittenInterpretation.terms.map((term) => term.label),
      resultCount,
    };
  }

  // The assistant is an enhancement: when it fails, the shopper simply gets no suggestion.
  private async rephraseSafely(rephraseRequest: RephraseRequest): Promise<string | null> {
    try {
      const rewritten = await this.assistant.rephrase(rephraseRequest);
      return rewritten === null ? null : rewritten.trim() || null;
    } catch {
      return null;
    }
  }
}

function isSameQuery(first: string, second: string): boolean {
  return first.trim().toLowerCase() === second.trim().toLowerCase();
}
