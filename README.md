# amazon-redesign

A minimal, search-first redesign of the amazon.com storefront. The search bar is the page: shoppers describe what they want in plain words, and the filters set themselves while they type.

## Running it

```bash
yarn install
yarn dev
```

| Command | What it does |
| --- | --- |
| `yarn dev` | Runs the app at http://localhost:3000 |
| `yarn format` | Formats with Biome |
| `yarn lint` | Biome, ESLint, and the strict TypeScript check |
| `yarn test` | All Vitest tests |
| `yarn build` | Production build |
| `yarn catalog:build` | Fetches the product source and regenerates the catalogue (see Data) |
| `yarn shots` | Screenshots every storefront state at 1440px and 390px into `docs/screenshots/` (run `yarn build` first; uses the installed Google Chrome) |

The engineering rules are in `CLAUDE.md`, and every architectural decision is an ADR in `docs/adr/`.

## Data

The products come from [DummyJSON](https://dummyjson.com/docs/products), a free public fake-store API: `GET https://dummyjson.com/products?limit=0`, 194 products. If DummyJSON is unreachable, the build falls back to [FakeStoreAPI](https://fakestoreapi.com/) (20 products).

- **Fetched once, then committed.** `yarn catalog:build` fetches the source a single time and saves the response verbatim to `src/infrastructure/product/data/raw/dummyjson.json`. It then writes the app's catalogue to `src/infrastructure/product/data/catalog.json` and the search vocabulary to `src/component/catalog-vocabulary/vocabulary.json`. All three files are committed, and the app never calls the API at runtime. `yarn catalog:build --from-raw` rebuilds from the committed response with no network call, and rebuilding is byte-for-byte reproducible.
- **Re-tagged by rules.** Shopper-facing category groups, feature tags, colours, and delivery estimates are derived by the pure rules in `src/component/catalog-enrichment/enrich.ts`. They use the dictionaries in `src/component/catalog-vocabulary/` (`category-map.ts`, `tag-rules.ts`, `color-word.ts`). Where the rules get an item wrong, `src/component/catalog-enrichment/override.json` corrects it, with a reason for each entry. Tags that fewer than two products share are dropped, so a suggestion never leads to a dead end.
- **Ratings are what the reviews say.** A product's rating is the average of its reviews, rounded to one decimal (reviews of 5, 4, and 1 give 3.3), because DummyJSON's own rating field disagrees with its reviews; review counts are the source's own. DummyJSON ships exactly three sample reviews per product, so cards hide the review count rather than show a number that means nothing. No counts are invented.
- **Product details are a separate file.** The build also writes `src/infrastructure/product/data/product-details.json`: each product's description, photos, stock, shipping, warranty, and return policy, and its three sample reviews (reviewer name, rating, comment, and date; reviewer email addresses are dropped). The browser loads it only when a product is first opened, so search never downloads it. ADR 0029 records the decision.
- **Images are the source's placeholders.** They are DummyJSON's thumbnails, loaded from its CDN through `next/image`. When an image is missing or fails to load, the card shows a drawn category glyph instead.
- **Delivery estimates are derived.** They come from DummyJSON's shipping text ("Ships overnight" means tomorrow, "Ships in 1 week" means 7 days, and so on).

None of this is real retail data: the products, prices, ratings, stock, and images are DummyJSON's sample data.

## Product details

Clicking a product opens it in a modal over the results, laid out like Instagram's post view: a photo carousel on the left (swipe, arrows, arrow keys, or dots) and the details on the right, with the description, availability, shipping, warranty, returns, and the ratings and reviews. The price and the cart button stay in view at the bottom. The open product is in the address (`?product=...`), so it can be shared, and Back closes it. On a phone it fills the screen, photos first.

## Account, orders, and the cart

The header keeps three things beside the logo: the department menu, one account item, and the cart. The account item shows who is shopping above where orders go ("Hello, Darri" over "Minneapolis 55401"), since the delivery location decides what can be delivered, and opens everything that belongs to the account:

- **Sign in** (`/sign-in`) takes only an email. There is no password; the name comes from the address (`darri.konn@example.com` is greeted as Darri). Sign out is at the bottom of the account menu.
- **Delivering to** sets the delivery ZIP code; a dozen US ZIP codes also name their city. On a phone it has its own line under the bar.
- **Your account** (`/account`) links to everything below, and **Your list** (`/lists`) holds products saved with the heart in a product's details.
- **Your orders** (`/orders`) lists orders with where each one is; an order's page tracks it (ordered, shipped, out for delivery, delivered) and starts a return for items still inside their return window.
- **Your cart** (`/cart`) changes quantities, deletes items, and places the order.
- **Buy again** (`/buy-again`), **Track an order** (`/orders?show=on-the-way`), and **Today’s deals** (`/deals`) are also the home page shortcuts.
- **Help** (`/help`), linked from the footer, explains delivery, returns, the account, and accessibility. Every footer link goes to a real page, and an unknown address shows the shop's own "Page not found" page (ADR 0031).

None of it has a backend. The session is a cookie holding the email and ZIP code; the cart, orders, returns, and list are kept in the browser's `localStorage`, so they stay on this device and survive a reload. A new shopper starts with three sample orders, marked "Sample order", so tracking, returns, and buy again have something to show. ADR 0030 records the design.

## Search assistant

There is no real AI behind the search. The assistant is simulated. The search bar parses what the shopper writes against the catalogue's own tagging system: categories, tags, colours, prices, delivery, and rating. It then finds the best matching products and suggests the next filters with exact result counts.

When unknown words leave a search with nothing to show, the "Assistant" row suggests the closest wording the catalogue understands, by spelling ("wireles headphnes" becomes "wireless headphones"). The "Drop" suggestions offer the way back. All of it is deterministic code in `src/component/`, with no model, API key, or network call. ADR 0026 records the decision.

If you want to see how I work with LLMs, take a look at [mintoagent.com](https://mintoagent.com) and [snaphost.ai](https://snaphost.ai). I'm behind both products and their sole developer.
