# NeverDeliver Shop

NeverDeliver Shop is a playful Amazon-style storefront built with React + Vite.
It focuses on UX polish and modern front-end foundations: localization, accessibility improvements, rich search, product suggestions, fake reviews, pagination, and skeleton loading states.

## Tech Stack

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 4

## Features

- Catalog experience:
  - **613+ products** aggregated from 4 public APIs (DummyJSON, Escuela JS, Makeup, Fakestore)
  - 20+ product categories (electronics, fashion, beauty, jewelry, automotive, groceries, etc.)
  - Category filtering
  - Product details with related products
  - Cart drawer and checkout flow

- Search and discovery:
  - Header search with live suggestions dropdown
  - Keyboard navigation in suggestions
  - Search by title, category, brand, and description

- Localization and regionalization:
  - Country selector (UK, Italy, US, Germany)
  - Currency selector (GBP, EUR, USD)
  - Language selector with flags (English, Italian, German)

- Accessibility and UX:
  - Improved color contrast for text and metadata
  - Keyboard-visible focus styles
  - Better placeholder/text visibility in search input
  - Skeleton loading states for key pages
  - Interactive review count opening a fake reviews panel
  - Skip link and improved ARIA semantics for search suggestions
  - Mobile-first responsive layout updates across header, listing, and product pages

- Shopping flow:
  - Add/remove/update cart quantity
  - Fake checkout with prefilled profile data
  - Simulated payment progress
  - Order history page

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
- **API aggregation**: Combines 4 public APIs (DummyJSON, Escuela JS, Makeup, Fakestore) with deduplication

## Privacy & Security

**Your data is safe.** This is a 100% client-side application:

- No backend server stores your data
- All data stays in your browser's local storage
- Checkout data is never sent anywhere — it's purely simulated
- We only fetch product catalog data from public APIs (no personal data leaves your device)
- You can safely enter any information without privacy concerns

## Notes

- Product, rating, and review content are demo or fake data.
- Checkout is fully simulated (no real payments or charges).
- External APIs may occasionally rate-limit or change response shape.

## Future Improvements

- Replace demo product APIs with a single production-grade catalog backend
- Add server-side pagination and query caching
- Add authentication and persistent user profiles
- Add automated accessibility checks in CI (axe/lighthouse)
- Expand unit tests for cart, checkout, and search logic

## License

Personal/demo project.
