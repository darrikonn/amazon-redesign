import "server-only";
import type { QueryAssistant } from "@/core";
import { ClaudeQueryAssistant, DisabledQueryAssistant } from "@/infrastructure";
import type { Container } from "./container";
import { createLocalContainer } from "./local-container";
import { createProductionContainer } from "./production-container";

export type ServerEnvironment = Readonly<Record<string, string | undefined>>;

export function createServerContainer(environment: ServerEnvironment = process.env): Container {
  const apiKey = environment.ANTHROPIC_API_KEY;
  return environment.NODE_ENV === "production"
    ? createProductionContainer(claudeAssistant(apiKey))
    : createLocalContainer(localAssistant(apiKey));
}

// The shopper is waiting on this answer, so it gets one short attempt rather than retries.
const CLAUDE_SETTINGS = {
  model: "claude-opus-5-5",
  timeoutInMilliseconds: 8_000,
  maximumRetries: 0,
} as const;

function claudeAssistant(apiKey: string | undefined): QueryAssistant {
  return new ClaudeQueryAssistant({ apiKey, ...CLAUDE_SETTINGS });
}

function localAssistant(apiKey: string | undefined): QueryAssistant {
  return apiKey === undefined || apiKey === ""
    ? new DisabledQueryAssistant()
    : claudeAssistant(apiKey);
}
