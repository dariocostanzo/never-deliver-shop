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
        sortBy: 'Sort by',
        perPage: 'Per page',
        relevance: 'Relevance',
        priceLowHigh: 'Price: Low to High',
        priceHighLow: 'Price: High to Low',
        ratingHighLow: 'Rating: High to Low',
        newest: 'Newest',
        retry: 'Retry',
        tip: 'Tip',
        tipTitle: 'Support this project on Ko-fi',
        flashSale: 'Flash Sale',
        saleHeadline: '50% OFF everything',
        saleSubline: 'Every item, half price — even the houses.',
        saleEndsIn: 'Ends in',
        saveLabel: 'You save',
        off: 'OFF',
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
        sortBy: 'Ordina per',
        perPage: 'Per pagina',
        relevance: 'Pertinenza',
        priceLowHigh: 'Prezzo: crescente',
        priceHighLow: 'Prezzo: decrescente',
        ratingHighLow: 'Valutazione: alta-bassa',
        newest: 'Piu recenti',
        retry: 'Riprova',
        tip: 'Offri',
        tipTitle: 'Sostieni questo progetto su Ko-fi',
        flashSale: 'Offerta Lampo',
        saleHeadline: '50% di SCONTO su tutto',
        saleSubline: 'Ogni articolo a meta prezzo — anche le case.',
        saleEndsIn: 'Finisce tra',
        saveLabel: 'Risparmi',
        off: 'SCONTO',
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
        sortBy: 'Sortieren nach',
        perPage: 'Pro Seite',
        relevance: 'Relevanz',
        priceLowHigh: 'Preis: aufsteigend',
        priceHighLow: 'Preis: absteigend',
        ratingHighLow: 'Bewertung: hoch nach niedrig',
        newest: 'Neueste',
        retry: 'Erneut versuchen',
        tip: 'Spende',
        tipTitle: 'Unterstutze dieses Projekt auf Ko-fi',
        flashSale: 'Blitzangebot',
        saleHeadline: '50% RABATT auf alles',
        saleSubline: 'Jeder Artikel zum halben Preis — sogar die Hauser.',
        saleEndsIn: 'Endet in',
        saveLabel: 'Du sparst',
        off: 'RABATT',
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
