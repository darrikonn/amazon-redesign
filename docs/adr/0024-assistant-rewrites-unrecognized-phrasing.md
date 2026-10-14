# 0024. A language model rewrites phrasing the interpreter does not understand

## Status

Accepted (2026-10-14)

## Context

The in-process interpreter (ADR 0017) understands a fixed vocabulary. Anything else becomes a literal keyword, so "gift for a coffee lover under forty bucks" finds nothing. The request is for an AI first search, which has to help exactly there. A model cannot sit on the per-keystroke path (ADR 0017), and the API key must never reach the browser.

## Decision

- Core defines the port `QueryAssistant.rephrase(request)`. The request carries the shopper's text, the words the interpreter did not understand, and the vocabulary the interpreter does understand. The port answers with a rewritten query, or `null`.
- The rewrite is plain query text, not filters. It goes through the same interpreter, so the chips, counts, and results the shopper sees after accepting it are exactly what the suggestion promised.
- The browser asks only after the shopper pauses (`ASSISTANT_PAUSE_IN_MILLISECONDS` in the storefront) and only when the current text has unrecognized words. The `AskAssistant` use case keeps a rewrite only if it has fewer unrecognized words than the original and finds at least one product. Any adapter failure means "no suggestion"; search never depends on the assistant.
- The server re-derives the unrecognized words and vocabulary from the text itself, so the browser cannot steer the prompt. Text longer than `ASSISTANT_RULES.maximumTextLength` is never sent to the model.
- `ClaudeQueryAssistant` calls the Messages API with `claude-opus-5-5`, effort `low` (a short, latency-sensitive rewrite), structured JSON output, and `fallbacks: "default"` so a safety decline falls back server-side instead of failing. The model name, timeout, and retry count are written in the composition root; the API key comes only from `ANTHROPIC_API_KEY`.

Bindings:

| Runtime and environment | `QueryAssistant` |
| --- | --- |
| Browser, production and local | `HttpQueryAssistant`, posting the text to `/api/assistant` |
| Server, production | `ClaudeQueryAssistant` |
| Server, local | `ClaudeQueryAssistant` when `ANTHROPIC_API_KEY` is set, otherwise `DisabledQueryAssistant`, which logs once to stdout and answers `null` |
| Test | `InMemoryQueryAssistant`, seeded with rewrites |

- Server-only wiring lives in `src/composition/server.ts`, imported as `@/composition/server` by server components and route handlers only. It imports `server-only`, so a client import fails the build. This is the one second entry point to a package next to its `index.ts` (ADR 0010), and it exists to keep the SDK and the secret out of the browser bundle.

## Consequences

Local development still needs no key; the assistant row simply never offers a rewrite. Each pause on unrecognized text costs one model call on the server. The adapter is tested against a local HTTP server standing in for the API (`baseURL`), which checks the request shape and response handling but not the model's judgement; that needs a sandbox run with a real key.
