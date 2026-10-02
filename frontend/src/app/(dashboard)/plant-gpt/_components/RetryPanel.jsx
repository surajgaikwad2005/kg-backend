'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

/** Inline "edit & resend" panel shown under a bot message when the user retries it. */
export function RetryPanel({ initialText, onSubmit, onCancel }) {
    const [text, setText] = useState(initialText);
    const taRef = useRef(null);

    useEffect(() => {
        taRef.current?.focus();
        const len = taRef.current?.value.length || 0;
        taRef.current?.setSelectionRange(len, len);
    }, []);

    const canSubmit = !!text.trim();

    return (
        <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mt-2.5 p-3.5 bg-surface-2 border border-border-strong rounded-2xl shadow-panel"
        >
            <p className="m-0 mb-2 text-xs font-extrabold uppercase tracking-wide text-brand">
                Edit &amp; Retry
            </p>
            <textarea
                ref={taRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (text.trim()) onSubmit(text.trim()); }
                    if (e.key === 'Escape') onCancel();
                }}
                rows={3}
                aria-label="Edit message to retry"
                className="w-full box-border bg-transparent border-none outline-none resize-none text-sm text-text-primary leading-relaxed font-medium"
            />
            <div className="flex justify-end gap-2 mt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer bg-transparent border border-border text-text-muted transition-colors duration-[var(--duration-fast,150ms)] hover:bg-surface hover:text-text-secondary"
                >
                    Cancel
                </button>
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { if (text.trim()) onSubmit(text.trim()); }}
                    disabled={!canSubmit}
                    aria-disabled={!canSubmit}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all duration-[var(--duration-fast,150ms)] ${
                        canSubmit ? 'bg-brand shadow-brand cursor-pointer hover:bg-brand-hover' : 'bg-brand/30 cursor-not-allowed'
                    }`}
                >
                    <Send className="w-3 h-3" /> Send
                </motion.button>
            </div>
        </motion.div>
    );
}
