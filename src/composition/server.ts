import "server-only";
import type { QueryAssistant } from "@/core";
import { ClaudeQueryAssistant, DisabledQueryAssistant } from "@/infrastructure";
import type { Container } from "./container";
import { createLocalContainer } from "./local-container";
import { createProductionContainer } from "./production-container";

export function createServerContainer(): Container {
  return process.env.NODE_ENV === "production"
    ? createProductionContainer(claudeAssistant(process.env.ANTHROPIC_API_KEY))
    : createLocalContainer(localAssistant());
}

const CLAUDE_SETTINGS = {
  model: "claude-opus-5-5",
  timeoutInMilliseconds: 15_000,
  maximumRetries: 1,
} as const;

function claudeAssistant(apiKey: string | undefined): QueryAssistant {
  return new ClaudeQueryAssistant({ apiKey, ...CLAUDE_SETTINGS });
}

function localAssistant(): QueryAssistant {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  return apiKey === undefined || apiKey === ""
    ? new DisabledQueryAssistant()
    : claudeAssistant(apiKey);
}
