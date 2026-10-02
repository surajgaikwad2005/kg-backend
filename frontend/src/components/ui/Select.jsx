'use client';

import { useState, useRef, useId, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useMenuMotion } from '@/src/components/layout/menuMotion';

const SIZES = {
    sm: { trigger: 'h-9 px-3 text-xs gap-1.5', option: 'px-3 py-2 text-xs' },
    md: { trigger: 'h-10.5 px-3.5 text-sm gap-2', option: 'px-3.5 py-2.5 text-sm' },
};

const VIEWPORT_MARGIN = 8;   // gutter kept from viewport edges
const TRIGGER_GAP = 6;       // gap between trigger and panel
const MIN_PANEL_HEIGHT = 120;
const DEFAULT_MAX_PANEL_HEIGHT = 288;

function normalizeOptions(options) {
    return options.map((o) => (
        typeof o === 'string' || typeof o === 'number' ? { value: o, label: String(o) } : o
    ));
}

/**
 * Select — modern, animated, fully theme-aware dropdown replacing native
 * <select> elements. Portals its panel to document.body (fixed-positioned,
 * recomputed on scroll/resize) so it never gets clipped by an
 * overflow-hidden ancestor, and flips upward when there isn't enough
 * viewport space below the trigger.
 *
 * options: Array<string|number|{ value, label, disabled?, dotClassName? }>
 * `dotClassName` is optional: when present, a small colour dot (any semantic
 * token class, e.g. `bg-success`) is rendered before that option's label —
 * used by pickers whose options carry a colour of their own, like the
 * connector use-case labels.
 * onChange: (value) => void — receives the raw value, not an event, so it
 * drops straight into existing `setState`-style handlers.
 */
