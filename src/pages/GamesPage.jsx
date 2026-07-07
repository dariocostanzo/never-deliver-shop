import { useState, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { useLanguage } from '../context/LanguageContext';
import { PRIZES, toPrizeCartItem } from '../lib/prizes';

// Segments shown on the wheel (8 slices, two of them "Try again").
const WHEEL_SEGMENTS = [
    PRIZES[0], // sticker
    { id: 'miss', title: 'Try again', emoji: '🙈', value: 0 },
    PRIZES[2], // mug
    PRIZES[4], // cap
    { id: 'miss', title: 'Try again', emoji: '🙈', value: 0 },
    PRIZES[5], // plush
    PRIZES[3], // tote
    PRIZES[7], // jackpot
];

const SEGMENT_COLORS = ['#ff9900', '#131921', '#c7511f', '#0077b8', '#e88b00', '#232f3e', '#b12704', '#005a8d'];

// Slot-machine reel symbols mapped to a prize when all three match.
const SLOT_SYMBOLS = [
    { emoji: '🍒', prizeId: 'sticker' },
    { emoji: '🔔', prizeId: 'keychain' },
    { emoji: '⭐', prizeId: 'mug' },
    { emoji: '💎', prizeId: 'plush' },
    { emoji: '🏆', prizeId: 'jackpot' },
];

// Roulette pockets: 0 is green, then alternating red/black.
const ROULETTE_POCKETS = Array.from({ length: 10 }, (_, n) => ({
    n,
    color: n === 0 ? 'green' : n % 2 === 1 ? 'red' : 'black',
}));

function prizeById(id) {
    return PRIZES.find(p => p.id === id) || null;
}

// ── Shared result banner ────────────────────────────────────────────────────
function ResultBanner({ prize, onAdd, added }) {
    const { t } = useLanguage();
    if (!prize) return null;

    if (prize.id === 'miss') {
        return (
            <p className="mt-3 text-sm font-semibold text-gray-700" role="status">
                🙈 {t('gameTryAgain')}
            </p>
        );
    }

    return (
        <div className="mt-3 flex flex-col items-center gap-2" role="status">
            <p className="text-sm font-bold text-green-700">
                🎉 {t('gameYouWon')} {prize.emoji} {prize.title}!
            </p>
            <button
                type="button"
                onClick={onAdd}
                disabled={added}
                className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${added
                    ? 'bg-green-500 text-white'
                    : 'bg-[#ff9900] hover:bg-[#e88b00] text-[#131921]'}`}
            >
                {added ? `✓ ${t('gameAddedFree')}` : t('gameAddFree')}
            </button>
        </div>
    );
}

// ── Spin the Wheel ──────────────────────────────────────────────────────────
function SpinWheel({ onWin }) {
    const { t } = useLanguage();
    const segments = WHEEL_SEGMENTS.length;
    const anglePer = 360 / segments;
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [prize, setPrize] = useState(null);
    const [added, setAdded] = useState(false);

    const gradient = SEGMENT_COLORS
        .map((color, i) => `${color} ${i * anglePer}deg ${(i + 1) * anglePer}deg`)
        .join(', ');

    function spin() {
        if (spinning) return;
        setSpinning(true);
        setPrize(null);
        setAdded(false);

        const winIndex = Math.floor(Math.random() * segments);
        const targetAngle = 360 - winIndex * anglePer - anglePer / 2;
        const currentMod = ((rotation % 360) + 360) % 360;
        const delta = (360 - currentMod) + targetAngle + 5 * 360;

        setRotation(rotation + delta);
        window.setTimeout(() => {
            setSpinning(false);
            setPrize(WHEEL_SEGMENTS[winIndex]);
        }, 3600);
    }

    return (
        <section className="bg-white rounded-lg shadow p-5 flex flex-col items-center text-center">
            <h2 className="text-lg font-extrabold text-gray-900 mb-1">🎡 {t('gameWheelTitle')}</h2>
            <p className="text-xs text-gray-600 mb-4">{t('gameWheelDesc')}</p>

            <div className="relative w-56 h-56">
                {/* Pointer */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 text-2xl leading-none">▼</div>
                <div
                    className="w-56 h-56 rounded-full border-4 border-[#131921] relative"
                    style={{
                        background: `conic-gradient(${gradient})`,
                        transform: `rotate(${rotation}deg)`,
                        transition: spinning ? 'transform 3.6s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                    }}
                    aria-hidden="true"
                >
                    {WHEEL_SEGMENTS.map((seg, i) => (
                        <span
                            key={i}
                            className="absolute left-1/2 top-1/2 text-xl"
                            style={{
                                transform: `rotate(${i * anglePer + anglePer / 2}deg) translateY(-88px) translateX(-50%)`,
                                transformOrigin: 'center',
                            }}
                        >
                            {seg.emoji}
                        </span>
                    ))}
                </div>
                <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white border-4 border-[#131921]" />
            </div>

            <button
                type="button"
                onClick={spin}
                disabled={spinning}
                className="mt-5 bg-[#131921] hover:bg-[#232f3e] disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-full transition-colors"
            >
                {spinning ? t('gameSpinning') : t('gameSpin')}
            </button>

            <ResultBanner prize={prize} added={added} onAdd={() => { onWin(prize); setAdded(true); }} />
        </section>
    );
}

// ── Slot Machine ────────────────────────────────────────────────────────────
function SlotMachine({ onWin }) {
    const { t } = useLanguage();
    const [reels, setReels] = useState([0, 1, 2]);
    const [spinning, setSpinning] = useState(false);
    const [prize, setPrize] = useState(null);
    const [added, setAdded] = useState(false);

    function spin() {
        if (spinning) return;
        setSpinning(true);
        setPrize(null);
        setAdded(false);

        // 40% of the time we force a jackpot triple so wins feel achievable.
        const forceWin = Math.random() < 0.4;
        const winSymbol = Math.floor(Math.random() * SLOT_SYMBOLS.length);
        const finalReels = forceWin
            ? [winSymbol, winSymbol, winSymbol]
            : [
                Math.floor(Math.random() * SLOT_SYMBOLS.length),
                Math.floor(Math.random() * SLOT_SYMBOLS.length),
                Math.floor(Math.random() * SLOT_SYMBOLS.length),
            ];

        // Shuffle the reels while "spinning".
        const shuffle = window.setInterval(() => {
            setReels([
                Math.floor(Math.random() * SLOT_SYMBOLS.length),
                Math.floor(Math.random() * SLOT_SYMBOLS.length),
                Math.floor(Math.random() * SLOT_SYMBOLS.length),
            ]);
        }, 90);

        window.setTimeout(() => {
            window.clearInterval(shuffle);
            setReels(finalReels);
            setSpinning(false);
            const isTriple = finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2];
            if (isTriple) {
                setPrize(prizeById(SLOT_SYMBOLS[finalReels[0]].prizeId));
            } else {
                setPrize({ id: 'miss', title: 'Try again', emoji: '🙈', value: 0 });
            }
        }, 1600);
    }

    return (
        <section className="bg-white rounded-lg shadow p-5 flex flex-col items-center text-center">
            <h2 className="text-lg font-extrabold text-gray-900 mb-1">🎰 {t('gameSlotTitle')}</h2>
            <p className="text-xs text-gray-600 mb-4">{t('gameSlotDesc')}</p>

            <div className="flex gap-2 bg-[#131921] p-3 rounded-lg" aria-hidden="true">
                {reels.map((symbolIndex, i) => (
                    <div
                        key={i}
                        className="w-16 h-20 bg-white rounded flex items-center justify-center text-4xl"
                    >
                        {SLOT_SYMBOLS[symbolIndex].emoji}
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={spin}
                disabled={spinning}
                className="mt-5 bg-[#131921] hover:bg-[#232f3e] disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-full transition-colors"
            >
                {spinning ? t('gameSpinning') : t('gamePull')}
            </button>

            <ResultBanner prize={prize} added={added} onAdd={() => { onWin(prize); setAdded(true); }} />
        </section>
    );
}

// ── Roulette ────────────────────────────────────────────────────────────────
const COLOR_CLASSES = {
    red: 'bg-[#b12704] text-white',
    black: 'bg-[#131921] text-white',
    green: 'bg-green-600 text-white',
};

function Roulette({ onWin }) {
    const { t } = useLanguage();
    const [bet, setBet] = useState('red');
    const [result, setResult] = useState(null);
    const [spinning, setSpinning] = useState(false);
    const [prize, setPrize] = useState(null);
    const [added, setAdded] = useState(false);

    function spin() {
        if (spinning) return;
        setSpinning(true);
        setPrize(null);
        setResult(null);
        setAdded(false);

        const cycle = window.setInterval(() => {
            setResult(ROULETTE_POCKETS[Math.floor(Math.random() * ROULETTE_POCKETS.length)]);
        }, 90);

        window.setTimeout(() => {
            window.clearInterval(cycle);
            const landed = ROULETTE_POCKETS[Math.floor(Math.random() * ROULETTE_POCKETS.length)];
            setResult(landed);
            setSpinning(false);

            if (landed.color === bet) {
                // Green is the rare jackpot; red/black win everyday prizes.
                const won = bet === 'green' ? prizeById('jackpot') : prizeById('tote');
                setPrize(won);
            } else {
                setPrize({ id: 'miss', title: 'Try again', emoji: '🙈', value: 0 });
            }
        }, 1800);
    }

    return (
        <section className="bg-white rounded-lg shadow p-5 flex flex-col items-center text-center">
            <h2 className="text-lg font-extrabold text-gray-900 mb-1">🎯 {t('gameRouletteTitle')}</h2>
            <p className="text-xs text-gray-600 mb-4">{t('gameRouletteDesc')}</p>

            <div
                className={`w-24 h-24 rounded-full border-4 border-[#131921] flex items-center justify-center text-3xl font-extrabold ${result ? COLOR_CLASSES[result.color] : 'bg-gray-100 text-gray-400'}`}
                aria-live="polite"
            >
                {result ? result.n : '?'}
            </div>

            <div className="mt-4 flex gap-2" role="group" aria-label={t('gameBetLabel')}>
                {['red', 'black', 'green'].map(color => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => setBet(color)}
                        disabled={spinning}
                        aria-pressed={bet === color}
                        className={`px-3 py-1.5 rounded-full text-sm font-bold capitalize border-2 transition-all ${bet === color ? `${COLOR_CLASSES[color]} border-[#ff9900]` : `${COLOR_CLASSES[color]} border-transparent opacity-60`}`}
                    >
                        {t(`gameBet_${color}`)}
                    </button>
                ))}
            </div>

            <button
                type="button"
                onClick={spin}
                disabled={spinning}
                className="mt-5 bg-[#131921] hover:bg-[#232f3e] disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-full transition-colors"
            >
                {spinning ? t('gameSpinning') : t('gameSpin')}
            </button>

            <ResultBanner prize={prize} added={added} onAdd={() => { onWin(prize); setAdded(true); }} />
        </section>
    );
}

// ── Games Page ──────────────────────────────────────────────────────────────
export default function GamesPage() {
    const { addItem, openDrawer } = useCart();
    const { formatCurrency } = useLocale();
    const { t } = useLanguage();

    const handleWin = useCallback((prize) => {
        if (!prize || prize.id === 'miss') return;
        addItem(toPrizeCartItem(prize));
        openDrawer();
    }, [addItem, openDrawer]);

    return (
        <div className="min-h-screen bg-[#eaeded]">
            <div className="bg-gradient-to-r from-[#131921] to-[#232f3e] text-white py-8 px-4 text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">🎁 {t('gamesTitle')}</h1>
                <p className="text-gray-100 text-sm">{t('gamesSubtitle')}</p>
            </div>

            <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                <SpinWheel onWin={handleWin} />
                <SlotMachine onWin={handleWin} />
                <Roulette onWin={handleWin} />
            </div>

            <div className="max-w-screen-xl mx-auto px-3 sm:px-4 pb-10">
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-bold text-gray-900 mb-3">{t('gamesPrizePool')}</h3>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                        {PRIZES.map(prize => (
                            <div key={prize.id} className="shrink-0 w-28 text-center bg-gray-50 border border-gray-200 rounded p-2">
                                <div className="text-3xl">{prize.emoji}</div>
                                <p className="text-xs font-medium text-gray-900 mt-1 line-clamp-2">{prize.title}</p>
                                <p className="text-[11px] text-gray-500 line-through">{formatCurrency(prize.value)}</p>
                                <p className="text-xs font-bold text-green-700">{t('gameFree')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
