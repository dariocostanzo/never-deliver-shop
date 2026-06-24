const DUMMYJSON_BASE = 'https://dummyjson.com';
const FAKESTORE_BASE = 'https://fakestoreapi.com';

let catalogCache = null;
let catalogInitPromise = null;

function asNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function seededNumber(seed, min, max) {
    let hash = 0;
    for (let i = 0; i < String(seed).length; i += 1) {
        hash = (hash << 5) - hash + String(seed).charCodeAt(i);
        hash |= 0;
    }
    const normalized = Math.abs(hash % 1000) / 1000;
    return min + (max - min) * normalized;
}

function normalizeDummyProduct(raw) {
    return {
        id: `dj-${raw.id}`,
        title: raw.title,
        description: raw.description || '',
        category: raw.category || 'other',
        price: asNumber(raw.price, 0),
        image: raw.thumbnail || raw.images?.[0] || '',
        rating: {
            rate: asNumber(raw.rating, 4),
            count: asNumber(raw.stock, 100),
        },
        stock: asNumber(raw.stock, 0),
        brand: raw.brand || '',
    };
}

function normalizeFakestoreProduct(raw) {
    return {
        id: `fs-${raw.id}`,
        title: raw.title,
        description: raw.description || '',
        category: raw.category || 'other',
        price: asNumber(raw.price, 0),
        image: raw.image || '',
        rating: {
            rate: asNumber(raw.rating?.rate, 3.5),
            count: asNumber(raw.rating?.count, 50),
        },
        stock: Math.round(seededNumber(raw.id, 5, 100)),
        brand: raw.category || 'FakeStore',
    };
}

function dedupeProducts(products) {
    const seen = new Set();
    return products.filter(product => {
        const key = `${product.title.toLowerCase().trim()}::${product.price}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

async function fetchFakestoreProducts() {
    try {
        const res = await fetch(`${FAKESTORE_BASE}/products`);
        if (!res.ok) throw new Error('Fakestore failed');
        const data = await res.json();
        return (Array.isArray(data) ? data : []).map(normalizeFakestoreProduct);
    } catch {
        return [];
    }
}

// Lazy-load catalog (build it once, use for pagination)
async function initializeCatalog() {
    if (catalogCache?.length) {
        return catalogCache;
    }

    if (!catalogInitPromise) {
        catalogInitPromise = (async () => {
            const [dummyResult, fakestoreProducts] = await Promise.all([
                fetch(`${DUMMYJSON_BASE}/products?limit=194`)
                    .then(r => (r.ok ? r.json() : { products: [] }))
                    .then(data => (data.products || []).map(normalizeDummyProduct))
                    .catch(() => []),
                fetchFakestoreProducts().catch(() => []),
            ]);

            const combined = dedupeProducts([...dummyResult, ...fakestoreProducts]);
            if (combined.length === 0) {
                throw new Error('Failed to fetch products');
            }

            catalogCache = combined;
            return catalogCache;
        })();
    }

    return catalogInitPromise;
}

// Fetch paginated products (lazy-loaded)
export async function fetchCatalogPage(page = 1, pageSize = 20) {
    const catalog = await initializeCatalog();
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    return {
        products: catalog.slice(startIdx, endIdx),
        total: catalog.length,
        page,
        pageSize,
        totalPages: Math.ceil(catalog.length / pageSize),
    };
}

// Legacy function for backward compatibility - returns products from cache
export async function fetchCatalogProducts(limit = 700) {
    const catalog = await initializeCatalog();
    return catalog.slice(0, limit);
}

export async function searchCatalogProducts(query, limit = 8) {
    if (!query?.trim()) return [];

    const q = query.toLowerCase().trim();
    const catalog = await fetchCatalogProducts(900);
    const matches = catalog.filter(product =>
        product.title.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q)
    );

    return matches.slice(0, limit);
}

export async function fetchProductById(id) {
    const [source, rawId] = String(id).split('-');

    if (source === 'dj') {
        const res = await fetch(`${DUMMYJSON_BASE}/products/${rawId}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        return normalizeDummyProduct(data);
    }

    if (source === 'fs') {
        const res = await fetch(`${FAKESTORE_BASE}/products/${rawId}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        return normalizeFakestoreProduct(data);
    }

    if (rawId === undefined) {
        const catalog = await fetchCatalogProducts(900);
        const found = catalog.find(product => String(product.id) === String(id));
        if (found) return found;
    }

    throw new Error('Unknown product source');
}

export async function fetchRelatedProducts(category, excludeId, limit = 5) {
    const products = await fetchCatalogProducts(900);

    const sameCategory = products
        .filter(product => product.id !== excludeId)
        .filter(product => product.category.toLowerCase() === String(category).toLowerCase())
        .slice(0, limit);

    if (sameCategory.length >= limit) return sameCategory;

    const fallback = products
        .filter(product => product.id !== excludeId)
        .filter(product => !sameCategory.some(existing => existing.id === product.id))
        .slice(0, limit - sameCategory.length);

    return [...sameCategory, ...fallback];
}
