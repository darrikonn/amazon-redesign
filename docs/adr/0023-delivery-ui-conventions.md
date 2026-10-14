# 0023. Delivery UI conventions

## Status

Accepted (2026-10-14)

## Context

The delivery layer is React. React has naming conventions of its own, and the product illustrations carry their own palette. Both sit awkwardly next to ADR 0011 (no abbreviations) and ADR 0019 (colours are tokens in `global.css`).

## Decision

- `props`, `ref`, and the suffixes `Props` and `Ref` (`SearchPanelProps`, `inputRef`) are React API names and count as names that must match an external API under ADR 0011.
- Interface colours, shadows, and glows (surfaces, text, borders, accents, states, elevation) are custom properties in `src/app/global.css`, and CSS Modules use only those tokens. An opaque stop in a `mask-image` gradient is an alpha mask, not a colour, and stays inline.
- Product illustration colours are artwork data, not interface colours. They stay inline in `product-illustration.tsx`, and the product ink colours stay in the `INK` table in `product-card.tsx`, keyed by the domain `Color` literal.
- A CSS Module class lookup is typed `string | undefined` under `noUncheckedIndexedAccess`, so a component prop that passes a class name through is typed `className?: string | undefined`.
- Every interactive element has an accessible name. Toggle buttons change their label ("Add X to cart", "Remove X from cart") instead of combining a fixed label with `aria-pressed`, except the sort control, where `aria-pressed` marks the selected option.

## Consequences

Theme changes touch one file. Redrawing a product touches only its illustration. Reviewers do not flag React's own names as abbreviations.
