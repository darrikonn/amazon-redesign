# 0026. The search assistant is simulated, not a language model

## Status

Accepted (2026-10-14). Supersedes ADR 0024.

## Context

ADR 0024 added a Claude-backed assistant that rewrote phrasing the interpreter missed. The product decision is now to keep the assistant experience but fake it: the app should parse what the shopper wrote and find the best match in the catalogue's own tagging system, with no model, no API key, and no server endpoint.

## Decision

- The Claude adapter, the query assistant port, the `/api/assistant` route, the server-only composition entry point, and the sandbox test are removed, together with `@anthropic-ai/sdk` and `server-only`.
- `suggestRewrite` in the `query-assistance` component is the assistant. It runs only when unknown words leave a search with no results. Each unknown word is mapped to the closest single-word category synonym, tag keyword, or colour word by edit distance (at most one edit for words of four to seven letters, two for longer ones, nothing below four letters); words with no close match are dropped. A rewrite that only drops words is left to the "Drop" suggestions.
- The suggestion is rebuilt from the understood phrases, must leave fewer unknown words than the original, and must find at least one product. It is part of the search outcome, so it appears with the results, with no waiting state.
- The README says plainly that the assistant is simulated.

## Consequences

The assistant is instant, free, deterministic, and fully unit tested. It fixes spelling slips ("wireles headphnes") but cannot understand intent outside the vocabulary ("a gift for my dad"); those searches fall back to the "Drop" suggestions and closest matches.
