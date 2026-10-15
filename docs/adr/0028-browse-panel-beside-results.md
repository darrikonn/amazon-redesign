# 0028. A department directory beside the results

## Status

Accepted (2026-10-14)

## Context

A shopper who finds what they searched for has nowhere obvious to go next. Large retailers show a department tree with counts next to results, which both helps people adjust a search and invites them to browse more of the catalogue.

A first version built the panel from each search: one department with its sub-groups and related departments, or a split of the results by department. Clicking through it changed what it showed, so an entry the shopper had just seen could vanish on the next click, and the panel never told them where in the store they were.

## Decision

- Every search returns a `navigation` (`buildBrowseNavigation` in the product-search component): the store directory. It lists every department that has products, in the catalogue's fixed order (`CATEGORY_IDS`), each with its catalogue-wide count and its sub-groups (the department's most common tags, at most `NAVIGATION_RULES.maximumGroupLinks`, with catalogue-wide counts).
- The directory is the same on every search. Only the markers move, so clicking through it never reshuffles it. Searches with no results keep it too, as a way out.
- The department the results belong to (named in the text, or shared by every result) is marked `containsResults`: it is shown bold and underlined, announced with `aria-current`, and opened to show its sub-groups. Results spread over several departments mark none.
- An entry is `isCurrent` (`aria-current="page"`) only when the search is exactly that entry; a narrower search marks no entry.
- Any department can be opened or closed with its disclosure button to look inside without searching. Nothing closes by itself: when the results move to another department, that department opens and the one they left stays open, so no entry slides away from the pointer. A department the results move into always opens, even if it was closed by hand earlier.
- A sub-group link searches "<tag> <department>" and does not keep the shopper's other filters, like a store directory. Narrowing the current search is the job of the "Add a detail" chips.
- Each entry is a real link to its search (`/?q=...&sort=...`, keeping the shopper's sort, as a plain click does), so it opens in a new tab, but a plain click searches in place without a reload. On a phone, where the panel follows the results, the page then goes back to the top so the new results are in view. Beside the results, it goes to the top only if the clicked entry stays in view there; otherwise the page stays put, so the entry never jumps away from the pointer.
- Every entry goes somewhere fixed, so the panel works even while a newer typed search is pending, and it does not dim with the results.
- The entries are links the page answers itself, so they do not prefetch: prefetching would run a full server render of every search and product in view for nothing.
- The header's menu lists the same directory. A department's name searches it; its arrow only opens its sub-groups (with an "All" entry first), so a shopper can look inside a department before going anywhere.
- The panel comes after the results in the DOM, so keyboard and screen reader order reaches the products first. On desktop the grid draws it in a 240 px column left of the results (200 px below 1100 px wide), and it scrolls with the page. It is deliberately neither sticky nor a scroll area of its own: a scroll area that fills the left column would capture the mouse wheel and stop the page from scrolling. On a phone it follows the results.

## Consequences

Every result page shows the whole store and where the shopper is in it, grounded in what the catalogue actually holds. The panel is stable, so it can be learned. With 21 departments and one open, the panel can be taller than the window; the lower departments are reached by scrolling the page, like any long directory. The reference design ended the panel with "recently viewed" products; the storefront records no product views, so that block is left out until views are tracked. The results grid loses one column on desktop to make room for the panel.
