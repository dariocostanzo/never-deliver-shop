import { useEffect, useRef, useState } from 'react';
import { getRandomCoupon } from '../lib/coupons';

// A tongue-in-cheek "customer support" chat. No matter what a shopper types,
// the agent apologizes that the item is out of stock and hands over an
// in-store coupon. It is purely for laughs, like everything else in the shop.
function makeAgentReply() {
    const coupon = getRandomCoupon();
    return {
        id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        from: 'agent',
        text: "We're so sorry for the inconvenience, but the item you ordered is out of stock. As a thank-you for your patience, here's an in-store coupon you can use at checkout:",
        coupon,
    };
}

const GREETING = {
    id: 'agent-greeting',
    from: 'agent',
    text: "Hi! You've reached NeverDeliver Support. How can we help you today?",
    coupon: null,
};

export default function CustomerSupport() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([GREETING]);
    const [input, setInput] = useState('');
    const [copiedCode, setCopiedCode] = useState('');
    const panelRef = useRef(null);
    const inputRef = useRef(null);
    const endRef = useRef(null);

    // Close on Escape.
    useEffect(() => {
        if (!open) return undefined;
        function onKey(e) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    // Focus the input and scroll to the latest message when opened/updated.
    useEffect(() => {
        if (open) {
            inputRef.current?.focus();
            endRef.current?.scrollIntoView({ block: 'end' });
        }
    }, [open, messages]);

    function handleSend(e) {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;
        const userMsg = { id: `user-${Date.now()}`, from: 'user', text, coupon: null };
        setMessages(prev => [...prev, userMsg, makeAgentReply()]);
        setInput('');
    }

    async function copyCode(code) {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(''), 1500);
        } catch {
            // Clipboard may be unavailable; ignore.
        }
    }

    return (
        <>
            {/* Launcher button */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                aria-label={open ? 'Close customer support chat' : 'Open customer support chat'}
                className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[#131921] text-white font-semibold rounded-full shadow-lg px-4 py-3 hover:bg-[#232f3e] transition-colors focus-visible:ring-2 focus-visible:ring-[#ff9900]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.9 9.9 0 01-4-.83L3 20l1.03-3.09A7.6 7.6 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="hidden sm:inline text-sm">Support</span>
            </button>

            {/* Chat panel */}
            {open && (
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-modal="false"
                    aria-label="Customer support chat"
                    className="fixed bottom-20 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up"
                >
                    <div className="flex items-center justify-between px-4 py-3 bg-[#131921] text-white">
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-green-400" aria-hidden="true" />
                            <div>
                                <p className="text-sm font-bold leading-tight">NeverDeliver Support</p>
                                <p className="text-[11px] text-gray-300 leading-tight">Typically replies with an apology</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-gray-200 hover:text-white text-2xl leading-none"
                            aria-label="Close chat"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="flex-1 max-h-80 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.from === 'user'
                                        ? 'bg-[#ff9900] text-[#131921] rounded-br-sm'
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                    {msg.coupon && (
                                        <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-2 py-1.5">
                                            <span className="font-mono font-bold text-green-800 text-sm">🎟️ {msg.coupon.code}</span>
                                            <button
                                                type="button"
                                                onClick={() => copyCode(msg.coupon.code)}
                                                className="ml-auto text-xs font-semibold text-green-700 hover:underline"
                                            >
                                                {copiedCode === msg.coupon.code ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={endRef} />
                    </div>

                    <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 p-2">
                        <label htmlFor="support-input" className="sr-only">Type your message</label>
                        <input
                            id="support-input"
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Describe your issue..."
                            className="flex-1 min-w-0 border border-gray-300 rounded-full px-3 py-2 text-sm focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900]"
                        />
                        <button
                            type="submit"
                            className="shrink-0 bg-[#131921] text-white text-sm font-semibold rounded-full px-4 py-2 hover:bg-[#232f3e] transition-colors focus-visible:ring-2 focus-visible:ring-[#ff9900]"
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
