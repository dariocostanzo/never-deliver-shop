const PREFIX = 'nds-reviews-';

export function loadUserReviews(productId) {
    try {
        const raw = localStorage.getItem(PREFIX + productId);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveUserReview(productId, review) {
    const next = [review, ...loadUserReviews(productId)];
    try {
        localStorage.setItem(PREFIX + productId, JSON.stringify(next));
    } catch {
        // storage may be unavailable, but the review still shows for this session
    }
    return next;
}

export function deleteUserReview(productId, reviewId) {
    const next = loadUserReviews(productId).filter((r) => r.id !== reviewId);
    try {
        localStorage.setItem(PREFIX + productId, JSON.stringify(next));
    } catch {
        // storage may be unavailable, but the list still updates for this session
    }
    return next;
}
