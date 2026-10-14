# 0027. Search waits for a typing pause, and the layout glides between states

## Status

Accepted (2026-10-14)

## Context

Search ran on every keystroke, so chips and results flickered while the shopper was still typing. The first keystroke on the home page removed the hero at once, and the search bar leapt from the middle of the screen to the top. The placeholder demo typed and deleted examples all the time, and "Would set" chips repeated each example, which drew the eye away from the shopper's own task.

## Decision

- What the shopper types appears in the bar at once, but the search runs only after a 250 ms pause (`useSearchText`). Choosing a chip, a suggestion, a department, an example, or a sort, clearing the bar, and pressing Enter all search at once.
- The page layout follows the search that ran, not the raw text: the results layout starts when a search with text has completed.
- The hero and the home extras are never removed; they fold away (`Collapsible`, a `grid-template-rows` transition) while the space above the bar shrinks, so the bar slides to the top. Folded content is `inert`. All of it lasts `--duration-layout` and becomes instant under `prefers-reduced-motion`.
- The bar's height is measured only when its text changes, and the scroll position is restored after measuring.
- The placeholder example animates only after the shopper has not moved the pointer, scrolled, touched, or typed for four seconds (`useIdle`). Otherwise it shows the current example, fully written and still. It types more slowly than before and holds each example longer.
- The "Would set" preview chips are gone, together with the `PreviewQuery` use case that fed them.

## Consequences

Results update about a quarter of a second after typing stops, which reads as calm rather than slow. Starting a search is one smooth movement instead of a jump; a headless frame-by-frame measurement shows the bar moving at most 18 px per frame. The demo can be missed by a shopper who never pauses, which is acceptable: the example queries below the bar remain visible.
