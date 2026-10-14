# 0029. Product details open in a modal, from a separately loaded details file

## Status

Accepted (2026-10-14)

## Context

A card shows a name, a price, a rating, and a delivery estimate. Shoppers who want more (other photos, the description, shipping, warranty, returns, what other buyers said) had nowhere to go. A separate product page would throw away the search they are in the middle of. DummyJSON already holds up to six photos, a description, shipping, warranty, and return policy text, stock, and three reviews per product.

Search runs in the browser over the whole catalogue (ADR 0017, ADR 0019), so everything in `catalog.json` is downloaded on the first visit. Descriptions, reviews, and photo lists for every product would more than double that download for data a shopper reads one product at a time.

## Decision

- Clicking a product (its card, or a product in the department panel) opens it in a modal over the results, laid out like Instagram's: the photos on the left, the details on the right; on a phone, photos on top and details below, full screen. The search, the scroll position, and the results stay as they were underneath.
- The photos are a carousel when there is more than one: swipe or scroll on touch, arrow buttons and the arrow keys otherwise, and dots that show and choose the photo.
- The right side shows the brand, name, rating, and price; delivery; an add to cart button; the description; availability, shipping, warranty, and returns; and "Ratings and reviews" with each review's name, rating, date, and comment.
- The modal is a native `<dialog>` opened with `showModal()`, which makes the page behind it inert, traps focus, closes on Escape, and returns focus to the product that opened it. Clicking the backdrop closes it too. The page behind does not scroll while it is open.
- The open product is in the URL (`?product=<id>`), so a link to it can be shared. Opening pushes a history entry, so Back closes the modal; a link opened straight to a product opens the modal after the page loads, and closing it leaves the search in place.
- Details live in their own generated file, `src/infrastructure/product/data/product-details.json`, written by `yarn catalog:build` next to `catalog.json`. `CatalogProductDetailsRepository` imports it on first use, so the bundler puts it in a separate chunk that only loads when a modal first opens. The modal appears at once with what the card already shows, and fills in when the details arrive.
- Reviewer email addresses in the source are dropped at build time; only the reviewer's name, rating, comment, and date are kept.
- The `ViewProduct` use case combines the product and its details into a `ProductView`; the `ProductDetailsRepository` port has the usual complete surface, an in-memory fake, and a single and a list data loader.
- The department the results belong to lists its three best-rated products under its sub-groups, preferring products outside the current results, so the panel also offers related products to open.

## Consequences

The first visit downloads no more than before; the first modal costs one small extra request. Shoppers can look closely at a product without losing their search. A product that is not in the catalogue (an old or edited link) simply opens nothing. The three DummyJSON reviews per product are sample data and are labelled as reviews, not as a count of buyers.
