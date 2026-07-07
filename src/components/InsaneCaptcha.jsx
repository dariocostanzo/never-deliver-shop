import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * A deliberately absurd, 100% client-side "human verification" gauntlet.
 * Nothing here is real security. It exists purely for the joke. Every stage
 * validates locally and, on completion, calls onSuccess().
 */

const DREAD_EMOJIS = ['🫠', '💀', '🕳️', '📉', '🧾', '⏳'];
const CALM_EMOJIS = ['🌸', '🍰', '🐶', '☀️', '🎈', '🧸', '🌈', '🍓', '🦋'];

function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Stage 1: absurd emoji math ────────────────────────────────────────────────
function MathChallenge({ onPass }) {
    const problem = useMemo(() => {
        const a = randInt(3, 9);
        const b = randInt(3, 9);
        // "Add the numbers, then subtract the legs of a spider (8)."
        return { a, b, answer: a + b - 8 };
    }, []);
    const [value, setValue] = useState('');
    const [error, setError] = useState(false);

    const check = () => {
        if (Number(value) === problem.answer) onPass();
        else setError(true);
    };

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-800">
                Add the two numbers, then subtract the number of legs on a spider. Obviously.
            </p>
            <p className="text-2xl font-bold text-center text-gray-900">
                🕷️ {problem.a} + {problem.b} − 🕸️ = ?
            </p>
            <input
                type="number"
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(false); }}
                className="w-full border border-gray-400 rounded px-3 py-2 text-sm"
                aria-label="Your answer"
                placeholder="Your answer"
            />
            {error && <p className="text-xs text-red-600" role="alert">Nope. A spider has 8 legs. Try again.</p>}
            <button
                type="button"
                onClick={check}
                className="w-full py-2 rounded-full bg-[#ff9900] hover:bg-[#e88b00] text-[#131921] font-bold text-sm"
            >
                Verify (1/4)
            </button>
        </div>
    );
}

