# 0019. Search renders on the server first, then runs in the browser

## Status

Accepted (2026-10-14)

## Context

A search must be shareable and survive a reload, so the query and sort belong in the URL. The search must also react to every keystroke without waiting on the network (ADR 0017).

## Decision

- The URL is the source of truth for a search: `/?q=<text>&sort=<sort>`. `sort` is one of the `SearchSort` literals and is validated at the delivery boundary; anything else falls back to best match.
- `src/app/page.tsx` is a server component. It reads the URL, creates a container, runs the search use case, and renders the first result on the server.
- `src/app/_ui/storefront.tsx` is the client root. It creates its own container once per page, re-runs the use cases on every change, and writes the query and sort back to the URL with `history.replaceState`, so typing does not add history entries.
- Responses that arrive after a newer request started are discarded, so a slow early keystroke never overwrites a later result.
- Delivery UI lives in `src/app/_ui` (the underscore keeps it out of routing). Styles are CSS Modules next to the component, with colour tokens as CSS custom properties in `src/app/global.css`.

## Consequences

A shared link renders fully on the first response, with no loading flash. Use cases run in two places, so they must stay free of server-only or browser-only APIs; adapters that need either are bound per container.
