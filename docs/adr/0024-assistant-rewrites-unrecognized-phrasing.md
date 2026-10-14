# 0024. A language model rewrites phrasing the interpreter does not understand

## Status

Accepted (2026-10-14)

## Context

The in-process interpreter (ADR 0017) understands a fixed vocabulary. Anything else becomes a literal keyword, so "gift for a coffee lover under forty bucks" finds nothing. The request is for an AI first search, which has to help exactly there. A model cannot sit on the per-keystroke path (ADR 0017), and the API key must never reach the browser.

## Decision

- Core defines the port `QueryAssistant.rephrase(request)`. The request carries the shopper's text, the words the interpreter did not understand, and the vocabulary the interpreter does understand. The port answers with a rewritten query, or `null`.
- The rewrite is plain query text, not filters. It goes through the same interpreter, so the chips, counts, and results the shopper sees after accepting it are exactly what the suggestion promised.
- The rules live in the `query-assistance` component. `requestAssistance` asks only when the text has unrecognized words and finds no products: unknown words that still match something are doing their job, and a rewrite would only widen the search. Text longer than `ASSISTANCE_RULES.maximumTextLength` is never sent. `acceptRewrite` keeps a rewrite only if it has fewer unrecognized words than the original and finds at least one product.
- The browser asks after the shopper pauses (`ASSISTANT_PAUSE_IN_MILLISECONDS` in the storefront) and shows "Thinking about ..." while it waits. A suggestion appears as a chip with its result count. When there is no suggestion, the row disappears; the relaxations below the panel are the way forward. Any adapter failure means "no suggestion"; search never depends on the assistant.
- The port exposes `isAvailable()`. The storefront use case reports it, so the browser never asks a server that has no assistant, and `RephraseQuery` answers `null` without a call when it is false. A production server without a key is therefore quiet, not failing on every pause.
- The server re-derives the unrecognized words and vocabulary from the text itself, so the browser cannot steer the prompt.
- `ClaudeQueryAssistant` calls the Messages API with `claude-opus-5-5`, effort `low` (a short, latency-sensitive rewrite), structured JSON output, and `fallbacks: "default"` so a safety decline falls back server-side instead of failing. The shopper is waiting, so it gets one attempt with an 8 second timeout and no retries. The model name, timeout, and retry count are written in the composition root; the API key comes only from `ANTHROPIC_API_KEY`. `createServerContainer` takes the environment as a parameter so tests never read the developer's real key.

Bindings:

| Runtime and environment | `QueryAssistant` |
| --- | --- |
| Browser, production and local | `HttpQueryAssistant`, posting the text to `/api/assistant` |
| Server, production | `ClaudeQueryAssistant` |
| Server, local | `ClaudeQueryAssistant` when `ANTHROPIC_API_KEY` is set, otherwise `DisabledQueryAssistant`, which logs once to stdout and answers `null` |
| Test | `InMemoryQueryAssistant`, seeded with rewrites |

- Server-only wiring lives in `src/composition/server.ts`, imported as `@/composition/server` by server components and route handlers only. It imports `server-only`, so a client import fails the build. This is the one second entry point to a package next to its `index.ts` (ADR 0010), and it exists to keep the SDK and the secret out of the browser bundle.

## Consequences

Local development still needs no key; the assistant row never appears. Each pause on text that finds nothing because of unknown words costs one model call on the server. The adapter's wire format is tested in the quality gate against a local HTTP server standing in for the API (`baseURL`). The model's judgement is covered by a sandbox test in `__test__/sandbox/`, run with `yarn test:sandbox` and a real key. It is outside the quality gate because the gate must run without secrets, and it fails rather than skips when the key is missing. Run it before enabling the key in production.
