import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

// Prizes and some novelty items have no meaningful stock cap, so treat a
// missing or non-positive stock value as "unlimited".
function stockCap(product) {
    const stock = Number(product?.stock);
    return Number.isFinite(stock) && stock > 0 ? stock : Infinity;
}

function cartReducer(state, action) {
    switch (action.type) {
        case 'ADD_ITEM': {
            const addQty = Math.max(1, Number(action.qty) || 1);
            const cap = stockCap(action.product);
            const existing = state.items.find(i => i.id === action.product.id);
            if (existing) {
                const nextQty = Math.min(existing.qty + addQty, cap);
                return {
                    ...state,
                    items: state.items.map(i =>
                        i.id === action.product.id ? { ...i, qty: nextQty } : i
                    ),
                };
            }
            return { ...state, items: [...state.items, { ...action.product, qty: Math.min(addQty, cap) }] };
        }
        case 'REMOVE_ITEM':
            return { ...state, items: state.items.filter(i => i.id !== action.id) };
        case 'UPDATE_QTY': {
            if (action.qty <= 0) {
                return { ...state, items: state.items.filter(i => i.id !== action.id) };
            }
            return {
                ...state,
                items: state.items.map(i =>
                    i.id === action.id ? { ...i, qty: Math.min(action.qty, stockCap(i)) } : i
                ),
            };
        }
        case 'CLEAR_CART':
            return { ...state, items: [] };
        case 'SET_DRAWER':
            return { ...state, drawerOpen: action.open };
        default:
            return state;
    }
}

const STORAGE_KEY = 'nds-cart';
const ORDER_HISTORY_KEY = 'nds-orders';

function loadCart() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : { items: [], drawerOpen: false };
    } catch {
        return { items: [], drawerOpen: false };
    }
}

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, undefined, loadCart);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const totalItems = state.items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);

    function addItem(product, qty = 1) {
        dispatch({ type: 'ADD_ITEM', product, qty });
    }
    function removeItem(id) {
        dispatch({ type: 'REMOVE_ITEM', id });
    }
    function updateQty(id, qty) {
        dispatch({ type: 'UPDATE_QTY', id, qty });
    }
    function clearCart() {
        dispatch({ type: 'CLEAR_CART' });
    }
    function openDrawer() {
        dispatch({ type: 'SET_DRAWER', open: true });
    }
    function closeDrawer() {
        dispatch({ type: 'SET_DRAWER', open: false });
    }

    function saveOrder(order) {
        try {
            const existing = JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY) || '[]');
            existing.unshift(order);
            localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(existing.slice(0, 20)));
        } catch {
            // ignore storage errors
        }
    }

    function getOrders() {
        try {
            return JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY) || '[]');
        } catch {
            return [];
        }
    }

    return (
        <CartContext.Provider
            value={{
                items: state.items,
                drawerOpen: state.drawerOpen,
                totalItems,
                subtotal,
                addItem,
                removeItem,
                updateQty,
                clearCart,
                openDrawer,
                closeDrawer,
                saveOrder,
                getOrders,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
