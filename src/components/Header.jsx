import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { useLanguage } from '../context/LanguageContext';
import CartDrawer from './CartDrawer';
import { searchCatalogProducts } from '../lib/catalogApi';

export default function Header({ onSearch, searchValue }) {
    const { totalItems, openDrawer } = useCart();
    const { country, currency, countries, currencies, setCountry, setCurrency, countryInfo } = useLocale();
    const { language, languages, setLanguage, t } = useLanguage();
    const [badgeAnim, setBadgeAnim] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const prevTotal = useRef(totalItems);
    const searchWrapRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!searchValue?.trim()) {
            setSuggestions([]);
            setSuggestionsOpen(false);
            setActiveIndex(-1);
            return;
        }

        const timeout = setTimeout(() => {
            searchCatalogProducts(searchValue, 8)
                .then(items => {
                    setSuggestions(items);
                    setSuggestionsOpen(items.length > 0);
                    setActiveIndex(-1);
                })
                .catch(() => {
                    setSuggestions([]);
                    setSuggestionsOpen(false);
                });
        }, 200);

        return () => clearTimeout(timeout);
    }, [searchValue]);

    useEffect(() => {
        function onOutsideClick(event) {
            if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
                setSuggestionsOpen(false);
            }
        }

        document.addEventListener('mousedown', onOutsideClick);
        return () => document.removeEventListener('mousedown', onOutsideClick);
    }, []);

    // Trigger badge pop when totalItems increases
    if (totalItems > prevTotal.current) {
        setBadgeAnim(false);
        setTimeout(() => setBadgeAnim(true), 0);
        setTimeout(() => setBadgeAnim(false), 400);
    }
    prevTotal.current = totalItems;

    const handleCartClick = useCallback(() => {
        openDrawer();
    }, [openDrawer]);

    function handleSuggestionPick(product) {
        onSearch(product.title);
        setSuggestionsOpen(false);
        navigate(`/product/${product.id}`);
    }

    return (
        <>
            <header className="bg-[#131921] text-white sticky top-0 z-40 shadow-lg">
                {/* Top bar */}
                <div className="flex items-center gap-3 px-4 py-2 max-w-screen-xl mx-auto">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-1 shrink-0">
                        <span className="text-2xl font-extrabold tracking-tight text-[#ff9900]">never</span>
                        <span className="text-2xl font-extrabold tracking-tight text-white">deliver</span>
                    </Link>

                    {/* Deliver badge */}
                    <div className="hidden md:flex flex-col text-xs leading-tight px-2">
                        <span className="text-gray-200">{t('deliverTo')}</span>
                        <span className="font-bold text-white">{countryInfo.countryLabel}</span>
                    </div>

                    {/* Search bar */}
                    <div ref={searchWrapRef} className="flex-1 relative">
                        <div className="flex rounded overflow-hidden">
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchValue}
                                onChange={e => onSearch(e.target.value)}
                                onFocus={() => setSuggestionsOpen(suggestions.length > 0)}
                                onKeyDown={e => {
                                    if (!suggestionsOpen || suggestions.length === 0) return;
                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setActiveIndex(prev => (prev + 1) % suggestions.length);
                                    }
                                    if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setActiveIndex(prev => (prev <= 0 ? suggestions.length - 1 : prev - 1));
                                    }
                                    if (e.key === 'Enter' && activeIndex >= 0) {
                                        e.preventDefault();
                                        handleSuggestionPick(suggestions[activeIndex]);
                                    }
                                    if (e.key === 'Escape') {
                                        setSuggestionsOpen(false);
                                    }
                                }}
                                className="nd-search-input flex-1 bg-white px-3 py-2 text-slate-900 caret-slate-900 text-sm placeholder:text-slate-700"
                                aria-label={t('searchLabel')}
                                aria-expanded={suggestionsOpen}
                                aria-autocomplete="list"
                                spellCheck="false"
                            />
                            <button
                                className="bg-[#ff9900] px-4 hover:bg-[#e88b00] transition-colors"
                                onClick={() => navigate('/')}
                                aria-label={t('searchButton')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#131921]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                                </svg>
                            </button>
                        </div>
                        {suggestionsOpen && suggestions.length > 0 && (
                            <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl z-50 max-h-80 overflow-y-auto" role="listbox" aria-label="Search suggestions">
                                {suggestions.map((item, index) => (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            onClick={() => handleSuggestionPick(item)}
                                            className={`w-full text-left px-3 py-2 border-b border-gray-100 last:border-b-0 ${index === activeIndex ? 'bg-orange-50' : 'bg-white'} hover:bg-orange-50`}
                                        >
                                            <p className="text-sm text-gray-900 line-clamp-1">{item.title}</p>
                                            <p className="text-xs text-gray-700">{item.category}</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Nav links */}
                    <nav className="hidden md:flex items-center gap-4 text-sm shrink-0">
                        <label className="text-xs text-gray-200 leading-tight">
                            <span className="block mb-0.5">{t('country')}</span>
                            <select
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                                className="bg-[#232f3e] border border-[#3a4553] text-white rounded px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-[#ff9900]"
                                aria-label="Select delivery country"
                            >
                                {countries.map(option => (
                                    <option key={option.code} value={option.code}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="text-xs text-gray-200 leading-tight">
                            <span className="block mb-0.5">{t('currency')}</span>
                            <select
                                value={currency}
                                onChange={e => setCurrency(e.target.value)}
                                className="bg-[#232f3e] border border-[#3a4553] text-white rounded px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-[#ff9900]"
                                aria-label="Select currency"
                            >
                                {currencies.map(option => (
                                    <option key={option.code} value={option.code}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="text-xs text-gray-200 leading-tight">
                            <span className="block mb-0.5">{t('language')}</span>
                            <select
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                className="bg-[#232f3e] border border-[#3a4553] text-white rounded px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-[#ff9900]"
                                aria-label="Select language"
                            >
                                {languages.map(option => (
                                    <option key={option.code} value={option.code}>
                                        {option.flag} {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <Link to="/orders" className="hover:text-[#ff9900] transition-colors leading-tight">
                            <div className="text-xs text-gray-200">{t('returns')}</div>
                            <div className="font-bold">{t('orders')}</div>
                        </Link>
                    </nav>

                    {/* Cart button */}
                    <button
                        onClick={handleCartClick}
                        className="relative flex items-end gap-1 text-white hover:text-[#ff9900] transition-colors shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                        </svg>
                        {totalItems > 0 && (
                            <span
                                key={totalItems}
                                className={`absolute -top-1 -right-1 bg-[#ff9900] text-[#131921] text-xs font-extrabold rounded-full w-5 h-5 flex items-center justify-center ${badgeAnim ? 'animate-badge-pop' : ''}`}
                            >
                                {totalItems}
                            </span>
                        )}
                        <span className="text-sm font-bold hidden sm:block">Cart</span>
                    </button>
                </div>

                {/* Category nav */}
                <div className="bg-[#232f3e] px-4 py-1 overflow-x-auto">
                    <div className="flex items-center gap-2 text-xs text-gray-100 max-w-screen-xl mx-auto mb-1 md:hidden">
                        <label className="flex items-center gap-1">
                            <span>{t('country')}</span>
                            <select
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                                className="bg-[#131921] border border-[#3a4553] text-white rounded px-1.5 py-1 text-xs focus-visible:ring-2 focus-visible:ring-[#ff9900]"
                                aria-label="Select delivery country"
                            >
                                {countries.map(option => (
                                    <option key={option.code} value={option.code}>
                                        {option.code}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex items-center gap-1">
                            <span>{t('currency')}</span>
                            <select
                                value={currency}
                                onChange={e => setCurrency(e.target.value)}
                                className="bg-[#131921] border border-[#3a4553] text-white rounded px-1.5 py-1 text-xs focus-visible:ring-2 focus-visible:ring-[#ff9900]"
                                aria-label="Select currency"
                            >
                                {currencies.map(option => (
                                    <option key={option.code} value={option.code}>
                                        {option.code}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex items-center gap-1">
                            <span>{t('language')}</span>
                            <select
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                className="bg-[#131921] border border-[#3a4553] text-white rounded px-1.5 py-1 text-xs focus-visible:ring-2 focus-visible:ring-[#ff9900]"
                                aria-label="Select language"
                            >
                                {languages.map(option => (
                                    <option key={option.code} value={option.code}>
                                        {option.flag} {option.code.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className="flex gap-4 text-sm max-w-screen-xl mx-auto whitespace-nowrap">
                        {["All", "beauty", "fragrances", "smartphones", "furniture", "groceries"].map(cat => (
                            <Link
                                key={cat}
                                to={cat === 'All' ? '/' : `/?category=${encodeURIComponent(cat)}`}
                                className="text-white hover:text-[#ff9900] transition-colors py-1 capitalize focus-visible:ring-2 focus-visible:ring-[#ff9900] rounded"
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>
                </div>
            </header>

            <CartDrawer />
        </>
    );
}
