import type { QueryAssistant } from "@/core";

export class DisabledQueryAssistant implements QueryAssistant {
  private static hasWarned = false;

  constructor() {
    if (DisabledQueryAssistant.hasWarned) return;
    DisabledQueryAssistant.hasWarned = true;
    console.info("Query assistant is disabled locally: set ANTHROPIC_API_KEY to enable it.");
  }

  isAvailable(): boolean {
    return false;
  }

  async rephrase(): Promise<string | null> {
    return null;
  }
}
