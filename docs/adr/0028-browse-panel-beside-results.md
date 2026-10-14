# 0028. A department directory beside the results

## Status

Accepted (2026-10-14)

## Context

A shopper who finds what they searched for has nowhere obvious to go next. Large retailers show a department tree with counts next to results, which both helps people adjust a search and invites them to browse more of the catalogue.

A first version built the panel from each search: one department with its sub-groups and related departments, or a split of the results by department. Clicking through it changed what it showed, so an entry the shopper had just seen could vanish on the next click, and the panel never told them where in the store they were.

## Decision

- Every search with text returns a `navigation` (`buildBrowseNavigation` in the product-search component): the store directory. It lists every department that has products, in the catalogue's fixed order (`CATEGORY_IDS`), each with its catalogue-wide count and its sub-groups (the department's most common tags, at most `NAVIGATION_RULES.maximumGroupLinks`, with catalogue-wide counts).
- The directory is the same on every search. Only the markers move, so clicking through it never reshuffles it. Searches with no results keep it too, as a way out.
- The department the results belong to (named in the text, or shared by every result) is marked `containsResults`: it is shown bold and underlined, announced with `aria-current`, and opened to show its sub-groups. Results spread over several departments mark none.
- An entry is `isCurrent` (`aria-current="page"`) only when the search is exactly that entry; a narrower search marks no entry.
- Any department can be opened or closed with its disclosure button to look inside without searching. A department opened or closed by hand stays that way while the shopper clicks through the panel; the others follow the marker.
- A sub-group link searches "<tag> <department>" and does not keep the shopper's other filters, like a store directory. Narrowing the current search is the job of the "Add a detail" chips.
- Each entry is a real link to its search (`/?q=...&sort=...`, keeping the shopper's sort, as a plain click does), so it opens in a new tab, but a plain click searches in place without a reload and scrolls back to the top, so the new results start in view.
- Every entry goes somewhere fixed, so the panel works even while a newer typed search is pending, and it does not dim with the results.
- The panel comes after the results in the DOM, so keyboard and screen reader order reaches the products first. On desktop the grid draws it in a 240 px column left of the results (200 px below 1100 px wide). It is sticky and never taller than the window: the list scrolls inside it, and the marked department is brought into view there without moving the page. On a phone it follows the results.

## Consequences

Every result page shows the whole store and where the shopper is in it, grounded in what the catalogue actually holds. The panel is stable, so it can be learned. With 21 departments the desktop list can scroll inside the panel. The reference design ended the panel with "recently viewed" products; the storefront records no product views, so that block is left out until views are tracked. The results grid loses one column on desktop to make room for the panel.
