# NeverDeliver Shop

NeverDeliver Shop is a playful Amazon-style storefront built with React + Vite.
It focuses on UX polish and modern front-end foundations: localization, accessibility improvements, rich search, product suggestions, fake reviews, pagination, and skeleton loading states.

## Why this exists

NeverDeliver is a **shopping simulator**, basically a game. Nothing here is real: no products ship, no cards are charged, and no money ever changes hands.

It's designed as a **safe place to enjoy the fun of shopping without any of the risk**:

- Feel the dopamine of hunting deals, filling a cart, and "checking out" with zero financial consequences.
- A gentler outlet for anyone who struggles with compulsive shopping or shopping addiction.
- A low-stakes way for people with ADHD to scratch the impulse-buy itch and enjoy the thrill of a new purchase without the buyer's remorse.
- A safer sandbox for vulnerable people, including those living with dementia, who can be targeted by scams and fake online stores.

This project is **completely free**, with no ads and nothing to buy, and it always will be.

## Tech Stack

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 4

## Features

- Catalog experience:
  - **200+ products** aggregated from 2 public APIs (DummyJSON, Fakestore)
  - 20+ product categories (electronics, fashion, beauty, jewelry, automotive, groceries, etc.)
  - Category filtering
  - Product details with related products
  - Cart drawer and checkout flow

- Flash sale:
  - Site-wide **50% off everything** flash sale with a live 24h countdown banner
  - Rolling countdown that resets to a fresh 24h window when it expires
  - Original price strikethrough, discount badges, and savings totals across product cards, product pages, cart, and checkout
  - Localized sale copy (English, Italian, German)

- Lightning deals:
  - A rotating subset of products gets **extra-deep discounts (60–90% off)** on top of the flash sale for that "I found a bargain!" rush
  - Deals are chosen deterministically from an hourly time bucket, so the lineup refreshes on its own every hour, with no server needed
  - Marked with a ⚡ **Lightning Deal** badge and a per-item discount percentage on cards and product pages
  - A **Lightning Deals** strip on the home page surfaces the current bargains in a horizontal scroller

- Coupons:
  - Enter a coupon code at checkout, or hit **🎲 Surprise me** to reveal a random working coupon
  - Mix of percentage (10–30% off) and flat-amount ($5/$50 off) codes, with minimum-spend and max-discount rules
  - Applied discount appears in the order summary and is saved with the order; coupons auto-remove if they no longer qualify
  - Localized coupon copy (English, Italian, German)

- Play & Win mini-games (`/games`):
  - **🎡 Spin the Wheel**, **🎰 Slot Machine**, and **🎯 Roulette**: very simple, self-contained games of chance
  - Winning drops the prize into your cart at **$0**, so it rides along to checkout completely free
  - Prizes render as free line items (with a 🎁 badge and struck-through value) in the cart drawer and checkout summary
  - A prize-pool showcase lists everything you can win; localized copy (English, Italian, German)

- Novelty "real estate" listings:
  - Tongue-in-cheek homes to buy when we "don't deliver to your country" (London, Milan, Berlin, New York)
  - Appear in the catalog under a dedicated `real estate` category and are fully shoppable (and on sale)

- Novelty collectibles:
  - An ultra-rare Pokémon cards grail bundle (`collectibles` category) listed at its original grail-worthy price, fully shoppable and included in the flash sale

- Novelty oddities:
  - A batch of absurd, over-the-top curios in an `oddities` category: a bed made of cash, a solid gold toilet, a jar of moon dust, and a personal iceberg, all fully shoppable and on sale

- More things to buy (and never receive):
  - A `jewelry` line spanning everyday gold hoops to a two-carat diamond solitaire
  - `lego`-style brick sets at every budget, from a small polybag to a 5,000+ piece collector starship
  - Luxury `yachts`, from a weekender up to a 400-foot megayacht with its own submarine
  - A classic Magic 8-Ball in the `toys` category

- NeeDoh squishy shop:
  - A dedicated `needohs` category of squishy fidget toys with its own highlighted home-page section
  - Every NeeDoh clearly states it **ships in 6-9 weeks**, shown on the section badge and each product page

