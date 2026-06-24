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
	- Aggregated product catalog from multiple public APIs
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

- Shopping flow:
	- Add/remove/update cart quantity
	- Fake checkout with prefilled profile data
	- Simulated payment progress
	- Order history page

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

## Notes

- Product, rating, and review content are demo/fake data.
- Checkout is fully simulated (no real payments or charges).
- External APIs may occasionally rate-limit or change response shape.

## Future Improvements

- Replace demo product APIs with a single production-grade catalog backend
- Add server-side pagination and query caching
- Add authentication and persistent user profiles
- Add automated accessibility checks in CI (axe/lighthouse)
- Add unit + integration tests for cart, checkout, and search logic

## License

Personal/demo project.
