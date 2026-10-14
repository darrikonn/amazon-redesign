# 0028. A browse panel beside successful results

## Status

Accepted (2026-10-14)

## Context

A shopper who finds what they searched for has nowhere obvious to go next. Large retailers show a department tree with counts next to results, which both helps people adjust a search and invites them to browse more of the catalogue.

## Decision

- Successful searches return a `navigation` (`buildBrowseNavigation` in the product-search component); searches with no results return none.
- When the results sit in one department (named in the text, or shared by every result), the panel shows that department with its size in the whole catalogue, its sub-groups (the department's tags) with catalogue-wide counts, and "Shoppers also browse": the related departments in `RELATED_CATEGORIES` (`catalog-vocabulary/related-category.ts`) that have products.
- When the results span several departments, the panel splits them by department, with each count taken from the current results; a link narrows the current search to that department.
- Department and sub-group entries browse the department as a whole, like a store directory: a sub-group link searches "<tag> <department>" and does not keep the shopper's other filters. Narrowing the current search is the job of the "Add a detail" chips.
- An entry is marked current only when the search is exactly that entry; a narrower search marks nothing. The department heading is always shown in bold and underlined, because it names the department the results belong to.
- Each entry is a real link to its search (`/?q=...`), so it opens in a new tab, but a plain click searches in place without a reload.
- On desktop the panel sits in a 240 px column left of the results (200 px below 1100 px wide) and stays in view while scrolling. On a phone it follows the results, so products come first.
- Limits (`NAVIGATION_RULES`): at most 8 sub-groups, 8 departments, and 4 related departments.

## Consequences

Every successful result page offers a next step, grounded in what the catalogue actually holds. The related-department map is a business decision kept in one readable file. The results grid loses one column on desktop to make room for the panel.
