import { withSalePricing } from './sale';

const DUMMYJSON_BASE = 'https://dummyjson.com';
const FAKESTORE_BASE = 'https://fakestoreapi.com';

// Tongue-in-cheek "we never deliver" novelty listings. If we can't deliver to
// your country, just buy a home somewhere we can!
const NOVELTY_PRODUCTS = [
    {
        id: 'nd-house-london',
        title: 'A Whole House in London',
        description:
            "Don't we deliver to your country? No problem, buy this house in London and we'll deliver everything right to its front door. Comes with a red door, a permanently grey sky, and the best excuse for FREE delivery you'll ever have. Two beds, one very British kettle.",
        category: 'real estate',
        price: 1250000,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
        rating: { rate: 5, count: 342 },
        stock: 1,
        brand: 'NeverDeliver Estates',
    },
    {
        id: 'nd-apartment-milan',
        title: 'A Stylish Apartment in Milan',
        description:
            "Fashionably located and impossible to resist. Buy this Milan apartment and suddenly we absolutely deliver to your address. Includes an espresso machine you'll never clean and a balcony for judging passers-by.",
        category: 'real estate',
        price: 890000,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
        rating: { rate: 4.9, count: 211 },
        stock: 1,
        brand: 'NeverDeliver Estates',
    },
    {
        id: 'nd-flat-berlin',
        title: 'A Loft in Berlin',
        description:
            "Exposed brick, questionable art, and unbeatable delivery coverage. Own this Berlin loft and watch our couriers finally find you. Warehouse-chic ceilings included; the techno is sold separately.",
        category: 'real estate',
        price: 760000,
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
        rating: { rate: 4.8, count: 178 },
        stock: 1,
        brand: 'NeverDeliver Estates',
    },
    {
        id: 'nd-brownstone-newyork',
        title: 'A Brownstone in New York',
        description:
            "If you can make it here, we'll deliver here. Snap up this New York brownstone and enjoy same-decade delivery to your very own stoop. Includes a fire escape with a view and neighbours who never sleep.",
        category: 'real estate',
        price: 2100000,
        image: 'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?w=600&q=80',
        rating: { rate: 5, count: 405 },
        stock: 1,
        brand: 'NeverDeliver Estates',
    },
    {
        id: 'nd-pokemon-grail-bundle',
        title: 'Ultra-Rare Pokémon Cards Grail Bundle',
        description:
            "The chase is over. A vault-grade bundle of the rarest Pokémon cards ever printed, including a PSA 10 1st Edition Base Set Charizard, a Pikachu Illustrator promo, a Trophy Pikachu, and a genuinely absurd number of holos. Sleeved, cased, and insured against everything except our delivery service. The original price is exactly what a mint-condition dream costs.",
        category: 'collectibles',
        price: 6500000,
        image: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=600&q=80',
        rating: { rate: 5, count: 128 },
        stock: 1,
        brand: 'NeverDeliver Vault',
    },
    {
        id: 'nd-money-bed',
        title: 'Bed Made Entirely of Cash',
        description:
            "Sleep like a kingpin. A full-size bed built from neat stacks of (totally legal, definitely-not-laundered) hundred-dollar bills. Surprisingly firm, ethically questionable, and the only mattress that appreciates in value overnight. Breaking-bad dreams sold separately.",
        category: 'oddities',
        price: 3800000,
        image: 'https://images.unsplash.com/photo-1554672408-730436b60dde?w=600&q=80',
        rating: { rate: 4.9, count: 214 },
        stock: 1,
        brand: 'NeverDeliver Curiosities',
    },
    {
        id: 'nd-golden-toilet',
        title: 'Solid 18k Gold Toilet',
        description:
            "Because your throne deserves a throne. A fully functional, solid 18-karat gold toilet for the person who has everything and wishes to flush it in style. Comes with a velvet rope, a smug sense of superiority, and zero plumbing warranty. Art critics optional.",
        category: 'oddities',
        price: 5250000,
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80',
        rating: { rate: 4.7, count: 173 },
        stock: 2,
        brand: 'NeverDeliver Curiosities',
    },
    {
        id: 'nd-jar-moon-dust',
        title: 'Certified Jar of Genuine Moon Dust',
        description:
            "One small jar for you, one giant invoice for your wallet. Hand-scooped (allegedly) from the lunar surface and bottled with a certificate no lawyer will vouch for. Perfect for impressing guests and confusing scientists. May just be very expensive sand.",
        category: 'oddities',
        price: 990000,
        image: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=600&q=80',
        rating: { rate: 4.5, count: 89 },
        stock: 5,
        brand: 'NeverDeliver Curiosities',
    },
    {
        id: 'nd-personal-iceberg',
        title: 'Your Very Own Personal Iceberg',
        description:
            "Beat the heat with several million tonnes of premium Arctic ice, delivered nowhere near you. Great for cocktails, dramatic photo shoots, and slowly melting as a metaphor. Polar bear may or may not be included depending on stock and mood.",
        category: 'oddities',
        price: 1750000,
        image: 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=600&q=80',
        rating: { rate: 4.3, count: 47 },
        stock: 1,
        brand: 'NeverDeliver Curiosities',
    },

    // ── Jewelry ────────────────────────────────────────────────────────────
    {
        id: 'nd-jewelry-diamond-solitaire',
        title: 'Two-Carat Diamond Solitaire Ring',
        description:
            "A brilliant-cut two-carat diamond on a platinum band, sparkling hard enough to distract from the fact that it will never arrive. Comes with a certificate of authenticity and a box that snaps shut with a very satisfying click.",
        category: 'jewelry',
        price: 18500,
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
        rating: { rate: 4.9, count: 214 },
        stock: 3,
        brand: 'NeverDeliver Fine Jewelry',
    },
    {
        id: 'nd-jewelry-tennis-bracelet',
        title: 'Diamond Tennis Bracelet',
        description:
            "A continuous line of hand-set diamonds that says 'I have excellent taste and questionable delivery expectations.' Slips on easily, dazzles endlessly, ships never.",
        category: 'jewelry',
        price: 7400,
        image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80',
        rating: { rate: 4.8, count: 168 },
        stock: 5,
        brand: 'NeverDeliver Fine Jewelry',
    },
    {
        id: 'nd-jewelry-pearl-necklace',
        title: 'Freshwater Pearl Necklace',
        description:
            "A classic strand of lustrous freshwater pearls, hand-knotted on silk. Timeless, elegant, and perfect for occasions you will attend without the necklace, because it is still in our warehouse.",
        category: 'jewelry',
        price: 320,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
        rating: { rate: 4.7, count: 402 },
        stock: 22,
        brand: 'NeverDeliver Fine Jewelry',
    },
    {
        id: 'nd-jewelry-gold-hoops',
        title: '14k Gold Hoop Earrings',
        description:
            "Everyday gold hoops with just the right amount of shine. Lightweight, hypoallergenic, and endlessly flattering. The only downside is the part where we do not deliver them.",
        category: 'jewelry',
        price: 149,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
        rating: { rate: 4.6, count: 511 },
        stock: 40,
        brand: 'NeverDeliver Fine Jewelry',
    },
    {
        id: 'nd-jewelry-sapphire-pendant',
        title: 'Ceylon Sapphire Pendant',
        description:
            "A deep-blue Ceylon sapphire framed by a halo of tiny diamonds on a delicate gold chain. Regal, romantic, and reliably undeliverable.",
        category: 'jewelry',
        price: 2600,
        image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&q=80',
        rating: { rate: 4.8, count: 143 },
        stock: 7,
        brand: 'NeverDeliver Fine Jewelry',
    },
    {
        id: 'nd-jewelry-stacking-rings',
        title: 'Dainty Stacking Ring Set (Set of 5)',
        description:
            "Five mix-and-match minimalist bands you can stack however your heart desires. Affordable, adorable, and available to admire on your screen forever.",
        category: 'jewelry',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80',
        rating: { rate: 4.4, count: 726 },
        stock: 60,
        brand: 'NeverDeliver Jewelry Co.',
    },
    {
        id: 'nd-jewelry-charm-bracelet',
        title: 'Sterling Silver Charm Bracelet',
        description:
            "A polished sterling silver bracelet ready for a lifetime of charms and memories, none of which will include the day it was delivered.",
        category: 'jewelry',
        price: 89,
        image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&q=80',
        rating: { rate: 4.5, count: 289 },
        stock: 33,
        brand: 'NeverDeliver Jewelry Co.',
    },
    {
        id: 'nd-jewelry-emerald-studs',
        title: 'Emerald Stud Earrings',
        description:
            "A pair of vivid green emerald studs set in white gold. Small enough to be tasteful, expensive enough to be memorable, undeliverable enough to be on-brand.",
        category: 'jewelry',
        price: 1150,
        image: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80',
        rating: { rate: 4.7, count: 97 },
        stock: 12,
        brand: 'NeverDeliver Fine Jewelry',
    },

    // ── LEGO-style brick sets (every budget) ─────────────────────────────────
    {
        id: 'nd-lego-polybag',
        title: 'Mini Brick Polybag',
        description:
            "A tiny bag of bricks for a tiny build and a tiny price. Perfect for pocket money, party favours, or losing exactly one crucial piece under the sofa.",
        category: 'lego',
        price: 4.99,
        image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600&q=80',
        rating: { rate: 4.5, count: 980 },
        stock: 200,
        brand: 'NeverDeliver Bricks',
    },
    {
        id: 'nd-lego-race-car',
        title: 'Brick Race Car Kit',
        description:
            "A zippy little race car with stickers, spoilers, and a driver minifigure who has clearly never heard of a speed limit. Around one hundred pieces of pure fun.",
        category: 'lego',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&q=80',
        rating: { rate: 4.6, count: 640 },
        stock: 120,
        brand: 'NeverDeliver Bricks',
    },
    {
        id: 'nd-lego-cottage',
        title: 'Cozy Brick Cottage',
        description:
            "A charming buildable cottage with opening windows, a little garden, and a chimney that does absolutely nothing. A relaxing afternoon build for all ages.",
        category: 'lego',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1518946222227-364f22132616?w=600&q=80',
        rating: { rate: 4.7, count: 421 },
        stock: 75,
        brand: 'NeverDeliver Bricks',
    },
    {
        id: 'nd-lego-pirate-ship',
        title: 'Brick Pirate Ship',
        description:
            "Hoist the plastic sails! A detailed pirate ship complete with cannons, a crow's nest, and a treasure chest of bricks that will end up in your foot at 2 a.m.",
        category: 'lego',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&q=80',
        rating: { rate: 4.8, count: 356 },
        stock: 40,
        brand: 'NeverDeliver Bricks',
    },
    {
        id: 'nd-lego-space-station',
        title: 'Modular Brick Space Station',
        description:
            "A sprawling orbital station with detachable pods, a docking bay, and enough greebles to keep a serious builder happy for a weekend. Over one thousand pieces.",
        category: 'lego',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
        rating: { rate: 4.9, count: 288 },
        stock: 18,
        brand: 'NeverDeliver Bricks',
    },
    {
        id: 'nd-lego-castle',
        title: 'Grand Brick Castle',
        description:
            "A towering medieval castle with drawbridge, dungeon, and dozens of knight minifigures. An epic centrepiece build and an epic dust collector.",
        category: 'lego',
        price: 249.99,
        image: 'https://images.unsplash.com/photo-1533667586627-9f5ddc7fc2a0?w=600&q=80',
        rating: { rate: 4.9, count: 174 },
        stock: 9,
        brand: 'NeverDeliver Bricks',
    },
    {
        id: 'nd-lego-millennium-collector',
        title: 'Collector-Grade Brick Starship (5,000+ pieces)',
        description:
            "The ultimate display build: a colossal, screen-accurate starship with over five thousand pieces, a display stand, and a fact plaque. Reserve a very large shelf and a very large weekend.",
        category: 'lego',
        price: 849.99,
        image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=600&q=80',
        rating: { rate: 5, count: 132 },
        stock: 3,
        brand: 'NeverDeliver Bricks',
    },

    // ── Classic toys ─────────────────────────────────────────────────────────
    {
        id: 'nd-magic-8-ball',
        title: 'Magic 8-Ball',
        description:
            "Ask any question, give it a shake, and let the mystical floating icosahedron decide your fate. We asked it 'Will this ship on time?' and it replied 'Don't count on it.' Accurate as always.",
        category: 'toys',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=600&q=80',
        rating: { rate: 4.7, count: 1502 },
        stock: 88,
        brand: 'NeverDeliver Toys',
    },

    // ── Yachts ───────────────────────────────────────────────────────────────
    {
        id: 'nd-yacht-weekender',
        title: 'Weekender Sport Yacht',
        description:
            "A sleek 40-foot sport yacht built for sunny weekends and enviable marina selfies. Sleeps four, dazzles hundreds, and docks nowhere near your delivery address.",
        category: 'yachts',
        price: 480000,
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
        rating: { rate: 4.8, count: 64 },
        stock: 2,
        brand: 'NeverDeliver Marine',
    },
    {
        id: 'nd-yacht-cruiser',
        title: 'Ocean Cruiser Yacht',
        description:
            "An 80-foot luxury cruiser with three staterooms, a sun deck, and a jacuzzi that judges you gently. Perfect for crossing oceans we will never cross to deliver it.",
        category: 'yachts',
        price: 3200000,
        image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600&q=80',
        rating: { rate: 4.9, count: 41 },
        stock: 1,
        brand: 'NeverDeliver Marine',
    },
    {
        id: 'nd-yacht-superyacht',
        title: 'Superyacht "Undeliverable"',
        description:
            "A 250-foot superyacht with a helipad, a cinema, a spa, and a crew of thirty who will politely explain that no, it still will not be delivered. Christened with actual champagne.",
        category: 'yachts',
        price: 95000000,
        image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=600&q=80',
        rating: { rate: 5, count: 28 },
        stock: 1,
        brand: 'NeverDeliver Marine',
    },
    {
        id: 'nd-yacht-megayacht',
        title: 'Megayacht with Submarine',
        description:
            "The absolute apex of floating excess: a 400-foot megayacht featuring a private submarine, two helipads, and a swimming pool that has its own swimming pool. The submarine also does not deliver.",
        category: 'yachts',
        price: 300000000,
        image: 'https://images.unsplash.com/photo-1621277224630-81a08a5c1d69?w=600&q=80',
        rating: { rate: 5, count: 17 },
        stock: 1,
        brand: 'NeverDeliver Marine',
    },

    // ── NeeDoh squishy toys (ships in 6-9 weeks) ─────────────────────────────
    {
        id: 'nd-needoh-classic',
        title: 'NeeDoh The Groovy Glob',
        description:
            "The original squishy, squashy stress ball that always returns to its shape, just like your patience while you wait 6 to 9 weeks for it to arrive. Buttery smooth and endlessly satisfying.",
        category: 'needohs',
        price: 6.99,
        image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&q=80',
        rating: { rate: 4.8, count: 3120 },
        stock: 500,
        brand: 'NeeDoh',
        shippingNote: 'Ships in 6-9 weeks',
    },
    {
        id: 'nd-needoh-nice-cube',
        title: 'NeeDoh Nice Cube',
        description:
            "A jelly-soft squishy cube that folds, squashes, and springs back for hours of fidget bliss. Please allow 6 to 9 weeks for it to gently ooze its way to you.",
        category: 'needohs',
        price: 7.99,
        image: 'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=600&q=80',
        rating: { rate: 4.7, count: 1890 },
        stock: 420,
        brand: 'NeeDoh',
        shippingNote: 'Ships in 6-9 weeks',
    },
    {
        id: 'nd-needoh-teenie',
        title: 'Teenie NeeDoh 3-Pack',
        description:
            "Three mini globs of squishy joy in assorted colours, perfect for pockets, desks, and sharing. Ships in 6 to 9 weeks, which is roughly three to four times longer than the fun lasts.",
        category: 'needohs',
        price: 9.99,
        image: 'https://images.unsplash.com/photo-1560859251-d563a49c5e4a?w=600&q=80',
        rating: { rate: 4.6, count: 1440 },
        stock: 380,
        brand: 'NeeDoh',
        shippingNote: 'Ships in 6-9 weeks',
    },
    {
        id: 'nd-needoh-dohdough',
        title: 'NeeDoh Dohdough',
        description:
            "A moldable, squishable dough glob that you can shape, poke, and reshape endlessly. Allow 6 to 9 weeks for delivery and approximately zero weeks for obsession.",
        category: 'needohs',
        price: 8.49,
        image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80',
        rating: { rate: 4.7, count: 1102 },
        stock: 300,
        brand: 'NeeDoh',
        shippingNote: 'Ships in 6-9 weeks',
    },
    {
        id: 'nd-needoh-cool-cats',
        title: 'NeeDoh Cool Cats',
        description:
            "Squishy little cat-faced globs that are impossibly cute and impossibly slow to arrive. Collect all the colours over the next 6 to 9 weeks, one adorable shipment at a time.",
        category: 'needohs',
        price: 10.99,
        image: 'https://images.unsplash.com/photo-1615789591457-74a63395c990?w=600&q=80',
        rating: { rate: 4.8, count: 870 },
        stock: 260,
        brand: 'NeeDoh',
        shippingNote: 'Ships in 6-9 weeks',
    },
    {
        id: 'nd-needoh-bubble-glob',
        title: 'NeeDoh Bubble Glob',
        description:
            "A translucent glob packed with tiny beads that shift and swirl as you squeeze. Mesmerising, calming, and available at your door in a brisk 6 to 9 weeks.",
        category: 'needohs',
        price: 9.49,
        image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&q=80',
        rating: { rate: 4.6, count: 640 },
        stock: 240,
        brand: 'NeeDoh',
        shippingNote: 'Ships in 6-9 weeks',
    },
    {
        id: 'nd-needoh-glow',
        title: 'NeeDoh Glow-in-the-Dark Glob',
        description:
            "Charge it in the light and squish it in the dark for a spooky, soothing glow. Ships in 6 to 9 weeks, so it will glow long before it ships.",
        category: 'needohs',
        price: 11.99,
        image: 'https://images.unsplash.com/photo-1611604548018-d56bbd53b0a9?w=600&q=80',
        rating: { rate: 4.7, count: 520 },
        stock: 200,
        brand: 'NeeDoh',
        shippingNote: 'Ships in 6-9 weeks',
    },
    {
        id: 'nd-needoh-mega',
        title: 'Mega NeeDoh Jumbo Glob',
        description:
            "A giant, two-handed glob of maximum squish for maximum stress relief. It is enormous, it is glorious, and it will take a leisurely 6 to 9 weeks to reach you.",
        category: 'needohs',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1558877385-8c1b8e6b46b0?w=600&q=80',
        rating: { rate: 4.9, count: 410 },
        stock: 150,
        brand: 'NeeDoh',
        shippingNote: 'Ships in 6-9 weeks',
    },
];

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