- Search and discovery:
  - Header search with live suggestions dropdown
  - Keyboard navigation in suggestions
  - Search by title, category, brand, and description

- Localization and regionalization:
  - Worldwide shipping with a country selector (UK, Italy, US, Germany, Canada, Australia, Japan)
  - Currency selector (GBP, EUR, USD, CAD, AUD, JPY)
  - Language selector with flags (English, Italian, German)

- Accessibility and UX:
  - Improved color contrast for text and metadata
  - Keyboard-visible focus styles
  - Better placeholder/text visibility in search input
  - Improved mobile header layout with search-first wrapping on small screens
  - Checkout step indicator now remains usable on very narrow screens
  - Horizontal overflow prevention to avoid accidental side-scrolling on mobile
  - Automatic product image fallback when third-party image hosts are blocked by region/browser policy
  - Skeleton loading states for key pages
  - Interactive review count opening a fake reviews panel
  - Skip link and improved ARIA semantics for search suggestions
  - Mobile-first responsive layout updates across header, listing, and product pages
  - Pagination scrolls back to the top of the listing on page change, so mobile users aren't stranded at the bottom

- Leave-a-review (parody):
  - "Write a review" form inside the reviews panel (name, star rating, title, body)
  - Submission is gated behind a deliberately absurd 4-stage "human verification" gauntlet:
    spider-leg emoji math, an "existential dread" emoji grid, a wind-nudged slider, and a
    cursor-dodging confirm button
  - Reviews are stored **locally in the browser** (`localStorage`), with no backend involved.
    Your review appears at the top of the list with a "Your review" badge, visible only to you
  - Localized labels (English, Italian, German)

- Shopping flow:
  - Add/remove/update cart quantity, with **per-product stock limits enforced** everywhere (product page, cards, and cart quantity steppers)
  - Fake checkout with prefilled profile data
  - Payment method choice: a locked, prefilled card on file (no card entry required) or cash on delivery
  - Delivery speed pricing is persisted correctly into order history totals
  - Checkout confirmation survives page refresh right after payment
  - Simulated payment progress
  - Order history page

- Parody customer support:
  - A floating support chat that, whatever you type, apologizes that the item is out of stock and hands you an in-store coupon to copy

## Quality Standards

- Documentation hygiene:
  - Update this README whenever features, behavior, scripts, or UX flows change.
  - Keep screenshot references accurate and remove outdated assets or sections.

- Accessibility first:
  - WCAG AA-friendly contrast, visible keyboard focus, and semantic ARIA usage are required.
  - Keyboard-only navigation should work for all primary flows.

- Responsiveness first:
  - All UI updates must be validated on mobile and desktop breakpoints.
  - Avoid layout regressions in header, product grids, forms, drawers, and checkout.

## Project Structure

```text
src/
 components/
 context/
 lib/
 pages/
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

The app will be available on the local Vite URL shown in terminal.

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

### 5. Run tests

```bash
npm test
```

## Performance & Optimization

- **Lazy-loaded catalog**: Uses `fetchCatalogPage()` for efficient pagination instead of loading all 600+ products at once
- **Intelligent caching**: Full catalog is built once on first request and cached for instant subsequent loads
- **Client-side pagination**: Filter, sort, and paginate products in-memory for instant interactions (after initial load)
- **API aggregation**: Combines 2 public APIs (DummyJSON, Fakestore) with deduplication

## Privacy & Security

**Your data is safe.** This is a 100% client-side application:

- No backend server stores your data
- All data stays in your browser's local storage
- Checkout data is never sent anywhere, it's purely simulated
- We only fetch product catalog data from public APIs (no personal data leaves your device)
- You can safely enter any information without privacy concerns

## Notes

- Product, rating, and review content are demo or fake data.
- Checkout is fully simulated (no real payments or charges).
- External APIs may occasionally rate-limit or change response shape.
- Region-blocked image providers were removed from the catalog pipeline to improve global image reliability.

## Future Improvements

- Replace demo product APIs with a single production-grade catalog backend
- Add server-side pagination and query caching
- Add authentication and persistent user profiles
- Add automated accessibility checks in CI (axe/lighthouse)
- Expand unit tests for cart, checkout, and search logic

## License

Personal/demo project.
