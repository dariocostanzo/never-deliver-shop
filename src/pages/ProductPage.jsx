import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { StarRating } from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import { ProductPageSkeleton } from '../components/PageSkeletons';
import { fetchProductById, fetchRelatedProducts } from '../lib/catalogApi';
import { getProductImageSrc, handleProductImageError } from '../lib/imageUtils';

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
    const { addItem } = useCart();
    const { formatCurrency } = useLocale();

    useEffect(() => {
        setLoading(true);
        setAdded(false);
        setQty(1);
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
        for (let i = 0; i < qty; i++) addItem(product);
        setBtnAnim(true);
        setAdded(true);
        setTimeout(() => setBtnAnim(false), 450);
        setTimeout(() => setAdded(false), 600);
    }, [addItem, product, qty]);

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
    const fakeReviews = buildFakeReviews(product);

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
                                count={product.rating?.count}
                                onReviewClick={() => setShowReviews(true)}
                            />
                            <span className="text-xs text-gray-600">|</span>
                            <span className="text-xs text-blue-800 hover:underline cursor-pointer">Ask a question</span>
                        </div>

                        <div className="border-t pt-3">
                            <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
                            {product.price > 20 && (
                                <span className="ml-2 text-xs text-gray-700 line-through">{formatCurrency(product.price * 1.2)}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-[#0077b8] font-extrabold text-base">Plus</span>
                            <span className="text-gray-700">FREE delivery <strong>Tomorrow</strong></span>
                        </div>

                        {/* Stock */}
                        {isLowStock ? (
                            <p className="text-red-600 font-semibold text-sm">Only 3 left in stock — order soon.</p>
                        ) : (
                            <p className="text-green-700 font-semibold text-sm">In Stock</p>
                        )}

                        {/* Qty + Add */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
                            <select
                                value={qty}
                                onChange={e => setQty(Number(e.target.value))}
                                className="border border-gray-400 rounded px-2 py-1.5 text-sm"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <option key={n} value={n}>Qty: {n}</option>
                                ))}
                            </select>

                            <button
                                onClick={handleAdd}
                                className={`flex-1 py-2.5 px-6 rounded-full font-bold text-sm transition-all
                  ${added ? 'bg-green-500 text-white' : 'bg-[#ff9900] hover:bg-[#e88b00] text-[#131921]'}
                  ${btnAnim ? 'animate-btn-bounce' : ''}
                `}
                            >
                                {added ? '✓ Added to Cart!' : 'Add to Cart'}
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
                                {fakeReviews.map(review => (
                                    <article key={review.id} className="border border-gray-300 rounded-lg p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{review.author}</p>
                                                <p className="text-xs text-gray-700">{review.date}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-[#c77800]">{review.rating}.0 ★</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 mt-2">{review.title}</h4>
                                        <p className="text-sm text-gray-800 mt-1">{review.body}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
