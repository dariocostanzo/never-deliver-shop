import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { OrdersPageSkeleton } from '../components/PageSkeletons';

export default function OrderHistoryPage() {
    const { getOrders } = useCart();
    const { formatCurrency } = useLocale();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setOrders(getOrders());
            setLoading(false);
        }, 150);

        return () => clearTimeout(timer);
    }, [getOrders]);

    return (
        <div className="min-h-screen bg-[#eaeded]">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
                    <Link to="/" className="text-sm text-blue-700 hover:underline">Continue shopping</Link>
                </div>

                {loading && <OrdersPageSkeleton count={3} />}

                {!loading && orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h2 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h2>
                        <p className="text-gray-700 text-sm mb-6">Looks like you haven't placed any imaginary orders.</p>
                        <Link to="/" className="bg-[#ff9900] hover:bg-[#e88b00] text-[#131921] font-bold px-6 py-2.5 rounded-full transition-colors">
                            Start Shopping
                        </Link>
                    </div>
                ) : !loading ? (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                                {/* Order header */}
                                <div className="bg-gray-50 border-b px-4 py-3 flex flex-wrap gap-4 justify-between items-start">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs text-gray-600">
                                        <div>
                                            <div className="text-gray-700 uppercase tracking-wider text-[10px]">Order placed</div>
                                            <div className="font-semibold">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-700 uppercase tracking-wider text-[10px]">Total</div>
                                            <div className="font-semibold">{formatCurrency(order.total || 0)}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-700 uppercase tracking-wider text-[10px]">Ship to</div>
                                            <div className="font-semibold">{order.address?.split(',')[0]}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-gray-700 text-[10px] uppercase tracking-wider">Order #</div>
                                        <div className="font-mono text-xs font-semibold text-blue-700">{order.id}</div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="px-4 py-3 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                                            Delivered by {order.deliveryDate}
                                        </span>
                                    </div>
                                    {order.items?.map(item => (
                                        <div key={item.id} className="flex gap-3 items-start">
                                            <img src={item.image} alt={item.title} className="w-16 h-16 object-contain bg-gray-50 rounded border" />
                                            <div className="flex-1 min-w-0">
                                                <Link to={`/product/${item.id}`} className="text-sm font-medium text-blue-700 hover:underline line-clamp-2">
                                                    {item.title}
                                                </Link>
                                                <p className="text-xs text-gray-600">Qty: {item.qty} · {formatCurrency(item.price * item.qty)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="px-4 pb-3 flex gap-2">
                                    <Link to="/" className="text-xs border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700 transition-colors">
                                        Buy it again
                                    </Link>
                                    <button className="text-xs border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700 transition-colors">
                                        Track package
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
