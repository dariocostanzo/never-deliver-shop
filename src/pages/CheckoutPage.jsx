import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchCatalogProducts } from '../lib/catalogApi';
import { findCoupon, getRandomCoupon, computeCouponDiscount } from '../lib/coupons';

const STEPS = ['Delivery', 'Payment', 'Processing', 'Confirmation'];
const CHECKOUT_CONFIRMATION_KEY = 'nds-checkout-confirmation';

function genOrderId() {
    return `NDV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function genDeliveryDate(locale) {
    const d = new Date();
    d.setDate(d.getDate() + 2 + Math.floor(Math.random() * 3));
    return d.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
}

function loadCheckoutConfirmation() {
    try {
        const raw = sessionStorage.getItem(CHECKOUT_CONFIRMATION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.orderId || !parsed?.form) return null;
        return parsed;
    } catch {
        return null;
    }
}

function saveCheckoutConfirmation(payload) {
    try {
        sessionStorage.setItem(CHECKOUT_CONFIRMATION_KEY, JSON.stringify(payload));
    } catch {
        // ignore storage errors
    }
}

function clearCheckoutConfirmation() {
    try {
        sessionStorage.removeItem(CHECKOUT_CONFIRMATION_KEY);
    } catch {
        // ignore storage errors
    }
}

// ── Step 1: Delivery ──────────────────────────────────────────────────────────
function getDeliveryFields(countryCode) {
    if (countryCode === 'UK') {
        return [
            { key: 'fullName', label: 'Full name', placeholder: 'Amelia Carter' },
            { key: 'address', label: 'Street address', placeholder: '221B Baker Street' },
            { key: 'city', label: 'Town/City', placeholder: 'London' },
            { key: 'state', label: 'County', placeholder: 'Greater London' },
            { key: 'zip', label: 'Postcode', placeholder: 'NW1 6XE' },
        ];
    }

    if (countryCode === 'IT') {
        return [
            { key: 'fullName', label: 'Nome completo', placeholder: 'Giulia Bianchi' },
            { key: 'address', label: 'Indirizzo', placeholder: 'Via Roma 10' },
            { key: 'city', label: 'Citta', placeholder: 'Milano' },
            { key: 'state', label: 'Provincia', placeholder: 'MI' },
            { key: 'zip', label: 'CAP', placeholder: '20121' },
        ];
    }

    if (countryCode === 'CA') {
        return [
            { key: 'fullName', label: 'Full name', placeholder: 'Liam Tremblay' },
            { key: 'address', label: 'Street address', placeholder: '55 Maple Avenue' },
            { key: 'city', label: 'City', placeholder: 'Toronto' },
            { key: 'state', label: 'Province', placeholder: 'ON' },
            { key: 'zip', label: 'Postal code', placeholder: 'M5H 2N2' },
        ];
    }

    return [
        { key: 'fullName', label: 'Full name', placeholder: 'Jane Doe' },
        { key: 'address', label: 'Street address', placeholder: '123 Main St' },
        { key: 'city', label: 'City', placeholder: 'New York' },
        { key: 'state', label: 'State/Region', placeholder: 'NY' },
        { key: 'zip', label: 'Postal code', placeholder: '10001' },
    ];
}

function getInitialCheckoutForm(countryCode) {
    if (countryCode === 'IT') {
        return {
            fullName: 'Giulia Bianchi',
            address: 'Via Roma 10',
            city: 'Milano',
            state: 'MI',
            zip: '20121',
            deliverySpeed: 'standard',
            paymentMethod: 'card',
            cardNumber: '4242 4242 4242 4242',
            expiry: '12/26',
            cvv: '123',
            cardName: 'Giulia Bianchi',
        };
    }

    if (countryCode === 'CA') {
        return {
            fullName: 'Liam Tremblay',
            address: '55 Maple Avenue',
            city: 'Toronto',
            state: 'ON',
            zip: 'M5H 2N2',
            deliverySpeed: 'standard',
            paymentMethod: 'card',
            cardNumber: '4242 4242 4242 4242',
            expiry: '12/26',
            cvv: '123',
            cardName: 'Liam Tremblay',
        };
    }

    return {
        fullName: 'Amelia Carter',
        address: '221B Baker Street',
        city: 'London',
        state: 'Greater London',
        zip: 'NW1 6XE',
        deliverySpeed: 'standard',
        paymentMethod: 'card',
        cardNumber: '4242 4242 4242 4242',
        expiry: '12/26',
        cvv: '123',
        cardName: 'Amelia Carter',
    };
}

function DeliveryStep({ form, setForm, onNext, countryCode }) {
    const fields = getDeliveryFields(countryCode);

    const isValid = fields.every(f => form[f.key]?.trim());

    return (
        <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-900">Enter a delivery address</h2>
            {fields.map(f => (
                <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-800 mb-1">{f.label}</label>
                    <input
                        type="text"
                        placeholder={f.placeholder}
                        value={form[f.key] || ''}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]"
                    />
                </div>
            ))}

            <div className="pt-2">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Delivery Speed</h3>
                <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: form.deliverySpeed === 'standard' ? '#ff9900' : undefined, backgroundColor: form.deliverySpeed === 'standard' ? '#fff8f0' : undefined }}>
                        <input
                            type="radio"
                            name="deliverySpeed"
                            value="standard"
                            checked={form.deliverySpeed === 'standard'}
                            onChange={e => setForm(prev => ({ ...prev, deliverySpeed: e.target.value }))}
                            className="accent-[#ff9900]"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Standard Delivery</p>
                            <p className="text-xs text-gray-600">2-3 business days</p>
                        </div>
                        <p className="text-sm font-bold text-green-600">FREE</p>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: form.deliverySpeed === 'express' ? '#ff9900' : undefined, backgroundColor: form.deliverySpeed === 'express' ? '#fff8f0' : undefined }}>
                        <input
                            type="radio"
                            name="deliverySpeed"
                            value="express"
                            checked={form.deliverySpeed === 'express'}
                            onChange={e => setForm(prev => ({ ...prev, deliverySpeed: e.target.value }))}
                            className="accent-[#ff9900]"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Next Day Delivery</p>
                            <p className="text-xs text-gray-600">1 business day</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">+$9.99</p>
                    </label>
                </div>
            </div>

            <button
                disabled={!isValid || !form.deliverySpeed}
                onClick={onNext}
                className="w-full bg-[#ff9900] hover:bg-[#e88b00] disabled:opacity-50 text-[#131921] font-bold py-2.5 rounded-full transition-colors"
            >
                Continue to Payment
            </button>
        </div>
    );
}

// ── Step 2: Payment ────────────────────────────────────────────────────────────
function PaymentStep({ form, setForm, onNext, onBack }) {
    const paymentMethod = form.paymentMethod || 'card';
    const isCard = paymentMethod === 'card';

    return (
        <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-900">Payment method</h2>

            <div className="space-y-2">
                <label
                    className="flex items-center gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: isCard ? '#ff9900' : undefined, backgroundColor: isCard ? '#fff8f0' : undefined }}
                >
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={isCard}
                        onChange={e => setForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="accent-[#ff9900]"
                    />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">💳 Debit / Credit card</p>
                        <p className="text-xs text-gray-600">Pay now with the card on file</p>
                    </div>
                </label>

                <label
                    className="flex items-center gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: !isCard ? '#ff9900' : undefined, backgroundColor: !isCard ? '#fff8f0' : undefined }}
                >
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={!isCard}
                        onChange={e => setForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="accent-[#ff9900]"
                    />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">💵 Cash on delivery</p>
                        <p className="text-xs text-gray-600">Pay in cash when your order arrives</p>
                    </div>
                </label>
            </div>

            {isCard ? (
                <>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900">
                        🔒 Your saved card is ready to go. This is a simulated purchase with no real charge, so the details are locked.
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Card number</label>
                        <input
                            type="text"
                            value={form.cardNumber || '4242 4242 4242 4242'}
                            readOnly
                            aria-readonly="true"
                            tabIndex={-1}
                            className="w-full border border-gray-200 bg-gray-100 text-gray-600 rounded px-3 py-2 text-sm font-mono cursor-not-allowed"
                            maxLength={19}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">Expiry date</label>
                            <input
                                type="text"
                                value={form.expiry || '12/26'}
                                readOnly
                                aria-readonly="true"
                                tabIndex={-1}
                                className="w-full border border-gray-200 bg-gray-100 text-gray-600 rounded px-3 py-2 text-sm font-mono cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">CVV</label>
                            <input
                                type="text"
                                value={form.cvv || '123'}
                                readOnly
                                aria-readonly="true"
                                tabIndex={-1}
                                maxLength={4}
                                className="w-full border border-gray-200 bg-gray-100 text-gray-600 rounded px-3 py-2 text-sm font-mono cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Name on card</label>
                        <input
                            type="text"
                            value={form.cardName || form.fullName || ''}
                            readOnly
                            aria-readonly="true"
                            tabIndex={-1}
                            className="w-full border border-gray-200 bg-gray-100 text-gray-600 rounded px-3 py-2 text-sm cursor-not-allowed"
                        />
                    </div>
                </>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-900">
                    💵 No card needed. Have the exact amount ready and pay our delivery driver in cash when your imaginary package arrives.
                </div>
            )}

            <div className="flex gap-3">
                <button onClick={onBack} className="flex-1 border border-gray-300 text-gray-800 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
                    Back
                </button>
                <button onClick={onNext} className="flex-1 bg-[#ff9900] hover:bg-[#e88b00] text-[#131921] font-bold py-2.5 rounded-full transition-colors">
                    Place Order
                </button>
            </div>
        </div>
    );
}

// ── Step 3: Processing ─────────────────────────────────────────────────────────
function ProcessingStep({ onDone, paymentMethod = 'card' }) {
    const [progress, setProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState(paymentMethod === 'cod' ? 'Confirming your order...' : 'Verifying payment details...');

    useEffect(() => {
        const messages = paymentMethod === 'cod'
            ? [
                [0, 'Confirming your order...'],
                [30, 'Reserving your cash-on-delivery slot...'],
                [60, 'Assigning warehouse...'],
                [80, 'Preparing your order...'],
                [95, 'Almost done!'],
                [100, 'Order placed successfully!'],
            ]
            : [
                [0, 'Verifying payment details...'],
                [20, 'Contacting bank...'],
                [45, 'Payment approved ✓'],
                [60, 'Assigning warehouse...'],
                [80, 'Preparing your order...'],
                [95, 'Almost done!'],
                [100, 'Order placed successfully!'],
            ];

        let i = 0;
        const tick = setInterval(() => {
            if (i < messages.length) {
                setProgress(messages[i][0]);
                setStatusMsg(messages[i][1]);
                i++;
            } else {
                clearInterval(tick);
                setTimeout(onDone, 600);
            }
        }, 420);

        return () => clearInterval(tick);
    }, [onDone, paymentMethod]);

    return (
        <div className="flex flex-col items-center justify-center py-12 gap-6 animate-fade-in-up">
            <div className="relative w-20 h-20">
                <div className="w-20 h-20 border-4 border-gray-200 rounded-full" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-[#ff9900] border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Processing your order</h2>
                <p className="text-sm text-gray-700">{statusMsg}</p>
            </div>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className="h-full bg-[#ff9900] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-xs text-gray-600">{progress}%</p>
        </div>
    );
}

// ── Coupon box ─────────────────────────────────────────────────────────────
function CouponBox({ appliedCoupon, onApply, onRemove }) {
    const { t } = useLanguage();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    function handleApply() {
        const coupon = findCoupon(code);
        if (!coupon) {
            setError(t('couponInvalid'));
            return;
        }
        setError('');
        setCode('');
        onApply(coupon);
    }

    function handleSurprise() {
        const coupon = getRandomCoupon();
        setError('');
        setCode('');
        onApply(coupon);
    }

    if (appliedCoupon) {
        return (
            <div className="border border-green-300 bg-green-50 rounded p-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-sm font-bold text-green-800 font-mono">🎟️ {appliedCoupon.code}</p>
                    <p className="text-xs text-green-700 truncate">{appliedCoupon.label}</p>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-xs font-semibold text-red-700 hover:underline shrink-0"
                >
                    {t('couponRemove')}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-800">{t('couponTitle')}</p>
            <div className="flex gap-1.5">
                <input
                    type="text"
                    value={code}
                    onChange={e => { setCode(e.target.value); setError(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') handleApply(); }}
                    placeholder={t('couponPlaceholder')}
                    aria-label={t('couponTitle')}
                    className="flex-1 min-w-0 border border-gray-300 rounded px-2 py-1.5 text-sm font-mono uppercase focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]"
                />
                <button
                    type="button"
                    onClick={handleApply}
                    className="shrink-0 bg-[#131921] text-white text-xs font-semibold px-3 rounded hover:bg-[#232f3e] transition-colors"
                >
                    {t('couponApply')}
                </button>
            </div>
            <button
                type="button"
                onClick={handleSurprise}
                className="w-full text-xs font-semibold text-[#c7511f] hover:underline text-left"
            >
                {t('couponSurprise')}
            </button>
            {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
        </div>
    );
}

// ── Main Checkout Page ─────────────────────────────────────────────────────────
export default function CheckoutPage() {
    const { items, subtotal, totalItems, clearCart, saveOrder } = useCart();
    const { country, formatCurrency, countryInfo } = useLocale();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const { discount: couponDiscount } = computeCouponDiscount(appliedCoupon, subtotal);

    // Drop a coupon automatically if it no longer applies (e.g. cart shrank
    // below its minimum spend).
    useEffect(() => {
        if (appliedCoupon && !computeCouponDiscount(appliedCoupon, subtotal).valid) {
            setAppliedCoupon(null);
        }
    }, [appliedCoupon, subtotal]);

    // Only treat a stored confirmation as valid when the cart is empty.
    // A non-empty cart means the user is starting a brand-new checkout,
    // so any leftover confirmation is stale and must be ignored/cleared.
    const hasItemsAtMount = useRef(items.length > 0);
    const restoredConfirmation = hasItemsAtMount.current ? null : loadCheckoutConfirmation();

    const [step, setStep] = useState(() => (restoredConfirmation ? 3 : 0)); // 0=Delivery, 1=Payment, 2=Processing, 3=Confirmation
    const [form, setForm] = useState(() => restoredConfirmation?.form || getInitialCheckoutForm(country));
    const [orderId] = useState(() => restoredConfirmation?.orderId || genOrderId());
    const [deliveryDate] = useState(() => restoredConfirmation?.deliveryDate || genDeliveryDate(countryInfo.locale));
    const [confirmedTotal, setConfirmedTotal] = useState(() => (typeof restoredConfirmation?.total === 'number' ? restoredConfirmation.total : null));

    // Clear any stale confirmation when a fresh checkout begins.
    useEffect(() => {
        if (hasItemsAtMount.current) {
            clearCheckoutConfirmation();
        }
    }, []);

    if (items.length === 0 && step < 3) {
        return (
            <div className="min-h-screen bg-[#eaeded] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 text-lg mb-4">Your cart is empty.</p>
                    <button onClick={() => navigate('/')} className="bg-[#ff9900] px-6 py-2 rounded-full font-bold text-[#131921]">
                        Shop Now
                    </button>
                </div>
            </div>
        );
    }

    function handleProcessingDone() {
        const standardShipping = subtotal > 25 ? 0 : 4.99;
        const expressUpcharge = form.deliverySpeed === 'express' ? 9.99 : 0;
        const finalTotal = Math.max(0, subtotal - couponDiscount) + standardShipping + expressUpcharge;

        // Save order to history
        saveOrder({
            id: orderId,
            date: new Date().toISOString(),
            items: items.map(i => ({ ...i })),
            total: finalTotal,
            couponCode: appliedCoupon?.code || null,
            couponDiscount,
            deliveryDate,
            address: `${form.fullName}, ${form.address}, ${form.city}, ${form.state} ${form.zip}`,
        });

        saveCheckoutConfirmation({
            orderId,
            deliveryDate,
            total: finalTotal,
            form,
        });

        setConfirmedTotal(finalTotal);
        clearCart();
        setStep(3);
    }

    const standardShipping = subtotal > 25 ? 0 : 4.99;
    const expressUpcharge = form.deliverySpeed === 'express' ? 9.99 : 0;
    const shipping = standardShipping + expressUpcharge;
    const calculatedTotal = Math.max(0, subtotal - couponDiscount) + shipping;
    const saleSavings = items.reduce((sum, item) => {
        const original = Number(item.originalPrice) || item.price;
        return sum + Math.max(0, original - item.price) * item.qty;
    }, 0);
    const total = (step === 3 && typeof confirmedTotal === 'number')
        ? confirmedTotal
        : calculatedTotal;

    return (
        <div className="min-h-screen bg-[#eaeded]">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col lg:flex-row gap-5 sm:gap-6">
                {/* Left: Steps */}
                <div className="flex-1">
                    {/* Step indicator */}
                    {step < 3 && (
                        <div className="flex items-center mb-6 gap-1 overflow-x-auto pb-1">
                            {STEPS.slice(0, 3).map((s, i) => (
                                <div key={s} className="flex items-center shrink-0">
                                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                    ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#ff9900] text-[#131921]' : 'bg-gray-300 text-gray-600'}`}>
                                        {i < step ? '✓' : i + 1}
                                    </div>
                                    <span className={`ml-1 text-xs font-medium ${i === step ? 'text-gray-900' : 'text-gray-600'}`}>{s}</span>
                                    {i < 2 && <div className={`mx-2 flex-1 h-px w-8 ${i < step ? 'bg-green-500' : 'bg-gray-300'}`} />}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                        {step === 0 && <DeliveryStep form={form} setForm={setForm} onNext={() => setStep(1)} countryCode={country} />}
                        {step === 1 && <PaymentStep form={form} setForm={setForm} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
                        {step === 2 && <ProcessingStep onDone={handleProcessingDone} paymentMethod={form.paymentMethod} />}
                        {step === 3 && <ConfirmationStep orderId={orderId} deliveryDate={deliveryDate} total={total} form={form} formatCurrency={formatCurrency} onExit={clearCheckoutConfirmation} />}
                    </div>
                </div>

                {/* Right: Order summary (only for steps 0 and 1) */}
                {step < 2 && (
                    <div className="lg:w-72">
                        <div className="bg-white rounded-lg shadow p-4 lg:sticky lg:top-24">
                            <h3 className="font-bold text-gray-900 mb-3 border-b pb-2">Order Summary</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-2 text-xs">
                                        {item.isPrize ? (
                                            <div className="w-10 h-10 flex items-center justify-center text-xl bg-amber-50 rounded border border-amber-200">
                                                {item.emoji || '🎁'}
                                            </div>
                                        ) : (
                                            <img src={item.image} alt={item.title} className="w-10 h-10 object-contain bg-gray-50 rounded" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="line-clamp-1 font-medium">{item.isPrize ? `🎁 ${item.title}` : item.title}</p>
                                            <p className="text-gray-700">Qty: {item.qty}</p>
                                        </div>
                                        {item.isPrize ? (
                                            <p className="font-bold text-green-700">FREE</p>
                                        ) : (
                                            <p className="font-semibold">{formatCurrency(item.price * item.qty)}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mb-3">
                                <CouponBox
                                    appliedCoupon={appliedCoupon}
                                    onApply={setAppliedCoupon}
                                    onRemove={() => setAppliedCoupon(null)}
                                />
                            </div>
                            <div className="border-t pt-2 space-y-1 text-sm">
                                <div className="flex justify-between text-gray-700">
                                    <span>Items ({totalItems}):</span><span>{formatCurrency(subtotal)}</span>
                                </div>
                                {saleSavings > 0 && (
                                    <div className="flex justify-between text-green-700 font-semibold">
                                        <span>Flash sale savings:</span><span>−{formatCurrency(saleSavings)}</span>
                                    </div>
                                )}
                                {couponDiscount > 0 && (
                                    <div className="flex justify-between text-green-700 font-semibold">
                                        <span>{t('couponDiscount')}{appliedCoupon ? ` (${appliedCoupon.code})` : ''}:</span>
                                        <span>−{formatCurrency(couponDiscount)}</span>
                                    </div>
                                )}
                                {standardShipping > 0 && (
                                    <div className="flex justify-between text-gray-700">
                                        <span>Shipping:</span>
                                        <span>{formatCurrency(standardShipping)}</span>
                                    </div>
                                )}
                                {standardShipping === 0 && (
                                    <div className="flex justify-between text-gray-700">
                                        <span>Shipping:</span>
                                        <span className="text-green-600 font-semibold">FREE</span>
                                    </div>
                                )}
                                {expressUpcharge > 0 && (
                                    <div className="flex justify-between text-gray-700">
                                        <span>Next Day Delivery:</span>
                                        <span>+{formatCurrency(expressUpcharge)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-gray-900 border-t pt-1">
                                    <span>Order total:</span><span>{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Confirmation (inline to share state) ──────────────────────────────────────
function ConfirmationStep({ orderId, deliveryDate, total, form, formatCurrency, onExit }) {
    const navigate = useNavigate();
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [confettiDone, setConfettiDone] = useState(false);

    // Fire confetti
    useEffect(() => {
        import('canvas-confetti').then(({ default: confetti }) => {
            const end = Date.now() + 2500;
            const frame = () => {
                confetti({ particleCount: 6, spread: 80, startVelocity: 30, origin: { x: Math.random(), y: 0 } });
                if (Date.now() < end) requestAnimationFrame(frame);
                else setConfettiDone(true);
            };
            frame();
        });

        // Fetch some "you might also like" products
        fetchCatalogProducts(30)
            .then(products => setRelatedProducts(products.slice(0, 6)))
            .catch(() => { });
    }, []);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
                <div className="animate-spin-check w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
                    ✓
                </div>
                <h2 className="text-2xl font-extrabold text-green-600">Order Confirmed!</h2>
                <p className="text-gray-700 text-sm mt-1">Your imaginary package is on its way.</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Order #:</span>
                    <span className="font-bold font-mono text-gray-900">{orderId}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Delivering to:</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[55%]">
                        {form.fullName}, {form.address}, {form.city}, {form.state} {form.zip}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Estimated delivery:</span>
                    <span className="font-bold text-green-700">{deliveryDate}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Delivery speed:</span>
                    <span className="font-semibold text-gray-900">{form.deliverySpeed === 'express' ? 'Next Day Delivery' : 'Standard Delivery'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span className="font-semibold text-gray-900">{form.paymentMethod === 'cod' ? 'Cash on delivery' : 'Card on file'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Order total:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(total)}</span>
                </div>
            </div>

            <div className="bg-[#0077b8]/10 border border-[#0077b8]/30 rounded-lg p-3 flex items-center gap-3">
                <span className="text-[#005a8d] font-extrabold text-lg">Plus</span>
                <p className="text-sm text-gray-900">Your order qualifies for FREE Plus delivery. Arrives by <strong>{deliveryDate}</strong>.</p>
            </div>

            {relatedProducts.length > 0 && (
                <div>
                    <h3 className="font-bold text-gray-900 mb-3">You might also like</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {relatedProducts.map(p => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    onExit();
                                    navigate(`/product/${p.id}`);
                                }}
                                className="group text-left bg-gray-50 rounded border border-gray-200 p-2 hover:shadow transition-shadow"
                            >
                                <img src={p.image} alt={p.title} className="h-16 w-full object-contain mb-1" />
                                <p className="text-xs font-medium line-clamp-2 group-hover:text-[#c7511f]">{p.title}</p>
                                <p className="text-xs font-bold mt-0.5">{formatCurrency(p.price)}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => {
                        onExit();
                        navigate('/orders');
                    }}
                    className="flex-1 border border-gray-300 py-2.5 rounded-full text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                >
                    View Orders
                </button>
                <button
                    onClick={() => {
                        onExit();
                        navigate('/');
                    }}
                    className="flex-1 bg-[#ff9900] hover:bg-[#e88b00] text-[#131921] font-bold py-2.5 rounded-full transition-colors"
                >
                    Keep Shopping
                </button>
            </div>
        </div>
    );
}
