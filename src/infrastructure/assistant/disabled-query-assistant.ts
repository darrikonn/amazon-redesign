import type { QueryAssistant } from "@/core";

export class DisabledQueryAssistant implements QueryAssistant {
  private static hasWarned = false;

  async rephrase(): Promise<string | null> {
    if (!DisabledQueryAssistant.hasWarned) {
      DisabledQueryAssistant.hasWarned = true;
      console.info("Query assistant is disabled locally: set ANTHROPIC_API_KEY to enable it.");
    }
    return null;
  }
}
