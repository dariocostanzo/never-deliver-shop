// Flash sale configuration: a rolling 24h "50% off everything" event.
// The discount is always active in this demo, but the countdown resets every
// 24 hours to keep the urgency real for shoppers.

export const SALE_DISCOUNT_RATE = 0.5; // 50% off
export const SALE_DISCOUNT_PERCENT = Math.round(SALE_DISCOUNT_RATE * 100);

const SALE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const SALE_KEY = 'nds-sale-ends';

// ── Lightning deals ────────────────────────────────────────────────────────
// On top of the flat flash sale, a small rotating subset of products gets an
// extra-deep discount so shoppers can feel the "I found a bargain!" rush.
// The lineup is derived from the current time bucket, so it refreshes on its
// own every hour, no server needed.

export const DEAL_WINDOW_MS = 60 * 60 * 1000; // deals rotate every hour

// How deep a lightning deal can go (fraction off the original price).
const DEAL_DEPTHS = [0.6, 0.7, 0.8, 0.9];

// Roughly 1 in N catalog items is a lightning deal at any given moment.
const DEAL_FREQUENCY = 10;

// Small deterministic string hash (djb2-ish) used to pick deal items.
function hashString(str) {
    let hash = 0;
    const value = String(str);
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// Identifier for the current hourly deal window.
export function getDealWindowId(now = Date.now()) {
    return Math.floor(now / DEAL_WINDOW_MS);
}

// Timestamp (ms) when the current hourly deal window ends.
export function getDealWindowEndsAt(now = Date.now()) {
    return (getDealWindowId(now) + 1) * DEAL_WINDOW_MS;
}

// Decides whether a product is a lightning deal in the current window, and if
// so how deep the discount goes. Returns a discount rate (0–1) or null.
export function getDeepDiscountRate(productId, windowId = getDealWindowId()) {
    const hash = hashString(`${productId}::${windowId}`);
    if (hash % DEAL_FREQUENCY !== 0) return null;
    const depth = DEAL_DEPTHS[Math.floor(hash / DEAL_FREQUENCY) % DEAL_DEPTHS.length];
    return depth;
}

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
// order history all stay consistent with the displayed price. Lightning-deal
// items get an extra-deep discount instead of the flat flash-sale rate.
export function withSalePricing(product) {
    const original = Number(product.price) || 0;
    const deepRate = getDeepDiscountRate(product.id);
    const rate = deepRate ?? SALE_DISCOUNT_RATE;
    const discounted = original * (1 - rate);
    return {
        ...product,
        originalPrice: original,
        price: Math.round(discounted * 100) / 100,
        onSale: true,
        discountPercent: Math.round(rate * 100),
        isLightningDeal: deepRate != null,
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
