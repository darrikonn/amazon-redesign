# 0027. Search waits for a typing pause, and the layout glides between states

## Status

Accepted (2026-10-14)

## Context

Search ran on every keystroke, so chips and results flickered while the shopper was still typing. The first keystroke on the home page removed the hero at once, and the search bar leapt from the middle of the screen to the top. The placeholder demo typed and deleted examples all the time, and "Would set" chips repeated each example, which drew the eye away from the shopper's own task.

## Decision

- What the shopper types appears in the bar at once, but the search runs only after a 250 ms pause (`SearchTextScheduler`, behind `useSearchText`). Choosing a chip, a suggestion, a department, an example, or a sort, clearing the bar, emptying it by typing, and pressing Enter all search at once.
- Chips, suggestions, sort options, and browse links belong to the last search. While newer typed text is still waiting for its search, they dim, and picking one searches the typed text instead, so nothing the shopper typed is ever thrown away.
- The page layout follows the search that ran, not the raw text: the results layout starts when a search with text has completed.
- Nothing appears or disappears at once. The hero, the home extras, the search panel's result rows, and the results themselves fold open and closed (`Collapsible`, a `grid-template-rows` transition) while the space above the bar changes, so the bar slides between the middle and the top in both directions. The rows and results keep the last search's content while they fold away. Folded content is `inert`. All of it lasts `--duration-layout` and becomes instant under `prefers-reduced-motion`.
- The bar's height is measured only when its text changes, and the scroll position is restored after measuring. On a phone the input always reserves two lines, so the first keystroke does not shrink it.
- The placeholder example animates only after the shopper has not moved the pointer, scrolled, touched, or typed for four seconds (`IdleTracker`, behind `useIdle`). Otherwise it shows the current example, fully written and still: an empty bar keeps a hint, it just stops moving. It types more slowly than before and holds each example longer.
- The "Would set" preview chips are gone, together with the `PreviewQuery` use case that fed them.

## Consequences

Results update about a quarter of a second after typing stops, which reads as calm rather than slow. The timing rules live in plain classes with an injected timer, so they are unit tested without a browser. Results still change height between searches when the number of chip rows or products changes; that is new content, not a jump of the bar. Starting a search is one smooth movement instead of a jump; a headless frame-by-frame measurement shows the bar moving at most 18 px per frame. The demo can be missed by a shopper who never pauses, which is acceptable: the example queries below the bar remain visible.