// Normalize API category slugs to consistent internal names.
const CATEGORY_ALIASES = {
    'womens-jewellery': 'jewelry',
    'jewellery': 'jewelry',
    'jewlery': 'jewelry',
    'jewelery': 'jewelry',
};

function normalizeCategory(raw) {
    const slug = String(raw || '').toLowerCase().trim();
    return CATEGORY_ALIASES[slug] ?? slug;
}

function normalizeDummyProduct(raw) {
    return {
        id: `dj-${raw.id}`,
        title: raw.title,
        description: raw.description || '',
        category: normalizeCategory(raw.category),
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
        category: normalizeCategory(raw.category),
        price: asNumber(raw.price, 0),
        image: raw.image || '',
        rating: {
            rate: asNumber(raw.rating?.rate, 3.5),
            count: asNumber(raw.rating?.count, 50),
        },
        stock: Math.round(seededNumber(raw.id, 5, 100)),
        brand: normalizeCategory(raw.category) || 'FakeStore',
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

            // Prepend novelty listings, then apply the flash-sale discount to
            // the whole catalog so pricing stays consistent everywhere.
            const withNovelty = [...NOVELTY_PRODUCTS, ...combined];
            catalogCache = withNovelty.map(withSalePricing);
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

    // Novelty listings live only in our local catalog.
    if (source === 'nd') {
        const novelty = NOVELTY_PRODUCTS.find(p => p.id === String(id));
        if (novelty) return withSalePricing(novelty);
        throw new Error('Unknown product source');
    }

    if (source === 'dj') {
        const res = await fetch(`${DUMMYJSON_BASE}/products/${rawId}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        return withSalePricing(normalizeDummyProduct(data));
    }

    if (source === 'fs') {
        const res = await fetch(`${FAKESTORE_BASE}/products/${rawId}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        return withSalePricing(normalizeFakestoreProduct(data));
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
