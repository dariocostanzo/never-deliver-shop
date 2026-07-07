// Random coupon system. Shoppers can type a code at checkout or hit
// "Surprise me" to reveal a random working coupon for a nice extra discount.
// Everything is client-side and just for fun, with no real money involved.

// Each coupon is either a percentage discount (`percent`) capped at `maxOff`,
// or a flat amount off (`fixed`). `minSpend` gates the bigger rewards.
export const COUPONS = [
    { code: 'BARGAIN10', type: 'percent', amount: 10, label: '10% off your order' },
    { code: 'NEVER15', type: 'percent', amount: 15, label: '15% off because we never deliver' },
    { code: 'SURPRISE20', type: 'percent', amount: 20, label: '20% off, surprise!' },
    { code: 'HOUSEPARTY25', type: 'percent', amount: 25, label: '25% off, even the houses' },
    { code: 'FREEFALL30', type: 'percent', amount: 30, maxOff: 500, label: '30% off (up to your first $500)' },
    { code: 'LUCKY5', type: 'fixed', amount: 5, label: '$5 off any order' },
    { code: 'GOLDEN50', type: 'fixed', amount: 50, minSpend: 200, label: '$50 off orders over $200' },
];

const COUPON_MAP = new Map(COUPONS.map(c => [c.code, c]));

// Normalizes user input (trim + uppercase) and looks up a matching coupon.
// Returns the coupon definition or null when the code is unknown.
export function findCoupon(code) {
    if (!code) return null;
    return COUPON_MAP.get(String(code).trim().toUpperCase()) || null;
}

// Returns a random coupon so shoppers can be handed a working code on demand.
export function getRandomCoupon() {
    const index = Math.floor(Math.random() * COUPONS.length);
    return COUPONS[index];
}

// Computes the discount (in currency units) a coupon applies to a subtotal,
// along with a reason when it can't be applied yet (e.g. minimum spend).
export function computeCouponDiscount(coupon, subtotal) {
    if (!coupon) return { discount: 0, valid: false, reason: 'No coupon applied.' };

    const amount = Number(subtotal) || 0;

    if (coupon.minSpend && amount < coupon.minSpend) {
        return {
            discount: 0,
            valid: false,
            reason: `Spend ${coupon.minSpend} to use ${coupon.code}.`,
        };
    }

    let discount;
    if (coupon.type === 'fixed') {
        discount = coupon.amount;
    } else {
        discount = amount * (coupon.amount / 100);
        if (coupon.maxOff) {
            discount = Math.min(discount, coupon.maxOff);
        }
    }

    // Never discount below zero.
    discount = Math.min(discount, amount);
    discount = Math.round(discount * 100) / 100;

    return { discount, valid: discount > 0, reason: '' };
}
