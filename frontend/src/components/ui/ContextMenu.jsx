'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import { useMenuMotion } from '@/src/components/layout/menuMotion';

const VIEWPORT_MARGIN = 8;

/**
 * ContextMenu — generic right-click menu, positioned at viewport coordinates.
 *
 * Portals to document.body so it is never clipped by an `overflow-hidden`
 * ancestor (React Flow's canvas wrapper, a grid-layout panel, a modal body),
 * and clamps itself back inside the viewport when opened near an edge.
 * Animation comes from the shared `useMenuMotion` hook, so it follows
 * Settings → Interface → Animation speed / Dropdown animation style exactly
 * like Select and the header dropdowns instead of hardcoding its own timing.
 *
 * Controlled and headless about *what* it lists — the caller owns open state,
 * the anchor coordinates and the items.
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {number}   props.x            clientX of the triggering event
 * @param {number}   props.y            clientY of the triggering event
 * @param {() => void} props.onClose
 * @param {Array<{
 *   id: string,
 *   label: React.ReactNode,
 *   description?: React.ReactNode,
 *   icon?: React.ElementType,
 *   onSelect?: () => void,
 *   disabled?: boolean,
 *   danger?: boolean,
 * }>} props.items
 * @param {string}   [props.ariaLabel]
 * @param {string}   [props.className]
 */
export function ContextMenu({ open, x = 0, y = 0, onClose, items = [], ariaLabel = 'Context menu', className = '' }) {
    const menuRef = useRef(null);
    const [mounted, setMounted] = useState(false);
    const [coords, setCoords] = useState({ left: x, top: y });
    const [activeIndex, setActiveIndex] = useState(-1);

    const { panelMotion } = useMenuMotion();

    useEffect(() => setMounted(true), []);

    // Reset the roving highlight every time the menu is re-opened somewhere new.
    useEffect(() => {
        if (open) {
            setCoords({ left: x, top: y });
            setActiveIndex(-1);
        }
    }, [open, x, y]);

    // Measure after paint and pull the panel back inside the viewport. Runs in a
    // layout effect so the corrected position lands in the same frame the user
    // sees — a plain effect would flash the off-screen position first.
    useLayoutEffect(() => {
        if (!open) return;
        const el = menuRef.current;
        if (!el) return;
        const { width, height } = el.getBoundingClientRect();
        const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN;
        const maxTop = window.innerHeight - height - VIEWPORT_MARGIN;
        setCoords({
            left: Math.max(VIEWPORT_MARGIN, Math.min(x, maxLeft)),
            top: Math.max(VIEWPORT_MARGIN, Math.min(y, maxTop)),
        });
    }, [open, x, y, items.length]);

    useEffect(() => {
        if (!open) return undefined;
        menuRef.current?.focus();

        const closeMenu = () => onClose?.();
        // Scroll uses capture so a scroll inside any nested container counts —
        // the menu is fixed-positioned and would otherwise detach from its anchor.
        window.addEventListener('scroll', closeMenu, true);
        window.addEventListener('resize', closeMenu);
        window.addEventListener('blur', closeMenu);
        return () => {
            window.removeEventListener('scroll', closeMenu, true);
            window.removeEventListener('resize', closeMenu);
            window.removeEventListener('blur', closeMenu);
        };
    }, [open, onClose]);

    const enabledIndexes = items.reduce((acc, item, i) => (item.disabled ? acc : [...acc, i]), []);

    const moveHighlight = useCallback((direction) => {
        if (!enabledIndexes.length) return;
        setActiveIndex((current) => {
            const pos = enabledIndexes.indexOf(current);
            const next = pos === -1
                ? (direction === 1 ? 0 : enabledIndexes.length - 1)
                : (pos + direction + enabledIndexes.length) % enabledIndexes.length;
            return enabledIndexes[next];
        });
    }, [enabledIndexes]);

    const select = useCallback((item) => {
        if (!item || item.disabled) return;
        onClose?.();
        item.onSelect?.();
    }, [onClose]);

    const handleKeyDown = useCallback((e) => {
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                onClose?.();
                break;
            case 'ArrowDown':
                e.preventDefault();
                moveHighlight(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                moveHighlight(-1);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                select(items[activeIndex]);
                break;
            default:
                break;
        }
    }, [onClose, moveHighlight, select, items, activeIndex]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    {/* Dismiss layer — also swallows the next right-click so the
                        browser's native menu doesn't stack on top of ours. */}
                    <div
                        className="fixed inset-0 z-500"
                        onPointerDown={onClose}
                        onContextMenu={(e) => { e.preventDefault(); onClose?.(); }}
                        aria-hidden="true"
                    />

                    <motion.div
                        ref={menuRef}
                        role="menu"
                        aria-label={ariaLabel}
                        tabIndex={-1}
                        onKeyDown={handleKeyDown}
                        initial={panelMotion.initial}
                        animate={panelMotion.animate}
                        exit={panelMotion.exit}
                        transition={panelMotion.transition}
                        style={{ position: 'fixed', left: coords.left, top: coords.top, transformOrigin: 'top left' }}
                        className={cn(
                            'z-501 min-w-52 max-w-72 p-1.5 rounded-2xl border border-border bg-surface/95 backdrop-blur-xl shadow-modal outline-none overflow-hidden',
                            className,
                        )}
                    >
                        {items.map((item, i) => {
                            const Icon = item.icon;
                            const isActive = i === activeIndex;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="menuitem"
                                    disabled={item.disabled}
                                    onMouseEnter={() => !item.disabled && setActiveIndex(i)}
                                    onClick={() => select(item)}
                                    className={cn(
                                        'w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition-colors duration-[var(--duration-fast,150ms)]',
                                        item.disabled
                                            ? 'opacity-40 cursor-not-allowed'
                                            : 'cursor-pointer',
                                        !item.disabled && item.danger
                                            ? isActive ? 'bg-danger/10 text-danger' : 'text-danger'
                                            : !item.disabled && isActive
                                                ? 'bg-surface-2 text-text-primary'
                                                : 'text-text-secondary',
                                    )}
                                >
                                    {Icon && <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-xs font-bold truncate">{item.label}</span>
                                        {item.description && (
                                            <span className="block text-label font-semibold text-text-subtle truncate">
                                                {item.description}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}

                        {panelMotion.sheen && <div className="liquid-glass-sheen" />}
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body,
    );
}
