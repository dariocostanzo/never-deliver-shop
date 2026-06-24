import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';

export default function CartDrawer() {
    const { items, drawerOpen, closeDrawer, removeItem, updateQty, subtotal, totalItems } = useCart();
    const { formatCurrency } = useLocale();
    const drawerRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        function handler(e) {
            if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
                closeDrawer();
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [drawerOpen, closeDrawer]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-[#131921] text-white">
                    <h2 className="font-bold text-lg">Shopping Cart ({totalItems})</h2>
                    <button onClick={closeDrawer} className="text-gray-200 hover:text-white text-2xl leading-none" aria-label="Close cart drawer">&times;</button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-700 gap-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                            </svg>
                            <p className="text-sm">Your cart is empty</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-3">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-16 h-16 object-contain bg-gray-50 rounded border"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{formatCurrency(item.price * item.qty)}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <button
                                            onClick={() => updateQty(item.id, item.qty - 1)}
                                            className="w-6 h-6 border border-gray-300 rounded text-sm flex items-center justify-center hover:bg-gray-100"
                                        >−</button>
                                        <span className="text-sm w-5 text-center">{item.qty}</span>
                                        <button
                                            onClick={() => updateQty(item.id, item.qty + 1)}
                                            className="w-6 h-6 border border-gray-300 rounded text-sm flex items-center justify-center hover:bg-gray-100"
                                        >+</button>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-xs text-red-700 hover:underline ml-1"
                                        >Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t px-4 py-4 bg-gray-50 space-y-3">
                        <div className="flex justify-between text-sm font-semibold">
                            <span>Subtotal ({totalItems} items):</span>
                            <span className="text-lg font-bold">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                            <span className="text-[#0077b8] font-bold">Plus</span>
                            <span>FREE delivery on this order</span>
                        </div>
                        <Link
                            to="/checkout"
                            onClick={closeDrawer}
                            className="block w-full bg-[#ff9900] hover:bg-[#e88b00] text-[#131921] font-bold text-center py-2.5 rounded-full transition-colors"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
