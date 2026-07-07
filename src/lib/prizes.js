// Free prizes shoppers can win from the mini-games. Winning one drops it into
// the cart at $0, so it rides along to checkout completely free.

export const PRIZES = [
    { id: 'sticker', title: 'Sticker Pack', emoji: '🌟', value: 4.99 },
    { id: 'keychain', title: 'Enamel Keychain', emoji: '🔑', value: 7.99 },
    { id: 'mug', title: 'NeverDeliver Mug', emoji: '☕', value: 12.99 },
    { id: 'tote', title: 'Canvas Tote Bag', emoji: '👜', value: 19.99 },
    { id: 'cap', title: 'Snapback Cap', emoji: '🧢', value: 24.99 },
    { id: 'plush', title: 'Mascot Plush', emoji: '🧸', value: 29.99 },
    { id: 'giftcard', title: '$10 Gift Card', emoji: '🎁', value: 10 },
    { id: 'jackpot', title: 'Golden Jackpot Bundle', emoji: '🏆', value: 199.99 },
];

export const PRIZE_MAP = Object.fromEntries(PRIZES.map(p => [p.id, p]));

// Turns a prize into a free cart line item. A stable id keeps duplicate wins
// merging into a single line (with quantity), just like a normal product.
export function toPrizeCartItem(prize) {
    return {
        id: `prize-${prize.id}`,
        title: prize.title,
        price: 0,
        originalPrice: prize.value,
        isPrize: true,
        emoji: prize.emoji,
        category: 'prize',
        image: '',
        rating: { rate: 5, count: 0 },
        stock: 99,
    };
}
