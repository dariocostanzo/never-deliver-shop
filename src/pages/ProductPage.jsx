import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { StarRating } from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import InsaneCaptcha from '../components/InsaneCaptcha';
import { ProductPageSkeleton } from '../components/PageSkeletons';
import { fetchProductById, fetchRelatedProducts } from '../lib/catalogApi';
import { getProductImageSrc, handleProductImageError } from '../lib/imageUtils';
import { loadUserReviews, saveUserReview, deleteUserReview } from '../lib/reviewsStore';
import { SALE_DISCOUNT_PERCENT } from '../lib/sale';
import { useLanguage } from '../context/LanguageContext';

const REVIEW_SNIPPETS = [
    'Surprisingly good quality for the price. Arrived exactly as described.',
    'Looks even better in person. Packaging was neat and secure.',
    'Works well for everyday use. I would buy this again.',
    'The finish and details feel premium compared with similar listings.',
    'Easy to set up and use. Good value overall.',
    'Color and size were spot on. Happy with this purchase.',
    'Solid product with no issues after weeks of use.',
];

function buildFakeReviews(product) {
    const count = Math.max(3, Math.min(6, Math.round((product.rating?.count || 120) / 220)));
    return Array.from({ length: count }).map((_, index) => ({
        id: `${product.id}-r${index}`,
        author: ['Alex', 'Sam', 'Jordan', 'Taylor', 'Chris', 'Morgan'][index % 6],
        rating: Math.max(3, Math.min(5, Math.round((product.rating?.rate || 4) + ((index % 2 === 0) ? 0 : -1)))),
        title: ['Great pick', 'Worth it', 'Would recommend', 'Better than expected', 'Solid buy', 'Happy with it'][index % 6],
        body: REVIEW_SNIPPETS[index % REVIEW_SNIPPETS.length],
        date: new Date(Date.now() - index * 86400000 * 7).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    }));
}