// ── Stage 2: select all squares with "existential dread" ──────────────────────
function DreadChallenge({ onPass }) {
    const { cells, dreadSet } = useMemo(() => {
        const dread = shuffle(DREAD_EMOJIS).slice(0, 3);
        const calm = shuffle(CALM_EMOJIS).slice(0, 6);
        const grid = shuffle([...dread, ...calm]);
        return { cells: grid, dreadSet: new Set(dread) };
    }, []);
    const [selected, setSelected] = useState(() => new Set());
    const [error, setError] = useState(false);

    const toggle = (i) => {
        setError(false);
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(i)) next.delete(i); else next.add(i);
            return next;
        });
    };

    const check = () => {
        const chosen = [...selected].map((i) => cells[i]);
        const correct = chosen.length === dreadSet.size && chosen.every((e) => dreadSet.has(e));
        if (correct) onPass();
        else setError(true);
    };

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-800">Select all squares containing <strong>existential dread</strong>.</p>
            <div className="grid grid-cols-3 gap-2">
                {cells.map((emoji, i) => (
                    <button
                        type="button"
                        key={i}
                        onClick={() => toggle(i)}
                        aria-pressed={selected.has(i)}
                        aria-label={`Square ${i + 1}`}
                        className={`aspect-square text-3xl flex items-center justify-center rounded-lg border-2 transition
              ${selected.has(i) ? 'border-[#ff9900] bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
            {error && <p className="text-xs text-red-600" role="alert">That doesn't feel dreadful enough. Try again.</p>}
            <button
                type="button"
                onClick={check}
                className="w-full py-2 rounded-full bg-[#ff9900] hover:bg-[#e88b00] text-[#131921] font-bold text-sm"
            >
                Verify (2/4)
            </button>
        </div>
    );
}

// ── Stage 3: drag the slider to an exact target while "wind" nudges it ────────
function SliderChallenge({ onPass }) {
    const target = useMemo(() => randInt(31, 97), []);
    const [value, setValue] = useState(50);
    const [error, setError] = useState(false);

    const handleChange = (e) => {
        setError(false);
        let next = Number(e.target.value);
        // A gust of wind nudges the slider slightly whenever you move it.
        const gust = randInt(-2, 2);
        next = Math.max(0, Math.min(100, next + gust));
        setValue(next);
    };

    const nudge = (delta) => {
        setError(false);
        setValue((v) => Math.max(0, Math.min(100, v + delta)));
    };

    const check = () => {
        if (value === target) onPass();
        else setError(true);
    };

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-800">
                Set the slider to <strong>exactly {target}%</strong>. Mind the wind. 🌬️
            </p>
            <p className="text-center text-2xl font-bold text-gray-900" aria-live="polite">{value}%</p>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={handleChange}
                className="w-full"
                aria-label={`Slider, currently ${value} percent, target ${target} percent`}
            />
            <div className="flex justify-center gap-2">
                <button type="button" onClick={() => nudge(-1)} className="px-3 py-1 rounded border border-gray-400 text-sm" aria-label="Decrease by one">−1</button>
                <button type="button" onClick={() => nudge(1)} className="px-3 py-1 rounded border border-gray-400 text-sm" aria-label="Increase by one">+1</button>
            </div>
            {error && <p className="text-xs text-red-600" role="alert">So close. Or not. Try again.</p>}
            <button
                type="button"
                onClick={check}
                className="w-full py-2 rounded-full bg-[#ff9900] hover:bg-[#e88b00] text-[#131921] font-bold text-sm"
            >
                Verify (3/4)
            </button>
        </div>
    );
}

// ── Stage 4: a button that dodges your cursor before letting you click ────────
function DodgeChallenge({ onPass }) {
    const DODGES_REQUIRED = 4;
    const [dodges, setDodges] = useState(0);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const areaRef = useRef(null);

    const dodge = useCallback(() => {
        if (dodges >= DODGES_REQUIRED) return;
        const range = 90;
        setOffset({ x: randInt(-range, range), y: randInt(-40, 40) });
        setDodges((d) => d + 1);
    }, [dodges]);

    const caught = dodges >= DODGES_REQUIRED;

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-800">
                Click the button to confirm you are (probably) human. It's a little shy.
            </p>
            <div
                ref={areaRef}
                className="relative h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden"
            >
                <button
                    type="button"
                    onMouseEnter={caught ? undefined : dodge}
                    onClick={caught ? onPass : dodge}
                    style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
                    className={`py-2 px-5 rounded-full font-bold text-sm transition-transform duration-150
            ${caught ? 'bg-green-500 text-white' : 'bg-[#ff9900] text-[#131921]'}`}
                >
                    {caught ? 'Okay, click me! (4/4)' : "Can't catch me"}
                </button>
            </div>
            <p className="text-xs text-gray-600 text-center">
                {caught ? 'It gave up. Finish the job.' : `Dodges survived: ${dodges}/${DODGES_REQUIRED}`}
            </p>
        </div>
    );
}

const STAGES = [MathChallenge, DreadChallenge, SliderChallenge, DodgeChallenge];

export default function InsaneCaptcha({ onSuccess, onCancel }) {
    const [stage, setStage] = useState(0);
    const [canSkip, setCanSkip] = useState(false);
    const Current = STAGES[stage];

    const pass = () => {
        if (stage + 1 >= STAGES.length) onSuccess();
        else setStage((s) => s + 1);
    };

    // If you struggle on a stage long enough, the captcha decides you're far too
    // slow to be a bot and mercifully lets you through.
    useEffect(() => {
        setCanSkip(false);
        const id = setTimeout(() => setCanSkip(true), 8000);
        return () => clearTimeout(id);
    }, [stage]);

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Human verification">
            <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-900">🤖 Human verification</h3>
                    <button type="button" onClick={onCancel} className="text-gray-700 hover:text-black text-sm" aria-label="Cancel verification">
                        Give up
                    </button>
                </div>
                <div className="p-4">
                    <div className="flex gap-1 mb-4" aria-hidden="true">
                        {STAGES.map((_, i) => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= stage ? 'bg-[#ff9900]' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                    <Current onPass={pass} />
                    {canSkip && (
                        <button
                            type="button"
                            onClick={pass}
                            className="mt-3 w-full text-xs text-gray-500 hover:text-gray-800 hover:underline"
                        >
                            🐢 Wow, that took a while. No bot is this slow, you're clearly human. Skip this step →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
