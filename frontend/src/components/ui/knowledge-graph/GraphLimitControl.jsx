'use client';

/**
 * GraphLimitControl — node-limit input + explicit "Load" button. Drives how many
 * nodes the knowledge graph requests from the backend (kg_explore total_nodes).
 * Layout-agnostic; the host positions it. Submits on button click or Enter.
 *
 * @param {number} value
 * @param {(n: number) => void} onChange
 * @param {() => void} onApply       fired on submit (button / Enter)
 * @param {boolean} [isLoading]
 * @param {number} [min]  default 1
 * @param {number} [max]  default 500 — guards against the synchronous force
 *                        simulation freezing the tab on very large graphs.
 */
import React, { useState, useEffect } from 'react';
import { Loader2, Layers } from 'lucide-react';

export default function GraphLimitControl({ value, onChange, onApply, isLoading = false, min = 1, max = 10000 }) {
    const [localValue, setLocalValue] = useState(value);

    // Sync local state if parent value changes
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Clamp to [min, max] before loading so a hand-typed value can't request a
        // graph large enough to freeze the synchronous layout.
        const clamped = Math.min(max, Math.max(min, Number(localValue) || min));
        if (clamped !== localValue) setLocalValue(clamped);
        if (onChange) onChange(clamped);
        if (onApply) onApply(clamped);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 bg-surface/85 border border-border rounded-xl px-2.5 py-1.5 shadow-card backdrop-blur-sm"
        >
            <Layers className="w-3.5 h-3.5 text-text-subtle shrink-0" />
            <label className="text-label font-black uppercase tracking-wider text-text-subtle whitespace-nowrap">Node limit</label>
            <input
                type="number"
                min={min}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="w-16 px-2 py-1 bg-surface border border-border rounded-lg text-text-primary text-xs font-bold outline-none focus:border-brand transition-colors"
            />
            <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-caption font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Load
            </button>
        </form>
    );
}
