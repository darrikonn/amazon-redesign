import type { QueryAssistant, RephraseRequest } from "@/core";

export class InMemoryQueryAssistant implements QueryAssistant {
  readonly calls: RephraseRequest[] = [];
  private readonly rewrites = new Map<string, string | null>();
  private failure: Error | null = null;
  private available = true;

  seedAvailability(available: boolean): void {
    this.available = available;
  }

  isAvailable(): boolean {
    return this.available;
  }

  seedRewrite(text: string, rewritten: string | null): void {
    this.rewrites.set(text, rewritten);
  }

  seedFailure(failure: Error): void {
    this.failure = failure;
  }

  async rephrase(request: RephraseRequest): Promise<string | null> {
    this.calls.push(request);
    if (this.failure !== null) throw this.failure;
    return this.rewrites.get(request.text) ?? null;
  }

  reset(): void {
    this.calls.length = 0;
    this.rewrites.clear();
    this.failure = null;
    this.available = true;
  }
}
