import { createContext, useContext, useMemo, useState, useEffect } from 'react';

const STORAGE_KEY = 'nds-language';

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const DICT = {
    en: {
        searchPlaceholder: 'Search products...',
        searchLabel: 'Search products',
        searchButton: 'Search',
        country: 'Country',
        currency: 'Currency',
        language: 'Language',
        returns: 'Returns',
        orders: '& Orders',
        deliverTo: 'Deliver to',
        welcome: 'Welcome to',
        heroLine: 'Big catalog energy, zero delivery anxiety.',
        freeDelivery: 'FREE delivery on every imaginary order',
        results: 'results',
        result: 'result',
        page: 'Page',
        of: 'of',
        previous: 'Previous',
        next: 'Next',
    },
    it: {
        searchPlaceholder: 'Cerca prodotti...',
        searchLabel: 'Cerca prodotti',
        searchButton: 'Cerca',
        country: 'Paese',
        currency: 'Valuta',
        language: 'Lingua',
        returns: 'Resi',
        orders: 'e ordini',
        deliverTo: 'Consegna a',
        welcome: 'Benvenuto su',
        heroLine: 'Catalogo enorme, zero ansia da consegna.',
        freeDelivery: 'Consegna GRATIS su ogni ordine immaginario',
        results: 'risultati',
        result: 'risultato',
        page: 'Pagina',
        of: 'di',
        previous: 'Indietro',
        next: 'Avanti',
    },
    de: {
        searchPlaceholder: 'Produkte suchen...',
        searchLabel: 'Produkte suchen',
        searchButton: 'Suchen',
        country: 'Land',
        currency: 'Wahrung',
        language: 'Sprache',
        returns: 'Retouren',
        orders: 'und Bestellungen',
        deliverTo: 'Liefern nach',
        welcome: 'Willkommen bei',
        heroLine: 'Groser Katalog, null Lieferstress.',
        freeDelivery: 'KOSTENLOSE Lieferung fur jede imaginare Bestellung',
        results: 'Ergebnisse',
        result: 'Ergebnis',
        page: 'Seite',
        of: 'von',
        previous: 'Zuruck',
        next: 'Weiter',
    },
};

const LanguageContext = createContext(null);

function getInitialLanguage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (LANGUAGES.some(l => l.code === stored)) return stored;
    } catch {
        // ignore
    }
    return 'en';
}

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(getInitialLanguage);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, language);
    }, [language]);

    const value = useMemo(() => {
        const dictionary = DICT[language] || DICT.en;
        return {
            language,
            languages: LANGUAGES,
            setLanguage(next) {
                if (!LANGUAGES.some(l => l.code === next)) return;
                setLanguage(next);
            },
            t(key) {
                return dictionary[key] || DICT.en[key] || key;
            },
        };
    }, [language]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
}
