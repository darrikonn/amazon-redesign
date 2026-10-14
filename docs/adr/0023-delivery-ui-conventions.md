# 0023. Delivery UI conventions

## Status

Accepted (2026-10-14)

## Context

The delivery layer is React. React has naming conventions of its own, and the fallback product glyphs carry their own palette. Both sit awkwardly next to ADR 0011 (no abbreviations) and ADR 0019 (colours are tokens in `global.css`).

## Decision

- `props`, `ref`, and the suffixes `Props` and `Ref` (`SearchPanelProps`, `inputRef`) are React API names and count as names that must match an external API under ADR 0011.
- Interface colours, shadows, and glows (surfaces, text, borders, accents, states, elevation) are custom properties in `src/app/global.css`, and CSS Modules use only those tokens. An opaque stop in a `mask-image` gradient is an alpha mask, not a colour, and stays inline.
- Product photos are the catalogue's thumbnails, rendered with `next/image` inside the well with `object-fit: contain` and 16px of padding. They are decorative (the title follows), so they carry an empty `alt`. A missing or failing photo is replaced by the category glyph from `category-glyph.tsx`, so the well never shows a broken image or alt text.
- Glyph colours are artwork data, not interface colours. Glyph shapes stay inline in `category-glyph.tsx`, and the ink colours stay in the `INK` table in `product-card.tsx`, keyed by the domain `Color` literal, with a default ink for products without a colour.
- A CSS Module class lookup is typed `string | undefined` under `noUncheckedIndexedAccess`, so a component prop that passes a class name through is typed `className?: string | undefined`.
- Every interactive element has an accessible name. Toggle buttons change their label ("Add X to cart", "Remove X from cart") instead of combining a fixed label with `aria-pressed`, except the sort control, where `aria-pressed` marks the selected option.

## Consequences

Theme changes touch one file. Redrawing a category glyph touches only `category-glyph.tsx`. Reviewers do not flag React's own names as abbreviations.
