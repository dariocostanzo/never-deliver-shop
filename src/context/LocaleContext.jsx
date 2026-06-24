import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'nds-locale';

const COUNTRY_CONFIG = {
    UK: { countryLabel: 'United Kingdom', locale: 'en-GB', currency: 'GBP', symbol: 'GBP' },
    IT: { countryLabel: 'Italy', locale: 'it-IT', currency: 'EUR', symbol: 'EUR' },
    US: { countryLabel: 'United States', locale: 'en-US', currency: 'USD', symbol: 'USD' },
    DE: { countryLabel: 'Germany', locale: 'de-DE', currency: 'EUR', symbol: 'EUR' },
};

const CURRENCY_OPTIONS = [
    { code: 'GBP', label: 'GBP (£)' },
    { code: 'USD', label: 'USD ($)' },
    { code: 'EUR', label: 'EUR (€)' },
];

const LocaleContext = createContext(null);

function getInitialState() {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const country = COUNTRY_CONFIG[stored.country] ? stored.country : 'UK';
        const currency = CURRENCY_OPTIONS.some(c => c.code === stored.currency)
            ? stored.currency
            : COUNTRY_CONFIG[country].currency;
        return { country, currency };
    } catch {
        return { country: 'UK', currency: 'GBP' };
    }
}

export function LocaleProvider({ children }) {
    const [{ country, currency }, setState] = useState(getInitialState);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ country, currency }));
    }, [country, currency]);

    const countryInfo = COUNTRY_CONFIG[country];

    const value = useMemo(() => {
        const formatter = new Intl.NumberFormat(countryInfo.locale, {
            style: 'currency',
            currency,
            maximumFractionDigits: 2,
        });

        return {
            country,
            currency,
            countryInfo,
            countries: Object.entries(COUNTRY_CONFIG).map(([code, info]) => ({
                code,
                label: info.countryLabel,
            })),
            currencies: CURRENCY_OPTIONS,
            setCountry(nextCountry) {
                if (!COUNTRY_CONFIG[nextCountry]) return;
                setState({
                    country: nextCountry,
                    currency: COUNTRY_CONFIG[nextCountry].currency,
                });
            },
            setCurrency(nextCurrency) {
                if (!CURRENCY_OPTIONS.some(c => c.code === nextCurrency)) return;
                setState(prev => ({ ...prev, currency: nextCurrency }));
            },
            formatCurrency(amount) {
                return formatter.format(amount);
            },
        };
    }, [country, countryInfo, currency]);

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (!context) throw new Error('useLocale must be used within LocaleProvider');
    return context;
}
