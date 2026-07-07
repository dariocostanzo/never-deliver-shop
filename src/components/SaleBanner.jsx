import { useState, useEffect } from 'react';
import { getSaleEndsAt, formatCountdown, SALE_DISCOUNT_PERCENT } from '../lib/sale';
import { useLanguage } from '../context/LanguageContext';

export default function SaleBanner() {
    const { t } = useLanguage();
    const [endsAt, setEndsAt] = useState(getSaleEndsAt);
    const [remaining, setRemaining] = useState(() => endsAt - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            const next = endsAt - Date.now();
            if (next <= 0) {
                // Roll the flash sale forward to a fresh 24h window.
                const refreshed = getSaleEndsAt();
                setEndsAt(refreshed);
                setRemaining(refreshed - Date.now());
            } else {
                setRemaining(next);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [endsAt]);

    return (
        <div className="bg-gradient-to-r from-[#c7511f] via-[#e88b00] to-[#ff9900] text-white">
            <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
                <span className="inline-flex items-center gap-1.5 font-extrabold text-sm sm:text-base">
                    <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs uppercase tracking-wide">
                        ⚡ {t('flashSale')}
                    </span>
                    {t('saleHeadline')}
                </span>
                <span className="hidden sm:inline text-white/85 text-sm">{t('saleSubline')}</span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    <span className="text-white/85">{t('saleEndsIn')}</span>
                    <span
                        className="font-mono tabular-nums bg-[#131921] text-white rounded px-2 py-1 text-sm tracking-widest"
                        aria-label={`${t('saleEndsIn')} ${formatCountdown(remaining)}`}
                        role="timer"
                    >
                        {formatCountdown(remaining)}
                    </span>
                    <span className="sr-only">{SALE_DISCOUNT_PERCENT}% {t('off')}</span>
                </span>
            </div>
        </div>
    );
}
