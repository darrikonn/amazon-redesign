# 0027. Search waits for a typing pause, and the layout glides between states

## Status

Accepted (2026-10-14)

## Context

Search ran on every keystroke, so chips and results flickered while the shopper was still typing. The first keystroke on the home page removed the hero at once, and the search bar leapt from the middle of the screen to the top. The placeholder demo typed and deleted examples all the time, and "Would set" chips repeated each example, which drew the eye away from the shopper's own task.

## Decision

- What the shopper types appears in the bar at once, but the search runs only after a 250 ms pause (`SearchTextScheduler`, behind `useSearchText`). Choosing a chip, a suggestion, a department, an example, or a sort, the clear button, Escape, and pressing Enter all search at once. Backspacing the bar empty waits for the pause like any other typing, so deleting a query to write a new one does not fold the page home in between.
- Chips, suggestions, sort options, and relaxations belong to the last search. While newer typed text is still waiting for its search, they dim, and picking one searches the typed text instead, so nothing the shopper typed is ever thrown away. When the shopper has emptied the bar there is nothing to lose, so the pick goes through. The department panel goes somewhere fixed, so it never dims and always does what it says (ADR 0028).
- The page layout follows the search that ran, not the raw text: the results layout starts when a search with text has completed.
- Nothing appears or disappears at once. The hero, the home extras, the search panel's result rows (and, between searches, the assistant and "Add a detail" rows), and the results themselves fold open and closed (`Collapsible`, a `grid-template-rows` transition) while the space above the bar changes, so the bar slides between the middle and the top in both directions. The rows and results keep the last search's content while they fold away (`useRetained`, `lastResults`). Folded content is `inert`. All of it lasts `--duration-layout` and becomes instant under `prefers-reduced-motion`.
- When choosing something folds away the very control that was used (a starter query, the last chip, the example arrow, a browse link), keyboard focus moves to the results headline, or back to the input on the way home, once the chosen search has arrived. Only a choice that changes the bar or the searched text is tracked, so a sort change or a click on the current department can never move focus later, and once the shopper has typed something else, focus is left alone. A starter query also scrolls back to the top, so on a phone the bar is in view for refining.
- The bar's height is measured only when its text changes, and the scroll position is restored after measuring. On a phone the input always reserves two lines, so the first keystroke does not shrink it.
- The placeholder example animates only after the shopper has not moved the pointer, scrolled, touched, or typed for four seconds (`IdleTracker`, behind `useIdle`). Otherwise it shows the current example, fully written and still: an empty bar keeps a hint, it just stops moving. An interrupted animation resets to that fully written example, and the next one starts from it, so a half-typed frame is never shown again. It types more slowly than before and holds each example longer.
- The "Would set" preview chips are gone, together with the `PreviewQuery` use case that fed them.

## Consequences

Results update about a quarter of a second after typing stops, which reads as calm rather than slow. The timing rules live in plain classes with an injected timer, so they are unit tested without a browser. Results still change height between searches when the number of products changes; that is new content, not a jump of the bar. Starting a search is one smooth movement instead of a jump; a headless frame-by-frame measurement shows the bar moving at most 17 px per frame in either direction. The demo can be missed by a shopper who never pauses, which is acceptable: the example queries below the bar remain visible.
