'use client';
import { useState, cloneElement } from 'react';
import { cn } from '@/src/lib/utils';

const ARROW_CLASSES = {
    right: 'border-y-[5px] border-y-transparent border-r-[6px] border-r-overlay',
    left: 'border-y-[5px] border-y-transparent border-l-[6px] border-l-overlay',
    top: 'border-x-[5px] border-x-transparent border-t-[6px] border-t-overlay',
    bottom: 'border-x-[5px] border-x-transparent border-b-[6px] border-b-overlay',
};

const SLIDE_CLASSES = {
    right: 'slide-in-from-left-1',
    left: 'slide-in-from-right-1',
    top: 'slide-in-from-bottom-1',
    bottom: 'slide-in-from-top-1',
};

const FLEX_DIRECTION = {
    right: 'flex-row',
    left: 'flex-row-reverse',
    top: 'flex-col',
    bottom: 'flex-col-reverse',
};

/**
 * Bubble chrome per variant. Both keep `bg-overlay` so ARROW_CLASSES above
 * (which hardcodes `border-*-overlay`) stays visually attached to the bubble.
 * `panel` deliberately omits `whitespace-nowrap` — `cn()` here is a plain join,
 * not tailwind-merge, so a caller cannot reliably override it via className.
 */
const VARIANT_CLASSES = {
    text: 'text-body-sm font-semibold px-3 py-1.5 whitespace-nowrap tracking-wide',
    panel: 'w-56 p-3',
};

function placement(rect, side, offset) {
    switch (side) {
        case 'left':
            return { top: rect.top + rect.height / 2, left: rect.left - offset, transform: 'translate(-100%, -50%)' };
        case 'top':
            return { top: rect.top - offset, left: rect.left + rect.width / 2, transform: 'translate(-50%, -100%)' };
        case 'bottom':
            return { top: rect.bottom + offset, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' };
        default:
            return { top: rect.top + rect.height / 2, left: rect.right + offset, transform: 'translateY(-50%)' };
    }
}

/**
 * Reusable hover/focus tooltip — dark bubble + directional arrow, matching the
 * main app Sidebar's collapsed-nav tooltip (bg-overlay, animate-in). Clones its
 * single child to attach the listeners, so it adds no extra wrapper element and
 * drops into flex/grid layouts without affecting sizing.
 *
 * @param {React.ReactNode} label  content shown in the bubble; tooltip is skipped if falsy.
 *                                 Plain text suits `variant="text"`; pass an element with
 *                                 `variant="panel"` for a richer card.
 * @param {'right'|'left'|'top'|'bottom'} [side='right']
 * @param {'text'|'panel'} [variant='text']  `text` is the single-line dark bubble;
 *                                 `panel` is a fixed-width block that wraps.
 * @param {number} [offset=10]  gap in px between trigger and bubble
 * @param {boolean} [disabled]  force-skip the tooltip (e.g. only show when a rail is collapsed)
 * @param {string} [className]  extend/override the bubble's classes
 */
export function Tooltip({ label, side = 'right', variant = 'text', offset = 10, disabled = false, className, children }) {
    const [coords, setCoords] = useState(null);

    if (disabled || !label) return children;

    const show = (e) => setCoords(placement(e.currentTarget.getBoundingClientRect(), side, offset));
    const hide = () => setCoords(null);

    const trigger = cloneElement(children, {
        onMouseEnter: (e) => { children.props.onMouseEnter?.(e); show(e); },
        onMouseLeave: (e) => { children.props.onMouseLeave?.(e); hide(); },
        onFocus: (e) => { children.props.onFocus?.(e); show(e); },
        onBlur: (e) => { children.props.onBlur?.(e); hide(); },
    });

    return (
        <>
            {trigger}
            {coords && (
                <div
                    className="fixed z-200 pointer-events-none"
                    style={{ top: coords.top, left: coords.left, transform: coords.transform }}
                >
                    <div
                        key={label}
                        className={cn(
                            'flex items-center animate-in fade-in duration-[var(--duration-fast,150ms)] ease-out',
                            FLEX_DIRECTION[side],
                            SLIDE_CLASSES[side],
                        )}
                    >
                        <div className={cn('w-0 h-0 shrink-0', ARROW_CLASSES[side])} />
                        <div
                            role="tooltip"
                            className={cn(
                                'bg-overlay text-white rounded-lg shadow-xl',
                                VARIANT_CLASSES[variant] || VARIANT_CLASSES.text,
                                className,
                            )}
                        >
                            {label}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
