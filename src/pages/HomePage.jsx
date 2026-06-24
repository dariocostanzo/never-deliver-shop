import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { HomeGridSkeleton } from '../components/PageSkeletons';
import { fetchCatalogPage } from '../lib/catalogApi';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [12, 20, 32, 48];
const SORT_OPTIONS = ['relevance', 'price-asc', 'price-desc', 'rating-desc', 'newest'];

export default function HomePage({ searchValue }) {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const categoryParam = searchParams.get('category') || 'All';
    const pageParam = Number.parseInt(searchParams.get('page') || '1', 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const pageSizeParam = Number.parseInt(searchParams.get('perPage') || String(DEFAULT_PAGE_SIZE), 10);
    const pageSize = PAGE_SIZE_OPTIONS.includes(pageSizeParam) ? pageSizeParam : DEFAULT_PAGE_SIZE;
    const sortByParam = searchParams.get('sort') || 'relevance';
    const sortBy = SORT_OPTIONS.includes(sortByParam) ? sortByParam : 'relevance';

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Lazy load: fetch first page quickly, then full catalog in background
            const pageData = await fetchCatalogPage(1, DEFAULT_PAGE_SIZE);
            setProducts(pageData.products);

            // Load full catalog for filtering/searching
            const fullData = await fetchCatalogPage(1, pageData.total);
            setProducts(fullData.products);
        } catch (err) {
            setError(err.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category))).sort((a, b) => a.localeCompare(b))];

    const inCategory = categoryParam === 'All'
        ? products
        : products.filter(p => p.category === categoryParam);

    const filtered = searchValue
        ? inCategory.filter(p =>
            p.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            p.category.toLowerCase().includes(searchValue.toLowerCase()) ||
            p.description.toLowerCase().includes(searchValue.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchValue.toLowerCase())
        )
        : inCategory;

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating-desc') return (b.rating?.rate || 0) - (a.rating?.rate || 0);
        if (sortBy === 'newest') return String(b.id).localeCompare(String(a.id));
        return 0;
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pageStart = (safePage - 1) * pageSize;
    const pagedProducts = sorted.slice(pageStart, pageStart + pageSize);

    useEffect(() => {
        if (safePage === page) return;
        const nextParams = new URLSearchParams(searchParams);
        if (safePage <= 1) {
            nextParams.delete('page');
        } else {
            nextParams.set('page', String(safePage));
        }
        setSearchParams(nextParams, { replace: true });
    }, [page, safePage, searchParams, setSearchParams]);

    function updateQueryParam(key, value, { resetPage = false } = {}) {
        const nextParams = new URLSearchParams(searchParams);
        if (value === null || value === undefined || value === '' || value === 'All') {
            nextParams.delete(key);
        } else {
            nextParams.set(key, String(value));
        }
        if (resetPage) {
            nextParams.delete('page');
        }
        setSearchParams(nextParams, { replace: true });
    }

    function toCategoryHref(category) {
        const nextParams = new URLSearchParams(searchParams);
        if (category === 'All') {
            nextParams.delete('category');
        } else {
            nextParams.set('category', category);
        }
        nextParams.delete('page');
        const query = nextParams.toString();
        return query ? `/?${query}` : '/';
    }

    const paginationWindowSize = 7;
    let startPage = Math.max(1, safePage - Math.floor(paginationWindowSize / 2));
    let endPage = Math.min(totalPages, startPage + paginationWindowSize - 1);
    if (endPage - startPage + 1 < paginationWindowSize) {
        startPage = Math.max(1, endPage - paginationWindowSize + 1);
    }

    const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return (
        <div className="min-h-screen bg-[#eaeded]">
            {/* Hero banner */}
            <div className="bg-gradient-to-r from-[#131921] to-[#232f3e] text-white py-8 sm:py-10 px-4 text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">
                    {t('welcome')} <span className="text-[#ff9900]">NeverDeliver</span>
                </h1>
                <p className="text-gray-100 text-sm">{t('heroLine')}</p>
                <div className="mt-3 inline-flex items-center gap-2 bg-[#ff9900] text-[#131921] text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 rounded-full">
                    <span className="text-[#005a8d] font-extrabold">Plus</span>
                    {t('freeDelivery')}
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-5 sm:py-6">
                {/* Category pills */}
                <div className="flex gap-2 flex-nowrap overflow-x-auto pb-1 mb-5 sm:mb-6">
                    {categories.map(cat => (
                        <Link
                            key={cat}
                            to={toCategoryHref(cat)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize focus-visible:ring-2 focus-visible:ring-[#ff9900]
                ${(categoryParam === cat || (cat === 'All' && categoryParam === 'All'))
                                    ? 'bg-[#131921] text-white border-[#131921]'
                                    : 'bg-white text-gray-900 border-gray-400 hover:border-[#ff9900]'
                                }`}
                        >
                            {cat}
                        </Link>
                    ))}
                </div>

                {loading && (
                    <HomeGridSkeleton count={10} />
                )}

                {error && (
                    <div className="text-center py-20 text-red-600">
                        <p className="text-xl font-bold">Oops! Something went wrong.</p>
                        <p className="text-sm mt-1">We couldn't load the products right now. Please try again.</p>
                        <button
                            type="button"
                            onClick={loadProducts}
                            className="mt-4 px-4 py-2 rounded bg-[#131921] text-white text-sm font-semibold hover:bg-[#232f3e]"
                        >
                            {t('retry')}
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                            <p className="text-sm text-gray-800" aria-live="polite">
                                {sorted.length} {sorted.length !== 1 ? t('results') : t('result')}{searchValue ? ` for "${searchValue}"` : ''}
                                {sorted.length > 0 ? ` · ${t('page')} ${safePage} ${t('of')} ${totalPages}` : ''}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <label className="text-xs text-gray-800">
                                    <span className="mr-1">{t('sortBy')}</span>
                                    <select
                                        value={sortBy}
                                        onChange={e => updateQueryParam('sort', e.target.value === 'relevance' ? '' : e.target.value, { resetPage: true })}
                                        className="border border-gray-400 bg-white rounded px-2 py-1 text-xs"
                                    >
                                        <option value="relevance">{t('relevance')}</option>
                                        <option value="price-asc">{t('priceLowHigh')}</option>
                                        <option value="price-desc">{t('priceHighLow')}</option>
                                        <option value="rating-desc">{t('ratingHighLow')}</option>
                                        <option value="newest">{t('newest')}</option>
                                    </select>
                                </label>

                                <label className="text-xs text-gray-800">
                                    <span className="mr-1">{t('perPage')}</span>
                                    <select
                                        value={pageSize}
                                        onChange={e => updateQueryParam('perPage', Number(e.target.value) === DEFAULT_PAGE_SIZE ? '' : Number(e.target.value), { resetPage: true })}
                                        className="border border-gray-400 bg-white rounded px-2 py-1 text-xs"
                                    >
                                        {PAGE_SIZE_OPTIONS.map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                            {pagedProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        {sorted.length > pageSize && (
                            <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => updateQueryParam('page', safePage - 1 <= 1 ? '' : safePage - 1)}
                                    disabled={safePage === 1}
                                    className="px-3 py-1.5 rounded border border-gray-400 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('previous')}
                                </button>

                                {startPage > 1 && <span className="px-1 text-gray-700">...</span>}

                                {pageNumbers.map(pageNum => {
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            onClick={() => updateQueryParam('page', pageNum <= 1 ? '' : pageNum)}
                                            className={`px-3 py-1.5 rounded border ${safePage === pageNum ? 'bg-[#131921] text-white border-[#131921]' : 'bg-white text-gray-900 border-gray-400'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                {endPage < totalPages && <span className="px-1 text-gray-700">...</span>}

                                <button
                                    type="button"
                                    onClick={() => updateQueryParam('page', Math.min(totalPages, safePage + 1) <= 1 ? '' : Math.min(totalPages, safePage + 1))}
                                    disabled={safePage === totalPages}
                                    className="px-3 py-1.5 rounded border border-gray-400 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('next')}
                                </button>
                            </div>
                        )}
                        {sorted.length === 0 && (
                            <div className="text-center py-20 text-gray-700">
                                <p className="text-xl font-bold text-gray-900">No results found</p>
                                <p className="text-sm mt-1">Try a different search or category</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
