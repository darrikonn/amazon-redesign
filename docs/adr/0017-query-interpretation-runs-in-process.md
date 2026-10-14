# 0017. Query interpretation runs in process, on every keystroke

## Status

Accepted (2026-10-14)

## Context

The storefront is search first: the shopper describes what they need in plain language ("dimmable desk lamp under $40 that arrives tomorrow") and the filters set themselves while they type. Every keystroke must update the understood terms, the result count, and the "add a detail" suggestions. Each suggestion shows how many results it would leave, which means interpreting a dozen candidate queries per keystroke.

A hosted language model cannot do that: a network round trip per candidate per keystroke is too slow, costs money on every character, and needs an API key, which local development must not require (ADR 0005).

## Decision

Query interpretation is a pure business component in `src/component/query-interpretation`. It turns text into a `SearchIntent` (category, price range, delivery window, rating floor, colour, features, leftover keywords) plus the list of understood terms, each with the exact phrase it came from so the term can be removed from the text again.

The vocabulary (category synonyms, feature synonyms, colours, stop words) lives next to the interpreter as constants. Adding a synonym is a code change with a test.

Suggestion counts are computed by appending the suggestion's phrase to the query and interpreting the result. The count a chip shows is therefore exactly what the shopper gets after pressing it.

Good:

```ts
const next = appendPhrase(text, "under $30");
const resultCount = filterProducts(products, interpretQuery(next).intent).length;
```

Bad:

```ts
// One network call per suggestion, per keystroke.
const next = await languageModel.interpret(`${text} under $30`);
```

## Consequences

Interpretation is instant, free, deterministic, and unit tested against the reference screens. Phrasing outside the vocabulary falls through to keyword matching on product text, which is less clever than a model. If a model is added later, it goes behind a core port as an infrastructure adapter that enriches the intent for leftover keywords after the shopper pauses, never on the per-keystroke path, and the in-process interpreter stays the fallback.