export function Select({
    id,
    label,
    // For compact rows that cannot afford a visible <label> but still need the
    // trigger announced meaningfully (e.g. "Labels for pump-datasheet.pdf").
    ariaLabel,
    labelClassName = '',
    value,
    onChange,
    options = [],
    placeholder = 'Select…',
    disabled = false,
    error,
    size = 'sm',
    searchable = false,
    searchPlaceholder = 'Search…',
    emptyMessage = 'No options found',
    icon: Icon,
    multiple = false,
    className = '',
    triggerClassName = '',
    panelClassName = '',
    wrapperClassName = '',
}) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const listboxId = `${selectId}-listbox`;

    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [query, setQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [coords, setCoords] = useState(null);

    const triggerRef = useRef(null);
    const searchInputRef = useRef(null);
    const optionRefs = useRef([]);

    const { panelMotion } = useMenuMotion({ openUp: coords?.openUp });

    useEffect(() => setMounted(true), []);

    const normalized = useMemo(() => normalizeOptions(options), [options]);
    const filtered = useMemo(() => {
        if (!searchable || !query.trim()) return normalized;
        const q = query.trim().toLowerCase();
        return normalized.filter((o) => o.label.toLowerCase().includes(q));
    }, [normalized, searchable, query]);

    const selectedValues = useMemo(() => {
        if (!multiple) return [];
        if (Array.isArray(value)) return value.map(String);
        if (typeof value === 'string' && value.trim()) return value.split(',').map(s => s.trim()).filter(Boolean);
        return [];
    }, [multiple, value]);

    const selected = useMemo(
        () => normalized.find((o) => String(o.value) === String(value)),
        [normalized, value],
    );

    const displayLabel = useMemo(() => {
        if (multiple) {
            if (selectedValues.length === 0) return null;
            return selectedValues.map(v => normalized.find(o => String(o.value) === v)?.label || v).join(', ');
        }
        return selected ? selected.label : null;
    }, [multiple, selectedValues, normalized, selected]);

    const computePosition = useCallback(() => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const viewportH = window.innerHeight;
        const viewportW = window.innerWidth;
        const spaceBelow = viewportH - rect.bottom - VIEWPORT_MARGIN - TRIGGER_GAP;
        const spaceAbove = rect.top - VIEWPORT_MARGIN - TRIGGER_GAP;
        const openUp = spaceBelow < MIN_PANEL_HEIGHT && spaceAbove > spaceBelow;
        const maxHeight = Math.max(MIN_PANEL_HEIGHT, Math.min(DEFAULT_MAX_PANEL_HEIGHT, openUp ? spaceAbove : spaceBelow));
        const width = Math.max(rect.width, 200);
        let left = rect.left;
        if (left + width > viewportW - VIEWPORT_MARGIN) left = Math.max(VIEWPORT_MARGIN, viewportW - VIEWPORT_MARGIN - width);

        setCoords({
            left,
            width,
            maxHeight,
            top: openUp ? undefined : rect.bottom + TRIGGER_GAP,
            bottom: openUp ? viewportH - rect.top + TRIGGER_GAP : undefined,
            openUp,
        });
    }, []);

    const close = useCallback(() => {
        setOpen(false);
        setQuery('');
        setHighlightedIndex(-1);
    }, []);

    const openMenu = useCallback(() => {
        if (disabled) return;
        computePosition();
        const idx = normalized.findIndex((o) => String(o.value) === String(value));
        setHighlightedIndex(idx >= 0 ? idx : 0);
        setOpen(true);
    }, [disabled, computePosition, normalized, value]);

    useEffect(() => {
        if (!open) return;
        computePosition();
        const onReflow = () => computePosition();
        window.addEventListener('scroll', onReflow, true);
        window.addEventListener('resize', onReflow);
        const onEscape = (e) => { if (e.key === 'Escape') { close(); triggerRef.current?.focus(); } };
        document.addEventListener('keydown', onEscape);
        return () => {
            window.removeEventListener('scroll', onReflow, true);
            window.removeEventListener('resize', onReflow);
            document.removeEventListener('keydown', onEscape);
        };
    }, [open, computePosition, close]);

    useEffect(() => {
        if (open && searchable) searchInputRef.current?.focus();
    }, [open, searchable]);

    useEffect(() => {
        if (open && highlightedIndex >= 0) optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }, [open, highlightedIndex]);

    const selectValue = useCallback((opt) => {
        if (opt.disabled) return;
        if (multiple) {
            const optValStr = String(opt.value);
            const exists = selectedValues.includes(optValStr);
            const nextValues = exists
                ? selectedValues.filter(v => v !== optValStr)
                : [...selectedValues, opt.value];
            onChange?.(nextValues);
            return;
        }
        onChange?.(opt.value);
        close();
        triggerRef.current?.focus();
    }, [multiple, selectedValues, onChange, close]);

    const handleKeyDown = useCallback((e) => {
        if (disabled) return;
        if (!open) {
            if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
                e.preventDefault();
                openMenu();
            }
            return;
        }
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((i) => Math.min(filtered.length - 1, i + 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((i) => Math.max(0, i - 1));
                break;
            case 'Home':
                e.preventDefault();
                setHighlightedIndex(0);
                break;
            case 'End':
                e.preventDefault();
                setHighlightedIndex(filtered.length - 1);
                break;
            case 'Enter':
                e.preventDefault();
                if (filtered[highlightedIndex]) selectValue(filtered[highlightedIndex]);
                break;
            case 'Tab':
                close();
                break;
            default:
                break;
        }
    }, [disabled, open, openMenu, filtered, highlightedIndex, selectValue, close]);

    const s = SIZES[size] ?? SIZES.sm;

    return (
        <div className={cn('flex flex-col gap-1.5 min-w-0', wrapperClassName)}>
            {label && (
                <label htmlFor={selectId} className={cn('text-label font-black text-text-subtle uppercase tracking-wider', labelClassName)}>
                    {label}
                </label>
            )}

            <button
                type="button"
                id={selectId}
                ref={triggerRef}
                disabled={disabled}
                onClick={() => (open ? close() : openMenu())}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-label={ariaLabel}
                className={cn(
                    'group flex items-center justify-between w-full min-w-0 rounded-xl border cursor-pointer',
                    'bg-surface-2 text-text-secondary transition-colors duration-[var(--duration-fast,150ms)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
                    s.trigger,
                    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-border-strong',
                    error ? 'border-danger' : open ? 'border-brand ring-2 ring-brand/20' : 'border-border',
                    triggerClassName,
                    className,
                )}
            >
                <span className="flex items-center gap-2 min-w-0 flex-1">
                    {Icon && <Icon className="w-3.5 h-3.5 shrink-0 text-text-subtle" />}
                    <span className={cn('truncate font-bold text-left', !displayLabel && 'text-text-subtle font-semibold')}>
                        {displayLabel || placeholder}
                    </span>
                </span>
                <ChevronDown className={cn('w-3.5 h-3.5 shrink-0 text-text-subtle transition-transform duration-[var(--duration-fast,150ms)]', open && 'rotate-180 text-brand')} />
            </button>

            {error && <p className="text-label font-semibold text-danger">{error}</p>}

            {mounted && createPortal(
                <AnimatePresence>
                    {open && coords && (
                        <>
                            <div className="fixed inset-0 z-490" onClick={close} data-select-portal="true" />
                            <motion.div
                                role="listbox"
                                id={listboxId}
                                aria-label={label || ariaLabel || placeholder}
                                data-select-portal="true"
                                initial={panelMotion.initial}
                                animate={panelMotion.animate}
                                exit={panelMotion.exit}
                                transition={panelMotion.transition}
                                style={{
                                    position: 'fixed',
                                    left: coords.left,
                                    width: coords.width,
                                    top: coords.top,
                                    bottom: coords.bottom,
                                    maxHeight: coords.maxHeight,
                                    transformOrigin: coords.openUp ? 'bottom' : 'top',
                                }}
                                className={cn(
                                    'z-500 flex flex-col rounded-2xl border border-border bg-surface/95 backdrop-blur-xl shadow-modal overflow-hidden',
                                    panelClassName,
                                )}
                            >
                                {searchable && (
                                    <div className="p-2 border-b border-border shrink-0">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle pointer-events-none" />
                                            <input
                                                ref={searchInputRef}
                                                value={query}
                                                onChange={(e) => { setQuery(e.target.value); setHighlightedIndex(0); }}
                                                onKeyDown={handleKeyDown}
                                                placeholder={searchPlaceholder}
                                                aria-label={searchPlaceholder}
                                                className="w-full pl-8 pr-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs font-semibold text-text-primary outline-none focus:border-brand transition-colors"
                                            />
                                        </div>
                                    </div>
                                )}

                                <ul className="flex-1 overflow-y-auto thin-scrollbar p-1.5" role="presentation">
                                    {filtered.length === 0 && (
                                        <li className="px-3 py-6 text-center text-label font-semibold text-text-subtle italic">{emptyMessage}</li>
                                    )}
                                    {filtered.map((opt, i) => {
                                        const isSelected = multiple
                                            ? selectedValues.includes(String(opt.value))
                                            : String(opt.value) === String(value);
                                        const isHighlighted = i === highlightedIndex;
                                        return (
                                            <li
                                                key={opt.value}
                                                ref={(el) => { optionRefs.current[i] = el; }}
                                                role="option"
                                                aria-selected={isSelected}
                                                aria-disabled={opt.disabled || undefined}
                                                onMouseEnter={() => setHighlightedIndex(i)}
                                                onClick={() => selectValue(opt)}
                                                className={cn(
                                                    'flex items-center gap-2 rounded-lg font-bold cursor-pointer transition-colors duration-[var(--duration-fast,150ms)]',
                                                    s.option,
                                                    opt.disabled && 'opacity-40 cursor-not-allowed',
                                                    isSelected ? 'bg-brand-muted text-brand' : isHighlighted ? 'bg-surface-2 text-text-primary' : 'text-text-secondary',
                                                )}
                                            >
                                                {multiple && (
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        readOnly
                                                        className="w-3.5 h-3.5 rounded border-border text-brand focus:ring-brand cursor-pointer pointer-events-none"
                                                    />
                                                )}
                                                {/* Optional per-option colour dot — opt-in via
                                                    `dotClassName` on the option, so every existing
                                                    caller renders exactly as before. */}
                                                {opt.dotClassName && (
                                                    <span className={cn('w-2 h-2 rounded-full shrink-0', opt.dotClassName)} aria-hidden="true" />
                                                )}
                                                <span className="flex-1 truncate">{opt.label}</span>
                                                {!multiple && isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                                            </li>
                                        );
                                    })}
                                </ul>
                                {panelMotion.sheen && <div className="liquid-glass-sheen" />}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body,
            )}
        </div>
    );
}
