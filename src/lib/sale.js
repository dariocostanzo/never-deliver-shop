// Flash sale configuration: a rolling 24h "50% off everything" event.
// The discount is always active in this demo, but the countdown resets every
// 24 hours to keep the urgency real for shoppers.

export const SALE_DISCOUNT_RATE = 0.5; // 50% off
export const SALE_DISCOUNT_PERCENT = Math.round(SALE_DISCOUNT_RATE * 100);

const SALE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const SALE_KEY = 'nds-sale-ends';

// Returns the timestamp (ms) when the current flash-sale window ends.
// Rolls forward automatically once the window elapses.
export function getSaleEndsAt() {
    try {
        const stored = Number(localStorage.getItem(SALE_KEY));
        if (Number.isFinite(stored) && stored > Date.now()) {
            return stored;
        }
    } catch {
        // ignore storage errors
    }
    const next = Date.now() + SALE_WINDOW_MS;
    try {
        localStorage.setItem(SALE_KEY, String(next));
    } catch {
        // ignore storage errors
    }
    return next;
}

// Applies the flash-sale discount to a base price.
export function applySaleToPrice(price) {
    const discounted = Number(price) * (1 - SALE_DISCOUNT_RATE);
    return Math.round(discounted * 100) / 100;
}

// Returns a product with sale pricing baked in so the cart, checkout, and
// order history all stay consistent with the displayed price.
export function withSalePricing(product) {
    const original = Number(product.price) || 0;
    return {
        ...product,
        originalPrice: original,
        price: applySaleToPrice(original),
        onSale: true,
    };
}

// Formats a millisecond duration as HH:MM:SS.
export function formatCountdown(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = n => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
