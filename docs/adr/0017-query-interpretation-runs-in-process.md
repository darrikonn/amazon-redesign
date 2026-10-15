# 0017. Query interpretation runs in process, as the shopper types

## Status

Accepted (2026-10-14). Amended by ADR 0027: the search now runs after a 600 ms typing pause rather than on every keystroke.

## Context

The storefront is search first: the shopper describes what they need in plain language ("wireless headphones under $150") and the filters set themselves while they type. Each search, run as soon as the shopper pauses (ADR 0027), must update the understood terms, the result count, and the "add a detail" suggestions. Each suggestion shows how many results it would leave, which means interpreting a dozen candidate queries per search.

A hosted language model cannot do that: a network round trip per candidate per search is too slow, costs money on every pause, and needs an API key, which local development must not require (ADR 0005).

## Decision

Query interpretation is a pure business component in `src/component/query-interpretation`. It turns text into a `SearchIntent` (category, price range, delivery window, rating floor, colour, tags, leftover keywords) plus the list of understood terms, each with the exact phrase it came from so the term can be removed from the text again.

The vocabulary (category synonyms, tag keywords, colour words) lives in the `catalog-vocabulary` component module, and the stop words live next to the interpreter. Adding a synonym is a code change with a test.

Rating phrases set a floor: "top rated", "best rated", and "highly rated" mean 4.5 and up, and an explicit star count ("4 stars", "4+ stars") means that count and up. The reference prototype mapped every rating phrase to 4.5; taking the shopper's number literally is deliberate.

Suggestion counts are computed by appending the suggestion's phrase to the query and interpreting the result. The count a chip shows is therefore exactly what the shopper gets after pressing it.

Good:

```ts
const next = appendPhrase(text, "under $30");
const resultCount = filterProducts(products, interpretQuery(next).intent).length;
```

Bad:

```ts
// One network call per suggestion, per search.
const next = await languageModel.interpret(`${text} under $30`);
```

## Consequences

Interpretation is instant, free, deterministic, and unit tested against the reference screens. Phrasing outside the vocabulary falls through to keyword matching on product text, which is less clever than a model. A simulated assistant suggests spelling corrections for leftover keywords (ADR 0026); the interpreter stays the source of truth for what a query means.

The vocabulary is data-driven (ADR 0025): category synonyms come from `category-map.ts`, tag keywords from `tag-rules.ts`, and only the categories and tags that the generated `vocabulary.json` lists as present are recognised. Tags and categories are matched in one pass, longest phrase first, so the category "sports gear" is read before the tag "sports" can take half of it.
