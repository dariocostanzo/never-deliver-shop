import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { HomeGridSkeleton } from '../components/PageSkeletons';
import { fetchCatalogProducts } from '../lib/catalogApi';
import { useLanguage } from '../context/LanguageContext';

const PAGE_SIZE = 20;

export default function HomePage({ searchValue }) {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [searchParams] = useSearchParams();

    const categoryParam = searchParams.get('category') || 'All';

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchCatalogProducts(200)
            .then(data => {
                setProducts(data || []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

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

    useEffect(() => {
        setPage(1);
    }, [categoryParam, searchValue]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageStart = (safePage - 1) * PAGE_SIZE;
    const pagedProducts = filtered.slice(pageStart, pageStart + PAGE_SIZE);

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
                            to={cat === 'All' ? '/' : `/?category=${encodeURIComponent(cat)}`}
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
                        <p className="text-xl font-bold">Oops! Couldn't load products.</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <p className="text-sm text-gray-800 mb-3">
                            {filtered.length} {filtered.length !== 1 ? t('results') : t('result')}{searchValue ? ` for "${searchValue}"` : ''}
                            {filtered.length > 0 ? ` · ${t('page')} ${safePage} ${t('of')} ${totalPages}` : ''}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                            {pagedProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        {filtered.length > PAGE_SIZE && (
                            <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    disabled={safePage === 1}
                                    className="px-3 py-1.5 rounded border border-gray-400 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('previous')}
                                </button>

                                {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
                                    const pageNum = idx + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            onClick={() => setPage(pageNum)}
                                            className={`px-3 py-1.5 rounded border ${safePage === pageNum ? 'bg-[#131921] text-white border-[#131921]' : 'bg-white text-gray-900 border-gray-400'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                {totalPages > 7 && <span className="px-1 text-gray-700">...</span>}

                                <button
                                    type="button"
                                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={safePage === totalPages}
                                    className="px-3 py-1.5 rounded border border-gray-400 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('next')}
                                </button>
                            </div>
                        )}
                        {filtered.length === 0 && (
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
