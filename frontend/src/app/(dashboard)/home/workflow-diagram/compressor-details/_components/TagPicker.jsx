'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useMenuMotion } from '@/src/components/layout/menuMotion';

const MAX_SELECTION = 8;

/**
 * TagPicker — choose which of the equipment's real tags are charted.
 *
 * The tag list comes from GET /p1/dashboard/equipment/{id}/tags, and the
 * selection is written back to the URL by the caller, so a configured view is
 * shareable. Capped at 8 series to keep one `createVisual` call readable.
 */
export function TagPicker({ tags, selected, onChange, disabled }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef(null);
    const { panelMotion } = useMenuMotion();

    useEffect(() => {
        if (!isOpen) return;
        const onPointerDown = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        const onKeyDown = (e) => { if (e.key === 'Escape') setIsOpen(false); };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return tags;
        return tags.filter((t) => t.label.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    }, [tags, query]);

    const toggle = useCallback((tagId) => {
        if (selected.includes(tagId)) onChange(selected.filter((id) => id !== tagId));
        else if (selected.length < MAX_SELECTION) onChange([...selected, tagId]);
    }, [selected, onChange]);

    const atLimit = selected.length >= MAX_SELECTION;

    return (
        <div className="relative shrink-0" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                disabled={disabled}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                className={cn(
                    'flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-bold whitespace-nowrap',
                    'transition-all duration-(--duration-fast) disabled:cursor-not-allowed disabled:opacity-50',
                    isOpen
                        ? 'border-brand bg-brand-muted text-brand'
                        : 'border-border bg-surface text-text-secondary hover:border-border-strong hover:bg-surface-2'
                )}
            >
                <SlidersHorizontal aria-hidden="true" className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Signals</span>
                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-tiny font-black tabular-nums text-text-secondary">
                    {selected.length}/{tags.length}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        role="dialog"
                        aria-label="Select signals to chart"
                        initial={panelMotion.initial}
                        animate={panelMotion.animate}
                        exit={panelMotion.exit}
                        transition={panelMotion.transition}
                        className="absolute right-0 top-[calc(100%+8px)] z-500 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-modal"
                    >
                        <div className="flex items-center justify-between gap-2 border-b border-border bg-canvas px-4 py-2.5">
                            <span className="text-tiny font-black uppercase tracking-widest text-text-primary">
                                Charted signals
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close"
                                className="cursor-pointer rounded-lg border border-border bg-surface p-1 text-text-muted transition-colors duration-(--duration-fast) hover:bg-surface-2"
                            >
                                <X aria-hidden="true" className="h-3 w-3" />
                            </button>
                        </div>

                        <div className="p-3">
                            <div className="relative">
                                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-subtle" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    aria-label="Search signals"
                                    placeholder="Search signals…"
                                    className="w-full rounded-lg border border-border bg-canvas py-2 pl-9 pr-3 text-xs font-medium text-text-primary outline-none transition-all duration-(--duration-fast) placeholder:text-text-subtle focus:border-brand focus:ring-2 focus:ring-brand/15"
                                />
                            </div>
                        </div>

                        <ul className="max-h-64 space-y-1 overflow-y-auto px-3 pb-3">
                            {filtered.length === 0 && (
                                <li className="py-6 text-center text-xs font-medium text-text-muted">No signals match that search.</li>
                            )}
                            {filtered.map((tag) => {
                                const isSelected = selected.includes(tag.id);
                                return (
                                    <li key={tag.id}>
                                        <button
                                            type="button"
                                            onClick={() => toggle(tag.id)}
                                            disabled={!isSelected && atLimit}
                                            aria-pressed={isSelected}
                                            className={cn(
                                                'flex w-full cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-left',
                                                'transition-all duration-(--duration-fast) disabled:cursor-not-allowed disabled:opacity-40',
                                                isSelected
                                                    ? 'border-brand/30 bg-brand-muted'
                                                    : 'border-transparent hover:border-border hover:bg-surface-2'
                                            )}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={cn(
                                                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                                                    isSelected ? 'border-brand bg-brand text-white' : 'border-border-strong'
                                                )}
                                            >
                                                {isSelected && <Check className="h-2.5 w-2.5" />}
                                            </span>
                                            <span className="min-w-0 flex-1 truncate text-xs font-bold text-text-secondary" title={tag.label}>
                                                {tag.label}
                                            </span>
                                            {tag.unit && (
                                                <span className="shrink-0 text-tiny font-bold uppercase text-text-subtle">{tag.unit}</span>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>

                        {atLimit && (
                            <p className="border-t border-border bg-canvas px-4 py-2 text-tiny font-bold text-text-muted">
                                Maximum {MAX_SELECTION} signals — deselect one to add another.
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
