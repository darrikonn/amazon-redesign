# 0029. Product details open in a modal, from a separately loaded details file

## Status

Accepted (2026-10-14)

## Context

A card shows a name, a price, a rating, and a delivery estimate. Shoppers who want more (other photos, the description, shipping, warranty, returns, what other buyers said) had nowhere to go. A separate product page would throw away the search they are in the middle of. DummyJSON already holds up to six photos, a description, shipping, warranty, and return policy text, stock, and three reviews per product.

Search runs in the browser over the whole catalogue (ADR 0017, ADR 0019), so everything in `catalog.json` is downloaded on the first visit. Descriptions, reviews, and photo lists for every product would more than double that download for data a shopper reads one product at a time.

## Decision

- Clicking a product (its card, or a product in the department panel) opens it in a modal over the results, laid out like Instagram's: the photos on the left, the details on the right; on a phone, photos on top and details below, full screen. The search, the scroll position, and the results stay as they were underneath.
- The photos are a carousel when there is more than one: swipe or scroll on touch, arrow buttons and the arrow keys otherwise, and dots that show and choose the photo. All of a product's photos (at most six) load as soon as the modal opens, so a swipe lands on a photo rather than a blank.
- The right side shows the brand, name, rating, and price; delivery; an add to cart button; the description; availability, shipping, warranty, and returns; and "Ratings and reviews" with each review's name, rating, date, and comment.
- The modal is a native `<dialog>` opened with `showModal()`, which makes the page behind it inert, traps focus, closes on Escape, and returns focus to the product that opened it. Clicking the backdrop closes it too. The page behind does not scroll while it is open.
- The open product is in the URL (`?product=<id>`), so a link to it can be shared. Opening pushes a history entry, so Back closes the modal; a link opened straight to a product opens the modal after the page loads, and closing it leaves the search in place. A plain arrow key turns the photos from anywhere in the modal; modified arrows are left to the browser.
- Details live in their own generated file, `src/infrastructure/product/data/product-details.json`, written by `yarn catalog:build` next to `catalog.json`. `CatalogProductDetailsRepository` imports it on first use, so the bundler puts it in a separate chunk that only loads when a modal first opens. The modal appears at once with what the card already shows, and fills in when the details arrive.
- Reviewer email addresses in the source are dropped at build time; only the reviewer's name, rating, comment, and date are kept.
- In the modal the photos are the subject, not decoration, so unlike the cards (ADR 0023) each carries the product name as its `alt`, inside a figure labelled "Photo n of m".
- `ProductDetails` names one record (the details of one product), so its files keep the entity's name (`product-details.ts`, `product-details.json`) under ADR 0009.
- The `ViewProduct` use case combines the product and its details into a `ProductView`; the `ProductDetailsRepository` port has the usual complete surface, an in-memory fake, and a single and a list data loader.
- The department the results belong to lists its three best-rated products under its sub-groups, preferring products outside the current results, so the panel also offers related products to open. A department the results have left keeps the list it showed, like it stays open (ADR 0028), so nothing above a clicked entry shrinks.
- The address is written in one place, after every change has rendered: the search that ran, its sort, and the open product. Opening a product pushes a history entry marked in `history.state`, which survives a reload. The shop hands the framework only its own keys: the framework adds its own, and only then keeps `usePathname` and `useSearchParams` in step with the new address, so links built from the address (sign in and come back) follow the search on screen. Moving to another page shows the product that page's address names, so the modal never stays open over the sign-in page; closing steps back over a marked entry and otherwise just drops the product from the address.

## Consequences

The first visit downloads no more than before; the first modal costs one extra request for the details chunk (about 165 KB, once per visit). Shoppers can look closely at a product without losing their search. A product that is not in the catalogue (an old or edited link) simply opens nothing. The three DummyJSON reviews per product are sample data and are labelled as reviews, not as a count of buyers.
