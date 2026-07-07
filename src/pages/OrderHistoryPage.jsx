import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { OrdersPageSkeleton } from '../components/PageSkeletons';

function buildTrackingSteps(order) {
    const placed = order.date ? new Date(order.date) : new Date();
    const shipped = new Date(placed.getTime() + 24 * 60 * 60 * 1000);
    const outForDelivery = new Date(placed.getTime() + 2 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const fmt = (d) =>
        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
        ', ' +
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return [
        { label: 'Order placed', detail: fmt(placed), done: true },
        { label: 'Shipped', detail: fmt(shipped), done: now >= shipped },
        { label: 'Out for delivery', detail: fmt(outForDelivery), done: now >= outForDelivery },
        { label: `Delivered${order.deliveryDate ? ' · ' + order.deliveryDate : ''}`, detail: 'Left in a parallel dimension', done: now >= outForDelivery },
    ];
}

export default function OrderHistoryPage() {
    const { getOrders, addItem, updateQty, openDrawer } = useCart();
    const { formatCurrency } = useLocale();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trackingId, setTrackingId] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setOrders(getOrders());
            setLoading(false);
        }, 150);

        return () => clearTimeout(timer);
    }, [getOrders]);

    function handleBuyAgain(order) {
        (order.items || []).forEach(item => {
            addItem(item);
            if (item.qty > 1) {
                updateQty(item.id, item.qty);
            }
        });
        openDrawer();
        navigate('/');  // Explicitly open drawer and navigate home for buy again
    }

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
                                            {item.isPrize ? (
                                                <div className="w-16 h-16 flex items-center justify-center text-3xl bg-amber-50 rounded border border-amber-200">
                                                    {item.emoji || '🎁'}
                                                </div>
                                            ) : (
                                                <img src={item.image} alt={item.title} className="w-16 h-16 object-contain bg-gray-50 rounded border" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                {item.isPrize ? (
                                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">🎁 {item.title}</p>
                                                ) : (
                                                    <Link to={`/product/${item.id}`} className="text-sm font-medium text-blue-700 hover:underline line-clamp-2">
                                                        {item.title}
                                                    </Link>
                                                )}
                                                <p className="text-xs text-gray-600">
                                                    Qty: {item.qty} · {item.isPrize ? <span className="font-bold text-green-700">FREE</span> : formatCurrency(item.price * item.qty)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="px-4 pb-3 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleBuyAgain(order)}
                                        className="text-xs border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700 transition-colors"
                                    >
                                        Buy it again
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTrackingId(prev => (prev === order.id ? null : order.id))}
                                        aria-expanded={trackingId === order.id}
                                        className="text-xs border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700 transition-colors"
                                    >
                                        {trackingId === order.id ? 'Hide tracking' : 'Track package'}
                                    </button>
                                </div>

                                {/* Tracking timeline */}
                                {trackingId === order.id && (
                                    <div className="px-4 pb-4 pt-1 border-t bg-gray-50">
                                        <ol className="mt-3 space-y-3">
                                            {buildTrackingSteps(order).map((s, i) => (
                                                <li key={i} className="flex gap-3 items-start">
                                                    <span
                                                        className={`mt-0.5 flex-shrink-0 h-4 w-4 rounded-full border-2 ${s.done ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}
                                                        aria-hidden="true"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className={`text-xs font-semibold ${s.done ? 'text-gray-900' : 'text-gray-500'}`}>{s.label}</p>
                                                        <p className="text-[11px] text-gray-500">{s.detail}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