export default function ProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [btnAnim, setBtnAnim] = useState(false);
    const [added, setAdded] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    const [userReviews, setUserReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [posted, setPosted] = useState(false);
    const [form, setForm] = useState({ author: '', rating: 5, title: '', body: '' });
    const { addItem } = useCart();
    const { formatCurrency } = useLocale();
    const { t } = useLanguage();

    useEffect(() => {
        setLoading(true);
        setAdded(false);
        setQty(1);
        setUserReviews(loadUserReviews(id));
        setShowForm(false);
        setShowCaptcha(false);
        setPosted(false);
        setForm({ author: '', rating: 5, title: '', body: '' });
        fetchProductById(id)
            .then(data => {
                setProduct(data);
                setLoading(false);
                return fetchRelatedProducts(data.category, id, 5);
            })
            .then(setRelated)
            .catch(() => setLoading(false));
    }, [id]);

    const handleAdd = useCallback(() => {
        if (!product) return;
        addItem(product, qty);
        setBtnAnim(true);
        setAdded(true);
        setTimeout(() => setBtnAnim(false), 450);
        setTimeout(() => setAdded(false), 600);
    }, [addItem, product, qty]);

    const handleReviewSubmit = useCallback((event) => {
        event.preventDefault();
        setShowCaptcha(true);
    }, []);

    const handleCaptchaSuccess = useCallback(() => {
        const review = {
            id: `${id}-user-${Date.now()}`,
            author: form.author.trim() || 'Anonymous',
            rating: Number(form.rating),
            title: form.title.trim() || 'My review',
            body: form.body.trim(),
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            mine: true,
        };
        setUserReviews(saveUserReview(id, review));
        setShowCaptcha(false);
        setShowForm(false);
        setPosted(true);
        setForm({ author: '', rating: 5, title: '', body: '' });
    }, [form, id]);

    const handleDeleteReview = useCallback((reviewId) => {
        setUserReviews(deleteUserReview(id, reviewId));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#eaeded]">
                <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-5 sm:py-6">
                    <ProductPageSkeleton />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#eaeded] flex items-center justify-center">
                <p className="text-red-600 text-lg">Product not found.</p>
            </div>
        );
    }

    const isLowStock = product.stock > 0 && product.stock <= 5;
    const isOutOfStock = product.stock <= 0;
    const maxQty = Math.min(10, product.stock > 0 ? product.stock : 10);
    const qtyOptions = Array.from({ length: maxQty }, (_, i) => i + 1);
    const fakeReviews = buildFakeReviews(product);
    const allReviews = [...userReviews, ...fakeReviews];
    const reviewCount = (product.rating?.count ?? 0) + userReviews.length;
    const onSale = product.onSale && product.originalPrice > product.price;
    const savings = onSale ? product.originalPrice - product.price : 0;
    const discountPercent = product.discountPercent ?? SALE_DISCOUNT_PERCENT;
    const isLightningDeal = product.isLightningDeal && onSale;

    return (
        <div className="min-h-screen bg-[#eaeded]">
            <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-5 sm:py-6">
                {/* Breadcrumb */}
                <nav className="text-xs text-blue-700 mb-4 flex gap-1 overflow-x-auto whitespace-nowrap">
                    <Link to="/" className="hover:underline">Home</Link>
                    <span className="text-gray-600">&rsaquo;</span>
                    <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:underline capitalize">{product.category}</Link>
                    <span className="text-gray-600">&rsaquo;</span>
                    <span className="text-gray-800 truncate max-w-xs">{product.title}</span>
                </nav>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6 flex flex-col md:flex-row gap-5 sm:gap-8">
                    {/* Image */}
                    <div className="flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-lg p-5 sm:p-8 w-full md:w-80 h-72 sm:h-80">
                        <img
                            src={getProductImageSrc(product)}
                            alt={product.title}
                            className="max-h-full max-w-full object-contain"
                            onError={(event) => handleProductImageError(event, product)}
                        />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col gap-3">
                        <p className="text-xs uppercase text-gray-700 tracking-wider">{product.category}</p>
                        <h1 className="text-2xl font-bold text-gray-900 leading-snug">{product.title}</h1>

                        <div className="flex items-center gap-3">
                            <StarRating
                                rating={product.rating?.rate ?? 4}
                                count={reviewCount}
                                onReviewClick={() => setShowReviews(true)}
                            />
                            <span className="text-xs text-gray-600">|</span>
                            <span className="text-xs text-blue-800 hover:underline cursor-pointer">Ask a question</span>
                        </div>

                        <div className="border-t pt-3">
                            {onSale && (
                                <span className={`inline-block mb-1 text-white text-xs font-extrabold px-2 py-0.5 rounded-sm ${isLightningDeal ? 'bg-[#b12704]' : 'bg-[#c7511f]'}`}>
                                    {isLightningDeal ? `⚡ ${t('lightningDeal')}` : t('flashSale')} · -{discountPercent}%
                                </span>
                            )}
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
                                {onSale && (
                                    <span className="text-sm text-gray-700 line-through">{formatCurrency(product.originalPrice)}</span>
                                )}
                            </div>
                            {onSale && (
                                <p className="text-sm font-semibold text-green-700 mt-1">
                                    {t('saveLabel')} {formatCurrency(savings)} ({discountPercent}% {t('off')})
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-[#0077b8] font-extrabold text-base">Plus</span>
                            {product.shippingNote ? (
                                <span className="text-gray-700">{product.shippingNote}</span>
                            ) : (
                                <span className="text-gray-700">FREE delivery <strong>Tomorrow</strong></span>
                            )}
                        </div>

                        {/* Stock */}
                        {isOutOfStock ? (
                            <p className="text-red-600 font-semibold text-sm">Out of stock</p>
                        ) : isLowStock ? (
                            <p className="text-red-600 font-semibold text-sm">Only {product.stock} left in stock, order soon.</p>
                        ) : (
                            <p className="text-green-700 font-semibold text-sm">In Stock ({product.stock} available)</p>
                        )}

                        {/* Qty + Add */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
                            <select
                                value={qty}
                                onChange={e => setQty(Number(e.target.value))}
                                disabled={isOutOfStock}
                                className="border border-gray-400 rounded px-2 py-1.5 text-sm disabled:opacity-50"
                            >
                                {qtyOptions.map(n => (
                                    <option key={n} value={n}>Qty: {n}</option>
                                ))}
                            </select>

                            <button
                                onClick={handleAdd}
                                disabled={isOutOfStock}
                                className={`flex-1 py-2.5 px-6 rounded-full font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  ${added ? 'bg-green-500 text-white' : 'bg-[#ff9900] hover:bg-[#e88b00] text-[#131921]'}
                  ${btnAnim ? 'animate-btn-bounce' : ''}
                `}
                            >
                                {isOutOfStock ? 'Out of Stock' : added ? '✓ Added to Cart!' : 'Add to Cart'}
                            </button>
                        </div>

                        {/* Description */}
                        <div className="border-t pt-3 mt-2">
                            <h3 className="font-semibold text-sm text-gray-700 mb-1">About this item</h3>
                            <p className="text-sm text-gray-800 leading-relaxed">{product.description}</p>
                        </div>
                    </div>
                </div>

                {/* You might also like */}
                {related.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">You might also like</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {related.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                )}

                {showReviews && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Customer reviews">
                        <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl max-h-[85vh] overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b">
                                <h3 className="text-lg font-bold text-gray-900">Customer reviews for {product.title}</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowReviews(false)}
                                    className="text-gray-800 hover:text-black"
                                    aria-label="Close reviews"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
                                {posted && (
                                    <p className="text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2" role="status">
                                        ✓ {t('reviewPosted')}
                                    </p>
                                )}

                                {!showForm ? (
                                    <button
                                        type="button"
                                        onClick={() => { setShowForm(true); setPosted(false); }}
                                        className="w-full py-2 rounded-full border border-gray-400 hover:bg-gray-50 text-sm font-bold text-gray-900"
                                    >
                                        {t('writeReview')}
                                    </button>
                                ) : (
                                    <form onSubmit={handleReviewSubmit} className="border border-gray-300 rounded-lg p-3 space-y-3 bg-gray-50">
                                        <div>
                                            <label htmlFor="rv-name" className="block text-xs font-semibold text-gray-700 mb-1">{t('yourName')}</label>
                                            <input
                                                id="rv-name"
                                                type="text"
                                                value={form.author}
                                                onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                                                className="w-full border border-gray-400 rounded px-2 py-1.5 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="rv-rating" className="block text-xs font-semibold text-gray-700 mb-1">{t('yourRating')}</label>
                                            <select
                                                id="rv-rating"
                                                value={form.rating}
                                                onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}
                                                className="w-full border border-gray-400 rounded px-2 py-1.5 text-sm"
                                            >
                                                {[5, 4, 3, 2, 1].map(n => (
                                                    <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="rv-title" className="block text-xs font-semibold text-gray-700 mb-1">{t('reviewTitle')}</label>
                                            <input
                                                id="rv-title"
                                                type="text"
                                                value={form.title}
                                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                                className="w-full border border-gray-400 rounded px-2 py-1.5 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="rv-body" className="block text-xs font-semibold text-gray-700 mb-1">{t('reviewBody')}</label>
                                            <textarea
                                                id="rv-body"
                                                required
                                                rows={3}
                                                value={form.body}
                                                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                                                className="w-full border border-gray-400 rounded px-2 py-1.5 text-sm resize-y"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className="flex-1 py-2 rounded-full bg-[#ff9900] hover:bg-[#e88b00] text-[#131921] font-bold text-sm"
                                            >
                                                {t('submitReview')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowForm(false)}
                                                className="py-2 px-4 rounded-full border border-gray-400 hover:bg-gray-100 text-sm font-bold text-gray-800"
                                            >
                                                {t('cancel')}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {allReviews.map(review => (
                                    <article key={review.id} className={`border rounded-lg p-3 ${review.mine ? 'border-[#ff9900] bg-orange-50' : 'border-gray-300'}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {review.author}
                                                    {review.mine && (
                                                        <span className="ml-2 text-[10px] uppercase tracking-wide bg-[#ff9900] text-[#131921] font-bold px-1.5 py-0.5 rounded">
                                                            {t('yourReviewBadge')}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-700">{review.date}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-[#c77800]">{review.rating}.0 ★</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 mt-2">{review.title}</h4>
                                        <p className="text-sm text-gray-800 mt-1">{review.body}</p>
                                        {review.mine && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="mt-2 text-xs font-semibold text-red-700 hover:underline"
                                            >
                                                {t('deleteReview')}
                                            </button>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {showCaptcha && (
                    <InsaneCaptcha
                        onSuccess={handleCaptchaSuccess}
                        onCancel={() => setShowCaptcha(false)}
                    />
                )}
            </div>
        </div>
    );
}
