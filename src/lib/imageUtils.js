const PLACEHOLDER_BASE = 'https://placehold.co/600x600/f3f4f6/111827/png?text=';
const BLOCKED_IMAGE_HOSTS = new Set([
    'imgur.com',
    'i.imgur.com',
    'nyxcosmetics.com',
    'www.nyxcosmetics.com',
    'api.lorem.space',
]);

function toPlaceholderText(product) {
    const title = String(product?.title || 'Product').trim();
    const shortTitle = title.length > 40 ? `${title.slice(0, 37)}...` : title;
    return encodeURIComponent(shortTitle || 'Product');
}

export function getProductImageSrc(product) {
    const image = String(product?.image || '').trim();
    if (!image) {
        return `${PLACEHOLDER_BASE}${toPlaceholderText(product)}`;
    }

    try {
        const host = new URL(image).hostname.toLowerCase();
        if (BLOCKED_IMAGE_HOSTS.has(host)) {
            return `${PLACEHOLDER_BASE}${toPlaceholderText(product)}`;
        }
    } catch {
        return `${PLACEHOLDER_BASE}${toPlaceholderText(product)}`;
    }

    if (image) return image;
    return `${PLACEHOLDER_BASE}${toPlaceholderText(product)}`;
}

export function handleProductImageError(event, product) {
    const fallback = `${PLACEHOLDER_BASE}${toPlaceholderText(product)}`;
    if (event.currentTarget.src !== fallback) {
        event.currentTarget.src = fallback;
    }
}